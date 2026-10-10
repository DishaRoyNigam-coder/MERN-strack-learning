// src/services/email.service.js
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { emailConfig } from '../config/email.js';
import logger from '../utils/logger.js';

// ============================================================
// LAZY INITIALIZATION
// ============================================================

let transporter = null;
let resendClient = null;

function getNodemailerTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: emailConfig.smtp.host,
    port: emailConfig.smtp.port,
    secure: emailConfig.smtp.secure,
    auth: emailConfig.smtp.auth,
    // Connection pooling for production
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  return transporter;
}

function getResendClient() {
  if (resendClient) return resendClient;
  resendClient = new Resend(emailConfig.resend.apiKey);
  return resendClient;
}

// ============================================================
// SEND EMAIL (abstracts both providers)
// ============================================================

async function sendEmail({ to, subject, html, text }) {
  if (!emailConfig.enabled) {
    logger.info('Email disabled — skipping send', { to, subject });
    return { skipped: true };
  }

  try {
    if (emailConfig.service === 'resend') {
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to: [to],
        subject,
        html,
        text,
      });

      if (error) throw new Error(error.message);
      
      logger.info('Email sent', { to, subject, provider: 'resend', id: data?.id });
      return { id: data?.id, provider: 'resend' };
    }

    // Default: Nodemailer
    const transport = getNodemailerTransporter();
    const info = await transport.sendMail({
      from: emailConfig.from,
      to,
      subject,
      html,
      text,
    });

    // For Ethereal, log the preview URL if available
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info('Email preview available', { to, subject, previewUrl });
    }

    logger.info('Email sent', { to, subject, provider: 'nodemailer', messageId: info.messageId });
    return { messageId: info.messageId, provider: 'nodemailer' };
  } catch (error) {
    logger.error('Email failed', { to, subject, error: error.message });
    throw error;
  }
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

/**
 * Simple HTML email template
 */
function wrapTemplate({ title, body, ctaText, ctaUrl, footer }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: #0f172a; padding: 24px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px;">📝 Posts API</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 30px;">
              <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 22px;">${title}</h2>
              <div style="color: #475569; font-size: 16px; line-height: 1.6;">
                ${body}
              </div>
              ${
                ctaText && ctaUrl
                  ? `
              <table cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td style="background: #3b82f6; border-radius: 8px;">
                    <a href="\({ctaUrl}" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-weight: 600; text-decoration: none;">\){ctaText}</a>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                ${footer || 'You received this email because you signed up for Posts API.'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================================
// WELCOME EMAIL
// ============================================================

export async function sendWelcomeEmail(user) {
  const subject = `Welcome to Posts API, ${user.name}! 🎉`;

  const html = wrapTemplate({
    title: `Welcome aboard, ${user.name}!`,
    body: `
      <p>Thanks for signing up for <strong>Posts API</strong>. We're thrilled to have you!</p>
      <p>Here's what you can do right away:</p>
      <ul>
        <li>✍️ Create your first post</li>
        <li>❤️ Like posts from other members</li>
        <li>💬 (Soon) Comment on discussions</li>
      </ul>
      <p>Your account email: <strong>${user.email}</strong></p>
    `,
    ctaText: 'Start Writing →',
    ctaUrl: 'http://localhost:5173/posts/new',
    footer: 'Posts API · Made with ❤️',
  });

  const text = `
Welcome to Posts API, ${user.name}!

Thanks for signing up. Your account email is ${user.email}.

Start writing: http://localhost:5173/posts/new

— Posts API Team
`;

  return sendEmail({ to: user.email, subject, html, text });
}

// ============================================================
// PASSWORD RESET (bonus)
// ============================================================

export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  const subject = 'Reset your password';

  const html = wrapTemplate({
    title: 'Password Reset Request',
    body: `
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <p style="color: #94a3b8; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
    footer: 'If you did not request a password reset, please ignore this email.',
  });

  return sendEmail({ to: user.email, subject, html });
}

// ============================================================
// VERIFY CONNECTION (for startup check)
// ============================================================

export async function verifyEmailConnection() {
  if (!emailConfig.enabled) {
    logger.info('Email service disabled on startup');
    return false;
  }

  try {
    if (emailConfig.service === 'nodemailer') {
      const transport = getNodemailerTransporter();
      await transport.verify();
      logger.info('SMTP connection verified successfully');
      return true;
    }

    logger.info('Resend client initialized successfully');
    return true;
  } catch (error) {
    logger.error('Email startup connection failed', { error: error.message });
    return false;
  }
}
