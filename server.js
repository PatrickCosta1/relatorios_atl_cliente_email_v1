import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/email', upload.array('fotos'), async (req, res) => {
  try {
    const { name, email, contacto, morada, distancia, detalhes } = req.body;
    // Corrige valores undefined, string 'undefined' ou vazia
    function safeVal(val) {
      return (val && val !== 'undefined') ? val : '-';
    }
    const distanciaVal = safeVal(distancia);

    // CONFIGURE CREDENCIAIS VIA VARIÁVEIS DE AMBIENTE (EMAIL_USER e EMAIL_PASS)
    const EMAIL_USER = process.env.EMAIL_USER || 'manutencao@atlanthia.com';
    const EMAIL_PASS = process.env.EMAIL_PASS || 'Dubaipool26';
    if (!EMAIL_PASS) {
      console.error('EMAIL_PASS não definido no ambiente.');
      return res.status(500).json({ error: 'EMAIL_PASS não definido no ambiente. Configure a senha do e‑mail em EMAIL_PASS.' });
    }

    // transporter para Outlook / Office365 (SMTP)
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      },
      tls: {
        ciphers: 'TLSv1.2',
        rejectUnauthorized: false
      }
    });

    // verificar transporter (falha aqui indica problema de autenticação/ligação)
    try {
      await transporter.verify();
      console.log('Transporter verificado com sucesso.');
    } catch (verifyErr) {
      console.error('Falha ao verificar transporter:', verifyErr);
      return res.status(500).json({ error: 'Falha na autenticação SMTP. Verifique EMAIL_USER/EMAIL_PASS e configurações do provedor.', detail: verifyErr.message });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer
      }));
    }

    // E-mail para a empresa
    await transporter.sendMail({
      from: `Atlanthia Piscinas <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: 'Novo Pedido de Manutenção de Piscina',
      html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
      <body style="margin:0;padding:0;background:#f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 6px 32px rgba(0,0,0,0.09);padding:0 0 30px 0;">
                <tr>
                  <td style="background:#003366;padding:30px 0 20px 0;border-radius:12px 12px 0 0;text-align:center;">
                    <img src="https://atlanthia.com/wp-content/uploads/2023/04/Logotipo-Website.png" alt="Atlanthia Piscinas" style="width:220px;height:auto;margin-bottom:10px;">
                    <h1 style="color:#fff;font-family:Inter,Arial,sans-serif;font-size:1.7rem;margin:10px 0 0 0;letter-spacing:1px;">Novo Pedido de Manutenção</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 40px 10px 40px;">
                    <p style="font-family:Inter,Arial,sans-serif;font-size:1.1rem;color:#222;margin:0 0 18px 0;">
                      Recebemos um novo pedido de manutenção de piscina com os seguintes dados:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;font-size:1rem;color:#222;">
                      <tr><td style="padding:8px 0;font-weight:600;width:180px;">Nome:</td><td style="padding:8px 0;">${name}</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;">E-mail:</td><td style="padding:8px 0;">${email}</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;">Contacto:</td><td style="padding:8px 0;">${contacto}</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;">Morada:</td><td style="padding:8px 0;">${morada}</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;">Distância até à sede:</td><td style="padding:8px 0;">${distanciaVal} km</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Descrição do problema:</td><td style="padding:8px 0;">${detalhes}</td></tr>
                    </table>
                    <div style="margin:24px 0 0 0;">
                      <span style="display:inline-block;background:#e0e7ff;color:#2563eb;padding:8px 16px;border-radius:6px;font-size:.98rem;">
                        Anexos: Se o cliente enviou fotos, elas estarão anexadas a este e-mail.
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 40px 0 40px;">
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                    <p style="font-family:Inter,Arial,sans-serif;font-size:.98rem;color:#64748b;text-align:right;margin:0;">
                      Recebido automaticamente via formulário do site <strong>Atlanthia Piscinas</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
      attachments
    });

    // E-mail de confirmação para o cliente (mais estilizado e com aviso)
    await transporter.sendMail({
      from: `Atlanthia Piscinas <${EMAIL_USER}>`,
      to: email,
      subject: 'Confirmação do Pedido de Manutenção',
      html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
      <body style="margin:0;padding:0;background:#f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(37,99,235,0.13);padding:0 0 36px 0;">
                <tr>
                  <td style="background:linear-gradient(90deg,#2563eb 60%,#003366 100%);padding:36px 0 24px 0;border-radius:16px 16px 0 0;text-align:center;">
                    <img src="https://atlanthia.com/wp-content/uploads/2023/04/Logotipo-Website.png" alt="Atlanthia Piscinas" style="width:180px;height:auto;margin-bottom:12px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.10));">
                    <h1 style="color:#fff;font-family:Inter,Arial,sans-serif;font-size:1.7rem;margin:12px 0 0 0;letter-spacing:1px;text-shadow:0 2px 8px rgba(0,0,0,0.10);">Pedido Recebido!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 44px 10px 44px;">
                    <p style="font-family:Inter,Arial,sans-serif;font-size:1.13rem;color:#222;margin:0 0 18px 0;line-height:1.6;">
                      Olá <b>${name}</b>,<br>
                      Agradecemos o seu contacto! Recebemos o seu pedido de manutenção e entraremos em contacto o mais breve possível.<br><br>
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;font-size:1.05rem;color:#222;margin-bottom:18px;">
                      <tr><td style="padding:8px 0;font-weight:600;width:180px;">Morada:</td><td style="padding:8px 0;">${morada}</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Descrição do problema:</td><td style="padding:8px 0;">${detalhes}</td></tr>
                    </table>
                    <div style="margin:24px 0 0 0;">
                      <span style="display:inline-block;background:#e0e7ff;color:#2563eb;padding:8px 16px;border-radius:6px;font-size:.98rem;">
                        Se enviou fotos, elas foram recebidas com sucesso.
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 44px 0 44px;">
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
                    <p style="font-family:Inter,Arial,sans-serif;font-size:1.01rem;color:#64748b;text-align:right;margin:0;">
                      Recebido automaticamente via formulário do site <strong>Atlanthia Piscinas</strong>.<br>
                      <span style="color:#2563eb;">Muito obrigado pela sua confiança!</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando na porta 3000');
});
