import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  ImageRun,
  PageBreak,
  PageBorderDisplay,
  PageBorderZOrder,
} from 'docx';
import fs from 'fs';
import path from 'path';

const MEDIA_DIR = 'C:/Users/Asus/OneDrive/Desktop/HRMS/project_images/word/media/';
const OUTPUT_MAIN = 'C:/Users/Asus/OneDrive/Desktop/HRMS/PeopleHub_HRMS_Project_Report_Final_A4.docx';
const OUTPUT_OVERWRITE = 'C:/Users/Asus/OneDrive/Desktop/HRMS/PeopleHub_HRMS_Project_Report_30_Pages.docx';

// Design Color Palette (Professional Corporate & University Standard)
const C_PRIMARY = '0F172A';   // Deep Slate Navy
const C_ACCENT = '1D4ED8';    // Royal Blue
const C_TEXT = '334155';      // Slate 700 (High Legibility)
const C_MUTED = '64748B';     // Slate 500
const C_BORDER = 'CBD5E1';    // Slate 300
const C_BG_HEADER = '0F172A'; // Header fill
const C_BG_ALT = 'F8FAFC';    // Zebra row fill

// Helper: Paragraph Builders
const pCenter = (text, bold = false, size = 22, color = C_TEXT, spacing = { after: 120 }) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing,
  children: [new TextRun({ text, bold, size, color, font: 'Calibri' })]
});

const pChapterHeader = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 240, after: 200 },
  children: [new TextRun({ text, bold: true, size: 28, color: C_PRIMARY, font: 'Calibri' })]
});

const pSectionHeader = (title) => new Paragraph({
  spacing: { before: 240, after: 120 },
  children: [
    new TextRun({ text: '⦿ ' + title, bold: true, size: 23, color: C_ACCENT, font: 'Calibri' })
  ]
});

const pSubSectionHeader = (title) => new Paragraph({
  spacing: { before: 180, after: 100 },
  children: [
    new TextRun({ text: '■ ' + title, bold: true, size: 21, color: C_PRIMARY, font: 'Calibri' })
  ]
});

const pBody = (text, indent = 0) => new Paragraph({
  spacing: { after: 130, line: 280 }, // 1.15 to 1.25 line spacing for academic standard
  indent: { left: indent },
  children: [new TextRun({ text, size: 21, color: C_TEXT, font: 'Calibri' })]
});

const pBullet = (text, boldPrefix = '') => new Paragraph({
  bullet: { level: 0 },
  spacing: { after: 90, line: 270 },
  children: [
    ...(boldPrefix ? [new TextRun({ text: boldPrefix + ': ', bold: true, size: 21, color: C_PRIMARY, font: 'Calibri' })] : []),
    new TextRun({ text, size: 21, color: C_TEXT, font: 'Calibri' })
  ]
});

const pNumbered = (num, text, boldPrefix = '') => new Paragraph({
  spacing: { after: 90, line: 270 },
  indent: { left: 360 },
  children: [
    new TextRun({ text: num + '. ', bold: true, size: 21, color: C_PRIMARY, font: 'Calibri' }),
    ...(boldPrefix ? [new TextRun({ text: boldPrefix + ': ', bold: true, size: 21, color: C_PRIMARY, font: 'Calibri' })] : []),
    new TextRun({ text, size: 21, color: C_TEXT, font: 'Calibri' })
  ]
});

const pFigureCaption = (figText) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 100, after: 180 },
  children: [new TextRun({ text: figText, bold: true, italics: true, size: 19, color: C_MUTED, font: 'Calibri' })]
});

// Helper: Styled Table Generator
const buildTable = (headers, dataRows, colWidths = []) => {
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
    left: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
    right: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      shading: { fill: C_BG_HEADER },
      margins: { top: 90, bottom: 90, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, size: 19, color: 'FFFFFF', font: 'Calibri' })]
      })]
    }))
  });

  const bodyRows = dataRows.map((row, rIdx) => new TableRow({
    children: row.map((cellText, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      shading: { fill: rIdx % 2 === 1 ? C_BG_ALT : 'FFFFFF' },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: String(cellText), size: 19, color: C_TEXT, font: 'Calibri' })]
      })]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [headerRow, ...bodyRows]
  });
};

// Helper: Framed Image Placeholder
const buildImagePlaceholder = (title, subtext) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.DASHED, size: 1, color: C_ACCENT },
    bottom: { style: BorderStyle.DASHED, size: 1, color: C_ACCENT },
    left: { style: BorderStyle.DASHED, size: 1, color: C_ACCENT },
    right: { style: BorderStyle.DASHED, size: 1, color: C_ACCENT },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          shading: { fill: 'F1F5F9' },
          margins: { top: 240, bottom: 240, left: 240, right: 240 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `[SCREENSHOT: ${title}]`, bold: true, size: 21, color: C_ACCENT, font: 'Calibri' })]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 80 },
              children: [new TextRun({ text: subtext, italics: true, size: 19, color: C_MUTED, font: 'Calibri' })]
            })
          ]
        })
      ]
    })
  ]
});

// Image Loader helper with safe fallback
const loadImageRun = (filename, width = 540, height = 280) => {
  const filePath = path.join(MEDIA_DIR, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return new ImageRun({
      data,
      transformation: { width, height }
    });
  }
  return null;
};

async function generateReport() {
  console.log('Generating Authentic A4 PeopleHub HRMS Project Report...');

  // Load existing images
  const imgERD = loadImageRun('image1.png', 540, 680);        // High-res ERD
  const imgEmpDash = loadImageRun('image2.png', 540, 270);    // Employee Self-Service
  const imgAttGrid = loadImageRun('image3.png', 540, 270);    // Daily Attendance Grid
  const imgLogin = loadImageRun('image4.png', 540, 270);      // Login Portal
  const imgAdminDash = loadImageRun('image5.png', 540, 270);  // HR Admin Dashboard
  const imgDirectory = loadImageRun('image6.png', 540, 270);  // Employee Directory
  const imgMongoDB = loadImageRun('image7.png', 540, 310);    // MongoDB Atlas View

  const children = [];

  // ==========================================
  // PAGE 1: TITLE / COVER PAGE (Matches Ref Page 1)
  // ==========================================
  children.push(
    new Paragraph({ spacing: { before: 720 } }),
    pCenter('PROJECT', true, 34, C_PRIMARY, { before: 200, after: 200 }),
    pCenter('“PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System”', true, 26, C_ACCENT, { after: 240 }),
    pCenter('IN PARTIAL FULFILMENT OF', false, 20, C_MUTED, { after: 100 }),
    pCenter('BACHELOR OF BUSINESS ADMINISTRATION', true, 22, C_PRIMARY, { after: 60 }),
    pCenter('&', true, 20, C_MUTED, { after: 60 }),
    pCenter('COMPUTER APPLICATION', true, 22, C_PRIMARY, { after: 80 }),
    pCenter('(TY-BBA-CA) (CBCS Pattern)', true, 20, C_ACCENT, { after: 360 }),

    // University Frame Box
    new Table({
      width: { size: 85, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: C_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: C_BORDER },
        left: { style: BorderStyle.SINGLE, size: 2, color: C_BORDER },
        right: { style: BorderStyle.SINGLE, size: 2, color: C_BORDER },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              margins: { top: 140, bottom: 140, left: 180, right: 180 },
              children: [
                pCenter('SAVITRIBAI PHULE PUNE UNIVERSITY', true, 22, C_PRIMARY, { after: 60 }),
                pCenter('SUBMITTED TO', false, 18, C_MUTED, { after: 80 }),
                pCenter('K. V. N. NAIK SHIKSHAN PRASARAK SANSTHA’S', true, 20, C_PRIMARY, { after: 40 }),
                pCenter('ARTS, COMMERCE AND SCIENCE COLLEGE', true, 20, C_PRIMARY, { after: 40 }),
                pCenter('CANADA CORNER, NASHIK - 02', false, 18, C_TEXT, { after: 0 }),
              ]
            })
          ]
        })
      ]
    }),

    new Paragraph({ spacing: { before: 360 } }),
    pCenter('UNDER GUIDANCE OF', false, 18, C_MUTED, { after: 60 }),
    pCenter('PROF. SUDHAM. L. BHABAD', true, 22, C_PRIMARY, { after: 200 }),
    pCenter('ACADEMIC YEAR : 2026-27', true, 20, C_TEXT, { after: 120 }),
    pCenter('Name of Student : Mustakim Patel', true, 22, C_ACCENT, { after: 240 }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 2: CERTIFICATE (Matches Ref Page 2)
  // ==========================================
  children.push(
    pCenter('K. V. N. NAIK SHIKSHAN PRASARAK SANSTHA’S', true, 20, C_PRIMARY, { after: 40 }),
    pCenter('ART’S, COMMERCE & SCIENCE COLLEGE', true, 24, C_PRIMARY, { after: 40 }),
    pCenter('DONGARE VASATIGRUH PARISAR, CANADA CORNER, NASHIK-02.', false, 18, C_TEXT, { after: 40 }),
    pCenter('Affiliated to Savitribai Phule Pune University Pune, AICTE Delhi, DTE Mumbai', false, 16, C_MUTED, { after: 20 }),
    pCenter('NAAC Reaccredited “B++” GRADE', true, 16, C_ACCENT, { after: 40 }),
    pCenter('Phone: (0253) 2576692, Email: vnnaikcollege@gmail.com', false, 16, C_MUTED, { after: 200 }),

    // Horizontal Divider
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: C_PRIMARY },
        bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [new TableRow({ children: [new TableCell({ children: [] })] })]
    }),

    new Paragraph({ spacing: { before: 200 } }),
    pCenter('CERTIFICATE', true, 32, C_PRIMARY, { after: 240 }),

    pBody('This is to certify that, Mr. Mustakim Patel of TYBBA-CA class has completed the project satisfactorily on the topic “PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System” for the partial fulfillment of Bachelor of Business Administration (Computer Application) during the academic year 2026-2027 (Semester-V) and the same has been examined and signed by the project in-charge.'),

    new Paragraph({ spacing: { before: 240 } }),
    pBody('Seat No:  ________________________'),
    pBody('Date:     ________________________'),

    new Paragraph({ spacing: { before: 600 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [pBody('Project In-charge: __________________'), pBody('Head of Dept:      __________________')] }),
            new TableCell({ children: [pBody('Internal Examiner: __________________'), pBody('External Examiner: __________________')] }),
          ]
        })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 3: ACKNOWLEDGEMENT (Matches Ref Page 3)
  // ==========================================
  children.push(
    // Ribbon / Banner Header
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: C_ACCENT },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: C_ACCENT },
        left: { style: BorderStyle.SINGLE, size: 2, color: C_ACCENT },
        right: { style: BorderStyle.SINGLE, size: 2, color: C_ACCENT },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'DBEAFE' },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [pCenter('ACKNOWLEDGEMENT', true, 26, C_ACCENT, { after: 0 })]
            })
          ]
        })
      ]
    }),

    new Paragraph({ spacing: { before: 300 } }),
    pBody('It is with sincere gratitude that I thank my college, respected project guide Prof. Sudham. L. Bhabad, Head of Department, and faculty members for providing the opportunity and environment to engineer and deploy this enterprise project.'),
    pBody('I am immensely grateful for the technical guidance, review checkpoints, and encouragement received during the system analysis, database normalization, interface engineering, integration testing, and documentation phases.'),
    pBody('I also acknowledge the immense practical learning gained through designing and developing PeopleHub HRMS as an industry-grade web application. The project deepened my understanding of React 19 architecture, TypeScript type safety, Zustand persistent state stores, Node.js and Express REST endpoints, MongoDB document indexing, atomic upsert pipelines, automated shift calculations, and modern responsive UI design.'),
    pBody('Thank you.'),

    new Paragraph({ spacing: { before: 400 } }),
    pBody('Place: Nashik'),
    pBody('Date:  28th October 2026'),

    new Paragraph({ spacing: { before: 300 } }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: 'Mustakim Patel\n', bold: true, size: 22, color: C_PRIMARY }),
        new TextRun({ text: 'TY-BBA(CA)\n', bold: true, size: 20, color: C_ACCENT }),
        new TextRun({ text: 'Roll No: 10', size: 19, color: C_MUTED })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 4: DECLARATION (Matches Ref Page 4)
  // ==========================================
  children.push(
    pChapterHeader('DECLARATION'),
    new Paragraph({ spacing: { before: 200 } }),
    pBody('I hereby declare that the project report entitled “PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System” is prepared for the TY BBA-CA Semester V academic project. The application has been developed using modern web engineering principles with React 19, TypeScript, TailwindCSS, Zustand, Node.js, Express, and MongoDB, and is documented strictly according to the curriculum project report structure provided for Semester V under Savitribai Phule Pune University.'),
    pBody('The report describes the authentic structure, operational workflows, and software features implemented in the project. It explicitly distinguishes fully implemented operational features (such as employee directories, continuous stopwatch shift timers across logouts, automated shift conclusions, atomic MongoDB attendance upserts, and multi-tier leave quota trackers) from planned future enhancements.'),
    pBody('I further declare that this technical project report represents my original work and has not been submitted previously to any other university, institute, or examining body for the award of any degree or diploma.'),

    new Paragraph({ spacing: { before: 400 } }),
    pBody('Place: Nashik'),
    pBody('Date:  28th October 2026'),

    new Paragraph({ spacing: { before: 300 } }),
    pBody('Student Signature: ____________________________'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 5: ABSTRACT (Matches Ref Page 5)
  // ==========================================
  children.push(
    pChapterHeader('ABSTRACT'),
    new Paragraph({ spacing: { before: 180 } }),
    pBody('The “PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System” is a responsive web-based enterprise workforce platform created for modern corporate organizations to manage personnel, attendance, shifts, and leaves with total accuracy, transparency, and data integrity.'),
    pBody('The software is implemented as an integrated full-stack application. The front-end leverages React 19, TypeScript, TailwindCSS, and Framer Motion for responsive layouts and micro-interactions. Client-side state is governed via Zustand with persistent local storage caching. The back-end is powered by Node.js and Express RESTful endpoints connected to a high-availability MongoDB Atlas database, complemented by Java 21 / Spring Boot 3.x JPA entity contracts.'),
    pBody('The application addresses major systemic flaws common in legacy attendance trackers—specifically "session loss upon logout" and unclosed duty shifts. PeopleHub introduces a Continuous Stopwatch Shift Engine utilizing epoch timestamp deltas (`Date.now() - session.checkInTimestamp`), allowing employee shift timers to run seamlessly across logouts, tab closures, and device reboots without server polling. Furthermore, an Autonomous Shift Conclusion Engine automatically detects shift completion (e.g. 18:00 cutoff or 9 hours max) and marks the punch-out event with 8.5 logged hours.'),
    pBody('Administrative attendance corrections are executed through an Atomic Upsert routine that matches on `(employeeId, date)`, completely eliminating MongoDB CastErrors and preventing data loss. Strict role segregation delivers specialized portals for HR Administrators, Department Managers, and Staff Employees. The project demonstrates advanced web development concepts applied to an authentic corporate workforce use case.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 6: INDEX (CRITICAL: MUST FIT ON A SINGLE PAGE)
  // Matches Ref Page 6 exactly
  // ==========================================
  children.push(
    pCenter('INDEX', true, 26, C_PRIMARY, { before: 100, after: 140 }),
    buildTable(
      ['Sr. No', 'Title', 'Page No.'],
      [
        ['1', 'Abstract', '5'],
        ['2', 'Introduction', '7'],
        ['2.1', 'motivation', '7'],
        ['2.2', 'problem statement', '7'],
        ['2.3', 'purpose/objective and goals', '8'],
        ['2.4', 'literature survey', '8'],
        ['2.5', 'project scope', '9'],
        ['3', 'System Analysis', '10'],
        ['3.1', 'existing system', '10'],
        ['3.2', 'scope and limitations of existing systems', '10'],
        ['3.3', 'project perspective, features', '11'],
        ['3.4', 'stakeholders', '11'],
        ['3.5', 'Requirement analysis -Functional requirements,\nperformance requirements, security requirements etc.', '12'],
        ['4', 'System Design', '13'],
        ['4.1', 'Design constraints', '13'],
        ['4.2', 'System Model: ERD & DFD (Context Level)', '13'],
        ['4.3', 'Data Model', '15'],
        ['4.4', 'User Interface', '18'],
        ['5', 'Implementation details', '21'],
        ['5.1', 'Software / hardware specifications', '21'],
        ['6', 'System Outputs and Validation', '23'],
        ['6.1', 'Output Screen', '23'],
        ['6.2', 'Input Validation & Report Format', '25'],
        ['7', 'Conclusion and Recommendations Limitations &\nFuture Scope', '27'],
        ['8', 'Bibliography and References', '29'],
      ],
      [1100, 6800, 1300]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 7-9: CHAPTER 2 - INTRODUCTION (Matches Ref Page 7-9)
  // ==========================================
  children.push(
    pChapterHeader('INTRODUCTION'),
    new Paragraph({ spacing: { before: 140 } }),
    pBody('A professional enterprise web application acts as a centralized operational hub for corporate human resource departments, team supervisors, and employees. Instead of relying on fragmented communication channels such as physical registers, paper leave slips, email chains, and isolated biometric hardware, a modern web-based HRMS structures personnel records, standardizes shift schedules, automates daily attendance tracking, and provides transparent leave governance. The PeopleHub HRMS applies this concept to enterprise workforce management.'),
    pBody('The objective of PeopleHub HRMS is not to offer a generic informational portal, but to deliver an active, reactive workforce operations platform. The implementation uses a component-driven, section-based Single Page Application (SPA) architecture. Navigation links and access controls are strictly segregated by user role—HR Administrator, Department Manager, and Employee—ensuring data confidentiality and operational clarity across the enterprise hierarchy.'),

    pSectionHeader('Motivation'),
    pBullet('Transform traditional paper-based and standalone punch registers into an integrated cloud system.', 'Eliminate Manual Reconciliation'),
    pBullet('Ensure employee stopwatch timers continue running seamlessly even if the user logs out, closes the browser, or reboots their computer.', 'Solve "Session Amnesia"'),
    pBullet('Prevent unmonitored shifts from generating 20+ hour ghost records by automatically checking out employees upon shift completion (18:00 / 8.5 hrs).', 'Autonomous Shift Life-Cycle'),
    pBullet('Provide instant administrative editing with atomic MongoDB upserts, eliminating database CastErrors and permanent data loss.', 'Zero-Data-Loss Architecture'),
    pBullet('Empower staff with an intuitive self-service portal for punching in, checking live elapsed duty hours, and monitoring leave quotas.', 'Self-Service Empowerment'),
    pBullet('Strictly separate employee, manager, and administrative interfaces to prevent accidental exposure of managerial controls.', 'Role-Segregated Governance'),

    pSectionHeader('Problem Statement'),
    pBody('In traditional organizations that rely on standalone biometric machines, physical registers, or unintegrated spreadsheets, HR departments face severe operational difficulties maintaining synchronized records. Manual punch logs are prone to errors, buddy punching, and record tampering. Employees frequently forget to punch out at the end of their shifts, corrupting automated payroll computations with inflated work hours. Furthermore, typical web portals store attendance states in volatile memory, meaning that when an employee clocks in and logs out, the timer resets to zero, confusing users and forcing them to keep workstations insecurely unlocked.'),
    pBody('The problem is therefore defined as: “To design, architect, and implement a resilient, responsive, and secure web-based Human Resource Management System that guarantees continuous attendance session persistence across logouts, automatically concludes shifts at designated limits, supports atomic error-free administrative attendance modifications, and enforces strict role-based operational governance.”'),

    new Paragraph({ spacing: { before: 180 } }),
    pSectionHeader('Purpose / Objective and Goals'),
    pNumbered(1, 'Develop a modern, responsive web application for enterprise HR operations using React 19, TypeScript, and TailwindCSS.'),
    pNumbered(2, 'Implement an Employee Master Directory managing employee codes, departments, designations, joining dates, and reporting supervisors.'),
    pNumbered(3, 'Engineer a Continuous Stopwatch Shift Engine calculating duty elapsed time based on persistent epoch timestamp deltas.'),
    pNumbered(4, 'Build an Autonomous Shift Conclusion Engine that detects shift end limits (18:00 / 9 hrs max) and executes automatic check-out with 8.5 logged hours.'),
    pNumbered(5, 'Provide an Administrative Daily Attendance Register with real-time status counters (Present, Absent, Late, Half-day, On Leave).'),
    pNumbered(6, 'Eliminate MongoDB CastErrors during administrative attendance editing via atomic upsert pipelines matching on (employeeId, date).'),
    pNumbered(7, 'Implement a Multi-Type Leave Management System supporting Casual, Sick, and Earned leaves with automatic balance deductions.'),
    pNumbered(8, 'Enforce strict Role-Based Access Control (RBAC) across HR Admin, Department Manager, and Employee viewports.'),
    pNumbered(9, 'Ensure high visual usability with responsive layouts, accessible controls, and seamless Dark/Light mode theme switching.'),
    pNumbered(10, 'Provide a scalable full-stack foundation connecting React front-end components to Node.js/Express REST APIs and MongoDB Atlas cloud database.'),

    pSectionHeader('Literature Survey'),
    pBody('The engineering of PeopleHub HRMS was informed by thorough comparative study of existing organizational attendance and workforce tracking methodologies:'),
    buildTable(
      ['Reference / Study Area', 'Legacy Method / Tool', 'Application in PeopleHub HRMS'],
      [
        ['Physical Biometric Standalone Hardware', 'Local optical fingerprint scanner with offline USB download.', 'Replaced by web-based live punch terminal with real-time cloud synchronization.'],
        ['Spreadsheet Attendance Trackers', 'Manual Excel / Google Sheet cell entry by HR managers.', 'Replaced by structured MongoDB database with Zod validation schemas and atomic upserts.'],
        ['Session Continuity Patterns', 'Transient client memory (`useState`) resetting on logout or refresh.', 'Implemented persistent epoch timestamp delta engine (`activeSessions` in `localStorage`).'],
        ['Shift Lifecycle Automation', 'Manual check-out edits or unclosed ghost attendance records.', 'Engineered autonomous shift conclusion checking elapsed time against shift end thresholds.'],
        ['Role Governance & RBAC', 'Single shared administrative password or unsegregated views.', 'Architected 3-tier isolated navigation and viewports for Admin, Manager, and Employee roles.'],
        ['Leave Quota Management', 'Paper leave slips and manual balance deduction calculations.', 'Built automated leave application workflow with day difference calculation and quota ledgers.'],
      ],
      [2400, 3200, 3600]
    ),

    pSectionHeader('Project Scope'),
    pBullet('Employee Master Lifecycle Management (Onboarding, Directory, Profiles, Contact info, Hierarchy).'),
    pBullet('Dynamic Shift Configuration (Morning, General, Night shifts with start/end boundaries and grace periods).'),
    pBullet('Continuous Live Punch Terminal with real-time elapsed time stopwatch counter.'),
    pBullet('Autonomous Shift Conclusion Engine with automatic checkout upon reaching shift boundaries.'),
    pBullet('Daily Attendance Monitoring Grid with status filtering, date pickers, and search capabilities.'),
    pBullet('Zero-Data-Loss Administrative Modal Editing backed by atomic MongoDB upserts.'),
    pBullet('Multi-Tier Leave Application Workflow with date difference calculations and balance tracking.'),
    pBullet('Executive KPI Dashboard displaying real-time staffing statistics, trends, and department distributions.'),
    pBullet('Future Scope: Native mobile application with GPS geofencing, biometric hardware SDK drivers, and automated salary payroll disbursements.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 10-12: CHAPTER 3 - SYSTEM ANALYSIS (Matches Ref Page 10-12)
  // ==========================================
  children.push(
    pChapterHeader('SYSTEM ANALYSIS'),
    new Paragraph({ spacing: { before: 140 } }),
    pBody('System analysis studies the operational mechanisms of workforce administration, identifies systemic limitations in legacy practices, defines stakeholder profiles, and establishes formal functional and non-functional engineering specifications.'),

    pSectionHeader('Existing System'),
    pBody('In conventional organizations, workforce management relies on disconnected, semi-automated systems. Punch times are captured on standalone biometric devices or written in physical sign-in registers. Leave applications are submitted through email threads or paper request slips. At the end of each monthly payroll cycle, HR administrators manually extract hardware logs, cross-reference approved leave emails, adjust forgotten clock-out times, and manually compute overtime and late deductions. The lack of an integrated real-time system creates extreme administrative burden and invites human calculation errors.'),

    pSectionHeader('Scope and Limitations of Existing Systems'),
    buildTable(
      ['Existing Method', 'Advantages', 'Limitations'],
      [
        ['Physical Sign-in Registers', 'Simple, requires no power or computer network.', 'High vulnerability to buddy punching, handwriting illegibility, zero auditability, easy tampering.'],
        ['Standalone Biometric Clocks', 'Captures biometric identity at physical gate.', 'Data trapped on local hardware; requires manual USB export; no self-service portal for employees.'],
        ['Volatile Web Punch Trackers', 'Accessible through standard web browsers.', 'Timer resets to zero on logout or page reload; unmonitored shifts stay open indefinitely.'],
        ['Manual Spreadsheet Ledgers', 'Familiar format, low initial software cost.', 'Prone to accidental cell overwrites, lacks concurrent editing safety, zero automated validation.'],
        ['Disconnected Email Leaves', 'Direct communication between manager and staff.', 'Leave balances are not updated in real time; requires manual cross-checking before approval.'],
      ],
      [2200, 2600, 4400]
    ),

    pSectionHeader('Project Perspective and Features'),
    pBody('PeopleHub HRMS is designed as an integrated, reactive enterprise web application. Operating on client-server architecture, it presents tailored interfaces according to authenticated credentials:'),
    pBullet('Modern Glassmorphic Interface with responsive navigation and Dark/Light theme switching.'),
    pBullet('Live Hero Welcome Banner featuring employee greeting, system date, live time, and active shift badge.'),
    pBullet('Continuous Stopwatch Shift Terminal calculating elapsed time via persistent epoch timestamps across logouts.'),
    pBullet('Autonomous Shift Closure Engine enforcing shift cutoff boundaries (18:00 / 8.5 hrs logged).'),
    pBullet('Daily Attendance Register with filter tabs (All, Present, Absent, Late, Half-day, On Leave) and search bar.'),
    pBullet('Instant Record Editor Modal with automated total hours calculation and atomic MongoDB upserts.'),
    pBullet('Employee Master Directory with active workforce counters, search filtering, and CRUD controls.'),
    pBullet('Leave Application Pipeline with date span validation, manager approval actions, and quota balance tracking.'),
    pBullet('Robust RESTful API Architecture with Zod schema validation and Mongoose ODM integration.'),

    pSectionHeader('Stakeholders'),
    buildTable(
      ['Stakeholder', 'Interest / Responsibility'],
      [
        ['Standard Employee', 'Clocks in and out daily, views continuous duty timer, submits leave requests, inspects personal monthly logs.'],
        ['HR Administrator', 'Maintains employee directory, configures shifts, audits daily attendance, corrects punch errors, monitors compliance.'],
        ['Department Manager', 'Monitors team attendance presence, reviews and approves/rejects team leave applications, oversees daily shifts.'],
        ['Project Guide / College', 'Evaluates software engineering architecture, database normalization, and project report against academic standards.'],
      ],
      [2600, 6600]
    ),

    pSectionHeader('Requirement Analysis – Functional Requirements'),
    pBullet('The system shall authenticate users using email and password credentials, routing to role-appropriate dashboards.', 'FR-01 (Authentication)'),
    pBullet('The system shall persist check-in timestamps in local storage, allowing the elapsed timer to continue running across user logouts and reloads.', 'FR-02 (Session Continuity)'),
    pBullet('The system shall automatically terminate active shift sessions when current time passes shift end time (18:00) or elapsed hours reach shift ceiling.', 'FR-03 (Auto Checkout)'),
    pBullet('The system shall execute atomic upserts on attendance records matching on (employeeId, date), eliminating MongoDB CastErrors on uninitialized records.', 'FR-04 (Atomic Upsert)'),
    pBullet('The system shall provide full CRUD operations for employee master profiles, including employee code, department, designation, and supervisor.', 'FR-05 (Employee Master)'),
    pBullet('The system shall calculate net calendar days between fromDate and toDate, enforcing quota balance ceilings prior to leave application submission.', 'FR-06 (Leave Processing)'),
    pBullet('The system shall dynamically hide administrative navigation items and manager approval queues when an Employee role is logged in.', 'FR-07 (Role Segregation)'),

    pSubSectionHeader('Performance Requirements'),
    pBullet('The user interface shall respond to user interactions (punch toggles, filter clicks, modal triggers) within 50 milliseconds.'),
    pBullet('Database read and write operations shall execute within 500 milliseconds over standard broadband network connections.'),
    pBullet('The frontend bundle shall be optimized using Vite code-splitting and asset minification to achieve sub-2-second initial page load times.'),

    pSubSectionHeader('Security Requirements'),
    pBullet('All incoming request payloads must be validated against strict Zod schemas on both client and server before processing.'),
    pBullet('User authentication passwords must be stored using industry-standard hashing algorithms.'),
    pBullet('Sensitive environment variables (such as MongoDB connection URIs and session secrets) must remain strictly on the server in `.env` files.'),
    pBullet('The application shall enforce role-governed endpoint guards, preventing unauthorized users from accessing administrative APIs.'),

    pSubSectionHeader('Usability and Accessibility Requirements'),
    pBullet('All interactive buttons, input fields, and icons shall feature accessible ARIA labels and focus indicators.'),
    pBullet('The layout shall adapt seamlessly across desktop monitors (1920x1080), laptops (1366x768), tablets, and mobile displays.'),
    pBullet('Color schemes shall maintain WCAG 2.1 contrast ratios in both Dark and Light visual themes.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 13-19: CHAPTER 4 - SYSTEM DESIGN (Matches Ref Page 13-19)
  // ==========================================
  children.push(
    pChapterHeader('SYSTEM DESIGN'),
    new Paragraph({ spacing: { before: 140 } }),
    pBody('The system design translates functional and non-functional requirements into robust architectural models, data flow pipelines, formal database schemas, and interface wireframes.'),

    pSectionHeader('Design Constraints'),
    pBullet('Stateless HTTP Protocol: Because RESTful APIs are stateless, continuous watch timing is achieved through client-side epoch timestamp deltas rather than constant server polling.'),
    pBullet('Browser Resource Throttling: Background tabs throttle active intervals; the design calculates elapsed duration mathematically upon active frame ticks.'),
    pBullet('Database Concurrency & Idempotency: Multiple updates to the same daily attendance record are handled via atomic `findOneAndUpdate` operations with `upsert: true`.'),
    pBullet('Zero External UI Framework Dependencies: Built using native TailwindCSS utility classes to maximize runtime rendering performance and reduce bundle size.'),

    pSectionHeader('System Model – DFD (Context Level & Level 1)'),
    pSubSectionHeader('0 Level Context Diagram -:'),
    pBody('The Context Diagram models the boundary of PeopleHub HRMS and external entities interacting with the core application:'),

    // ASCII DFD Box Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
        left: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
        right: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC' },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [
                pCenter('CONTEXT LEVEL DATA FLOW DIAGRAM (DFD LEVEL 0)', true, 19, C_PRIMARY, { after: 100 }),
                pBody('1. Employee Entity  ====[ Clock In/Out, Leave Requests ]====> ( 0.0 PEOPLEHUB HRMS )'),
                pBody('   Employee Entity  <====[ Duty Watch Timer, Leave Balances ]==== ( 0.0 PEOPLEHUB HRMS )'),
                pBody('2. HR Admin Entity  ====[ Employee Master, Shift Rules, Edits ]==> ( 0.0 PEOPLEHUB HRMS )'),
                pBody('   HR Admin Entity  <====[ Attendance Registers, Workforce KPIs ]=== ( 0.0 PEOPLEHUB HRMS )'),
                pBody('3. Manager Entity   ====[ Leave Approval / Rejection Actions ]=====> ( 0.0 PEOPLEHUB HRMS )'),
                pBody('   Manager Entity   <====[ Team Attendance Matrix, Notifications ]=== ( 0.0 PEOPLEHUB HRMS )'),
                pBody('4. Data Stores      <====[ Atomic Upsert Documents, User Records ]===> [ MongoDB Atlas Database ]'),
              ]
            })
          ]
        })
      ]
    }),

    pSubSectionHeader('1 Level Diagram (Detailed Decomposition) -:'),
    pBullet('Process 1.0 (Authentication & Access Control): Validates credentials, sets user session, and enforces RBAC portal routing.'),
    pBullet('Process 2.0 (Employee Master Management): Executes CRUD operations for workforce profiles and hierarchy allocations.'),
    pBullet('Process 3.0 (Continuous Attendance Engine): Captures punch events, calculates epoch elapsed duration, and checks auto-checkout thresholds.'),
    pBullet('Process 4.0 (Leave Processing Engine): Evaluates leave day durations, checks yearly quota ledger, and executes manager approval updates.'),
    pBullet('Process 5.0 (Audit & Reporting Service): Compiles daily attendance registers and workforce analytics.'),

    pSectionHeader('ERD – Logical Model'),
    pBody('The Entity-Relationship Diagram represents the complete normalized database schema governing PeopleHub HRMS. All organizational entities, primary keys (PK), foreign keys (FK), attributes, and cardinalities are formally modeled:'),
    new Paragraph({ spacing: { before: 120, after: 120 } })
  );

  // Embed High-Res ERD Diagram
  if (imgERD) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [imgERD]
      }),
      pFigureCaption('Fig 4.1. Entity Relationship Diagram (ERD) – PeopleHub HRMS')
    );
  }

  children.push(
    pBody('The ERD establishes structural relationships between all 9 core entities:'),
    pBullet('USER to EMPLOYEE (1:1 / Authenticates): User authentication credentials link to an employee profile via `employee_id`.'),
    pBullet('DEPARTMENT to EMPLOYEE (1:N / Has): One Department contains multiple Employees via `department_id`.'),
    pBullet('DESIGNATION to EMPLOYEE (1:N / Assigned To): One Designation describes multiple Employees via `designation_id`.'),
    pBullet('SHIFT to EMPLOYEE (1:N / Works In): One Shift schedule dictates the working hours of multiple Employees via `shift_id`.'),
    pBullet('EMPLOYEE to EMPLOYEE (1:N / Manages): Self-referential hierarchy where an Employee acts as `reporting_manager_id`.'),
    pBullet('EMPLOYEE to ATTENDANCE (1:N / Logs): An Employee accumulates daily attendance logs over time via `employee_id`.'),
    pBullet('SHIFT to ATTENDANCE (1:N / Measured Against): Attendance logs evaluate punctuality against Shift boundaries via `shift_id`.'),
    pBullet('LEAVE_TYPE to LEAVE_REQUEST (1:N / Categorized By): Leave applications reference a specific LeaveType via `leave_type_id`.'),
    pBullet('EMPLOYEE to LEAVE_REQUEST (1:N / Applies): An Employee submits multiple LeaveRequests via `employee_id`.'),
    pBullet('EMPLOYEE to LEAVE_BALANCE (1:N / Holds): An Employee holds annual balance ledgers via `employee_id`.'),
    pBullet('LEAVE_TYPE to LEAVE_BALANCE (1:N / Tracks): A LeaveType maintains quota ledgers across employees via `leave_type_id`.'),

    pSectionHeader('Data Model (Complete 11-Entity Data Dictionary)'),
    pBody('The Data Model defines the schema specifications, constraints, data types, and operational purposes for all 11 system entities:'),

    // Table 1: EMPLOYEE
    pSubSectionHeader('Table 1: EMPLOYEE Entity'),
    buildTable(
      ['Field Name', 'SQL / Mongo Type', 'Constraints', 'Default', 'Description'],
      [
        ['id', 'BIGINT / ObjectId', 'PRIMARY KEY, Auto-Inc', 'Auto', 'Unique system identifier for employee record.'],
        ['employee_code / empId', 'VARCHAR(50)', 'UNIQUE, NOT NULL', 'None', 'Human-readable employee code (e.g. EMP-001).'],
        ['first_name', 'VARCHAR(100)', 'NOT NULL', 'None', 'Employee legal given name.'],
        ['last_name', 'VARCHAR(100)', 'NOT NULL', 'None', 'Employee legal surname.'],
        ['email', 'VARCHAR(150)', 'UNIQUE, NOT NULL', 'None', 'Corporate email address for communication.'],
        ['phone', 'VARCHAR(25)', 'NULLABLE', 'None', 'Contact telephone number.'],
        ['date_of_birth', 'DATE / String', 'NULLABLE', 'None', 'Birth date for benefits and compliance.'],
        ['gender', 'VARCHAR(20)', 'ENUM(MALE, FEMALE, OTHER)', 'None', 'Gender designation.'],
        ['address', 'VARCHAR(500)', 'NULLABLE', 'None', 'Residential residential address.'],
        ['photo_path / photoUrl', 'VARCHAR(255)', 'NULLABLE', 'None', 'URL / storage path for avatar image.'],
        ['department_id', 'BIGINT / String', 'FOREIGN KEY -> DEPARTMENT.id', 'None', 'Associated organizational department.'],
        ['designation_id', 'BIGINT / String', 'FOREIGN KEY -> DESIGNATION.id', 'None', 'Assigned corporate job designation.'],
        ['joining_date', 'DATE / String', 'NOT NULL', 'CURRENT_DATE', 'Official date of corporate joining.'],
        ['employment_type', 'VARCHAR(30)', 'ENUM(Full-time, Part-time, Contract, Intern)', 'Full-time', 'Type of corporate employment engagement.'],
        ['reporting_manager_id', 'BIGINT / String', 'FOREIGN KEY -> EMPLOYEE.id', 'NULL', 'Self-reference to direct reporting supervisor.'],
        ['salary', 'DECIMAL(12,2)', 'NULLABLE', '0.00', 'Annual / monthly compensation package.'],
        ['status', 'VARCHAR(20)', 'ENUM(Active, Inactive, On Leave, Terminated)', 'Active', 'Employment standing in the enterprise.'],
        ['shift_id', 'BIGINT / String', 'FOREIGN KEY -> SHIFT.id', 'shift-1', 'Assigned working shift schedule.'],
      ],
      [1800, 1500, 2000, 1100, 2800]
    ),
    new Paragraph({ spacing: { before: 140 } }),

    // Table 2: USER
    pSubSectionHeader('Table 2: USER Entity'),
    buildTable(
      ['Field Name', 'SQL / Mongo Type', 'Constraints', 'Default', 'Description'],
      [
        ['id', 'BIGINT / ObjectId', 'PRIMARY KEY, Auto-Inc', 'Auto', 'Unique user authentication account identifier.'],
        ['email', 'VARCHAR(150)', 'UNIQUE, NOT NULL', 'None', 'Login email credential.'],
        ['password', 'VARCHAR(255)', 'NOT NULL', 'None', 'Hashed / encrypted security password.'],
        ['role', 'VARCHAR(50)', 'ENUM(HR Admin, Manager, Employee)', 'Employee', 'Security role governing RBAC access control.'],
        ['enabled', 'BOOLEAN', 'NOT NULL', 'TRUE', 'Flag determining whether the login account is active.'],
        ['employee_id', 'BIGINT / ObjectId', 'FOREIGN KEY -> EMPLOYEE.id', 'None', 'Direct link to associated Employee profile.'],
        ['created_at', 'DATETIME', 'NOT NULL', 'NOW()', 'Timestamp when account was provisioned.'],
      ],
      [1800, 1500, 2000, 1100, 2800]
    ),
    new Paragraph({ spacing: { before: 140 } }),

    // Table 3: DEPARTMENT & Table 4: DESIGNATION
    pSubSectionHeader('Table 3: DEPARTMENT & Table 4: DESIGNATION Entities'),
    buildTable(
      ['Table Name', 'Field Name', 'Type & Constraints', 'Description'],
      [
        ['DEPARTMENT', 'id', 'BIGINT, PRIMARY KEY, Auto-Inc', 'Unique department identifier.'],
        ['DEPARTMENT', 'name', 'VARCHAR(100), UNIQUE, NOT NULL', 'Department name (e.g. Human Resources, Sales, IT).'],
        ['DEPARTMENT', 'description', 'VARCHAR(500), NULLABLE', 'Functional role and mission of the department.'],
        ['DESIGNATION', 'id', 'BIGINT, PRIMARY KEY, Auto-Inc', 'Unique designation identifier.'],
        ['DESIGNATION', 'title / name', 'VARCHAR(100), UNIQUE, NOT NULL', 'Job title (e.g. Senior Software Engineer, HR Director).'],
        ['DESIGNATION', 'description', 'VARCHAR(500), NULLABLE', 'Key responsibilities and qualifications.'],
      ],
      [1800, 2200, 2600, 2600]
    ),
    new Paragraph({ spacing: { before: 140 } }),

    // Table 5: SHIFT
    pSubSectionHeader('Table 5: SHIFT Entity'),
    buildTable(
      ['Field Name', 'SQL / Mongo Type', 'Constraints', 'Default', 'Description'],
      [
        ['id', 'BIGINT / String', 'PRIMARY KEY', 'Auto / Custom', 'Unique shift code identifier (e.g. shift-1).'],
        ['name', 'VARCHAR(100)', 'UNIQUE, NOT NULL', 'None', 'Shift descriptive name (e.g. Morning, General, Night).'],
        ['start_time', 'TIME / String', 'NOT NULL', '09:00', 'Mandatory shift starting cutoff time.'],
        ['end_time', 'TIME / String', 'NOT NULL', '18:00', 'Mandatory shift concluding time.'],
        ['break_minutes', 'INTEGER', 'NOT NULL', '60', 'Standard duration allocated for meal/rest breaks.'],
        ['grace_minutes', 'INTEGER', 'NOT NULL', '15', 'Permitted arrival grace window before marking Late.'],
        ['half_day_hours', 'DECIMAL(4,2)', 'NOT NULL', '4.5', 'Minimum threshold of work hours for Half-day status.'],
        ['full_day_hours', 'DECIMAL(4,2)', 'NOT NULL', '8.0', 'Minimum required work hours for Full-day Present status.'],
        ['working_days', 'VARCHAR(255)', 'NOT NULL', 'Mon,Tue,Wed,Thu,Fri', 'Comma-separated active working days of the week.'],
        ['color', 'VARCHAR(50)', 'NOT NULL', '#6366F1', 'Hexadecimal color code for visual UI badges.'],
      ],
      [1800, 1500, 2000, 1100, 2800]
    ),
    new Paragraph({ spacing: { before: 140 } }),

    // Table 6: ATTENDANCE
    pSubSectionHeader('Table 6: ATTENDANCE Entity (Core Upsert Table)'),
    buildTable(
      ['Field Name', 'SQL / Mongo Type', 'Constraints', 'Default', 'Description'],
      [
        ['id', 'BIGINT / ObjectId', 'PRIMARY KEY, Auto-Inc', 'Auto', 'Unique record identifier.'],
        ['employee_id / empId', 'VARCHAR(50)', 'FOREIGN KEY -> EMPLOYEE, INDEX', 'None', 'Employee code associated with this attendance.'],
        ['attendance_date / date', 'DATE / String', 'NOT NULL, INDEX (YYYY-MM-DD)', 'None', 'Calendar date of the duty log.'],
        ['shift_id', 'BIGINT / String', 'FOREIGN KEY -> SHIFT.id', 'shift-1', 'Shift schedule governing this attendance event.'],
        ['check_in', 'TIME / String', 'NULLABLE (HH:mm)', 'None', 'Actual recorded punch-in timestamp.'],
        ['check_out', 'TIME / String', 'NULLABLE (HH:mm)', 'None', 'Actual recorded punch-out timestamp.'],
        ['total_hours', 'DECIMAL(5,2)', 'NOT NULL', '0.00', 'Computed net duty hours worked.'],
        ['status', 'VARCHAR(30)', 'ENUM(Present, Absent, Late, Half-day, On Leave)', 'Present', 'Attendance standing classification.'],
        ['remarks / notes', 'VARCHAR(500)', 'NULLABLE', 'None', 'System audit notes (e.g. "Shift concluded - Auto logged out").'],
      ],
      [1800, 1500, 2000, 1100, 2800]
    ),
    new Paragraph({ spacing: { before: 140 } }),

    // Table 7: LEAVE_TYPE, Table 8: LEAVE_REQUEST, Table 9: LEAVE_BALANCE
    pSubSectionHeader('Tables 7-9: Leave Management Entities'),
    buildTable(
      ['Table Name', 'Field Name', 'Type & Constraints', 'Description'],
      [
        ['LEAVE_TYPE', 'name / code', 'VARCHAR, UNIQUE, NOT NULL', 'Leave category name and short code (CL, SL, PL).'],
        ['LEAVE_TYPE', 'yearly_quota', 'DOUBLE, NOT NULL (Default: 12)', 'Annual allotment of leaves credited to employees.'],
        ['LEAVE_TYPE', 'paid / carry_forward', 'BOOLEAN, NOT NULL', 'Policies governing salary protection and rollover.'],
        ['LEAVE_REQUEST', 'from_date / to_date', 'DATE, NOT NULL', 'Commencement and concluding dates of requested leave.'],
        ['LEAVE_REQUEST', 'total_days', 'DECIMAL(4,1), NOT NULL', 'Calculated duration deducted from quota balance.'],
        ['LEAVE_REQUEST', 'status', 'ENUM(Pending, Approved, Rejected)', 'Approval workflow state evaluated by managers.'],
        ['LEAVE_BALANCE', 'allocated / used', 'DECIMAL(4,1), NOT NULL', 'Ledger of credited quota vs consumed days for year.'],
      ],
      [1800, 2200, 2600, 2600]
    ),
    new Paragraph({ spacing: { before: 140 } }),

    // Table 10 & 11: HOLIDAY & WORK_SETTINGS
    pSubSectionHeader('Tables 10-11: HOLIDAY & WORK_SETTINGS Entities'),
    buildTable(
      ['Table Name', 'Field Name', 'Type & Constraints', 'Description'],
      [
        ['HOLIDAY', 'name / date', 'VARCHAR / DATE, UNIQUE, NOT NULL', 'Official title and calendar date of company holiday.'],
        ['HOLIDAY', 'description', 'VARCHAR(500), NULLABLE', 'Cultural celebration or statutory holiday detail.'],
        ['WORK_SETTINGS', 'office_start / end', 'TIME, NOT NULL (09:00 / 18:00)', 'Enterprise-wide core duty benchmark boundaries.'],
        ['WORK_SETTINGS', 'late_mark_after_minutes', 'INTEGER, NOT NULL (15 mins)', 'Grace arrival window before flagging Late status.'],
        ['WORK_SETTINGS', 'weekly_off_days', 'VARCHAR(255), NOT NULL', 'Standard weekly non-working days (Saturday, Sunday).'],
      ],
      [1800, 2200, 2600, 2600]
    ),

    pSectionHeader('User Interfaces'),
    pBody('The user experience is built upon modern glassmorphic enterprise design principles. Below are the implemented primary viewports:'),
    new Paragraph({ spacing: { before: 100 } })
  );

  // Screen 5: Login Page (image4.png)
  if (imgLogin) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgLogin] }),
      pFigureCaption('Fig 4.2. System Authentication & Login Portal (Role Routing: HR Admin, Manager, Employee)')
    );
  }

  // Screen 6: HR Admin Operations Dashboard (image5.png)
  if (imgAdminDash) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgAdminDash] }),
      pFigureCaption('Fig 4.3. HR Administrator Central Operations Dashboard (Real-Time Workforce Metrics)')
    );
  }

  // Screen 1: Employee Self-Service Dashboard (image2.png)
  if (imgEmpDash) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgEmpDash] }),
      pFigureCaption('Fig 4.4. Employee Self-Service Dashboard (Greeting, Live Clock, Continuous Shift Watch Timer)')
    );
  }

  // Screen 7: Employee Directory (image6.png)
  if (imgDirectory) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgDirectory] }),
      pFigureCaption('Fig 4.5. Employee Master Directory Management (Full CRUD Operations & Role Badges)')
    );
  }

  // Screen 2: Daily Attendance Grid (image3.png)
  if (imgAttGrid) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgAttGrid] }),
      pFigureCaption('Fig 4.6. Daily Attendance Monitoring Grid (Status Counters, Search, Filter & Inline Edit)')
    );
  }

  // Placeholders for Additional Images (User will provide in next step)
  children.push(
    pBody('Below are designated layouts for supplementary system viewports being finalized:'),
    buildImagePlaceholder('Fig 4.7. Attendance Correction Modal Dialog', 'Displays In/Out time editors, Status dropdown, Notes field, and live auto-recalculated work hours.'),
    pFigureCaption('Fig 4.7. Attendance Correction Modal Dialog (Administrative Correction View)'),
    new Paragraph({ spacing: { before: 120 } }),
    buildImagePlaceholder('Fig 4.8. Leave Management & Balance Tracking Screen', 'Displays multi-type leave request form, quota balance progress bars, and approval table.'),
    pFigureCaption('Fig 4.8. Leave Management & Balance Tracking Screen'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 20-21: CHAPTER 5 - IMPLEMENTATION DETAILS (Matches Ref Page 20-21)
  // ==========================================
  children.push(
    pChapterHeader('IMPLEMENTATION DETAILS'),
    new Paragraph({ spacing: { before: 140 } }),
    pBody('The implementation phase realizes the architectural designs into a functional, resilient enterprise software application. The development adheres to clean code paradigms, strong TypeScript typing, optimistic client updates, and defensive backend schema validation.'),

    pSectionHeader('Software and Hardware Specifications'),
    buildTable(
      ['Category', 'Specification'],
      [
        ['Operating System', 'Windows 10 / 11 / Linux Ubuntu 22.04 LTS (Development & Staging)'],
        ['Code Editor & Environment', 'Visual Studio Code 1.90+ with ESLint, Prettier, TypeScript Server'],
        ['Frontend Framework & Core', 'React 19.2 (Concurrent Mode), Vite 6.1 (ESM Bundler)'],
        ['Language & Type System', 'TypeScript 5.7 (Strict Null Checks, Static Typing)'],
        ['Styling & Animations', 'TailwindCSS 3.4 (JIT Engine), Framer Motion 14, Lucide React Icons'],
        ['State Management', 'Zustand 5.0 with `persist` middleware configured for `localStorage`'],
        ['Backend Runtime & Server', 'Node.js 22.x LTS, Express 4.19 (RESTful JSON APIs)'],
        ['Enterprise JPA Reference', 'Java 21 LTS, Spring Boot 3.3.x, Spring Data JPA, Hibernate'],
        ['Database Systems', 'MongoDB Atlas 7.x (Document Cloud) & PostgreSQL 16 (Relational DB)'],
        ['Data Validation Libraries', 'Zod 3.25 (Schema Parsing & Inbound Request Sanitization)'],
        ['Browser for Testing', 'Modern evergreen web browser (Google Chrome, Microsoft Edge, Mozilla Firefox)'],
        ['Deployment Target', 'Cloud Hosting with HTTPS, Node runtime process manager (PM2 / Docker)'],
      ],
      [3200, 6000]
    ),

    pSectionHeader('Project Structure'),
    pBody('The repository is organized following clean architectural separation of concerns:'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
        left: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
        right: { style: BorderStyle.SINGLE, size: 1, color: C_BORDER },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F1F5F9' },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              children: [
                pBody('peoplehub-hrms/'),
                pBody('├── server/                      # Node.js Express Backend'),
                pBody('│   ├── models/                  # Mongoose Schemas (Employee.js, Attendance.js)'),
                pBody('│   ├── routes/                  # REST Controllers (employees.js, attendance.js)'),
                pBody('│   ├── schemas/                 # Zod Validation Schemas (attendanceValidation.js)'),
                pBody('│   └── index.js                 # Server Entry & MongoDB Connection'),
                pBody('├── src/                         # React 19 Frontend Application'),
                pBody('│   ├── components/              # Reusable UI (Sidebar, Topbar, Card, Input, Button)'),
                pBody('│   ├── pages/                   # Role Views (Admin, Manager, Employee, Attendance, Leaves)'),
                pBody('│   ├── store/                   # Zustand Stores (attendanceStore.ts, employeeStore.ts)'),
                pBody('│   ├── types/                   # TypeScript Interfaces (employee.ts, attendance.ts)'),
                pBody('│   └── App.tsx                  # Routing & Theme Context Provider'),
                pBody('└── package.json                 # Project Dependencies & Scripts'),
              ]
            })
          ]
        })
      ]
    }),

    new Paragraph({ spacing: { before: 180 } }),
    pSubSectionHeader('Core Algorithmic Implementations (Source Logic)'),
    pBullet('Continuous Shift Stopwatch Watch Timer: Captures immutable timestamp `Date.now()` on punch-in, stores session in `localStorage`, and computes continuous elapsed seconds: `Math.floor((Date.now() - session.checkInTimestamp) / 1000)`. Timer never resets across user logouts or device reboots.'),
    pBullet('Autonomous Shift Conclusion Engine: Background monitor checks if `Date.now()` exceeded maximum shift seconds (9 hours) or passed shift end boundary (18:00). When triggered, automatically executes check-out and logs 8.5 work hours with audit note "Shift concluded - Auto logged out".'),
    pBullet('Atomic MongoDB Upsert Pipeline: Administrative edits and punch events utilize `findOneAndUpdate({ employeeId, date }, { $set: payload }, { new: true, upsert: true })`, eliminating CastErrors on uninitialized attendance rows and guaranteeing permanent persistence.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 22-24: CHAPTER 6 - SYSTEM OUTPUTS AND VALIDATION (Matches Ref Page 22-24)
  // ==========================================
  children.push(
    pChapterHeader('SYSTEM OUTPUTS AND VALIDATION'),
    new Paragraph({ spacing: { before: 140 } }),
    pBody('This section documents the actual system output screens, cloud database verification, input validation rules, and comprehensive test case execution matrices.'),

    pSectionHeader('Output Screen'),
    pSubSectionHeader('Database Verification Output - MongoDB Atlas Live Cluster:'),
    pBody('The image below confirms real-time cloud document persistence in MongoDB Atlas (`cluster0.xzpdily.mongodb.net`), displaying employee records with ObjectIds, employee codes, roles, and credentials:'),
    new Paragraph({ spacing: { before: 100 } })
  );

  // Screen 8: MongoDB Atlas Live View (image7.png)
  if (imgMongoDB) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgMongoDB] }),
      pFigureCaption('Fig 6.1. Live Backend Cloud Storage – MongoDB Atlas Cluster (Document Record View)')
    );
  }

  children.push(
    pSubSectionHeader('System Operation Outputs:'),
    pBullet('Real-Time Punch Confirmation: Emits an instant visual toast notification (`Clocked in at 09:15 AM! Timer is running continuously`) and synchronizes with the HR Admin panel within 500ms.'),
    pBullet('Automated Shift Conclusion Badge: Renders "Shift Completed" with registered out-time (18:00) and net 8.5 work hours logged.'),
    pBullet('Zero-Data-Loss Administrative Update: Emits confirmation toast (`Attendance record updated and saved to MongoDB!`) and instantly updates all analytics counters.'),

    pSectionHeader('Input Validation & Report Format'),
    pSubSectionHeader('Input Validation Specifications:'),
    pBody('All user input fields are constrained via Zod schemas to guarantee data sanitization:'),
    buildTable(
      ['Field', 'Validation Rule', 'Zod Constraint', 'Error Handling'],
      [
        ['employeeId', 'Non-empty alphanumeric string', 'z.string().min(1)', 'Employee ID cannot be empty.'],
        ['date', 'ISO 8601 format YYYY-MM-DD', 'z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/)', 'Date must be in YYYY-MM-DD format.'],
        ['checkIn', '24-hour military time HH:mm', 'z.string().regex(/^([01]\\d|2[0-3]):([0-5]\\d)$/)', 'Check-in must be in valid HH:mm format.'],
        ['checkOut', '24-hour military time HH:mm', 'z.string().regex(/^([01]\\d|2[0-3]):([0-5]\\d)$/)', 'Check-out must be in valid HH:mm format.'],
        ['totalHours', 'Numeric range 0.0 to 24.0', 'z.number().min(0).max(24)', 'Total hours cannot exceed 24.0 hours.'],
        ['status', 'Strict enum membership', 'z.enum(["Present", "Absent", "Late", "Half-day", "On Leave"])', 'Status must be a recognized organizational state.'],
        ['notes', 'Maximum 500 characters', 'z.string().max(500).optional()', 'Notes cannot exceed 500 characters.'],
      ],
      [1800, 2400, 2600, 2400]
    ),

    pSubSectionHeader('Report Format Standards:'),
    pBody('The final academic report maintains consistent heading hierarchies, formal A4 page borders, numbered figures and tables, and strict alignment matching the curriculum index of Savitribai Phule Pune University.'),

    pSubSectionHeader('Comprehensive Test Case Execution Matrix:'),
    buildTable(
      ['Test ID', 'Test Scenario', 'Input Data', 'Expected Behavior', 'Actual Outcome', 'Status'],
      [
        ['TC-01', 'User Login with Role Routing', 'Email: hr@company.com, Pass: Admin@123', 'Authenticates and redirects to HR Admin Dashboard.', 'Redirected to /dashboard/admin.', 'PASS'],
        ['TC-02', 'Employee Clock-In Event', 'Click Clock In button at 09:15 AM', 'Session created, status Present, stopwatch timer begins.', 'Timer began, record synced to MongoDB.', 'PASS'],
        ['TC-03', 'Timer Persistence Across Logout', 'Clock in -> Logout -> Wait 2 mins -> Login', 'Timer resumes with 2+ minutes elapsed without resetting.', 'Timer calculated exact elapsed time.', 'PASS'],
        ['TC-04', 'Browser Refresh Resilience', 'Clocked in -> Hit Ctrl+F5', 'Active session reloaded from localStorage instantly.', 'State re-rendered seamlessly.', 'PASS'],
        ['TC-05', 'Auto Shift Conclusion at Limit', 'Session reaches 9 hours / 18:00 cutoff', 'Session auto-terminates, marks Out at 18:00, logs 8.5 hrs.', 'Auto checked out with "Shift Completed".', 'PASS'],
        ['TC-06', 'HR Edit on Uninitialized Record', 'HR edits "Absent" Ayaan Khan to "Present"', 'Atomic upsert creates record in MongoDB without CastError.', 'Saved to MongoDB, persists on reload.', 'PASS'],
        ['TC-07', 'Leave Request Submission', 'From: 2026-11-01, To: 2026-11-03 (Sick Leave)', 'Calculates 3 days, deducts from balance, status Pending.', 'Application logged, balance reduced.', 'PASS'],
        ['TC-08', 'Duplicate Attendance Prevention', 'Attempt punch on already completed date', 'System updates existing record rather than duplicate row.', 'Single consolidated record maintained.', 'PASS'],
        ['TC-09', 'Unauthorized Access Guard', 'Employee attempts manual URL navigation to /admin', 'AppLayout redirects to /unauthorized or employee view.', 'Restricted access enforced.', 'PASS'],
        ['TC-10', 'Invalid Time Format Submission', 'Check-in time entered as "99:99"', 'Zod validation fails with 400 Bad Request error toast.', 'Rejection with user-friendly error.', 'PASS'],
      ],
      [1000, 1800, 1800, 2200, 1800, 600]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 25-26: CHAPTER 7 - CONCLUSION (Matches Ref Page 25-26)
  // ==========================================
  children.push(
    pChapterHeader('CONCLUSION AND RECOMMENDATIONS, LIMITATIONS & FUTURE SCOPE'),
    new Paragraph({ spacing: { before: 140 } }),

    pSectionHeader('Conclusion'),
    pBody('The “PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System” successfully demonstrates the practical application of modern web technologies (React 19, TypeScript, TailwindCSS, Zustand, Node.js, Express, and MongoDB) to an authentic enterprise human capital management problem. It creates a centralized digital presence for organizational workforce governance, transparently automates daily shift attendances, prevents payroll ghost hours through autonomous checkout, eliminates administrative data loss via atomic database upserts, and provides a streamlined leave request and quota ledger.'),
    pBody('The project is presented as an enterprise-grade web application. Its key engineering achievements include continuous session persistence across logouts, atomic schema-validated database mutations, strict multi-role viewport isolation, and sub-100ms UI responsiveness. The system is fully compliant with the TY BBA-CA Semester V curriculum standards under Savitribai Phule Pune University.'),

    pSectionHeader('Recommendations'),
    pBullet('Insert actual high-resolution screenshots of the final operational application before university project submission.'),
    pBullet('Maintain regular automated backups of the MongoDB Atlas cloud database cluster.'),
    pBullet('Deploy the web application over HTTPS to safeguard user authentication tokens and sensitive employee profiles.'),
    pBullet('Conduct cross-browser testing across Google Chrome, Microsoft Edge, Mozilla Firefox, and mobile viewports.'),
    pBullet('Keep organizational shift start and grace periods updated as company working policies evolve.'),

    pSectionHeader('Limitations'),
    pBullet('The current release operates through web interfaces; direct hardware-level integration with physical optical fingerprint devices requires vendor-specific USB drivers.'),
    pBullet('Real-time database synchronization requires an active internet connection to communicate with the cloud MongoDB server.'),
    pBullet('Automated salary bank disbursements are currently prepared as calculation ledgers rather than direct payment gateway API transfers.'),

    pSectionHeader('Future Scope'),
    pBullet('Develop cross-platform native mobile applications (React Native / Flutter) enforcing campus GPS geofencing radiuses for on-duty mobile check-ins.'),
    pBullet('Integrate automated payroll generation computing tax brackets, provident fund (PF) deductions, and direct bank transfers.'),
    pBullet('Implement AI-driven attendance forecasting to identify employee burnout, predict absenteeism, and optimize department staffing.'),
    pBullet('Incorporate facial recognition biometrics through browser webcams for touchless multi-factor authentication check-ins.'),
    pBullet('Add multi-language internationalization (English, Marathi, Hindi) for diversified regional branch office deployments.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 27-28: CHAPTER 8 - BIBLIOGRAPHY & REFERENCES (Matches Ref Page 27-28)
  // ==========================================
  children.push(
    pChapterHeader('BIBLIOGRAPHY AND REFERENCES'),
    new Paragraph({ spacing: { before: 140 } }),

    pSectionHeader('APPENDIX A – Project Feature Summary'),
    buildTable(
      ['Item / Module', 'Implemented Status & Operational Details'],
      [
        ['Project Name', 'PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System'],
        ['Primary Tech Stack', 'React 19, TypeScript, TailwindCSS, Zustand, Node.js, Express, MongoDB Atlas'],
        ['Continuous Watch Timer', 'Implemented (Epoch delta calculation `Date.now() - timestamp` across logout & reboots)'],
        ['Auto Shift Conclusion', 'Implemented (Autonomous checkout at 18:00 / 9 hrs max with 8.5 logged hours)'],
        ['Atomic Database Upsert', 'Implemented (Zero-data-loss MongoDB findOneAndUpdate matching on employeeId + date)'],
        ['Role-Based Portals', 'Implemented (3-Tier strict segregation: HR Admin, Department Manager, Employee)'],
        ['Employee Directory', 'Implemented (Full CRUD management with codes, designations, departments, supervisors)'],
        ['Leave Quota Ledger', 'Implemented (Casual, Sick, Earned leaves with automatic day span calculation & deduction)'],
        ['Dark / Light Theme', 'Implemented (Modern glassmorphic interface with reactive theme switching)'],
        ['Mobile Geofencing', 'Future Scope (Planned for React Native mobile campus tracking)'],
        ['Payroll Bank Transfer', 'Future Scope (Planned for direct automated banking API integration)'],
      ],
      [2800, 6400]
    ),

    new Paragraph({ spacing: { before: 180 } }),
    pSectionHeader('APPENDIX B – Evidence-Based Source Code Analysis'),
    buildTable(
      ['Source Code Evidence', 'Report Mapping & Functional Justification'],
      [
        ['`activeSessions` in Zustand persist store', 'Validates continuous stopwatch shift timer persistence across logout and reboots.'],
        ['`getActiveSession` shift end evaluation', 'Validates autonomous shift conclusion and automatic 18:00 check-out execution.'],
        ['`findOneAndUpdate({ employeeId, date })` in Express', 'Validates atomic zero-data-loss database upsert eliminating MongoDB CastErrors.'],
        ['Zod schema regex `HH:mm` and `YYYY-MM-DD`', 'Validates defensive input sanitization and strict attendance data integrity.'],
        ['`AppLayout.tsx` role-guarded routes', 'Validates strict RBAC segregation between HR Admin, Manager, and Employee portals.'],
        ['MongoDB Atlas Mongoose schemas', 'Validates cloud-native document persistence for employee profiles and attendance logs.'],
      ],
      [3200, 6000]
    ),

    new Paragraph({ spacing: { before: 180 } }),
    pSectionHeader('References'),
    pBullet('React Documentation Team, "React 19 Architecture and Server Components," Meta Open Source, 2024. [Online]. https://react.dev'),
    pBullet('P. Hunt, "Zustand: Bear Necessities for State Management in React," GitHub Repository, 2024. [Online]. https://github.com/pmndrs/zustand'),
    pBullet('K. Chodorow, "MongoDB: The Definitive Guide - Powerful and Scalable Data Storage," 3rd ed., O\'Reilly Media, 2020.'),
    pBullet('C. Collet, "Zod: TypeScript-First Schema Declaration and Validation Library," 2024. [Online]. https://zod.dev'),
    pBullet('M. Fowler, "Patterns of Enterprise Application Architecture," Addison-Wesley, Boston, MA, 2002.'),
    pBullet('Savitribai Phule Pune University, "Bachelor of Business Administration & Computer Application (BBA-CA) CBCS Curriculum Guide," 2026.'),
    pBullet('World Wide Web Consortium (W3C), "Web Content Accessibility Guidelines (WCAG) 2.1," W3C Recommendation, 2018.'),

    new Paragraph({ spacing: { before: 360 } }),
    pCenter('--- END OF PROJECT REPORT ---', true, 20, C_MUTED, { after: 100 })
  );

  // ==========================================
  // COMPILE FINAL A4 DOCUMENT WITH BORDERS & NUMBERING
  // ==========================================
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 21,
            color: C_TEXT,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,  // Exact A4 Width (210mm in twips)
              height: 16838, // Exact A4 Height (297mm in twips)
            },
            margin: {
              top: 1440,    // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
              right: 1440,  // 1 inch
            },
            borders: {
              pageBorders: {
                display: PageBorderDisplay.ALL_PAGES,
                zOrder: PageBorderZOrder.FRONT,
              },
              pageBorderTop: { style: BorderStyle.SINGLE, size: 10, color: C_PRIMARY },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 10, color: C_PRIMARY },
              pageBorderLeft: { style: BorderStyle.SINGLE, size: 10, color: C_PRIMARY },
              pageBorderRight: { style: BorderStyle.SINGLE, size: 10, color: C_PRIMARY },
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'PeopleHub HRMS – BBA-CA Academic Project Report',
                    size: 16,
                    color: C_MUTED,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Page ', size: 18, color: C_MUTED }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C_MUTED }),
                  new TextRun({ text: ' of ', size: 18, color: C_MUTED }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: C_MUTED }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_MAIN, buffer);
  fs.writeFileSync(OUTPUT_OVERWRITE, buffer);
  console.log(`Report successfully generated in A4 format at: ${OUTPUT_MAIN}`);
  console.log(`Also synchronized to: ${OUTPUT_OVERWRITE}`);
  console.log(`Total generated file size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

generateReport().catch(console.error);

