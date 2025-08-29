import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());

app.post('/api/email', upload.array('fotos'), async (req, res) => {
  try {
    const { name, email, contacto, morada, distancia, preco_deslocacao, mao_obra, total, detalhes, links_fotos } = req.body;

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

    // E-mail para a empresa
    await transporter.sendMail({
      from: 'Atlanthia Piscinas <pat16spam@gmail.com>', // Altere para seu e-mail
      to: 'pat16spam@gmail.com', // Altere para o e-mail da empresa
      subject: 'Novo Pedido de Manutenção de Piscina',
      html: `
        <h2>Novo Pedido de Manutenção</h2>
        <ul>
          <li><b>Nome:</b> ${name}</li>
          <li><b>E-mail:</b> ${email}</li>
          <li><b>Contacto:</b> ${contacto}</li>
          <li><b>Morada:</b> ${morada}</li>
          <li><b>Distância:</b> ${distancia} km</li>
          <li><b>Valor deslocação:</b> ${preco_deslocacao}</li>
          <li><b>Mão de obra:</b> ${mao_obra}</li>
          <li><b>Total estimado:</b> ${total}</li>
          <li><b>Links para fotos:</b> ${links_fotos || 'Nenhum'}</li>
          <li><b>Descrição:</b> ${detalhes}</li>
        </ul>
        <p>Anexos: Se o cliente enviou fotos, elas estão anexadas.</p>
      `,
      attachments
    });

    // E-mail de confirmação para o cliente
    await transporter.sendMail({
      from: 'Atlanthia Piscinas <SEU_EMAIL@gmail.com>',
      to: email,
      subject: 'Confirmação do Pedido de Manutenção',
      html: `
        <h2>Olá ${name},</h2>
        <p>Obrigado por contactar a Atlanthia Piscinas! Confirmamos que recebemos o seu pedido e entraremos em contacto o mais breve possível.</p>
        <p><b>Resumo do pedido:</b></p>
        <ul>
          <li><b>Morada:</b> ${morada}</li>
          <li><b>Descrição:</b> ${detalhes}</li>
        </ul>
        <p>Se enviou fotos, elas foram recebidas.</p>
        <p>Atenciosamente,<br>Atlanthia Piscinas</p>
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
