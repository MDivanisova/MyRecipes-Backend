import nodemailer from 'nodemailer';
import { env } from '../config/config.env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,   // e.g. smtp.gmail.com
  port: Number.parseInt(env.SMTP_PORT) || 587,
  secure: false, // true for port 465, false for other ports (uses STARTTLS)
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export default transporter;