import nodemailer from 'nodemailer';

const isConfigured = () =>
  Boolean(
    process.env.OWNER_EMAIL &&
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const notifyOwner = async ({ subject, text }) => {
  if (!isConfigured()) {
    console.warn('Owner notifications disabled — set OWNER_EMAIL and SMTP_* env vars');
    return;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.OWNER_EMAIL,
      subject,
      text,
    });
  } catch (error) {
    console.error(`Owner notification failed: ${error.message}`);
  }
};

export const notifySignup = (user) =>
  notifyOwner({
    subject: 'LiveCodeHub — New user signed up',
    text: [
      'A new user registered on LiveCodeHub.',
      '',
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n'),
  });

export const notifyPasswordChange = (user) =>
  notifyOwner({
    subject: 'LiveCodeHub — User changed password',
    text: [
      'A user changed their password on LiveCodeHub.',
      '',
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n'),
  });

export const notifyLogin = (user) =>
  notifyOwner({
    subject: 'LiveCodeHub — User logged in',
    text: [
      'A user logged in to LiveCodeHub.',
      '',
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n'),
  });

export const sendPasswordResetEmail = async (user, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  notifyOwner({
    subject: 'LiveCodeHub — Password reset requested',
    text: [
      'A password reset was requested on LiveCodeHub.',
      '',
      `User: ${user.name} (${user.email})`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n'),
  });

  if (!isConfigured()) {
    throw new Error('SMTP not configured');
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'Reset your LiveCodeHub password',
    text: [
      `Hi ${user.name},`,
      '',
      'You requested a password reset. Click the link below to set a new password:',
      '',
      resetUrl,
      '',
      'This link expires in 1 hour.',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
  });
};
