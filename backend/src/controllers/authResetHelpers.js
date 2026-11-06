import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

// In-memory OTP storage for password reset in backend
const resetOtps = new Map();

/**
 * Request a password reset OTP code
 * POST /api/auth/forgot-password/send
 */
export const forgotPasswordSend = async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    if (!rawEmail) {
      return res.status(400).json({ message: 'Email or ID is required' });
    }

    const cleanInput = rawEmail.trim().toLowerCase();
    const GENERIC_MSG = 'If an account exists for that email, a reset code has been sent.';

    // Look up user in SQLite by email or ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { id: rawEmail.trim() },
          { email: `${cleanInput}@southshore.edu.gh` }
        ]
      }
    });

    if (!user) {
      return res.status(200).json({ message: GENERIC_MSG });
    }

    const email = user.email.toLowerCase();

    // Check cooldown (60 seconds)
    const existing = resetOtps.get(email);
    if (existing && existing.createdAt && (Date.now() - existing.createdAt < 60000)) {
      const waitSec = Math.ceil((60000 - (Date.now() - existing.createdAt)) / 1000);
      return res.status(429).json({ message: `Please wait ${waitSec} seconds before requesting a new code` });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    resetOtps.set(email, {
      otp,
      expiresAt,
      createdAt: Date.now(),
      attempts: 0,
      verified: false,
      resetToken: null,
      resetTokenExpiresAt: null
    });

    console.log(`[PASSWORD RESET] Generated OTP for ${email}: ${otp}`);

    return res.status(200).json({ message: GENERIC_MSG });
  } catch (err) {
    console.error('forgotPasswordSend error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

/**
 * Verify password reset OTP code
 * POST /api/auth/forgot-password/verify
 */
export const forgotPasswordVerify = async (req, res) => {
  try {
    const { email: rawEmail, otp } = req.body;
    if (!rawEmail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const email = rawEmail.trim().toLowerCase();
    const INVALID_MSG = 'Invalid or expired code. Please request a new one.';

    // Check by direct email or look up email
    let record = resetOtps.get(email);
    if (!record) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { id: rawEmail.trim() },
            { email: `${email}@southshore.edu.gh` }
          ]
        }
      });
      if (user) {
        record = resetOtps.get(user.email.toLowerCase());
      }
    }

    if (!record) {
      return res.status(400).json({ message: INVALID_MSG });
    }

    if (Date.now() > record.expiresAt) {
      resetOtps.delete(email);
      return res.status(400).json({ message: INVALID_MSG });
    }

    if (record.attempts >= 5) {
      resetOtps.delete(email);
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new code.' });
    }

    if (record.otp !== otp.toString().trim()) {
      record.attempts++;
      return res.status(401).json({
        message: 'Invalid code',
        attemptsLeft: 5 - record.attempts
      });
    }

    // Success: Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    record.verified = true;
    record.resetToken = resetToken;
    record.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    return res.status(200).json({
      message: 'Code verified successfully',
      verified: true,
      resetToken,
      expiresIn: 900
    });
  } catch (err) {
    console.error('forgotPasswordVerify error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

/**
 * Complete password reset with verified token
 * POST /api/auth/forgot-password/reset
 */
export const forgotPasswordReset = async (req, res) => {
  try {
    const { email: rawEmail, resetToken, newPassword } = req.body;
    if (!rawEmail || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'email, resetToken, and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const email = rawEmail.trim().toLowerCase();
    const INVALID_MSG = 'This reset session is invalid or has expired. Please start over.';

    let record = resetOtps.get(email);
    let resolvedEmail = email;
    if (!record) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { id: rawEmail.trim() },
            { email: `${email}@southshore.edu.gh` }
          ]
        }
      });
      if (user) {
        resolvedEmail = user.email.toLowerCase();
        record = resetOtps.get(resolvedEmail);
      }
    }

    if (!record || !record.verified || !record.resetToken) {
      return res.status(400).json({ message: INVALID_MSG });
    }

    if (record.resetToken !== resetToken || Date.now() > record.resetTokenExpiresAt) {
      return res.status(400).json({ message: INVALID_MSG });
    }

    // Hash new password and update in SQLite DB
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const user = await prisma.user.findFirst({
      where: { email: resolvedEmail }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });
    }

    resetOtps.delete(resolvedEmail);
    console.log(`[PASSWORD RESET] Successfully updated password for ${resolvedEmail}`);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('forgotPasswordReset error:', err);
    return res.status(500).json({ message: 'Failed to update password. Please try again.' });
  }
};

