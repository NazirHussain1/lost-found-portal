import nodemailer from 'nodemailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (process.env.EMAIL_SERVICE === 'gmail') {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  if (!isValidEmail(to)) {
    return {
      success: false,
      error: 'Invalid email address',
    };
  }

  if (!subject || !html) {
    return {
      success: false,
      error: 'Subject and HTML content are required',
    };
  }

  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"GAMICA Lost & Found" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

function createEmailTemplate(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;background-color:#f4f4f4;margin:0;padding:0}.container{max-width:600px;margin:40px auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.content h2{color:#667eea;margin-top:0;font-size:24px}.content p{margin:15px 0;font-size:16px;color:#555}.button{display:inline-block;padding:15px 40px;margin:25px 0;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-decoration:none;border-radius:50px;font-weight:600;font-size:16px;box-shadow:0 4px 15px rgba(102,126,234,0.3)}.info-box{background:#f8f9fa;border-left:4px solid #667eea;padding:15px;margin:20px 0;border-radius:4px}.footer{background:#f8f9fa;padding:20px 30px;text-align:center;font-size:14px;color:#777}.footer a{color:#667eea;text-decoration:none}.divider{height:1px;background:#e0e0e0;margin:30px 0}.warning{color:#e74c3c;font-size:14px;margin-top:20px}.feature{margin:20px 0;padding:15px;background:#f8f9fa;border-radius:8px}</style></head><body><div class="container">${content}<div class="footer"><p><strong>GAMICA Lost & Found Portal</strong><br>Helping reunite lost items with their owners</p><p>Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p></div></div></body></html>`;
}

export async function sendVerificationEmail(email, name, token) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  const content = `<div class="header"><h1>🔐 GAMICA Lost & Found Portal</h1></div><div class="content"><h2>Welcome, ${name}! 👋</h2><p>Thank you for signing up for GAMICA Lost & Found Portal. We're excited to have you join our community!</p><p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p><div style="text-align: center;"><a href="${verificationUrl}" class="button">Verify Email Address</a></div><div class="info-box"><strong>⏰ Important:</strong> This verification link will expire in <strong>1 hour</strong> for security reasons.</div><div class="divider"></div><p style="font-size: 14px; color: #777;">If the button doesn't work, copy and paste this link into your browser:</p><p style="word-break: break-all; font-size: 13px; color: #667eea;">${verificationUrl}</p><p class="warning">⚠️ If you didn't create an account with us, please ignore this email.</p></div>`;
  const html = createEmailTemplate(content);
  const result = await sendEmail({ to: email, subject: '🔐 Verify Your Email - GAMICA Lost & Found Portal', html });
  if (!result.success) {
    throw new Error(result.error || 'Failed to send verification email');
  }
  return result;
}

export async function sendWelcomeEmail(email, name) {
  const content = `<div class="header"><h1>✅ Email Verified Successfully!</h1></div><div class="content"><h2>Welcome to GAMICA Lost & Found, ${name}! 🎉</h2><p>Your email has been verified and your account is now active. You can now access all features of our platform.</p><div class="feature"><strong>📢 Report Lost Items</strong><br>Lost something? Create a detailed report to help others identify your item.</div><div class="feature"><strong>🔍 Browse Found Items</strong><br>Check if someone has found your lost item and posted it on our platform.</div><div class="feature"><strong>💬 Connect with Others</strong><br>Contact people directly via WhatsApp when you find a match.</div><div style="text-align: center;"><a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Start Using Portal</a></div><p style="margin-top: 30px; color: #777;">Thank you for being part of our community. Together, we can help reunite lost items with their owners!</p></div>`;
  const html = createEmailTemplate(content);
  return await sendEmail({ to: email, subject: '✅ Welcome to GAMICA Lost & Found Portal!', html });
}

export async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  const content = `<div class="header"><h1>🔑 Password Reset Request</h1></div><div class="content"><h2>Hi ${name},</h2><p>We received a request to reset your password. Click the button below to create a new password:</p><div style="text-align: center;"><a href="${resetUrl}" class="button">Reset Password</a></div><div class="info-box"><strong>⏰ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.</div><div class="divider"></div><p style="font-size: 14px; color: #777;">If the button doesn't work, copy and paste this link into your browser:</p><p style="word-break: break-all; font-size: 13px; color: #667eea;">${resetUrl}</p><p class="warning">⚠️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p></div>`;
  const html = createEmailTemplate(content);
  const result = await sendEmail({ to: email, subject: '🔑 Password Reset Request - GAMICA Lost & Found', html });
  if (!result.success) {
    throw new Error(result.error || 'Failed to send password reset email');
  }
  return result;
}

export async function testEmailConfig() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

export async function sendTestEmail(toEmail) {
  const content = `<div class="header"><h1>✅ Test Email</h1></div><div class="content"><h2>Email Configuration Test</h2><p>This is a test email to verify your email configuration is working correctly.</p><div class="info-box"><strong>✅ Success!</strong> If you're reading this, your email configuration is working properly.</div><p>Configuration details:</p><ul><li><strong>Service:</strong> ${process.env.EMAIL_SERVICE || 'SMTP'}</li><li><strong>Host:</strong> ${process.env.EMAIL_HOST || 'smtp.gmail.com'}</li><li><strong>Port:</strong> ${process.env.EMAIL_PORT || '587'}</li><li><strong>From:</strong> ${process.env.EMAIL_USER}</li></ul></div>`;
  const html = createEmailTemplate(content);
  return await sendEmail({ to: toEmail, subject: '✅ Test Email - GAMICA Lost & Found', html });
}

export function closeEmailConnection() {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}
