import nodemailer from 'nodemailer';

export async function sendResetEmail(to: string, url: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Recupera tu contraseña',
    html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${url}">${url}</a>`
  });
}
