import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  auth: {
    user: "resend",
    pass: process.env.EMAIL_PASS,
  },
  port: 2587,
  secure: false,
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};
