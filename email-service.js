import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()

if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.error('❌ ERROR: MAIL_USER and MAIL_PASS must be set in .env file')
  process.exit(1)
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file')
  process.exit(1)
}

// Service-role client — bypasses RLS.
// Attempt to use custom module if present, otherwise direct createClient.
let supabaseClient
try {
  const mod = await import('./src/utils/supabase.js')
  supabaseClient = mod.supabase
} catch {
  supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
const supabase = supabaseClient

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://attendance-w3h9.onrender.com',
    'https://attendance-peach-five.vercel.app',
    'https://suc-email-api.vercel.app',
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const OTP_EXPIRY_MS         = 60 * 60 * 1000
const MAX_VERIFY_ATTEMPTS   = 5
const RESEND_COOLDOWN_MS    = 60 * 1000
const BULK_SEND_LIMIT       = 200

const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000
const ALLOWED_DOMAIN        = 'southshore.edu.gh'
const EMAIL_REGEX           = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
})

transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message)
  } else {
    console.log('✅ Email server is ready to send OTPs and Attendance Notifications')
  }
})

// ──────────────────────────────────────────────────────────
// HTML EMAIL BUILDERS
// ──────────────────────────────────────────────────────────

function buildOtpHtml({ displayName, otp }) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; background: #ffffff; color: #222222; margin: 0; padding: 0; }
  .wrapper { max-width: 480px; margin: 40px auto; padding: 0 24px; }
  .brand { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #666666; border-bottom: 1px solid #dddddd; padding-bottom: 16px; margin-bottom: 24px; }
  .greeting { font-size: 16px; margin-bottom: 12px; }
  .body-text { font-size: 14px; line-height: 1.6; color: #444444; margin-bottom: 24px; }
  .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px 0; border-top: 1px solid #dddddd; border-bottom: 1px solid #dddddd; margin: 24px 0; }
  .expiry { font-size: 12px; color: #888888; text-align: center; margin-top: -12px; margin-bottom: 24px; }
  .note { font-size: 12px; color: #888888; line-height: 1.6; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #dddddd; font-size: 11px; color: #999999; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="brand">Southshore University College · Attendance</div>
  <p class="greeting">Hello, ${displayName}</p>
  <p class="body-text">
    Your lecturer has started an attendance session for your class.
    Enter the code below — shown live on your lecturer's screen — to verify your presence.
  </p>
  <div class="otp-code">${otp}</div>
  <div class="expiry">Expires in 60 minutes</div>
  <p class="note">Never share this code. If you did not expect this, you can ignore this message — no attendance will be recorded.</p>
  <div class="footer">Southshore Attendance System · Developed &amp; maintained by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

function buildPasswordResetHtml({ displayName, otp }) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; background: #ffffff; color: #222222; margin: 0; padding: 0; }
  .wrapper { max-width: 480px; margin: 40px auto; padding: 0 24px; }
  .brand { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #666666; border-bottom: 1px solid #dddddd; padding-bottom: 16px; margin-bottom: 24px; }
  .greeting { font-size: 16px; margin-bottom: 12px; }
  .body-text { font-size: 14px; line-height: 1.6; color: #444444; margin-bottom: 24px; }
  .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px 0; border-top: 1px solid #dddddd; border-bottom: 1px solid #dddddd; margin: 24px 0; }
  .expiry { font-size: 12px; color: #888888; text-align: center; margin-top: -12px; margin-bottom: 24px; }
  .note { font-size: 12px; color: #888888; line-height: 1.6; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #dddddd; font-size: 11px; color: #999999; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="brand">Southshore University College · Account Security</div>
  <p class="greeting">Hello, ${displayName}</p>
  <p class="body-text">
    We received a request to reset the password on your Southshore Attendance account.
    Enter the code below to continue.
  </p>
  <div class="otp-code">${otp}</div>
  <div class="expiry">Expires in 60 minutes</div>
  <p class="note">Didn't request this? Ignore this message and your password will remain unchanged. Never share this code with anyone, including staff.</p>
  <div class="footer">Southshore Attendance System · Developed &amp; maintained by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

function buildPresentConfirmationHtml({ studentName, courseCode, courseName, sessionCode, date, time }) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
  .wrapper { max-width: 520px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
  .header { background: #031c45; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #bc9333; }
  .brand { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #bc9333; font-weight: 700; margin-bottom: 6px; }
  .title { font-size: 20px; font-weight: 800; margin: 0; color: #ffffff; }
  .content { padding: 28px; }
  .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
  .badge { display: inline-block; padding: 4px 10px; background: #dcfce7; color: #15803d; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #64748b; font-weight: 500; }
  .value { color: #0f172a; font-weight: 700; text-align: right; }
  .body-text { font-size: 13px; line-height: 1.6; color: #334155; margin: 16px 0; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="brand">Southshore University College</div>
    <div class="title">Attendance Verified · Present</div>
  </div>
  <div class="content">
    <div class="badge">✓ Presence Logged</div>
    <p class="greeting">Hello, ${studentName}</p>
    <p class="body-text">
      Your attendance has been officially verified and recorded as <strong>PRESENT</strong> for your class session.
    </p>
    <div class="info-box">
      <div class="info-row"><span class="label">Course Code:</span><span class="value">${courseCode}</span></div>
      <div class="info-row"><span class="label">Course Name:</span><span class="value">${courseName}</span></div>
      <div class="info-row"><span class="label">Session PIN:</span><span class="value">#${sessionCode}</span></div>
      <div class="info-row"><span class="label">Date & Time:</span><span class="value">${date || new Date().toISOString().split('T')[0]} &bull; ${time || 'Class Session'}</span></div>
      <div class="info-row"><span class="label">Status:</span><span class="value" style="color: #16a34a;">PRESENT</span></div>
    </div>
    <p class="body-text" style="font-size: 12px; color: #64748b;">
      Keep up your consistent attendance. Continued attendance guarantees eligibility for all mid-semester and final examinations.
    </p>
  </div>
  <div class="footer">Southshore Attendance System · Developed by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

function buildAbsentNotificationHtml({ studentName, courseCode, courseName, sessionCode, date, time }) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
  .wrapper { max-width: 520px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
  .header { background: #031c45; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #e11d48; }
  .brand { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #bc9333; font-weight: 700; margin-bottom: 6px; }
  .title { font-size: 20px; font-weight: 800; margin: 0; color: #ffffff; }
  .content { padding: 28px; }
  .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
  .badge { display: inline-block; padding: 4px 10px; background: #ffe4e6; color: #e11d48; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
  .info-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 16px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #fecdd3; font-size: 13px; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #881337; font-weight: 500; }
  .value { color: #9f1239; font-weight: 700; text-align: right; }
  .body-text { font-size: 13px; line-height: 1.6; color: #334155; margin: 16px 0; }
  .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #92400e; margin: 16px 0; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="brand">Southshore University College</div>
    <div class="title">Absence Recorded · Class Session</div>
  </div>
  <div class="content">
    <div class="badge">✕ Marked Absent</div>
    <p class="greeting">Hello, ${studentName}</p>
    <p class="body-text">
      You were recorded as <strong>ABSENT</strong> for the lecture session detailed below.
    </p>
    <div class="info-box">
      <div class="info-row"><span class="label">Course Code:</span><span class="value">${courseCode}</span></div>
      <div class="info-row"><span class="label">Course Name:</span><span class="value">${courseName}</span></div>
      <div class="info-row"><span class="label">Session PIN:</span><span class="value">#${sessionCode}</span></div>
      <div class="info-row"><span class="label">Date:</span><span class="value">${date || new Date().toISOString().split('T')[0]} &bull; ${time || 'Lecture Session'}</span></div>
      <div class="info-row"><span class="label">Status:</span><span class="value" style="color: #e11d48;">ABSENT</span></div>
    </div>
    <div class="warning-box">
      <strong>⚠️ Attendance Policy Reminder:</strong> Regular attendance is mandatory. Missing two (2) consecutive sessions results in a critical warning, and three (3) consecutive sessions leads to automatic examination exemption / disqualification.
    </div>
    <p class="body-text" style="font-size: 12px; color: #64748b;">
      If you were present and believe this was an error, please reach out directly to your lecturer.
    </p>
  </div>
  <div class="footer">Southshore Attendance System · Developed by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

function buildConsecutiveWarningHtml({ studentName, courseCode, courseName, consecutiveCount, date }) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fffbeb; color: #0f172a; margin: 0; padding: 0; }
  .wrapper { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 2px solid #f59e0b; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.15); }
  .header { background: linear-gradient(135deg, #b45309, #d97706); padding: 26px 28px; color: #ffffff; }
  .brand { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #fef3c7; font-weight: 700; margin-bottom: 6px; }
  .title { font-size: 21px; font-weight: 800; margin: 0; color: #ffffff; }
  .content { padding: 28px; }
  .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
  .critical-card { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px; margin: 18px 0; text-align: center; }
  .critical-count { font-size: 32px; font-weight: 900; color: #b45309; }
  .critical-sub { font-size: 13px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 1px; }
  .body-text { font-size: 14px; line-height: 1.6; color: #334155; margin: 16px 0; }
  .urgent-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 14px 16px; border-radius: 6px; font-size: 13px; color: #991b1b; line-height: 1.5; margin: 20px 0; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="brand">Southshore University College · Academic Compliance</div>
    <div class="title">⚠️ URGENT WARNING: 2 Consecutive Absences</div>
  </div>
  <div class="content">
    <p class="greeting">Dear ${studentName},</p>
    <div class="critical-card">
      <div class="critical-count">${consecutiveCount || 2} CONSECUTIVE ABSENCES</div>
      <div class="critical-sub">${courseCode} — ${courseName}</div>
    </div>
    <p class="body-text">
      This is an official administrative warning that you have now accumulated <strong>two (2) consecutive absences</strong> in <strong>${courseName} (${courseCode})</strong> as of ${date || 'today'}.
    </p>
    <div class="urgent-box">
      <strong>🚨 MANDATORY NOTICE FOR UPCOMING CLASS:</strong><br/>
      Under Southshore academic regulations, missing <strong>three (3) consecutive classes</strong> results in <strong>AUTOMATIC EXEMPTION / DEBARMENT FROM THE SEMESTER EXAMINATION</strong> for this course.<br/><br/>
      You <u>MUST</u> attend the upcoming lecture to avoid disqualification from writing your final examination.
    </div>
    <p class="body-text">
      If you are facing medical emergencies or circumstances beyond your control, submit formal documentation to your lecturer and Academic Registry immediately.
    </p>
  </div>
  <div class="footer">Southshore Attendance System · Developed by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

function buildExamExemptionNoticeHtml({ studentName, courseCode, courseName, consecutiveCount, date }) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fff1f2; color: #0f172a; margin: 0; padding: 0; }
  .wrapper { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 2px solid #dc2626; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.2); }
  .header { background: linear-gradient(135deg, #881337, #be123c); padding: 26px 28px; color: #ffffff; }
  .brand { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #fecdd3; font-weight: 700; margin-bottom: 6px; }
  .title { font-size: 21px; font-weight: 800; margin: 0; color: #ffffff; }
  .content { padding: 28px; }
  .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
  .debarred-card { background: #fee2e2; border: 2px solid #dc2626; border-radius: 12px; padding: 20px; margin: 18px 0; text-align: center; }
  .debarred-status { font-size: 13px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 1.5px; }
  .debarred-headline { font-size: 22px; font-weight: 900; color: #7f1d1d; margin: 6px 0; }
  .debarred-sub { font-size: 13px; color: #b91c1c; font-weight: 600; }
  .body-text { font-size: 14px; line-height: 1.6; color: #334155; margin: 16px 0; }
  .policy-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 16px; font-size: 12px; color: #475569; margin: 18px 0; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="brand">Southshore University College · Examination Directorate</div>
    <div class="title">🚨 NOTICE: Examination Exemption (3 Consecutive Absences)</div>
  </div>
  <div class="content">
    <p class="greeting">Dear ${studentName},</p>
    <div class="debarred-card">
      <div class="debarred-status">Official Academic Standing</div>
      <div class="debarred-headline">EXEMPTION FROM EXAMINATION</div>
      <div class="debarred-sub">${courseCode} &bull; ${courseName} (${consecutiveCount || 3} Consecutive Absences)</div>
    </div>
    <p class="body-text">
      This is a formal notification that you have accumulated <strong>${consecutiveCount || 3} consecutive absences</strong> in <strong>${courseName} (${courseCode})</strong> as of ${date || 'today'}.
    </p>
    <p class="body-text">
      In strict accordance with the academic regulations of Southshore University College, you are <strong>DISQUALIFIED / EXEMPT</strong> from sitting for the final semester examination for this module.
    </p>
    <div class="policy-box">
      <strong>Formal Appeal Procedure:</strong><br/>
      If you wish to petition this exemption due to extreme documented extenuating circumstances (e.g. hospitalized medical condition), you must lodge an official petition backed by verified documentation with the <strong>Academic Affairs Office</strong> and your course lecturer within <strong>48 hours</strong> of receipt of this notice.
    </div>
  </div>
  <div class="footer">Southshore Attendance System · Developed by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

function buildLecturerConsecutiveAbsenceAlertHtml({ lecturerName, studentName, studentEmail, studentIdNumber, courseCode, courseName, consecutiveCount }) {
  const isDebarred = consecutiveCount >= 3
  const badgeColor = isDebarred ? '#dc2626' : '#d97706'
  const badgeBg    = isDebarred ? '#fee2e2' : '#fef3c7'
  const titleText  = isDebarred ? 'Student Exam Exemption Notice (3 Consecutive Absences)' : 'Student Attendance Warning (2 Consecutive Absences)'

  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
  .wrapper { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
  .header { background: #031c45; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid ${badgeColor}; }
  .brand { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #bc9333; font-weight: 700; margin-bottom: 6px; }
  .title { font-size: 19px; font-weight: 800; margin: 0; color: #ffffff; }
  .content { padding: 28px; }
  .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
  .badge { display: inline-block; padding: 5px 12px; background: ${badgeBg}; color: ${badgeColor}; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #64748b; font-weight: 500; }
  .value { color: #0f172a; font-weight: 700; text-align: right; }
  .body-text { font-size: 13px; line-height: 1.6; color: #334155; margin: 16px 0; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="brand">Southshore University College · Faculty Notification</div>
    <div class="title">${titleText}</div>
  </div>
  <div class="content">
    <div class="badge">${consecutiveCount} CONSECUTIVE ABSENCES DETECTED</div>
    <p class="greeting">Hello, Lecturer ${lecturerName || 'Faculty Member'}</p>
    <p class="body-text">
      The attendance surveillance system has flagged a student in your course who has missed consecutive lectures:
    </p>
    <div class="info-box">
      <div class="info-row"><span class="label">Course:</span><span class="value">${courseCode} &bull; ${courseName}</span></div>
      <div class="info-row"><span class="label">Student Name:</span><span class="value">${studentName}</span></div>
      <div class="info-row"><span class="label">Student ID:</span><span class="value">${studentIdNumber || 'N/A'}</span></div>
      <div class="info-row"><span class="label">Student Email:</span><span class="value">${studentEmail}</span></div>
      <div class="info-row"><span class="label">Consecutive Misses:</span><span class="value" style="color: ${badgeColor}; font-weight: 800;">${consecutiveCount} Classes</span></div>
      <div class="info-row"><span class="label">Academic Status:</span><span class="value" style="color: ${badgeColor}; font-weight: 800;">${isDebarred ? 'EXEMPT FROM FINAL EXAM' : 'AT RISK (1 Miss away from Exemption)'}</span></div>
    </div>
    <p class="body-text" style="font-size: 12px; color: #64748b;">
      ${isDebarred 
        ? 'The student has received an official exam ineligibility notice. Their examination eligibility flag has been updated in the academic roster.' 
        : 'The student has received an urgent warning to attend the upcoming class to prevent examination disqualification.'}
    </p>
  </div>
  <div class="footer">Southshore Attendance System · Developed by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

function buildLecturerSessionSummaryHtml({ lecturerName, courseCode, courseName, sessionCode, date, time, total, presentCount, absentCount, rate, flaggedStudents }) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
  .wrapper { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
  .header { background: #031c45; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #bc9333; }
  .brand { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #bc9333; font-weight: 700; margin-bottom: 6px; }
  .title { font-size: 20px; font-weight: 800; margin: 0; color: #ffffff; }
  .content { padding: 28px; }
  .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 8px; text-align: center; }
  .card-num { font-size: 20px; font-weight: 800; }
  .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-top: 4px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
  .info-row:last-child { border-bottom: none; }
  .flagged-section { margin-top: 20px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px; }
  .flagged-title { font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 8px; }
  .flagged-item { font-size: 12px; color: #78350f; padding: 4px 0; border-bottom: 1px dashed #fde68a; }
  .flagged-item:last-child { border-bottom: none; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="brand">Southshore University College · Rollcall Ledger</div>
    <div class="title">Attendance Session Summary</div>
  </div>
  <div class="content">
    <p class="greeting">Hello, Lecturer ${lecturerName || 'Faculty Member'}</p>
    <p style="font-size: 13px; color: #475569; line-height: 1.5;">
      Attendance has been successfully recorded for your lecture session in <strong>${courseCode} — ${courseName}</strong>.
    </p>

    <div style="background: #031c45; color: #ffffff; border-radius: 12px; padding: 14px 18px; margin: 16px 0; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #bc9333; font-weight: 700;">Session PIN</div>
        <div style="font-size: 24px; font-weight: 900; letter-spacing: 4px;">#${sessionCode}</div>
      </div>
      <div style="text-align: right; font-size: 12px; color: #cbd5e1;">
        <div>${date || new Date().toISOString().split('T')[0]}</div>
        <div>${time || 'Completed'}</div>
      </div>
    </div>

    <table width="100%" cellpadding="6" cellspacing="0" style="margin: 16px 0; text-align: center; font-size: 13px;">
      <tr>
        <td style="background: #f1f5f9; border-radius: 8px; padding: 10px;">
          <div style="font-size: 18px; font-weight: 800; color: #334155;">${total}</div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Enrolled</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background: #dcfce7; border-radius: 8px; padding: 10px;">
          <div style="font-size: 18px; font-weight: 800; color: #16a34a;">${presentCount}</div>
          <div style="font-size: 10px; font-weight: 700; color: #15803d; text-transform: uppercase;">Present</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background: #fee2e2; border-radius: 8px; padding: 10px;">
          <div style="font-size: 18px; font-weight: 800; color: #dc2626;">${absentCount}</div>
          <div style="font-size: 10px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Absent</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background: #fef3c7; border-radius: 8px; padding: 10px;">
          <div style="font-size: 18px; font-weight: 800; color: #d97706;">${rate}%</div>
          <div style="font-size: 10px; font-weight: 700; color: #b45309; text-transform: uppercase;">Turnout</div>
        </td>
      </tr>
    </table>

    ${flaggedStudents && flaggedStudents.length > 0 ? `
    <div class="flagged-section">
      <div class="flagged-title">⚠️ Students Flagged with Consecutive Absences:</div>
      ${flaggedStudents.map(f => `
        <div class="flagged-item">
          <strong>${f.name}</strong> (${f.email}) — 
          <span style="font-weight: 700; color: ${f.consecutive >= 3 ? '#b91c1c' : '#b45309'};">
            ${f.consecutive} consecutive absences [${f.consecutive >= 3 ? 'EXAM INELIGIBLE' : 'WARNING SENT'}]
          </span>
        </div>
      `).join('')}
    </div>
    ` : `
    <p style="font-size: 12px; color: #16a34a; background: #dcfce7; padding: 10px; border-radius: 8px; margin-top: 14px;">
      ✓ No students currently exceed consecutive absence warning thresholds in this course.
    </p>
    `}

    <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
      Individual attendance receipts and automated notices have been dispatched to student emails.
    </p>
  </div>
  <div class="footer">Southshore Attendance System · Developed by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

function buildLecturerMarkedByRepHtml({ lecturerName, courseCode, courseName, status, sessionCode, date, time, repName, notes }) {
  const isPresent = status === 'present'
  const isLate    = status === 'late'
  const statusColor = isPresent ? '#16a34a' : isLate ? '#d97706' : '#dc2626'
  const statusBg    = isPresent ? '#dcfce7' : isLate ? '#fef3c7' : '#fee2e2'
  const statusLabel = status ? status.toUpperCase() : 'MARKED'

  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
  .wrapper { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
  .header { background: #031c45; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #bc9333; }
  .brand { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #bc9333; font-weight: 700; margin-bottom: 6px; }
  .title { font-size: 20px; font-weight: 800; margin: 0; color: #ffffff; }
  .content { padding: 28px; }
  .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
  .badge { display: inline-block; padding: 5px 14px; background: ${statusBg}; color: ${statusColor}; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #64748b; font-weight: 500; }
  .value { color: #0f172a; font-weight: 700; text-align: right; }
  .notes-box { background: #f1f5f9; border-left: 4px solid #64748b; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #334155; margin: 16px 0; font-style: italic; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="brand">Southshore University College · Lecture Monitoring</div>
    <div class="title">Faculty Attendance Logged by Class Rep</div>
  </div>
  <div class="content">
    <div class="badge">${statusLabel}</div>
    <p class="greeting">Hello, Lecturer ${lecturerName || 'Faculty Member'}</p>
    <p style="font-size: 13px; color: #334155; line-height: 1.5;">
      Your attendance and arrival for today's lecture has been officially recorded by your designated <strong>Class Representative</strong>:
    </p>
    <div class="info-box">
      <div class="info-row"><span class="label">Course Code:</span><span class="value">${courseCode}</span></div>
      <div class="info-row"><span class="label">Course Name:</span><span class="value">${courseName}</span></div>
      <div class="info-row"><span class="label">Arrival / Session Date:</span><span class="value">${date || new Date().toISOString().split('T')[0]}</span></div>
      <div class="info-row"><span class="label">Arrival Time:</span><span class="value">${time || 'N/A'}</span></div>
      <div class="info-row"><span class="label">Session PIN:</span><span class="value">${sessionCode ? `#${sessionCode}` : 'Not Linked'}</span></div>
      <div class="info-row"><span class="label">Status Recorded:</span><span class="value" style="color: ${statusColor};">${statusLabel}</span></div>
      <div class="info-row"><span class="label">Logged By Rep:</span><span class="value">${repName || 'Class Representative'}</span></div>
    </div>
    ${notes ? `
    <div class="notes-box">
      <strong>Class Rep Observation Notes:</strong><br/>
      "${notes}"
    </div>` : ''}
    <p style="font-size: 12px; color: #64748b;">
      This record is synchronized with institutional lecture delivery audits and the Directorate of Academic Quality.
    </p>
  </div>
  <div class="footer">Southshore Attendance System · Developed by Mbills Enterprise · Accra, Ghana</div>
</div>
</body>
</html>`
}

// ──────────────────────────────────────────────────────────
// DATABASE HELPERS
// ──────────────────────────────────────────────────────────

async function getOtpRow(sessionId, studentId) {
  const { data, error } = await supabase
    .from('session_otps')
    .select('*')
    .eq('session_id', sessionId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) throw error
  return data
}

async function getPasswordResetRow(email) {
  const { data, error } = await supabase
    .from('password_reset_otps')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) throw error
  return data
}

function cooldownRemaining(row) {
  if (!row) return 0
  const elapsed = Date.now() - new Date(row.created_at).getTime()
  const remaining = RESEND_COOLDOWN_MS - elapsed
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString()
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Calculates consecutive absences for a student in a course
 * by inspecting past sessions ordered chronologically.
 */
async function getConsecutiveAbsences(studentId, courseId, currentSessionId) {
  try {
    const { data: sessions, error: sessErr } = await supabase
      .from('sessions')
      .select('id, created_at, date')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (sessErr || !sessions || sessions.length === 0) return 1

    const sessionIds = sessions.map(s => s.id)
    const { data: studentAtts } = await supabase
      .from('attendances')
      .select('session_id, status, timestamp')
      .eq('student_id', studentId)
      .in('session_id', sessionIds)

    const statusMap = new Map((studentAtts || []).map(a => [a.session_id, a.status]))

    let streak = 0
    for (const s of sessions) {
      const st = statusMap.get(s.id)
      if (st === 'absent') {
        streak++
      } else if (st === 'present' || st === 'late') {
        break
      } else if (s.id === currentSessionId) {
        streak++
      } else {
        break
      }
    }

    return Math.max(streak, 1)
  } catch (err) {
    console.warn(`[getConsecutiveAbsences] Error checking history for student ${studentId}:`, err.message)
    return 1
  }
}

/**
 * Persists an in-app student notification if student_notifications table exists.
 */
async function recordStudentNotification({ studentId, courseId, type, message }) {
  try {
    await supabase.from('student_notifications').insert({
      student_id: studentId,
      course_id: courseId,
      type,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    // Non-critical; ignore if table is absent
  }
}

async function sendOtpForStudent({ sessionId, studentId, email, displayName, otp }) {
  if (!studentId || !email) {
    return { studentId, email, success: false, code: 'BAD_REQUEST', message: 'studentId and email are required' }
  }

  const code = otp?.toString().trim()
  if (!code) {
    return { studentId, email, success: false, code: 'BAD_REQUEST', message: 'otp is required' }
  }

  let existing
  try {
    existing = await getOtpRow(sessionId, studentId)
  } catch (error) {
    return { studentId, email, success: false, code: 'DB_ERROR', message: 'Failed to check existing code', error: error.message }
  }

  const cooldown = cooldownRemaining(existing)
  if (cooldown > 0) {
    return {
      studentId, email, success: false, code: 'COOLDOWN',
      message: `Please wait ${cooldown} seconds before requesting a new code`,
      cooldown,
    }
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS)

  const { error: upsertErr } = await supabase
    .from('session_otps')
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        otp: code,
        attempts: 0,
        expires_at: expiresAt.toISOString(),
        verified_at: null,
        created_at: now.toISOString(),
      },
      { onConflict: 'session_id,student_id' }
    )

  if (upsertErr) {
    console.error(`❌ Failed to persist OTP for student ${studentId}:`, upsertErr.message)
    return { studentId, email, success: false, code: 'DB_ERROR', message: 'Failed to record code', error: upsertErr.message }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Southshore Attendance" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Attendance Verification Code',
      html: buildOtpHtml({ displayName, otp: code }),
    })
    console.log(`✅ OTP dispatched → ${email} (session ${sessionId})`)
    return { studentId, email, success: true, message: 'Code sent successfully', expiresIn: OTP_EXPIRY_MS / 1000 }
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message)
    await supabase.from('session_otps').delete().eq('session_id', sessionId).eq('student_id', studentId)
    return { studentId, email, success: false, code: 'SEND_FAILED', message: 'Failed to send code', error: error.message }
  }
}

// ──────────────────────────────────────────────────────────
// 1. UNIFIED ATTENDANCE NOTIFICATION DISPATCHER
// POST /api/attendance/notify-session
// Body: { sessionCode } OR { sessionId }
// Automatically queries Supabase, finds present and absent students,
// sends attendance confirmations, absence notices, calculates 2 & 3
// consecutive absence warnings, and emails the lecturer with a summary.
// ──────────────────────────────────────────────────────────
async function handleNotifySession(req, res) {
  const { sessionCode, sessionId, otp } = req.body
  const code = (sessionCode || otp)?.toString().trim()

  if (!code && !sessionId) {
    return res.status(400).json({ message: 'sessionCode or sessionId is required' })
  }

  try {
    // 1. Look up session
    let sessQuery = supabase.from('sessions').select('*')
    if (code) {
      sessQuery = sessQuery.eq('pin', code)
    } else {
      sessQuery = sessQuery.eq('id', sessionId)
    }
    const { data: session, error: sessErr } = await sessQuery.order('created_at', { ascending: false }).limit(1).maybeSingle()

    if (sessErr || !session) {
      return res.status(404).json({ message: `Session not found matching ${code ? `code "${code}"` : `ID "${sessionId}"`}` })
    }

    const actualSessionId = session.id
    const actualPin = session.pin || code

    // 2. Look up Course details
    let course = { code: 'COURSE', name: 'Class Session' }
    if (session.course_id) {
      const { data: cData } = await supabase.from('courses').select('id, code, name').eq('id', session.course_id).maybeSingle()
      if (cData) course = cData
    }

    // 3. Look up Lecturer details
    let lecturer = null
    if (session.lecturer_id) {
      const { data: lData } = await supabase.from('users').select('id, name, email').eq('id', session.lecturer_id).maybeSingle()
      if (lData) lecturer = lData
    }

    // 4. Fetch attendances for this session
    const { data: attendances, error: attErr } = await supabase
      .from('attendances')
      .select('*')
      .eq('session_id', actualSessionId)

    if (attErr) {
      return res.status(500).json({ message: 'Failed to load attendance records for session', error: attErr.message })
    }

    if (!attendances || attendances.length === 0) {
      return res.status(200).json({
        message: 'No attendance records logged for this session yet.',
        sessionId: actualSessionId,
        pin: actualPin,
        sent: 0
      })
    }

    // 5. Fetch student user accounts for these attendances
    const studentIds = [...new Set(attendances.map(a => a.student_id))]
    const { data: studentUsers } = await supabase
      .from('users')
      .select('id, name, email, id_number')
      .in('id', studentIds)

    const userMap = new Map((studentUsers || []).map(u => [u.id, u]))

    const presentStudents = []
    const absentStudents  = []

    for (const a of attendances) {
      const u = userMap.get(a.student_id)
      if (!u || !u.email) continue

      const sObj = {
        id: u.id,
        name: u.name || 'Student',
        email: u.email,
        studentIdNumber: u.id_number || 'N/A',
        status: a.status,
      }

      if (a.status === 'present') {
        presentStudents.push(sObj)
      } else {
        absentStudents.push(sObj)
      }
    }

    const sessionDate = session.date || new Date(session.created_at).toISOString().split('T')[0]
    const sessionTime = new Date(session.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const results = []
    const flaggedForLecturer = []

    // 6. Send PRESENT emails
    await Promise.all(
      presentStudents.map(async (student) => {
        try {
          await transporter.sendMail({
            from: `"Southshore Attendance" <${process.env.MAIL_USER}>`,
            to: student.email,
            subject: `✅ Attendance Confirmed: ${course.code} – Present`,
            html: buildPresentConfirmationHtml({
              studentName: student.name,
              courseCode: course.code,
              courseName: course.name,
              sessionCode: actualPin,
              date: sessionDate,
              time: sessionTime,
            }),
          })
          results.push({ studentId: student.id, email: student.email, status: 'present', success: true })
        } catch (err) {
          console.error(`❌ Failed to send present confirmation to ${student.email}:`, err.message)
          results.push({ studentId: student.id, email: student.email, status: 'present', success: false, error: err.message })
        }
      })
    )

    // 7. Send ABSENT emails & Consecutive Absence Warning / Exemption Checks
    await Promise.all(
      absentStudents.map(async (student) => {
        try {
          const consecutiveCount = await getConsecutiveAbsences(student.id, session.course_id, actualSessionId)
          let emailSubject = `❌ Absence Notification: ${course.code} – Marked Absent`
          let emailHtml = ''

          if (consecutiveCount === 2) {
            // Consecutive Absence 2: Urgent Warning
            emailSubject = `⚠️ Urgent Attendance Warning: 2 Consecutive Absences in ${course.code}`
            emailHtml = buildConsecutiveWarningHtml({
              studentName: student.name,
              courseCode: course.code,
              courseName: course.name,
              consecutiveCount,
              date: sessionDate,
            })
            flaggedForLecturer.push({ ...student, consecutive: 2 })

            await recordStudentNotification({
              studentId: student.id,
              courseId: session.course_id,
              type: 'warning_2',
              message: `⚠️ Urgent Warning: You have missed 2 consecutive lectures in ${course.code}. You must attend the upcoming class to prevent examination disqualification.`,
            })

            // Alert lecturer specifically about this student reaching 2 absences
            if (lecturer?.email) {
              transporter.sendMail({
                from: `"Southshore Attendance Alerts" <${process.env.MAIL_USER}>`,
                to: lecturer.email,
                subject: `⚠️ Student Attendance Alert: 2 Consecutive Absences – ${student.name} (${course.code})`,
                html: buildLecturerConsecutiveAbsenceAlertHtml({
                  lecturerName: lecturer.name,
                  studentName: student.name,
                  studentEmail: student.email,
                  studentIdNumber: student.studentIdNumber,
                  courseCode: course.code,
                  courseName: course.name,
                  consecutiveCount: 2,
                }),
              }).catch(err => console.error('Failed to dispatch 2-absence alert to lecturer:', err.message))
            }
          } else if (consecutiveCount >= 3) {
            // Consecutive Absence 3+: Notice of Examination Exemption
            emailSubject = `🚨 Examination Exemption Notice: ${consecutiveCount} Consecutive Absences in ${course.code}`
            emailHtml = buildExamExemptionNoticeHtml({
              studentName: student.name,
              courseCode: course.code,
              courseName: course.name,
              consecutiveCount,
              date: sessionDate,
            })
            flaggedForLecturer.push({ ...student, consecutive: consecutiveCount })

            await recordStudentNotification({
              studentId: student.id,
              courseId: session.course_id,
              type: 'ineligible',
              message: `🚨 Examination Ineligibility Notice: Having missed ${consecutiveCount} consecutive classes in ${course.code}, you are flagged as exempt / ineligible from writing the final examination.`,
            })

            // Alert lecturer about exam ineligibility
            if (lecturer?.email) {
              transporter.sendMail({
                from: `"Southshore Attendance Alerts" <${process.env.MAIL_USER}>`,
                to: lecturer.email,
                subject: `🚨 Exam Exemption Notice: ${student.name} (${course.code}) – ${consecutiveCount} Consecutive Absences`,
                html: buildLecturerConsecutiveAbsenceAlertHtml({
                  lecturerName: lecturer.name,
                  studentName: student.name,
                  studentEmail: student.email,
                  studentIdNumber: student.studentIdNumber,
                  courseCode: course.code,
                  courseName: course.name,
                  consecutiveCount,
                }),
              }).catch(err => console.error('Failed to dispatch 3-absence alert to lecturer:', err.message))
            }
          } else {
            // Single absence notice
            emailHtml = buildAbsentNotificationHtml({
              studentName: student.name,
              courseCode: course.code,
              courseName: course.name,
              sessionCode: actualPin,
              date: sessionDate,
              time: sessionTime,
            })

            await recordStudentNotification({
              studentId: student.id,
              courseId: session.course_id,
              type: 'warning_1',
              message: `Absence Notice: You were recorded absent for ${course.code} on ${sessionDate}. Ensure you attend upcoming classes.`,
            })
          }

          await transporter.sendMail({
            from: `"Southshore Attendance" <${process.env.MAIL_USER}>`,
            to: student.email,
            subject: emailSubject,
            html: emailHtml,
          })
          results.push({ studentId: student.id, email: student.email, status: 'absent', consecutive: consecutiveCount, success: true })
        } catch (err) {
          console.error(`❌ Failed to send absent email to ${student.email}:`, err.message)
          results.push({ studentId: student.id, email: student.email, status: 'absent', success: false, error: err.message })
        }
      })
    )

    // 8. Send LECTURER SESSION SUMMARY EMAIL
    let lecturerNotified = false
    if (lecturer?.email) {
      try {
        const total = presentStudents.length + absentStudents.length
        const rate = total > 0 ? Math.round((presentStudents.length / total) * 100) : 0

        await transporter.sendMail({
          from: `"Southshore Attendance" <${process.env.MAIL_USER}>`,
          to: lecturer.email,
          subject: `📋 Attendance Recorded: ${course.code} – ${course.name} (PIN: ${actualPin})`,
          html: buildLecturerSessionSummaryHtml({
            lecturerName: lecturer.name,
            courseCode: course.code,
            courseName: course.name,
            sessionCode: actualPin,
            date: sessionDate,
            time: sessionTime,
            total,
            presentCount: presentStudents.length,
            absentCount: absentStudents.length,
            rate,
            flaggedStudents: flaggedForLecturer,
          }),
        })
        lecturerNotified = true
        console.log(`✅ Session summary dispatched to lecturer → ${lecturer.email}`)
      } catch (err) {
        console.error(`❌ Failed to send session summary to lecturer ${lecturer.email}:`, err.message)
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`📧 Session #${actualPin} dispatch completed: ${successCount}/${results.length} student emails sent. Lecturer notified: ${lecturerNotified}`)

    res.status(200).json({
      message: `${successCount}/${results.length} notifications dispatched successfully.`,
      sessionId: actualSessionId,
      pin: actualPin,
      courseCode: course.code,
      courseName: course.name,
      totalEnrolled: presentStudents.length + absentStudents.length,
      presentCount: presentStudents.length,
      absentCount: absentStudents.length,
      flaggedCount: flaggedForLecturer.length,
      lecturerNotified,
      results,
    })
  } catch (err) {
    console.error('❌ notifySession error:', err)
    res.status(500).json({ message: 'Internal server error processing session notifications', error: err.message })
  }
}

app.post('/api/attendance/notify-session', handleNotifySession)
app.post('/api/otp/notify-session', handleNotifySession)

// ──────────────────────────────────────────────────────────
// 2. LECTURER ATTENDANCE MARKED BY CLASS REPRESENTATIVE
// POST /api/attendance/lecturer-marked-by-rep
// Body: { courseId, courseCode?, courseName?, sessionCode?, date, time, status, notes?, repName?, lecturerEmail?, lecturerName? }
// ──────────────────────────────────────────────────────────
async function handleLecturerMarkedByRep(req, res) {
  const {
    courseId,
    courseCode,
    courseName,
    sessionCode,
    date,
    time,
    status,
    notes,
    repName,
    lecturerEmail,
    lecturerName,
  } = req.body

  if (!courseId && !courseCode) {
    return res.status(400).json({ message: 'courseId or courseCode is required' })
  }

  try {
    let resolvedEmail = lecturerEmail
    let resolvedLecturerName = lecturerName
    let resolvedCourseCode = courseCode || 'COURSE'
    let resolvedCourseName = courseName || 'Module'

    // If course details not complete, look up in DB
    if ((!resolvedCourseCode || resolvedCourseCode === 'COURSE' || !resolvedEmail) && courseId) {
      const { data: cData } = await supabase.from('courses').select('id, code, name').eq('id', courseId).maybeSingle()
      if (cData) {
        resolvedCourseCode = cData.code
        resolvedCourseName = cData.name
      }
    }

    // If lecturer email not provided, look up from Session PIN or Schedules
    if (!resolvedEmail) {
      if (sessionCode) {
        const { data: sData } = await supabase
          .from('sessions')
          .select('lecturer_id, users(name, email)')
          .eq('pin', sessionCode.toString().trim())
          .maybeSingle()
        if (sData?.users?.email) {
          resolvedEmail = sData.users.email
          resolvedLecturerName = sData.users.name || resolvedLecturerName
        }
      }

      if (!resolvedEmail && courseId) {
        // Check latest session for this course
        const { data: latestSess } = await supabase
          .from('sessions')
          .select('lecturer_id, users(name, email)')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (latestSess?.users?.email) {
          resolvedEmail = latestSess.users.email
          resolvedLecturerName = latestSess.users.name || resolvedLecturerName
        }
      }

      if (!resolvedEmail && courseId) {
        // Fallback: check schedules table
        const { data: schData } = await supabase
          .from('schedules')
          .select('lecturer')
          .eq('course_id', courseId)
          .limit(1)
          .maybeSingle()
        if (schData?.lecturer) {
          const { data: uData } = await supabase
            .from('users')
            .select('id, name, email')
            .ilike('name', `%${schData.lecturer}%`)
            .maybeSingle()
          if (uData?.email) {
            resolvedEmail = uData.email
            resolvedLecturerName = uData.name || resolvedLecturerName
          }
        }
      }
    }

    if (!resolvedEmail) {
      return res.status(200).json({
        success: false,
        message: 'Class rep attendance recorded, but no lecturer email was found on file for this course.',
      })
    }

    await transporter.sendMail({
      from: `"Southshore Attendance · Monitoring" <${process.env.MAIL_USER}>`,
      to: resolvedEmail,
      subject: `📢 Lecture Attendance Logged: ${resolvedCourseCode} (${(status || 'PRESENT').toUpperCase()}) by Class Rep`,
      html: buildLecturerMarkedByRepHtml({
        lecturerName: resolvedLecturerName || 'Faculty Member',
        courseCode: resolvedCourseCode,
        courseName: resolvedCourseName,
        status: status || 'present',
        sessionCode: sessionCode || '',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '',
        repName: repName || 'Designated Class Representative',
        notes: notes || '',
      }),
    })

    console.log(`✅ Class rep attendance notification dispatched to lecturer → ${resolvedEmail}`)
    res.status(200).json({
      success: true,
      message: 'Lecturer notified of attendance record successfully.',
      lecturerEmail: resolvedEmail,
    })
  } catch (err) {
    console.error('❌ lecturer-marked-by-rep error:', err)
    res.status(500).json({ message: 'Failed to notify lecturer', error: err.message })
  }
}

app.post('/api/attendance/lecturer-marked-by-rep', handleLecturerMarkedByRep)
app.post('/api/otp/lecturer-marked-by-rep', handleLecturerMarkedByRep)

// ──────────────────────────────────────────────────────────
// EXISTING OTP ENDPOINTS (Preserved & Backward Compatible)
// ──────────────────────────────────────────────────────────

app.post('/api/otp/send', async (req, res) => {
  const { sessionId, studentId, email, otp, name } = req.body

  if (!sessionId || !studentId) return res.status(400).json({ message: 'sessionId and studentId are required' })
  if (!email) return res.status(400).json({ message: 'Email is required' })
  if (!otp) return res.status(400).json({ message: 'otp is required — pass the code shown on the lecturer dashboard' })

  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ message: 'Invalid email format' })

  const result = await sendOtpForStudent({ sessionId, studentId, email, otp, displayName: name || email })
  const status = result.success ? 200 : result.code === 'COOLDOWN' ? 429 : result.code === 'BAD_REQUEST' ? 400 : 500
  res.status(status).json(result)
})

app.post('/api/otp/send-bulk', async (req, res) => {
  const { sessionId, otp, students, isAbsence, courseCode, courseName } = req.body

  // If students array is omitted or empty but sessionId or otp is provided, automatically forward to unified session dispatcher!
  if ((!Array.isArray(students) || students.length === 0) && (sessionId || otp)) {
    return handleNotifySession(req, res)
  }

  if (!sessionId) return res.status(400).json({ message: 'sessionId is required' })
  if (!otp) return res.status(400).json({ message: 'otp is required' })
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'students must be a non-empty array' })
  }
  if (students.length > BULK_SEND_LIMIT) {
    return res.status(400).json({ message: `Cannot send to more than ${BULK_SEND_LIMIT} students at once` })
  }

  const seen = new Set()
  const preValidated = students.map((s) => {
    if (!s.studentId || !s.email) {
      return { studentId: s.studentId, email: s.email, success: false, code: 'BAD_REQUEST', message: 'studentId and email are required' }
    }
    if (!EMAIL_REGEX.test(s.email)) {
      return { studentId: s.studentId, email: s.email, success: false, code: 'BAD_REQUEST', message: 'Invalid email format' }
    }
    if (seen.has(s.studentId)) {
      return { studentId: s.studentId, email: s.email, success: false, code: 'DUPLICATE', message: 'Duplicate studentId in request' }
    }
    seen.add(s.studentId)
    return null
  })

  const toSend = students.filter((_, i) => preValidated[i] === null)

  const sent = await Promise.all(
    toSend.map(async (s) => {
      if (isAbsence) {
        try {
          await transporter.sendMail({
            from: `"Southshore Attendance" <${process.env.MAIL_USER}>`,
            to: s.email,
            subject: `❌ Absence Notification: ${courseCode || 'Class Session'}`,
            html: buildAbsentNotificationHtml({
              studentName: s.name || s.email,
              courseCode: courseCode || 'COURSE',
              courseName: courseName || 'Lecture Session',
              sessionCode: otp,
              date: new Date().toISOString().split('T')[0],
              time: 'Class Session',
            }),
          })
          return { studentId: s.studentId, email: s.email, success: true, message: 'Absence notification sent' }
        } catch (err) {
          return { studentId: s.studentId, email: s.email, success: false, code: 'SEND_FAILED', message: err.message }
        }
      }
      return sendOtpForStudent({ sessionId, studentId: s.studentId, email: s.email, otp, displayName: s.name || s.email })
    })
  )

  let sentIdx = 0
  const results = preValidated.map((failure) => (failure ? failure : sent[sentIdx++]))

  const successCount = results.filter((r) => r.success).length
  console.log(`📧 Bulk dispatch for session ${sessionId}: ${successCount}/${results.length} sent`)

  res.status(200).json({
    message: `${successCount}/${results.length} emails dispatched successfully`,
    sent: successCount,
    failed: results.length - successCount,
    results,
  })
})

app.post('/api/otp/send-absence-bulk', async (req, res) => {
  req.body.isAbsence = true
  return app._router.handle(req, res)
})

app.post('/api/otp/resend', async (req, res) => {
  const { sessionId, studentId, email, otp, name } = req.body

  if (!sessionId || !studentId) return res.status(400).json({ message: 'sessionId and studentId are required' })
  if (!email) return res.status(400).json({ message: 'Email is required' })
  if (!otp) return res.status(400).json({ message: 'otp is required — pass the code shown on the lecturer dashboard' })

  const result = await sendOtpForStudent({ sessionId, studentId, email, otp, displayName: name || email })
  const status = result.success ? 200 : result.code === 'COOLDOWN' ? 429 : result.code === 'BAD_REQUEST' ? 400 : 500
  res.status(status).json(result)
})

app.post('/api/otp/verify', async (req, res) => {
  const { sessionId, studentId, otp } = req.body

  if (!sessionId || !studentId || !otp) {
    return res.status(400).json({ message: 'sessionId, studentId, and otp are required' })
  }

  const row = await getOtpRow(sessionId, studentId)
  if (!row) return res.status(404).json({ message: 'No code found for this session. Please request a new one.' })

  if (row.verified_at) {
    return res.status(409).json({ message: 'This code has already been used.' })
  }
  if (new Date() > new Date(row.expires_at)) {
    return res.status(410).json({ message: 'Code has expired. Please request a new one.' })
  }
  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many failed attempts. Please request a new code.' })
  }

  if (row.otp !== otp.toString().trim()) {
    await supabase
      .from('session_otps')
      .update({ attempts: row.attempts + 1 })
      .eq('session_id', sessionId)
      .eq('student_id', studentId)

    return res.status(401).json({
      message: 'Invalid code',
      attemptsLeft: MAX_VERIFY_ATTEMPTS - (row.attempts + 1),
    })
  }

  await supabase
    .from('session_otps')
    .update({ verified_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('student_id', studentId)

  console.log(`✅ OTP verified → student ${studentId}, session ${sessionId}`)
  res.status(200).json({ message: 'Code verified successfully', verified: true })
})

// ──────────────────────────────────────────────────────────
// FORGOT PASSWORD ENDPOINTS
// ──────────────────────────────────────────────────────────

app.post('/api/auth/forgot-password/send', async (req, res) => {
  const { email: rawEmail } = req.body

  if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
    return res.status(400).json({ message: 'A valid email is required' })
  }

  const email = rawEmail.trim().toLowerCase()
  const GENERIC_MESSAGE = 'If an account exists for that email, a reset code has been sent.'

  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    return res.status(200).json({ message: GENERIC_MESSAGE })
  }

  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('email', email)
    .maybeSingle()

  if (profileErr) {
    console.error('❌ Failed to look up user for password reset:', profileErr.message)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }

  if (!profile) {
    return res.status(200).json({ message: GENERIC_MESSAGE })
  }

  let existing
  try {
    existing = await getPasswordResetRow(email)
  } catch (error) {
    console.error('❌ Failed to check existing reset code:', error.message)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }

  const cooldown = cooldownRemaining(existing)
  if (cooldown > 0) {
    return res.status(429).json({ message: `Please wait ${cooldown} seconds before requesting a new code`, cooldown })
  }

  const otp = generateOtp()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS)

  const { error: upsertErr } = await supabase
    .from('password_reset_otps')
    .upsert(
      {
        email,
        otp,
        attempts: 0,
        expires_at: expiresAt.toISOString(),
        verified_at: null,
        reset_token: null,
        reset_token_expires_at: null,
        created_at: now.toISOString(),
      },
      { onConflict: 'email' }
    )

  if (upsertErr) {
    console.error('❌ Failed to persist password reset OTP:', upsertErr.message)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }

  try {
    await transporter.sendMail({
      from: `"Southshore Attendance" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset Code',
      html: buildPasswordResetHtml({ displayName: profile.name || email, otp }),
    })
    console.log(`✅ Password reset OTP dispatched → ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error.message)
    await supabase.from('password_reset_otps').delete().eq('email', email)
    return res.status(200).json({ message: GENERIC_MESSAGE })
  }

  res.status(200).json({ message: GENERIC_MESSAGE })
})

app.post('/api/auth/forgot-password/verify', async (req, res) => {
  const { email: rawEmail, otp } = req.body

  if (!rawEmail || !otp) {
    return res.status(400).json({ message: 'email and otp are required' })
  }

  const email = rawEmail.trim().toLowerCase()
  const INVALID_MESSAGE = 'Invalid or expired code. Please request a new one.'

  let row
  try {
    row = await getPasswordResetRow(email)
  } catch (error) {
    console.error('❌ Failed to load password reset row:', error.message)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }

  if (!row) return res.status(400).json({ message: INVALID_MESSAGE })
  if (new Date() > new Date(row.expires_at)) return res.status(400).json({ message: INVALID_MESSAGE })
  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many failed attempts. Please request a new code.' })
  }

  if (row.otp !== otp.toString().trim()) {
    await supabase
      .from('password_reset_otps')
      .update({ attempts: row.attempts + 1 })
      .eq('email', email)

    return res.status(401).json({
      message: 'Invalid code',
      attemptsLeft: MAX_VERIFY_ATTEMPTS - (row.attempts + 1),
    })
  }

  const resetToken = generateResetToken()
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS)

  const { error: updateErr } = await supabase
    .from('password_reset_otps')
    .update({
      verified_at: new Date().toISOString(),
      reset_token: resetToken,
      reset_token_expires_at: resetTokenExpiresAt.toISOString(),
    })
    .eq('email', email)

  if (updateErr) {
    console.error('❌ Failed to mark password reset OTP verified:', updateErr.message)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }

  console.log(`✅ Password reset OTP verified → ${email}`)
  res.status(200).json({
    message: 'Code verified successfully',
    verified: true,
    resetToken,
    expiresIn: RESET_TOKEN_EXPIRY_MS / 1000,
  })
})

app.post('/api/auth/forgot-password/reset', async (req, res) => {
  const { email: rawEmail, resetToken, newPassword } = req.body

  if (!rawEmail || !resetToken || !newPassword) {
    return res.status(400).json({ message: 'email, resetToken, and newPassword are required' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })
  }

  const email = rawEmail.trim().toLowerCase()
  const INVALID_MESSAGE = 'This reset session is invalid or has expired. Please start over.'

  let row
  try {
    row = await getPasswordResetRow(email)
  } catch (error) {
    console.error('❌ Failed to load password reset row:', error.message)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }

  if (!row || !row.verified_at || !row.reset_token) {
    return res.status(400).json({ message: INVALID_MESSAGE })
  }
  if (row.reset_token !== resetToken) {
    return res.status(400).json({ message: INVALID_MESSAGE })
  }
  if (new Date() > new Date(row.reset_token_expires_at)) {
    return res.status(400).json({ message: INVALID_MESSAGE })
  }

  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (profileErr || !profile) {
    console.error('❌ Failed to look up user for password reset:', profileErr?.message)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }

  const { error: adminErr } = await supabase.auth.admin.updateUserById(profile.id, {
    password: newPassword,
  })

  if (adminErr) {
    console.error(`❌ Failed to update password for ${email}:`, adminErr.message)
    return res.status(500).json({ message: 'Failed to update password. Please try again.' })
  }

  await supabase.from('password_reset_otps').delete().eq('email', email)

  console.log(`✅ Password reset completed → ${email}`)
  res.status(200).json({ message: 'Password updated successfully' })
})

app.get('/api/health', async (req, res) => {
  const { count } = await supabase
    .from('session_otps')
    .select('*', { count: 'exact', head: true })
    .is('verified_at', null)

  res.status(200).json({
    status: 'Southshore Attendance OTP & Notification API is running',
    email: process.env.MAIL_USER ? 'configured' : 'not configured',
    pendingOTPs: count ?? 0,
    timestamp: new Date().toISOString(),
  })
})

app.get('/', (req, res) => {
  res.json({
    message: 'Southshore Attendance OTP & Notification API — developed by Mbills Enterprise',
    endpoints: {
      health:                   'GET  /api/health',
      notifySession:            'POST /api/attendance/notify-session          { sessionCode }',
      lecturerMarkedByRep:      'POST /api/attendance/lecturer-marked-by-rep  { courseId, sessionCode, date, time, status, notes?, repName? }',
      send:                     'POST /api/otp/send                           { sessionId, studentId, email, otp, name? }',
      sendBulk:                 'POST /api/otp/send-bulk                      { sessionId, otp, students: [{ studentId, email, name? }] }',
      resend:                   'POST /api/otp/resend                         { sessionId, studentId, email, otp, name? }',
      verify:                   'POST /api/otp/verify                         { sessionId, studentId, otp }',
      forgotPasswordSend:       'POST /api/auth/forgot-password/send          { email }',
      forgotPasswordVerify:     'POST /api/auth/forgot-password/verify        { email, otp }',
      forgotPasswordReset:      'POST /api/auth/forgot-password/reset         { email, resetToken, newPassword }',
    },
  })
})

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    available: [
      'GET  /api/health',
      'POST /api/attendance/notify-session',
      'POST /api/attendance/lecturer-marked-by-rep',
      'POST /api/otp/send',
      'POST /api/otp/send-bulk',
      'POST /api/otp/resend',
      'POST /api/otp/verify',
      'POST /api/auth/forgot-password/send',
      'POST /api/auth/forgot-password/verify',
      'POST /api/auth/forgot-password/reset',
    ],
  })
})

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message)
  res.status(500).json({ message: 'Internal server error', error: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Southshore Attendance OTP & Notification server running on port ${PORT}`)
  console.log(`📧 Mail: ${process.env.MAIL_USER}`)
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`)
})
