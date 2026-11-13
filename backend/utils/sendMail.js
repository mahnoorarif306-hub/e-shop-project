const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const mailUser = process.env.SMTP_MAIL || process.env.SMPT_MAIL;
  const mailPassword = process.env.SMTP_PASSWORD || process.env.SMPT_PASSWORD;
  const port = Number(process.env.SMTP_PORT || process.env.SMPT_PORT) || 587;

  if (!mailUser || !mailPassword) {
    throw new Error("Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.SMPT_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user: mailUser,
      pass: mailPassword,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  const mailOptions = {
    from: mailUser,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log("Sending email to:", options.email);
  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully!");
};

module.exports = sendMail;