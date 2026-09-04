import nodemailer from 'nodemailer';

/**
 * Create a reusable SMTP transporter.
 * Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in backend/.env
 * For development / testing use a service like Mailtrap, Gmail, or Resend.
 */
const createTransporter = () => {
  // If EMAIL_SERVICE is set (e.g. "gmail"), use the service shorthand,
  // otherwise fall back to manual host/port configuration.
  if (process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

const transporter = createTransporter();

const FROM_ADDRESS = process.env.EMAIL_FROM || '"Attendance System" <no-reply@attendance.edu>';

/**
 * Send a first-absence warning email.
 */
export async function sendFirstAbsenceWarning({ studentName, studentEmail, courseName, courseCode, missedCount }) {
  const subject = `⚠️ Attendance Warning – ${courseCode}: First Absence`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 32px;color:#fff">
        <h2 style="margin:0;font-size:1.4rem">⚠️ First Attendance Warning</h2>
        <p style="margin:6px 0 0;opacity:0.85;font-size:0.9rem">${courseCode} – ${courseName}</p>
      </div>
      <div style="padding:28px 32px;background:#fff">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>This is an automated notification to inform you that you have <strong>missed ${missedCount} class session</strong> in <strong>${courseName} (${courseCode})</strong>.</p>
        <div style="background:#fef9c3;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:6px;margin:16px 0">
          <p style="margin:0;color:#92400e;font-weight:600">⚠️ Warning Level: 1 of 3</p>
          <p style="margin:6px 0 0;color:#78350f;font-size:0.9rem">
            Please note that missing 3 or more classes may render you <strong>ineligible to sit the examination</strong> for this course.
          </p>
        </div>
        <p>We strongly encourage you to attend all remaining classes regularly. If you are facing challenges, please speak to your lecturer or academic advisor as soon as possible.</p>
        <p style="color:#64748b;font-size:0.85rem;margin-top:24px">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  return transporter.sendMail({ from: FROM_ADDRESS, to: studentEmail, subject, html });
}

/**
 * Send a second-absence warning email.
 */
export async function sendSecondAbsenceWarning({ studentName, studentEmail, courseName, courseCode, missedCount }) {
  const subject = `🚨 Attendance Warning – ${courseCode}: Second Absence`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:28px 32px;color:#fff">
        <h2 style="margin:0;font-size:1.4rem">🚨 Second Attendance Warning</h2>
        <p style="margin:6px 0 0;opacity:0.85;font-size:0.9rem">${courseCode} – ${courseName}</p>
      </div>
      <div style="padding:28px 32px;background:#fff">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>You have now <strong>missed ${missedCount} class sessions</strong> in <strong>${courseName} (${courseCode})</strong>.</p>
        <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:14px 18px;border-radius:6px;margin:16px 0">
          <p style="margin:0;color:#991b1b;font-weight:600">🚨 Warning Level: 2 of 3 — CRITICAL</p>
          <p style="margin:6px 0 0;color:#7f1d1d;font-size:0.9rem">
            You are <strong>one absence away</strong> from being declared <strong>ineligible to sit the examination</strong> for this course. Immediate action is required.
          </p>
        </div>
        <p>Please contact your lecturer or the academic office <strong>urgently</strong> if you are experiencing any difficulties attending classes.</p>
        <p style="color:#64748b;font-size:0.85rem;margin-top:24px">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  return transporter.sendMail({ from: FROM_ADDRESS, to: studentEmail, subject, html });
}

/**
 * Send an exam ineligibility notice (3rd absence).
 */
export async function sendIneligibilityNotice({ studentName, studentEmail, courseName, courseCode, missedCount }) {
  const subject = `❌ Exam Ineligibility Notice – ${courseCode}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7f1d1d,#991b1b);padding:28px 32px;color:#fff">
        <h2 style="margin:0;font-size:1.4rem">❌ Exam Ineligibility Notice</h2>
        <p style="margin:6px 0 0;opacity:0.85;font-size:0.9rem">${courseCode} – ${courseName}</p>
      </div>
      <div style="padding:28px 32px;background:#fff">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>We regret to inform you that you have <strong>missed ${missedCount} class sessions</strong> in <strong>${courseName} (${courseCode})</strong>.</p>
        <div style="background:#fee2e2;border-left:4px solid #991b1b;padding:14px 18px;border-radius:6px;margin:16px 0">
          <p style="margin:0;color:#7f1d1d;font-weight:700;font-size:1rem">❌ You are INELIGIBLE to sit the examination</p>
          <p style="margin:8px 0 0;color:#7f1d1d;font-size:0.9rem">
            As per academic regulations, students who miss <strong>3 or more class sessions</strong> are not permitted to sit the examination for that course.
          </p>
        </div>
        <p>If you believe there are extenuating circumstances, you must contact the <strong>Academic Office</strong> or your <strong>Head of Department</strong> immediately to appeal this decision.</p>
        <p>Please take this matter seriously and seek guidance at your earliest opportunity.</p>
        <p style="color:#64748b;font-size:0.85rem;margin-top:24px">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  return transporter.sendMail({ from: FROM_ADDRESS, to: studentEmail, subject, html });
}
