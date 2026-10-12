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
 * Fetches attendance data for a course and structures it per session / week.
 *
 * @param {string} courseId - ID of the course
 * @param {object} options - Optional filters (e.g., sessionId, lecturerNameOverride)
 * @returns {Promise<object>} Export data containing course, lecturer, and session weeks
 */
export async function fetchCourseAttendanceExportData(courseId, options = {}) {
  if (!courseId) throw new Error('A course must be selected for export.');

  // 1. Fetch Course details
  const { data: course, error: cErr } = await supabase
    .from('courses')
    .select('id, code, name')
    .eq('id', courseId)
    .maybeSingle();

  if (cErr || !course) {
    throw new Error('Course not found in the database.');
  }

  // 2. Fetch Sessions for this course (chronologically ascending)
  let sessQuery = supabase
    .from('sessions')
    .select('id, pin, date, created_at, lecturer_id')
    .eq('course_id', courseId)
    .order('created_at', { ascending: true });

  if (options.sessionId) {
    sessQuery = sessQuery.eq('id', options.sessionId);
  }

  const { data: rawSessions, error: sErr } = await sessQuery;
  if (sErr) throw sErr;

  if (!rawSessions || rawSessions.length === 0) {
    throw new Error(`No attendance sessions recorded for ${course.code} - ${course.name}.`);
  }

  // 3. Lecturer lookup
  let lecturerName = options.lecturerName || '';
  if (!lecturerName) {
    const lecturerIds = [...new Set(rawSessions.map((s) => s.lecturer_id).filter(Boolean))];
    if (lecturerIds.length > 0) {
      const { data: lecturers } = await supabase
        .from('users')
        .select('id, name')
        .in('id', lecturerIds);
      if (lecturers && lecturers.length > 0) {
        lecturerName = lecturers.map((l) => l.name).join(', ');
      }
    }
  }

  if (!lecturerName) {
    const { data: sch } = await supabase
      .from('schedules')
      .select('lecturer')
      .eq('course_id', courseId)
      .limit(1)
      .maybeSingle();
    if (sch?.lecturer) lecturerName = sch.lecturer;
  }

  if (!lecturerName) {
    lecturerName = 'Faculty Lecturer';
  }

  // 4. Fetch Enrolled Students for this Course
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('course_id', courseId);

  const enrolledStudentIds = (enrollments || []).map((e) => e.student_id);

  // Also collect any student_ids from attendances to avoid dropping students
  const sessionIds = rawSessions.map((s) => s.id);
  const { data: allAttendances, error: attErr } = await supabase
    .from('attendances')
    .select('id, session_id, student_id, status, timestamp')
    .in('session_id', sessionIds);

  if (attErr) throw attErr;

  const attendanceStudentIds = (allAttendances || []).map((a) => a.student_id);
  const allStudentIds = [...new Set([...enrolledStudentIds, ...attendanceStudentIds])];

  let studentUsers = [];
  if (allStudentIds.length > 0) {
    const { data: users, error: uErr } = await supabase
      .from('users')
      .select('id, name, id_number, email')
      .in('id', allStudentIds);
    if (!uErr && users) studentUsers = users;
  }

  // Sort students alphabetically by name
  const sortedStudents = [...studentUsers].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  // 5. Build Weeks (Week 1++, Week 2++, ...)
  const sessions = rawSessions.map((sess, index) => {
    const weekNumber = index + 1;
    const sessionAtts = (allAttendances || []).filter((a) => a.session_id === sess.id);
    const attMap = new Map(sessionAtts.map((a) => [a.student_id, a.status]));

    const studentRows = sortedStudents.map((st) => {
      const statusRaw = attMap.get(st.id);
      const isPresent = statusRaw === 'present';
      return {
        id: st.id_number || st.id,
        name: st.name || 'Student',
        email: st.email || '',
        status: isPresent ? 'Present' : 'Absent',
      };
    });

    const presentCount = studentRows.filter((s) => s.status === 'Present').length;
    const absentCount = studentRows.filter((s) => s.status === 'Absent').length;
    const totalCount = studentRows.length;
    const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    const dateStr = sess.date
      ? sess.date.split('T')[0]
      : sess.created_at
      ? sess.created_at.split('T')[0]
      : '';

    return {
      sessionId: sess.id,
      weekNumber,
      weekLabel: `Week ${weekNumber}`,
      sessionCode: sess.pin,
      date: dateStr,
      students: studentRows,
      presentCount,
      absentCount,
      totalCount,
      rate,
    };
  });

  return {
    courseId,
    courseCode: course.code,
    courseName: course.name,
    lecturerName,
    sessions,
  };
}

/**
 * Generates and downloads a multi-sheet Microsoft Excel SpreadsheetML workbook.
 *
 * Requirements:
 * - Heading: { Course Name, Lecturer, Week number 1++ (session code) }
 * - Columns: ID, Student Name, Attendance (Present or Absent)
 * - If session code > 1: creates separate sheets (Week 1, Week 2, ...)
 */
export function exportAttendanceToExcel(exportData) {
  const { courseName, courseCode, lecturerName, sessions } = exportData;

  const sanitizeSheetName = (name) =>
    name.replace(/[\\/?*:[\]]/g, '').slice(0, 31) || 'Sheet';

  let worksheetsXml = '';

  for (const s of sessions) {
    const sheetName = sanitizeSheetName(`Week ${s.weekNumber}`);
    const studentRowsXml = s.students
      .map(
        (st) => `
      <Row ss:Height="19">
        <Cell ss:StyleID="CellID"><Data ss:Type="String">${escapeXml(st.id)}</Data></Cell>
        <Cell ss:StyleID="CellName"><Data ss:Type="String">${escapeXml(st.name)}</Data></Cell>
        <Cell ss:StyleID="${st.status === 'Present' ? 'CellPresent' : 'CellAbsent'}"><Data ss:Type="String">${st.status}</Data></Cell>
      </Row>`
      )
      .join('');

    worksheetsXml += `
    <Worksheet ss:Name="${escapeXml(sheetName)}">
      <Table>
        <Column ss:Width="130" />
        <Column ss:Width="240" />
        <Column ss:Width="130" />

        <!-- Institutional Eyebrow -->
        <Row ss:Height="24">
          <Cell ss:MergeAcross="2" ss:StyleID="InstitutionBanner">
            <Data ss:Type="String">Southshore University College · Official Rollcall Audit</Data>
          </Cell>
        </Row>

        <!-- Required Heading Block -->
        <Row ss:Height="20">
          <Cell ss:MergeAcross="2" ss:StyleID="HeadingCourse">
            <Data ss:Type="String">Course Name: ${escapeXml(courseName)} (${escapeXml(courseCode)})</Data>
          </Cell>
        </Row>
        <Row ss:Height="20">
          <Cell ss:MergeAcross="2" ss:StyleID="HeadingLecturer">
            <Data ss:Type="String">Lecturer: ${escapeXml(lecturerName)}</Data>
          </Cell>
        </Row>
        <Row ss:Height="22">
          <Cell ss:MergeAcross="2" ss:StyleID="HeadingWeek">
            <Data ss:Type="String">Week number: Week ${s.weekNumber} (Session Code: ${escapeXml(s.sessionCode)})</Data>
          </Cell>
        </Row>
        <Row ss:Height="18">
          <Cell ss:MergeAcross="2" ss:StyleID="HeadingMeta">
            <Data ss:Type="String">Date: ${escapeXml(s.date)} | Enrolled: ${s.totalCount} | Present: ${s.presentCount} | Absent: ${s.absentCount} | Turnout: ${s.rate}%</Data>
          </Cell>
        </Row>

        <!-- Blank Spacer Row -->
        <Row ss:Height="10" />

        <!-- Required Columns Header -->
        <Row ss:Height="22">
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">ID</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student Name</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Attendance (Present or Absent)</Data></Cell>
        </Row>

        <!-- Student Attendance Records -->
        ${studentRowsXml}
      </Table>
      <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
        <PageSetup>
          <Layout x:Orientation="Portrait" />
          <Header x:Margin="0.3" />
          <Footer x:Margin="0.3" />
        </PageSetup>
        <Selected />
        <ProtectObjects>False</ProtectObjects>
        <ProtectScenarios>False</ProtectScenarios>
      </WorksheetOptions>
    </Worksheet>`;
  }

  const workbookXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>${escapeXml(courseName)} Attendance Report</Title>
    <Author>${escapeXml(lecturerName)}</Author>
    <Created>${new Date().toISOString()}</Created>
    <Company>Southshore University College</Company>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center" />
      <Borders />
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A" />
      <Interior />
      <NumberFormat />
      <Protection />
    </Style>

    <Style ss:ID="InstitutionBanner">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#BC9333" />
      <Interior ss:Color="#031C45" ss:Pattern="Solid" />
    </Style>

    <Style ss:ID="HeadingCourse">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#031C45" />
      <Interior ss:Color="#F1F5F9" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1" />
      </Borders>
    </Style>

    <Style ss:ID="HeadingLecturer">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#334155" />
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid" />
    </Style>

    <Style ss:ID="HeadingWeek">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#B45309" />
      <Interior ss:Color="#FEF3C7" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#F59E0B" />
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A" />
      </Borders>
    </Style>

    <Style ss:ID="HeadingMeta">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748B" />
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid" />
    </Style>

    <Style ss:ID="ColHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF" />
      <Interior ss:Color="#031C45" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#BC9333" />
      </Borders>
    </Style>

    <Style ss:ID="CellID">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0" />
      </Borders>
    </Style>

    <Style ss:ID="CellName">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0F172A" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0" />
      </Borders>
    </Style>

    <Style ss:ID="CellPresent">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#15803D" />
      <Interior ss:Color="#DCFCE7" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0" />
      </Borders>
    </Style>

    <Style ss:ID="CellAbsent">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#DC2626" />
      <Interior ss:Color="#FEE2E2" ss:Pattern="Solid" />
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECDD3" />
      </Borders>
    </Style>
  </Styles>
  ${worksheetsXml}
</Workbook>`;

  const blob = new Blob([workbookXml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanCode = (courseCode || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `${cleanCode}_Attendance_Export_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an institutional print/PDF report.
 * Each session / week is presented with the required heading and styled table.
 * If sessions > 1, page-break-after ensures each week prints as a dedicated sheet.
 */
export function exportAttendanceToPdf(exportData) {
  const { courseName, courseCode, lecturerName, sessions } = exportData;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups for this website to generate the PDF report.');
    return;
  }

  const sessionsHtml = sessions
    .map(
      (s, idx) => `
    <div class="session-sheet ${idx < sessions.length - 1 ? 'page-break' : ''}">
      <!-- Institution Header -->
      <div class="header">
        <div class="header-content">
          <div class="brand-sub">Southshore University College · Official Academic Audit</div>
          <h1 class="header-title">Lecture Attendance Register</h1>
        </div>
        <div class="badge-code">CODE: #${escapeXml(s.sessionCode)}</div>
      </div>

      <!-- Required Heading Block -->
      <div class="heading-block">
        <div class="heading-row">
          <span class="heading-label">Course Name:</span>
          <span class="heading-value">${escapeXml(courseName)} (${escapeXml(courseCode)})</span>
        </div>
        <div class="heading-row">
          <span class="heading-label">Lecturer:</span>
          <span class="heading-value">${escapeXml(lecturerName)}</span>
        </div>
        <div class="heading-row week-highlight">
          <span class="heading-label">Week Number:</span>
          <span class="heading-value">Week ${s.weekNumber} (Session Code: ${escapeXml(s.sessionCode)})</span>
        </div>
        <div class="stats-pills">
          <div class="stat-pill"><strong>Date:</strong> ${escapeXml(s.date || 'Class Session')}</div>
          <div class="stat-pill"><strong>Enrolled:</strong> ${s.totalCount}</div>
          <div class="stat-pill present"><strong>Present:</strong> ${s.presentCount}</div>
          <div class="stat-pill absent"><strong>Absent:</strong> ${s.absentCount}</div>
          <div class="stat-pill rate"><strong>Rate:</strong> ${s.rate}%</div>
        </div>
      </div>

      <!-- Required Attendance Table: cols ID, Student Name, Attendance -->
      <table class="att-table">
        <thead>
          <tr>
            <th style="width: 130px; text-align: center;">ID</th>
            <th>Student Name</th>
            <th style="width: 140px; text-align: center;">Attendance</th>
          </tr>
        </thead>
        <tbody>
          ${s.students
            .map(
              (st) => `
          <tr>
            <td style="text-align: center; font-family: monospace; font-size: 11px; color: #475569;">${escapeXml(st.id)}</td>
            <td style="font-weight: 600; color: #0f172a;">${escapeXml(st.name)}</td>
            <td style="text-align: center;">
              <span class="status-pill ${st.status === 'Present' ? 'present' : 'absent'}">
                ${st.status === 'Present' ? '✓ Present' : '✕ Absent'}
              </span>
            </td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <!-- Sheet Footer -->
      <div class="footer">
        <div>Southshore University College · Generated on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <div>Week ${s.weekNumber} · Session #${escapeXml(s.sessionCode)}</div>
      </div>
    </div>`
    )
    .join('');

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeXml(courseCode)} Attendance Register</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
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
    .session-sheet {
      padding: 10px 0 20px 0;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .header {
      background: #031c45;
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #bc9333;
      margin-bottom: 14px;
    }
    .brand-sub {
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #bc9333;
      font-weight: 700;
    }
    .header-title {
      font-size: 18px;
      font-weight: 800;
      margin: 2px 0 0 0;
      letter-spacing: -0.5px;
    }
    .badge-code {
      background: #bc9333;
      color: #031c45;
      font-family: monospace;
      font-weight: 800;
      font-size: 12px;
      padding: 6px 12px;
      border-radius: 6px;
      letter-spacing: 1px;
    }
    .heading-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 14px;
    }
    .heading-row {
      display: flex;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .heading-label {
      width: 120px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .heading-value {
      color: #0f172a;
      font-weight: 700;
    }
    .week-highlight {
      background: #fef3c7;
      padding: 6px 10px;
      border-radius: 6px;
      border-left: 3px solid #f59e0b;
      margin: 6px 0;
    }
    .week-highlight .heading-label {
      color: #92400e;
    }
    .week-highlight .heading-value {
      color: #b45309;
      font-size: 13px;
    }
    .stats-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #cbd5e1;
    }
    .stat-pill {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
    }
    .stat-pill.present { background: #dcfce7; border-color: #86efac; color: #166534; }
    .stat-pill.absent { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
    .stat-pill.rate { background: #fef9c3; border-color: #fde047; color: #854d0e; }
    .att-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 8px;
    }
    .att-table th {
      background: #031c45;
      color: #ffffff;
      padding: 8px 10px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border: 1px solid #031c45;
    }
    .att-table td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
    }
    .att-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .status-pill {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .status-pill.present {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .status-pill.absent {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
      font-size: 9px;
      color: #94a3b8;
      font-family: monospace;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #031c45; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
    <div style="font-size: 13px; font-weight: 600;">Attendance Register: ${escapeXml(courseCode)} (${sessions.length} Week${sessions.length > 1 ? 's' : ''})</div>
    <button onclick="window.print()" style="background: #bc9333; color: #031c45; border: none; font-weight: bold; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
      🖨️ Print / Save as PDF
    </button>
  </div>
  ${sessionsHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  <\/script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
