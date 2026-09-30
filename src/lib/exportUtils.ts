import { C3Report, ServiceTeamReport, MinistryReport, DashboardMetricSummary } from './types';

export async function exportC3ReportsToExcel(reports: C3Report[], filename = 'CFC_Makurdi_C3_Reports.xlsx') {
  if (typeof window === 'undefined') return;
  const XLSX = await import('xlsx');

  const rows = reports.map((r) => ({
    'Meeting Date': r.meetingDate,
    'C3 Center': r.c3Name,
    'Zone': r.zone,
    'Topic Taught': r.topicTaught,
    'Men': r.maleAttendance,
    'Women': r.femaleAttendance,
    'Children': r.childrenAttendance,
    'Total Attendance': r.totalAttendance,
    'First Timers': r.firstTimers,
    'New Converts': r.newConverts,
    'Offering (NGN)': r.offeringAmount,
    'Tithes (NGN)': r.tithesAmount,
    'Status': r.status.replace(/_/g, ' ').toUpperCase(),
    'Submitted By': r.submittedByName,
    'Pastoral Notes': r.residentPastorNotes || r.associatePastorNotes || '',
    'Prayer Requests': r.prayerRequests || '',
    'Testimonies': r.testimonies || '',
    'Challenges': r.challengesEncountered || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'C3 Reports');
  XLSX.writeFile(workbook, filename);
}

export async function exportServiceTeamReportsToExcel(reports: ServiceTeamReport[], filename = 'CFC_Makurdi_Service_Teams.xlsx') {
  if (typeof window === 'undefined') return;
  const XLSX = await import('xlsx');

  const rows = reports.map((r) => ({
    'Service Date': r.serviceDate,
    'Team Name': r.teamName,
    'Service Type': r.serviceType.replace(/_/g, ' ').toUpperCase(),
    'Present on Roster': r.rosterPresentCount,
    'Absent': r.rosterAbsentCount,
    'Total on Duty': r.totalOnDuty,
    'Tasks Completed': r.tasksCompleted,
    'Equipment Status': r.equipmentStatus,
    'Challenges': r.challengesEncountered || '',
    'Urgent Needs': r.urgentNeeds || '',
    'Status': r.status.replace(/_/g, ' ').toUpperCase(),
    'Submitted By': r.submittedByName,
    'Pastoral Notes': r.residentPastorNotes || r.associatePastorNotes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Service Teams');
  XLSX.writeFile(workbook, filename);
}

export async function exportC3ReportsToPDF(reports: C3Report[], title = 'C3 Community Churches Report') {
  if (typeof window === 'undefined') return;
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape' });

  // Header styling with CFM Brand Blue
  doc.setFillColor(10, 113, 158); // #0a719e
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('CHRIST FAMILY MINISTRIES', 14, 12);

  doc.setFontSize(10);
  doc.setTextColor(255, 240, 0); // CFM Yellow
  doc.text(`Christ Family Centre Makurdi • ${title} | ${new Date().toLocaleDateString('en-GB')}`, 14, 20);

  const tableBody = reports.map((r) => [
    r.meetingDate,
    r.c3Name,
    r.zone,
    `${r.maleAttendance}/${r.femaleAttendance}/${r.childrenAttendance}`,
    r.totalAttendance,
    r.firstTimers,
    r.newConverts,
    `₦${r.offeringAmount.toLocaleString()}`,
    r.status.replace(/_/g, ' ').toUpperCase(),
    r.submittedByName,
  ]);

  autoTable(doc, {
    head: [['Date', 'C3 Center', 'Zone', 'M/F/Kids', 'Total', '1st Timers', 'Converts', 'Offering', 'Status', 'Minister']],
    body: tableBody,
    startY: 34,
    theme: 'grid',
    headStyles: {
      fillColor: [10, 113, 158],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`CFC_Makurdi_C3_${Date.now()}.pdf`);
}

export async function exportServiceTeamReportsToPDF(reports: ServiceTeamReport[]) {
  if (typeof window === 'undefined') return;
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape' });

  // Header styling
  doc.setFillColor(10, 113, 158);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('CHRIST FAMILY MINISTRIES', 14, 12);

  doc.setFontSize(10);
  doc.setTextColor(255, 240, 0);
  doc.text(`Christ Family Centre Makurdi • Service Teams Operational Report | ${new Date().toLocaleDateString('en-GB')}`, 14, 20);

  const tableBody = reports.map((r) => [
    r.serviceDate,
    r.teamName,
    r.serviceType.replace(/_/g, ' '),
    r.rosterPresentCount,
    r.rosterAbsentCount,
    r.tasksCompleted.length > 55 ? r.tasksCompleted.substring(0, 55) + '...' : r.tasksCompleted,
    r.equipmentStatus.length > 45 ? r.equipmentStatus.substring(0, 45) + '...' : r.equipmentStatus,
    r.status.replace(/_/g, ' ').toUpperCase(),
    r.submittedByName,
  ]);

  autoTable(doc, {
    head: [['Service Date', 'Team', 'Service', 'Present', 'Absent', 'Tasks Summary', 'Equipment Notes', 'Status', 'Leader']],
    body: tableBody,
    startY: 34,
    theme: 'grid',
    headStyles: {
      fillColor: [10, 113, 158],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`CFC_Makurdi_Service_Teams_${Date.now()}.pdf`);
}

export async function exportConsolidatedPastoralBriefPDF(
  metrics: DashboardMetricSummary,
  c3Reports: C3Report[],
  teamReports: ServiceTeamReport[],
  ministryReports: MinistryReport[]
) {
  if (typeof window === 'undefined') return;
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait' });

  // Cover / Header Banner with CFM Brand Blue
  doc.setFillColor(10, 113, 158); // #0a719e CFM Brand Blue
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 38, 'F');

  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('CHRIST FAMILY MINISTRIES', 14, 13);

  doc.setFontSize(11);
  doc.setTextColor(255, 240, 0); // CFM Radiant Yellow
  doc.text('Christ Family Centre Makurdi • Weekly Pastoral Report', 14, 21);

  doc.setFontSize(8.5);
  doc.setTextColor(224, 242, 254);
  doc.setFont('helvetica', 'normal');
  doc.text('Motto: "Love is King • Raising a Happy & Successful People"', 14, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} | Senior Pastors: Pastors Arome & Avese Tokula`, 14, 34);

  // Executive KPI summary box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Key Church Growth & Operations Metrics', 14, 46);

  const kpiRows = [
    ['Latest Sunday Service Attendance', metrics.totalSundayAttendance.toLocaleString()],
    ['Total Community Church (C3) Attendance', metrics.totalC3Attendance.toLocaleString()],
    ['First Timers Welcomed', metrics.totalFirstTimers.toString()],
    ['Souls Won (New Converts)', metrics.totalConverts.toString()],
    ['Service Volunteers On Duty', metrics.totalServiceVolunteers.toString()],
    ['Total Recorded Offerings & Tithes (NGN)', `₦${metrics.totalGiving.toLocaleString()}`],
    ['Pending Reports Awaiting Review', metrics.pendingApprovalsCount.toString()],
  ];

  autoTable(doc, {
    body: kpiRows,
    startY: 50,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 120 } },
  });

  // C3 Highlights
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Community Church (C3) Cell Highlights', 14, finalY);

  const c3SummaryRows = c3Reports.map((r) => [
    r.c3Name,
    r.totalAttendance.toString(),
    r.firstTimers.toString(),
    r.newConverts.toString(),
    `₦${r.offeringAmount.toLocaleString()}`,
    r.status.replace(/_/g, ' '),
  ]);

  autoTable(doc, {
    head: [['C3 Centre', 'Attendance', '1st Timers', 'Converts', 'Offering', 'Status']],
    body: c3SummaryRows,
    startY: finalY + 4,
    theme: 'grid',
    headStyles: { fillColor: [10, 113, 158], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  // Ministry Fellowship Highlights
  const nextY = (doc as any).lastAutoTable.finalY + 10;
  if (nextY < 230) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Ministry Fellowships (Men of Faith, 31st Ladies, Kingdom Kids)', 14, nextY);

    const minRows = ministryReports.map((m) => [
      m.ministryName,
      m.reportTitle,
      m.totalAttendance.toString(),
      `₦${m.offeringAmount.toLocaleString()}`,
      m.status.replace(/_/g, ' '),
    ]);

    autoTable(doc, {
      head: [['Fellowship', 'Meeting Theme', 'Attendance', 'Offering', 'Review Status']],
      body: minRows,
      startY: nextY + 4,
      theme: 'grid',
      headStyles: { fillColor: [237, 32, 36], fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });
  }

  // Pastoral Sign-off block
  const signY = (doc as any).lastAutoTable.finalY + 16;
  if (signY < 270) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Prepared for Pastoral Review:', 14, signY);
    doc.text('__________________________________', 14, signY + 12);
    doc.text('Pastor David Terzungwe (Resident Pastor)', 14, signY + 18);

    doc.text('Associate Pastors Sign-off:', 120, signY);
    doc.text('__________________________________', 120, signY + 12);
    doc.text('C3 & Service Teams Oversight', 120, signY + 18);
  }

  doc.save(`CFC_Makurdi_Pastoral_Brief_${Date.now()}.pdf`);
}
