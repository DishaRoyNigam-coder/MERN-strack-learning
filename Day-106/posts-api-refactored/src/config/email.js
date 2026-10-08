// src/config/email.js

import 'dotenv/config';

const emailService = process.env.EMAIL_SERVICE || 'none';

export const emailConfig = {
  service: emailService,

  // Sender address (must be verified with your provider)
  from: process.env.EMAIL_FROM || 'Posts API <noreply@posts-api.com>',

  // Nodemailer (SMTP)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  // Resend (API)
  resend: {
    apiKey: process.env.RESEND_API_KEY,
  },

  // Feature flag
  enabled: emailService !== 'none',
};

// Validate configuration
if (emailConfig.enabled && emailService === 'nodemailer') {
  if (!emailConfig.smtp.auth.user || !emailConfig.smtp.auth.pass) {
    console.warn('⚠️  SMTP_USER / SMTP_PASS missing — emails will fail');
  }
}

if (emailConfig.enabled && emailService === 'resend') {
  if (!emailConfig.resend.apiKey) {
    console.warn('⚠️  RESEND_API_KEY missing — emails will fail');
  }
}