// src/config/email.js

import 'dotenv/config';

const service = process.env.EMAIL_SERVICE || 'none';

export const emailConfig = {
  service,
  from: process.env.EMAIL_FROM || 'Auth API <noreply@auth-api.com>',
  enabled: service !== 'none',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  },
};