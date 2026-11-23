import { supabase } from '@/stores/supabase';

function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds the complete structured attendance dossier for a student.
 * Contains:
 * - Student profile
 * - List of registered courses
 * - Performance metrics for each course (held, present, absent, rate, standing)
 * - Session-by-session records for each course (date, code, present/absent)
 * - Overall semester metrics
 */
export function buildStudentDossier(student, { enrollments = [], courses = [], sessions = [], attendances = [], programmes = [] }) {
  const studentId = student.id;
  const idNumber = student.idNumber || student.id_number || student.studentId;
  const altIds = new Set([studentId, idNumber].filter(Boolean));
  const studentMode = (student.mode || 'Regular').trim();

  // 1. Find all courses the student registered for (enrolled in)
  // Match on either UUID or student ID number to be 100% resilient
  const studentEnrollments = enrollments.filter(e => 
    altIds.has(e.studentId) || altIds.has(e.student_id)
  );
  const enrolledCourseIds = new Set(studentEnrollments.map(e => e.courseId || e.course_id));

  // Build sessions map for quick lookup
  const courseSessionsMap = new Map();
  sessions.forEach(s => {
    const cId = s.courseId || s.course_id;
    if (!courseSessionsMap.has(cId)) {
      courseSessionsMap.set(cId, []);
    }
    courseSessionsMap.get(cId).push(s);
  });

  // Build attendances map for this student: sessionId -> attendance record
  const studentAttendanceMap = new Map();
  attendances.forEach(a => {
    const aStudentId = a.studentId || a.student_id;
    const aSessionId = a.sessionId || a.session_id;
    if (altIds.has(aStudentId)) {
      studentAttendanceMap.set(aSessionId, a);
    }
  });

  // Resolve programme name
  const prog = programmes.find(p => p.id === student.programId || p.id === student.program_id);
  const programmeName = prog?.name || student.program || student.programmeName || 'General Programme';

  // 2. Compute performance for each registered course
  const courseBreakdown = [];
  let cumulativeSessionsHeld = 0;
  let cumulativePresent = 0;
  let cumulativeAbsent = 0;

  for (const courseId of enrolledCourseIds) {
    const course = courses.find(c => c.id === courseId) || { id: courseId, code: '—', name: 'Course' };
    const rawSessions = courseSessionsMap.get(courseId) || [];

    // Filter sessions matching student study mode if specified
    let eligibleSessions = rawSessions.filter(s => {
      if (!s.mode) return true;
      return s.mode.toLowerCase() === studentMode.toLowerCase();
    });
    // Fallback if no mode-specific session found
    if (eligibleSessions.length === 0 && rawSessions.length > 0) {
      eligibleSessions = rawSessions;
    }

    // Sort sessions chronologically
    eligibleSessions.sort((a, b) => new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0));

    // Evaluate each session
    let presentCount = 0;
    let absentCount = 0;
    const sessionLogs = [];

    eligibleSessions.forEach((s, idx) => {
      const att = studentAttendanceMap.get(s.id);
      const isPresent = att?.status === 'present';
      const isExplicitAbsent = att?.status === 'absent';
      
      let status = 'Absent';
      if (isPresent) {
        status = 'Present';
        presentCount++;
      } else {
        absentCount++;
      }

      sessionLogs.push({
        sessionNumber: idx + 1,
        sessionId: s.id,
        sessionPin: s.pin || '—',
        date: s.date ? new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Session Date',
        rawDate: s.date || s.createdAt || null,
        status, // 'Present' or 'Absent'
        recordedAt: att?.timestamp ? new Date(att.timestamp).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'System Default',
      });
    });

    const sessionsHeld = eligibleSessions.length;
    const rate = sessionsHeld > 0 ? Math.round((presentCount / sessionsHeld) * 100) : null;
    
    let eligibility = 'Eligible';
    if (sessionsHeld > 0) {
      if (rate < 60) eligibility = 'Ineligible (Barred)';
      else if (rate < 75) eligibility = 'At Risk';
      else eligibility = 'Eligible';
    } else {
      eligibility = 'No Classes Yet';
    }

    cumulativeSessionsHeld += sessionsHeld;
    cumulativePresent += presentCount;
    cumulativeAbsent += absentCount;

    courseBreakdown.push({
      courseId,
      code: course.code || '—',
      name: course.name || 'Untitled Course',
      semester: course.semester || 'Semester 1',
      credits: course.credits || 3,
      sessionsHeld,
      present: presentCount,
      absent: absentCount,
      rate, // null if 0 sessions
      eligibility,
      sessionLogs,
    });
  }

  // Sort registered courses by code
  courseBreakdown.sort((a, b) => a.code.localeCompare(b.code));

  // 3. Compute overall student standing
  const overallRate = cumulativeSessionsHeld > 0 
    ? Math.round((cumulativePresent / cumulativeSessionsHeld) * 100) 
    : (courseBreakdown.length > 0 ? 100 : 0);

  let overallStanding = 'Eligible';
  if (cumulativeSessionsHeld > 0) {
    if (overallRate < 60 || courseBreakdown.some(c => c.sessionsHeld >= 3 && c.rate !== null && c.rate < 60)) {
      overallStanding = 'Ineligible (Barred)';
    } else if (overallRate < 75 || courseBreakdown.some(c => c.sessionsHeld >= 3 && c.rate !== null && c.rate < 75)) {
      overallStanding = 'At Risk';
    } else {
      overallStanding = 'Fully Cleared';
    }
  } else {
    overallStanding = 'Pending Sessions';
  }

  return {
    id: student.id,
    studentId: student.id_number || student.idNumber || student.studentId || student.id,
    name: student.name || 'Student',
    email: student.email || '—',
    programme: programmeName,
    faculty: student.faculty || '—',
    level: student.level || '100',
    mode: studentMode,
    totalCourses: courseBreakdown.length,
    cumulativeSessionsHeld,
    cumulativePresent,
    cumulativeAbsent,
    overallRate,
    overallStanding,
    courses: courseBreakdown,
  };
}

/**
 * Generates and downloads an Excel SpreadsheetML (.xls) workbook
 * containing all queued students with registered courses and detailed session logs.
 */
export function exportStudentsAttendanceToExcel(studentsDossiers, options = {}) {
  if (!studentsDossiers || studentsDossiers.length === 0) {
    throw new Error('No students selected for export.');
  }

  const exportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Sheet 1: Student Overview ───────────────────────────────────────────────
  const summaryRowsXml = studentsDossiers.map(st => `
    <Row ss:Height="20">
      <Cell ss:StyleID="CellID"><Data ss:Type="String">${escapeXml(st.studentId)}</Data></Cell>
      <Cell ss:StyleID="CellName"><Data ss:Type="String">${escapeXml(st.name)}</Data></Cell>
      <Cell ss:StyleID="CellRegular"><Data ss:Type="String">${escapeXml(st.programme)}</Data></Cell>
      <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(st.level)}</Data></Cell>
      <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(st.mode)}</Data></Cell>
      <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${st.totalCourses}</Data></Cell>
      <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${st.cumulativeSessionsHeld}</Data></Cell>
      <Cell ss:StyleID="CellPresent"><Data ss:Type="Number">${st.cumulativePresent}</Data></Cell>
      <Cell ss:StyleID="CellAbsent"><Data ss:Type="Number">${st.cumulativeAbsent}</Data></Cell>
      <Cell ss:StyleID="CellRate"><Data ss:Type="String">${st.overallRate}%</Data></Cell>
      <Cell ss:StyleID="${st.overallStanding.includes('Ineligible') ? 'CellAbsent' : (st.overallStanding === 'At Risk' ? 'CellWarning' : 'CellPresent')}">
        <Data ss:Type="String">${escapeXml(st.overallStanding)}</Data>
      </Cell>
    </Row>
  `).join('');

  // ── Sheet 2: Course Performance Matrix ─────────────────────────────────────
  let courseMatrixRowsXml = '';
  studentsDossiers.forEach(st => {
    st.courses.forEach(c => {
      const rateText = c.rate !== null ? `${c.rate}%` : 'N/A';
      courseMatrixRowsXml += `
        <Row ss:Height="20">
          <Cell ss:StyleID="CellID"><Data ss:Type="String">${escapeXml(st.studentId)}</Data></Cell>
          <Cell ss:StyleID="CellName"><Data ss:Type="String">${escapeXml(st.name)}</Data></Cell>
          <Cell ss:StyleID="CellRegular"><Data ss:Type="String">${escapeXml(st.mode)}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(c.code)}</Data></Cell>
          <Cell ss:StyleID="CellRegular"><Data ss:Type="String">${escapeXml(c.name)}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(c.semester)}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${c.sessionsHeld}</Data></Cell>
          <Cell ss:StyleID="CellPresent"><Data ss:Type="Number">${c.present}</Data></Cell>
          <Cell ss:StyleID="CellAbsent"><Data ss:Type="Number">${c.absent}</Data></Cell>
          <Cell ss:StyleID="CellRate"><Data ss:Type="String">${rateText}</Data></Cell>
          <Cell ss:StyleID="${c.eligibility.includes('Ineligible') ? 'CellAbsent' : (c.eligibility === 'At Risk' ? 'CellWarning' : 'CellPresent')}">
            <Data ss:Type="String">${escapeXml(c.eligibility)}</Data>
          </Cell>
        </Row>
      `;
    });
  });

  // ── Sheet 3: Detailed Session Audit Ledger ─────────────────────────────────
  let sessionLedgerRowsXml = '';
  studentsDossiers.forEach(st => {
    st.courses.forEach(c => {
      c.sessionLogs.forEach(log => {
        sessionLedgerRowsXml += `
          <Row ss:Height="19">
            <Cell ss:StyleID="CellID"><Data ss:Type="String">${escapeXml(st.studentId)}</Data></Cell>
            <Cell ss:StyleID="CellName"><Data ss:Type="String">${escapeXml(st.name)}</Data></Cell>
            <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(c.code)}</Data></Cell>
            <Cell ss:StyleID="CellRegular"><Data ss:Type="String">${escapeXml(c.name)}</Data></Cell>
            <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${log.sessionNumber}</Data></Cell>
            <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(log.date)}</Data></Cell>
            <Cell ss:StyleID="CellCenter"><Data ss:Type="String">#${escapeXml(log.sessionPin)}</Data></Cell>
            <Cell ss:StyleID="${log.status === 'Present' ? 'CellPresent' : 'CellAbsent'}">
              <Data ss:Type="String">${log.status}</Data>
            </Cell>
            <Cell ss:StyleID="CellMeta"><Data ss:Type="String">${escapeXml(log.recordedAt)}</Data></Cell>
          </Row>
        `;
      });
    });
  });

  const workbookXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>Official Student Attendance Audit</Title>
    <Author>Southshore University College</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center" />
      <Borders />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a" />
      <Interior />
      <NumberFormat />
      <Protection />
    </Style>
    <Style ss:ID="InstitutionBanner">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#bc9333" />
      <Interior ss:Color="#031c45" ss:Pattern="Solid" />
    </Style>
    <Style ss:ID="HeadingMeta">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#475569" />
      <Interior ss:Color="#f8fafc" ss:Pattern="Solid" />
    </Style>
    <Style ss:ID="ColHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#bc9333" />
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1" />
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#ffffff" />
      <Interior ss:Color="#031c45" ss:Pattern="Solid" />
    </Style>
    <Style ss:ID="CellID">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Consolas" ss:Size="10" ss:Bold="1" ss:Color="#031c45" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
    <Style ss:ID="CellName">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0f172a" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
    <Style ss:ID="CellRegular">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
    <Style ss:ID="CellCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
    <Style ss:ID="CellPresent">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857" />
      <Interior ss:Color="#ecfdf5" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
    <Style ss:ID="CellAbsent">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#b91c1c" />
      <Interior ss:Color="#fef2f2" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
    <Style ss:ID="CellWarning">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#b45309" />
      <Interior ss:Color="#fffbeb" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
    <Style ss:ID="CellRate">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Consolas" ss:Size="10" ss:Bold="1" ss:Color="#031c45" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
    <Style ss:ID="CellMeta">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#64748b" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0" />
      </Borders>
    </Style>
  </Styles>

  <!-- SHEET 1: STUDENT OVERVIEW -->
  <Worksheet ss:Name="Student Overview">
    <Table>
      <Column ss:Width="110" />
      <Column ss:Width="190" />
      <Column ss:Width="170" />
      <Column ss:Width="60" />
      <Column ss:Width="75" />
      <Column ss:Width="75" />
      <Column ss:Width="75" />
      <Column ss:Width="65" />
      <Column ss:Width="65" />
      <Column ss:Width="75" />
      <Column ss:Width="130" />

      <Row ss:Height="26">
        <Cell ss:MergeAcross="10" ss:StyleID="InstitutionBanner">
          <Data ss:Type="String">Southshore University College · Student Attendance Dossier Summary</Data>
        </Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="10" ss:StyleID="HeadingMeta">
          <Data ss:Type="String">Generated: ${exportDate} · Total Queued Students: ${studentsDossiers.length}</Data>
        </Cell>
      </Row>
      <Row ss:Height="10" />

      <Row ss:Height="22">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student ID</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student Name</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Programme</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Level</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mode</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Courses</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Sessions</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Present</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Absent</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Rate (%)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Exam Standing</Data></Cell>
      </Row>
      ${summaryRowsXml}
    </Table>
  </Worksheet>

  <!-- SHEET 2: COURSE PERFORMANCE MATRIX -->
  <Worksheet ss:Name="Course Breakdown">
    <Table>
      <Column ss:Width="110" />
      <Column ss:Width="190" />
      <Column ss:Width="75" />
      <Column ss:Width="85" />
      <Column ss:Width="200" />
      <Column ss:Width="85" />
      <Column ss:Width="75" />
      <Column ss:Width="65" />
      <Column ss:Width="65" />
      <Column ss:Width="75" />
      <Column ss:Width="130" />

      <Row ss:Height="26">
        <Cell ss:MergeAcross="10" ss:StyleID="InstitutionBanner">
          <Data ss:Type="String">Southshore University College · Course-by-Course Attendance Performance</Data>
        </Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="10" ss:StyleID="HeadingMeta">
          <Data ss:Type="String">Detailed breakdown per student per registered course module</Data>
        </Cell>
      </Row>
      <Row ss:Height="10" />

      <Row ss:Height="22">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student ID</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student Name</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mode</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Course Code</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Course Name</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Semester</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Held</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Present</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Absent</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Rate (%)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Course Status</Data></Cell>
      </Row>
      ${courseMatrixRowsXml}
    </Table>
  </Worksheet>

  <!-- SHEET 3: DETAILED SESSION LEDGER -->
  <Worksheet ss:Name="Session Audit Log">
    <Table>
      <Column ss:Width="110" />
      <Column ss:Width="190" />
      <Column ss:Width="85" />
      <Column ss:Width="190" />
      <Column ss:Width="65" />
      <Column ss:Width="95" />
      <Column ss:Width="80" />
      <Column ss:Width="90" />
      <Column ss:Width="140" />

      <Row ss:Height="26">
        <Cell ss:MergeAcross="8" ss:StyleID="InstitutionBanner">
          <Data ss:Type="String">Southshore University College · Chronological Attendance Session Ledger</Data>
        </Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="8" ss:StyleID="HeadingMeta">
          <Data ss:Type="String">Verifiable transaction audit log of all class attendance check-ins</Data>
        </Cell>
      </Row>
      <Row ss:Height="10" />

      <Row ss:Height="22">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student ID</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student Name</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Course Code</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Course Name</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Week #</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Session Date</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">PIN Code</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Rollcall Status</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Recorded At</Data></Cell>
      </Row>
      ${sessionLedgerRowsXml}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([workbookXml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = studentsDossiers.length === 1
    ? `Student_Attendance_${studentsDossiers[0].studentId.replace(/[^\w-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`
    : `Students_Attendance_Queue_${studentsDossiers.length}_Records_${new Date().toISOString().slice(0, 10)}.xls`;

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an official printable PDF / Dossier window for queued students.
 * Includes official university header, per-student profile, course table,
 * and complete date-by-date session audit records.
 */
export function exportStudentsAttendanceToPdf(studentsDossiers, options = {}) {
  if (!studentsDossiers || studentsDossiers.length === 0) {
    throw new Error('No students selected for printable export.');
  }

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const studentsHtml = studentsDossiers.map((st, sIdx) => {
    const isLast = sIdx === studentsDossiers.length - 1;
    const standingPillClass = st.overallStanding.includes('Ineligible') 
      ? 'status-ineligible' 
      : (st.overallStanding === 'At Risk' ? 'status-risk' : 'status-eligible');

    // Build courses table
    const courseRows = st.courses.map(c => {
      const rateBadge = c.rate !== null ? `${c.rate}%` : 'N/A';
      const cPill = c.eligibility.includes('Ineligible') 
        ? 'badge-ineligible' 
        : (c.eligibility === 'At Risk' ? 'badge-risk' : 'badge-eligible');

      return `
        <tr>
          <td class="font-mono font-bold">${escapeXml(c.code)}</td>
          <td>
            <div class="font-bold text-slate-900">${escapeXml(c.name)}</div>
            <div class="text-xs text-slate-500">${escapeXml(c.semester)} · ${c.credits} Credits</div>
          </td>
          <td class="text-center font-mono">${c.sessionsHeld}</td>
          <td class="text-center font-mono text-emerald-700 font-bold">${c.present}</td>
          <td class="text-center font-mono text-rose-600 font-bold">${c.absent}</td>
          <td class="text-center font-mono font-bold">${rateBadge}</td>
          <td class="text-center">
            <span class="pill ${cPill}">${escapeXml(c.eligibility)}</span>
          </td>
        </tr>
      `;
    }).join('');

    // Build session logs breakdown by course
    const sessionLedgers = st.courses.map(c => {
      if (c.sessionLogs.length === 0) {
        return `
          <div class="course-session-block">
            <div class="course-session-header">
              <span class="font-mono font-bold text-navy">${escapeXml(c.code)}: ${escapeXml(c.name)}</span>
              <span class="text-slate-500 text-xs">No lecture sessions held yet</span>
            </div>
          </div>
        `;
      }

      const logItems = c.sessionLogs.map(log => `
        <div class="session-item ${log.status === 'Present' ? 'session-present' : 'session-absent'}">
          <div class="session-top">
            <span class="font-bold font-mono">Week ${log.sessionNumber}</span>
            <span class="session-status-badge ${log.status === 'Present' ? 'present' : 'absent'}">
              ${log.status === 'Present' ? '✓ Present' : '✕ Absent'}
            </span>
          </div>
          <div class="session-date">${escapeXml(log.date)}</div>
          <div class="session-code">PIN: #${escapeXml(log.sessionPin)}</div>
        </div>
      `).join('');

      return `
        <div class="course-session-block">
          <div class="course-session-header">
            <div>
              <span class="font-mono font-bold text-navy">${escapeXml(c.code)}</span>
              <span class="font-bold text-slate-800 ml-1">— ${escapeXml(c.name)}</span>
            </div>
            <div class="course-session-stats">
              Held: <strong>${c.sessionsHeld}</strong> | Present: <strong class="text-emerald-700">${c.present}</strong> | Absent: <strong class="text-rose-600">${c.absent}</strong> | Rate: <strong>${c.rate !== null ? c.rate + '%' : 'N/A'}</strong>
            </div>
          </div>
          <div class="session-grid">
            ${logItems}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="student-dossier-page ${!isLast ? 'page-break' : ''}">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <div class="crest-container">
              <div class="crest-box">SSUC</div>
            </div>
            <div>
              <div class="institution-sub">SOUTHSHORE UNIVERSITY COLLEGE</div>
              <h1 class="header-title">OFFICIAL STUDENT ATTENDANCE DOSSIER</h1>
              <div class="header-desc">Directorate of Academic Affairs &amp; Examination Clearance Audit</div>
            </div>
          </div>
          <div class="header-right">
            <div class="doc-badge">AUDIT RECORD</div>
            <div class="header-date">Issued: ${currentDate}</div>
          </div>
        </div>

        <!-- Student Profile Card -->
        <div class="profile-card">
          <div class="profile-col">
            <div class="profile-label">Student Name</div>
            <div class="profile-value-lg">${escapeXml(st.name)}</div>
            <div class="profile-sub">${escapeXml(st.email)}</div>
          </div>
          <div class="profile-col">
            <div class="profile-label">Student ID Number</div>
            <div class="profile-value font-mono text-navy">${escapeXml(st.studentId)}</div>
            <div class="profile-sub">Mode: <strong>${escapeXml(st.mode)}</strong> · Level: <strong>${escapeXml(st.level)}</strong></div>
          </div>
          <div class="profile-col">
            <div class="profile-label">Academic Programme</div>
            <div class="profile-value">${escapeXml(st.programme)}</div>
            <div class="profile-sub">Faculty: ${escapeXml(st.faculty)}</div>
          </div>
          <div class="profile-col-standing">
            <div class="profile-label text-center">Examination Clearance</div>
            <div class="standing-pill ${standingPillClass}">${escapeXml(st.overallStanding)}</div>
            <div class="overall-score font-mono">${st.overallRate}% Cumulative</div>
          </div>
        </div>

        <!-- KPI Strip -->
        <div class="kpi-strip">
          <div class="kpi-item">
            <div class="kpi-num">${st.totalCourses}</div>
            <div class="kpi-lbl">Registered Courses</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-num font-mono">${st.cumulativeSessionsHeld}</div>
            <div class="kpi-lbl">Total Classes Held</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-num font-mono text-emerald-700">${st.cumulativePresent}</div>
            <div class="kpi-lbl">Classes Attended</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-num font-mono text-rose-600">${st.cumulativeAbsent}</div>
            <div class="kpi-lbl">Classes Missed</div>
          </div>
          <div class="kpi-item highlight">
            <div class="kpi-num font-mono text-navy">${st.overallRate}%</div>
            <div class="kpi-lbl">Cumulative Rate</div>
          </div>
        </div>

        <!-- Registered Courses Performance Table -->
        <div class="section-title">
          <span>Registered Courses Attendance Performance</span>
          <span class="section-sub">${st.totalCourses} Active Course Registrations</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 100px;">Code</th>
              <th>Course Title &amp; Details</th>
              <th style="width: 80px; text-align: center;">Held</th>
              <th style="width: 80px; text-align: center;">Present</th>
              <th style="width: 80px; text-align: center;">Absent</th>
              <th style="width: 80px; text-align: center;">Rate (%)</th>
              <th style="width: 130px; text-align: center;">Exam Standing</th>
            </tr>
          </thead>
          <tbody>
            ${courseRows.length > 0 ? courseRows : `<tr><td colspan="7" style="text-align:center; padding: 20px;">No registered courses found for this student.</td></tr>`}
          </tbody>
        </table>

        <!-- Detailed Session Records for Courses -->
        <div class="section-title mt-4">
          <span>Detailed Session Logs &amp; Date Audit for Registered Courses</span>
          <span class="section-sub">Chronological Lecture Rollcall Records</span>
        </div>

        <div class="session-ledger-container">
          ${sessionLedgers}
        </div>

        <!-- Signatures & Authentication Footer -->
        <div class="cert-footer">
          <div class="cert-statement">
            <strong>Institutional Certification:</strong> This transcript reflects verified student course registrations and digital lecture check-ins recorded in the Southshore University College Attendance System. Institutional regulations stipulate a minimum 75% attendance threshold for examination eligibility.
          </div>
          <div class="signatures-grid">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-name">Head of Academic Department</div>
              <div class="sig-role">Faculty Representative</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-name">Director of Academic Affairs</div>
              <div class="sig-role">Registrar &amp; Examination Directorate</div>
            </div>
            <div class="stamp-box">
              <div class="stamp-circle">OFFICIAL STAMP &amp; DATE</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Student Attendance Dossiers - Southshore University College</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .student-dossier-page {
      padding: 0 0 10px 0;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .text-navy { color: #031c45; }
    .text-gold { color: #bc9333; }

    /* Header */
    .header {
      background: #031c45;
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #bc9333;
      margin-bottom: 12px;
    }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .crest-container {
      width: 44px;
      height: 44px;
      background: #bc9333;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14px;
      color: #031c45;
      letter-spacing: 1px;
    }
    .institution-sub {
      font-size: 10px;
      letter-spacing: 1.5px;
      font-weight: 800;
      color: #bc9333;
      text-transform: uppercase;
    }
    .header-title {
      font-size: 16px;
      font-weight: 800;
      margin: 1px 0;
      letter-spacing: -0.3px;
    }
    .header-desc { font-size: 10px; color: #cbd5e1; }
    .header-right { text-align: right; }
    .doc-badge {
      background: #bc9333;
      color: #031c45;
      font-family: monospace;
      font-weight: 800;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 1px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .header-date { font-size: 10px; color: #94a3b8; font-family: monospace; }

    /* Profile Card */
    .profile-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      display: grid;
      grid-template-columns: 2fr 1.5fr 2fr 1.5fr;
      gap: 12px;
      margin-bottom: 10px;
    }
    .profile-col { display: flex; flex-direction: column; }
    .profile-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; }
    .profile-value-lg { font-size: 14px; font-weight: 800; color: #0f172a; }
    .profile-value { font-size: 12px; font-weight: 700; color: #0f172a; }
    .profile-sub { font-size: 10px; color: #64748b; margin-top: 2px; }
    .profile-col-standing { display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; }
    
    .standing-pill {
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
      margin-top: 2px;
    }
    .status-eligible { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-risk { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .status-ineligible { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .overall-score { font-size: 12px; font-weight: 800; color: #031c45; margin-top: 4px; }

    /* KPI Strip */
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .kpi-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
    }
    .kpi-item.highlight { background: #f0fdf4; border-color: #86efac; }
    .kpi-num { font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1; }
    .kpi-lbl { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 4px; letter-spacing: 0.3px; }

    /* Section Titles */
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #031c45;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #031c45;
      margin-bottom: 6px;
    }
    .section-sub { font-size: 9px; color: #64748b; font-weight: normal; }
    .mt-4 { margin-top: 14px; }

    /* Data Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .data-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    .data-table td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .pill {
      display: inline-block;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .badge-eligible { background: #dcfce7; color: #166534; }
    .badge-risk { background: #fef3c7; color: #92400e; }
    .badge-ineligible { background: #fee2e2; color: #991b1b; }

    /* Session Logs */
    .session-ledger-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }
    .course-session-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .course-session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 6px;
    }
    .course-session-stats { font-size: 10px; color: #475569; }
    .session-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 6px;
    }
    .session-item {
      border-radius: 4px;
      padding: 5px 7px;
      font-size: 9px;
    }
    .session-present {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }
    .session-absent {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .session-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .session-status-badge { font-weight: 800; font-size: 8px; text-transform: uppercase; }
    .session-status-badge.present { color: #047857; }
    .session-status-badge.absent { color: #b91c1c; }
    .session-date { font-weight: 600; color: #1e293b; }
    .session-code { font-family: monospace; font-size: 8px; opacity: 0.8; }

    /* Certification Footer */
    .cert-footer {
      border-top: 1.5px solid #031c45;
      padding-top: 8px;
      margin-top: 10px;
    }
    .cert-statement { font-size: 8.5px; color: #64748b; line-height: 1.35; margin-bottom: 12px; }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 120px;
      gap: 20px;
      align-items: flex-end;
    }
    .sig-box { text-align: center; }
    .sig-line { border-bottom: 1px solid #475569; height: 26px; margin-bottom: 4px; }
    .sig-name { font-size: 9.5px; font-weight: 700; color: #0f172a; }
    .sig-role { font-size: 8.5px; color: #64748b; }
    .stamp-box {
      height: 60px;
      border: 1.5px dashed #cbd5e1;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .stamp-circle { font-size: 8px; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  ${studentsHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  <\/script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlDoc);
    printWindow.document.close();
  } else {
    // If popups blocked, use iframe fallback
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(htmlDoc);
    iframe.contentDocument.close();
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 700);
  }
}
