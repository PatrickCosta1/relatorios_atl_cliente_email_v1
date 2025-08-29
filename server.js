import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());

app.post('/api/email', upload.array('fotos'), async (req, res) => {
  try {
  const { name, email, contacto, morada, distancia, preco_deslocacao, mao_obra, total, detalhes } = req.body;
  // Corrige valores undefined para string vazia
  const deslocacaoVal = preco_deslocacao || '-';
  const maoObraVal = mao_obra || '-';
  const totalVal = total || '-';

    // CONFIGURE AQUI SEU E-MAIL E SENHA DE APLICATIVO
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'patrickcosta1605@gmail.com', // Altere para seu e-mail
        pass: 'fnsy oiwv nqja bzzy' // Altere para sua senha de app
      }
    });


    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer
      }));
    }


    // E-mail para a empresa (super estilizado)
    await transporter.sendMail({
      from: 'Atlanthia Piscinas <pat16spam@gmail.com>',
      to: 'pat16spam@gmail.com',
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
                    <img src="https://atlanthia.com/wp-content/uploads/2023/04/Logotipo-Website.png" alt="Atlanthia Piscinas" style="width:140px;height:auto;margin-bottom:10px;">
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
                      <tr><td style="padding:8px 0;font-weight:600;">Distância até à sede:</td><td style="padding:8px 0;">${distancia} km</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;">Valor deslocação:</td><td style="padding:8px 0;">${deslocacaoVal}</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;">Mão de obra (fixo):</td><td style="padding:8px 0;">${maoObraVal}</td></tr>
                      <tr><td style="padding:8px 0;font-weight:700;">Total estimado:</td><td style="padding:8px 0;font-weight:700;color:#2563eb;">${totalVal}</td></tr>
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

    // E-mail de confirmação para o cliente (super estilizado)
    await transporter.sendMail({
      from: 'Atlanthia Piscinas <pat16spam@gmail.com>',
      to: email,
      subject: 'Confirmação do Pedido de Manutenção',
      html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
      <body style="margin:0;padding:0;background:#f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 6px 32px rgba(0,0,0,0.09);padding:0 0 30px 0;">
                <tr>
                  <td style="background:#2563eb;padding:30px 0 20px 0;border-radius:12px 12px 0 0;text-align:center;">
                    <img src="https://atlanthia.com/wp-content/uploads/2023/04/Logotipo-Website.png" alt="Atlanthia Piscinas" style="width:140px;height:auto;margin-bottom:10px;">
                    <h1 style="color:#fff;font-family:Inter,Arial,sans-serif;font-size:1.5rem;margin:10px 0 0 0;letter-spacing:1px;">Confirmação do Pedido</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 40px 10px 40px;">
                    <p style="font-family:Inter,Arial,sans-serif;font-size:1.1rem;color:#222;margin:0 0 18px 0;">
                      Olá <b>${name}</b>,<br>
                      Obrigado por contactar a <b>Atlanthia Piscinas</b>! Confirmamos que recebemos o seu pedido e entraremos em contacto o mais breve possível.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;font-size:1rem;color:#222;">
                      <tr><td style="padding:8px 0;font-weight:600;width:180px;">Morada:</td><td style="padding:8px 0;">${morada}</td></tr>
                      <tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Descrição do problema:</td><td style="padding:8px 0;">${detalhes}</td></tr>
                    </table>
                    <div style="margin:24px 0 0 0;">
                      <span style="display:inline-block;background:#e0e7ff;color:#2563eb;padding:8px 16px;border-radius:6px;font-size:.98rem;">
                        Se enviou fotos, elas foram recebidas.
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 40px 0 40px;">
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                    <p style="font-family:Inter,Arial,sans-serif;font-size:.98rem;color:#64748b;text-align:right;margin:0;">
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
