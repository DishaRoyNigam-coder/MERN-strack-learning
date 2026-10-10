// src/services/email.service.js

import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';
import logger from '../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: emailConfig.smtp.host,
    port: emailConfig.smtp.port,
    secure: emailConfig.smtp.secure,
    auth: emailConfig.smtp.auth,
    pool: true,
    maxConnections: 5,
  });
  return transporter;
}

function wrapTemplate({ title, body, ctaText, ctaUrl }) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 15px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#0f172a;padding:24px 30px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:22px;">🔐 Auth API</h1></td></tr>
<tr><td style="padding:36px 30px;">
<h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;">${title}</h2>
<div style="color:#475569;font-size:16px;line-height:1.6;">${body}</div>
${ctaText && ctaUrl ? `<table cellpadding="0" cellspacing="0" style="margin-top:24px;">
<tr><td style="background:#3b82f6;border-radius:8px;">
<a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-weight:600;text-decoration:none;">${ctaText}</a>
</td></tr></table>` : ''}
</td></tr>
<tr><td style="padding:20px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;">
Auth API · Made with ❤️
</p></td></tr>
</table></td></tr></table></body></html>`;
}

async function sendEmail({ to, subject, html, text }) {
  if (!emailConfig.enabled) {
    logger.info('Email disabled — skipping', { to, subject });
    return { skipped: true };
  }

  const transport = getTransporter();
  const info = await transport.sendMail({ from: emailConfig.from, to, subject, html, text });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  logger.info('Email sent', { to, subject, previewUrl: previewUrl || undefined, messageId: info.messageId });
  return { messageId: info.messageId, previewUrl };
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: `Welcome to Auth API, ${user.name}!`,
    html: wrapTemplate({
      title: `Welcome aboard, ${user.name}!`,
      body: `<p>Thanks for signing up! Your account is ready.</p>
             <p>Email: <strong>${user.email}</strong></p>`,
      ctaText: 'Go to Dashboard',
      ctaUrl: 'http://localhost:5173/dashboard',
    }),
    text: `Welcome ${user.name}! Your email is ${user.email}`,
  });
}

export async function sendPasswordResetEmail(user, token) {
  const url = `http://localhost:5173/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset your password',
    html: wrapTemplate({
      title: 'Password Reset',
      body: `<p>Hi ${user.name},</p>
             <p>Click below to reset your password. Link expires in 1 hour.</p>`,
      ctaText: 'Reset Password',
      ctaUrl: url,
    }),
  });
}

export async function verifyEmailConnection() {
  if (!emailConfig.enabled) {
    logger.warn('Email service disabled');
    return false;
  }
  try {
    await getTransporter().verify();
    logger.info('SMTP connection verified');
    return true;
  } catch (error) {
    logger.error('SMTP connection failed', { error: error.message });
    return false;
  }
}