const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Recuperação de senha - ${process.env.COMPANY_NAME}`,
    html: `
      <p>Olá, ${name}!</p>
      <p>Recebemos uma solicitação para redefinir sua senha.</p>
      <p>Clique no link abaixo para criar uma nova senha (válido por 1 hora):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Se você não fez esta solicitação, ignore este e-mail.</p>
    `,
  });
}

module.exports = {
  sendPasswordResetEmail,
};

