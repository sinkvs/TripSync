import nodemailer from 'nodemailer';

// Отправляем письмо с ссылкой для подтверждения email
// В режиме development только пишем в консоль, фактически отправка не происходит
// В режиме production реально отправляем через SMTP
export const sendVerificationEmail = async (to: string, verificationLink: string): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    // Настраиваем транспорт для production
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // для порта 587 (стандартный порт для отправки от почтового клиента к почтовому серверу) используем STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    // Отправляем письмо
    await transporter.sendMail({
      from: `"TripSync" <${process.env.SMTP_FROM}>`,
      to,
      subject: 'Подтверждение регистрации в TripSync',
      html: `<p>Для завершения регистрации перейдите по ссылке:</p>
             <a href="${verificationLink}">${verificationLink}</a>
             <p>Ссылка действительна в течение 24 часов.</p>`,
    });
  } else {
    // В режиме разработки просто пишем лог, чтобы не настраивать SMTP
    console.log(`[DEV] Email would be sent to ${to} with link: ${verificationLink}`);
  }
};