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
  VerticalAlign,
} from 'docx';
import fs from 'fs';
import path from 'path';

const MEDIA_DIR = 'C:/Users/Asus/OneDrive/Desktop/HRMS/project_images/word/media/';
const OUTPUT_MAIN = 'C:/Users/Asus/OneDrive/Desktop/HRMS/PeopleHub_HRMS_Project_Report_Final_A4.docx';
const OUTPUT_SYNC = 'C:/Users/Asus/OneDrive/Desktop/HRMS/PeopleHub_HRMS_Project_Report_30_Pages.docx';

// Professional Academic Palette
const FONT_FAMILY = 'Times New Roman';
const COLOR_PRIMARY = '0F172A';   // Dark Navy / Slate 900
const COLOR_ACCENT = '1D4ED8';    // Deep Academic Blue
const COLOR_TEXT = '1E293B';      // Off-black text for sharp contrast
const COLOR_MUTED = '475569';     // Slate 600
const COLOR_BORDER = 'CBD5E1';    // Slate 300
const COLOR_BG_HEADER = '0F172A'; // Dark Header
const COLOR_BG_ZEBRA = 'F8FAFC';  // Light row

// ==========================================
// TYPOGRAPHY BUILDERS (Strictly Justified & Aligned)
// ==========================================

const pChapter = (num, title) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 280, after: 180 },
  keepWithNext: true,
  children: [
    new TextRun({ text: `CHAPTER ${num}\n`, bold: true, size: 28, color: COLOR_ACCENT, font: FONT_FAMILY }),
    new TextRun({ text: title.toUpperCase(), bold: true, size: 30, color: COLOR_PRIMARY, font: FONT_FAMILY })
  ]
});

const pSection = (secNum, title) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing: { before: 240, after: 120 },
  keepWithNext: true,
  children: [
    new TextRun({ text: `${secNum}  ${title}`, bold: true, size: 24, color: COLOR_PRIMARY, font: FONT_FAMILY })
  ]
});

const pSubSection = (title) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing: { before: 180, after: 80 },
  keepWithNext: true,
  children: [
    new TextRun({ text: title, bold: true, size: 22, color: COLOR_ACCENT, font: FONT_FAMILY })
  ]
});

const pBody = (text, indent = 0) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 140, line: 288 }, // 1.2 Line Spacing
  indent: { left: indent },
  children: [new TextRun({ text, size: 23, color: COLOR_TEXT, font: FONT_FAMILY })]
});

const pBullet = (text, boldPrefix = '') => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  bullet: { level: 0 },
  spacing: { after: 100, line: 280 },
  children: [
    ...(boldPrefix ? [new TextRun({ text: boldPrefix + ': ', bold: true, size: 23, color: COLOR_PRIMARY, font: FONT_FAMILY })] : []),
    new TextRun({ text, size: 23, color: COLOR_TEXT, font: FONT_FAMILY })
  ]
});

const pNumbered = (num, text, boldPrefix = '') => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 100, line: 280 },
  indent: { left: 400 },
  children: [
    new TextRun({ text: `${num}. `, bold: true, size: 23, color: COLOR_PRIMARY, font: FONT_FAMILY }),
    ...(boldPrefix ? [new TextRun({ text: boldPrefix + ': ', bold: true, size: 23, color: COLOR_PRIMARY, font: FONT_FAMILY })] : []),
    new TextRun({ text, size: 23, color: COLOR_TEXT, font: FONT_FAMILY })
  ]
});

const pFigureCaption = (figText) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 100, after: 200 },
  keepWithNext: true,
  children: [new TextRun({ text: figText, bold: true, italics: true, size: 20, color: COLOR_MUTED, font: FONT_FAMILY })]
});

// Professional Bordered Table
const buildStyledTable = (headers, dataRows, colWidths = []) => {
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      shading: { fill: COLOR_BG_HEADER },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF', font: FONT_FAMILY })]
      })]
    }))
  });

  const bodyRows = dataRows.map((row, rIdx) => new TableRow({
    cantSplit: true,
    children: row.map((cellText, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      shading: { fill: rIdx % 2 === 1 ? COLOR_BG_ZEBRA : 'FFFFFF' },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: String(cellText), size: 20, color: COLOR_TEXT, font: FONT_FAMILY })]
      })]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: tableBorders,
    rows: [headerRow, ...bodyRows]
  });
};

// Safe image loader
const loadImage = (filename, width, height) => {
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

// Styled Framed Placeholder
const buildPlaceholderBox = (title, subtext) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  alignment: AlignmentType.CENTER,
  borders: {
    top: { style: BorderStyle.DASHED, size: 2, color: COLOR_ACCENT },
    bottom: { style: BorderStyle.DASHED, size: 2, color: COLOR_ACCENT },
    left: { style: BorderStyle.DASHED, size: 2, color: COLOR_ACCENT },
    right: { style: BorderStyle.DASHED, size: 2, color: COLOR_ACCENT },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE }
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          shading: { fill: 'F8FAFC' },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `[IMAGE PLACEHOLDER: ${title}]`, bold: true, size: 22, color: COLOR_ACCENT, font: FONT_FAMILY })]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60 },
              children: [new TextRun({ text: subtext, italics: true, size: 19, color: COLOR_MUTED, font: FONT_FAMILY })]
            })
          ]
        })
      ]
    })
  ]
});

async function generate() {
  console.log('Generating Professional Academic A4 Report (Times New Roman, Justified, Standard Tables)...');

  // Load Extracted Real Images
  const imgERD = loadImage('image1.png', 540, 360);       // ERD Diagram (1536x1024)
  const imgEmpDash = loadImage('image2.png', 540, 266);   // Employee Dashboard (1911x943)
  const imgAttGrid = loadImage('image3.png', 540, 267);   // Daily Attendance Grid (1917x949)
  const imgLogin = loadImage('image4.png', 540, 270);     // Login Portal
  const imgAdminDash = loadImage('image5.png', 540, 270); // HR Admin Operations Dashboard
  const imgDirectory = loadImage('image6.png', 540, 271); // Employee Master Directory (1656x832)
  const imgMongoDB = loadImage('image7.png', 540, 337);   // MongoDB Atlas View (1438x897)

  const elements = [];

  // ==========================================
  // PAGE 1: TITLE / COVER PAGE
  // ==========================================
  elements.push(
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'A PROJECT DISSERTATION REPORT ON', bold: true, size: 20, color: COLOR_MUTED, font: FONT_FAMILY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: '“PEOPLEHUB HRMS – ENTERPRISE HUMAN RESOURCE MANAGEMENT & SHIFT AUTOMATION SYSTEM”', bold: true, size: 28, color: COLOR_PRIMARY, font: FONT_FAMILY })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: 'SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE DEGREE OF', size: 19, color: COLOR_MUTED, font: FONT_FAMILY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'BACHELOR OF BUSINESS ADMINISTRATION\n', bold: true, size: 22, color: COLOR_PRIMARY, font: FONT_FAMILY }),
        new TextRun({ text: '& COMPUTER APPLICATION\n', bold: true, size: 22, color: COLOR_PRIMARY, font: FONT_FAMILY }),
        new TextRun({ text: '(TY-BBA-CA) (CBCS PATTERN)\n', bold: true, size: 21, color: COLOR_ACCENT, font: FONT_FAMILY })
      ]
    }),
    new Paragraph({ spacing: { before: 300 } }),

    // Framed University Box
    new Table({
      width: { size: 90, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: COLOR_PRIMARY },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: COLOR_PRIMARY },
        left: { style: BorderStyle.SINGLE, size: 2, color: COLOR_PRIMARY },
        right: { style: BorderStyle.SINGLE, size: 2, color: COLOR_PRIMARY },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              margins: { top: 160, bottom: 160, left: 160, right: 160 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'SAVITRIBAI PHULE PUNE UNIVERSITY', bold: true, size: 24, color: COLOR_PRIMARY, font: FONT_FAMILY })]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80, after: 80 },
                  children: [new TextRun({ text: 'SUBMITTED TO', bold: true, size: 18, color: COLOR_MUTED, font: FONT_FAMILY })]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'K. V. N. NAIK SHIKSHAN PRASARAK SANSTHA’S\n', bold: true, size: 21, color: COLOR_PRIMARY, font: FONT_FAMILY }),
                    new TextRun({ text: 'ARTS, COMMERCE AND SCIENCE COLLEGE\n', bold: true, size: 21, color: COLOR_PRIMARY, font: FONT_FAMILY }),
                    new TextRun({ text: 'CANADA CORNER, NASHIK - 422002', size: 19, color: COLOR_TEXT, font: FONT_FAMILY })
                  ]
                }),
              ]
            })
          ]
        })
      ]
    }),

    new Paragraph({ spacing: { before: 360 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'UNDER THE ESTEEMED GUIDANCE OF\n', bold: true, size: 18, color: COLOR_MUTED, font: FONT_FAMILY }),
        new TextRun({ text: 'PROF. SUDHAM. L. BHABAD\n\n', bold: true, size: 23, color: COLOR_PRIMARY, font: FONT_FAMILY }),
        new TextRun({ text: 'SUBMITTED BY\n', bold: true, size: 18, color: COLOR_MUTED, font: FONT_FAMILY }),
        new TextRun({ text: 'MUSTAKIM PATEL\n', bold: true, size: 24, color: COLOR_ACCENT, font: FONT_FAMILY }),
        new TextRun({ text: 'Seat No: ________________    Academic Year: 2026-27', size: 20, color: COLOR_TEXT, font: FONT_FAMILY })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 2: CERTIFICATE
  // ==========================================
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'K. V. N. NAIK SHIKSHAN PRASARAK SANSTHA’S\n', bold: true, size: 20, color: COLOR_PRIMARY, font: FONT_FAMILY }),
        new TextRun({ text: 'ART’S, COMMERCE & SCIENCE COLLEGE\n', bold: true, size: 24, color: COLOR_PRIMARY, font: FONT_FAMILY }),
        new TextRun({ text: 'DONGARE VASATIGRUH PARISAR, CANADA CORNER, NASHIK-02\n', size: 18, color: COLOR_TEXT, font: FONT_FAMILY }),
        new TextRun({ text: 'Affiliated to Savitribai Phule Pune University, AICTE Delhi, DTE Mumbai\n', size: 16, color: COLOR_MUTED, font: FONT_FAMILY }),
        new TextRun({ text: 'NAAC Reaccredited “B++” GRADE | Best College Awarded by SPPU\n', bold: true, size: 16, color: COLOR_ACCENT, font: FONT_FAMILY }),
        new TextRun({ text: 'Phone: (0253) 2576692 | Email: vnnaikcollege@gmail.com', size: 16, color: COLOR_MUTED, font: FONT_FAMILY }),
      ]
    }),

    new Paragraph({ spacing: { before: 160 } }),
    // Divider
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 3, color: COLOR_PRIMARY },
        bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [new TableRow({ children: [new TableCell({ children: [] })] })]
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 240 },
      children: [new TextRun({ text: 'CERTIFICATE', bold: true, size: 32, color: COLOR_PRIMARY, font: FONT_FAMILY })]
    }),

    pBody('This is to certify that, Mr. Mustakim Patel of class TY BBA-CA (Semester V) has successfully completed the project entitled “PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System” in satisfactory compliance with the curriculum requirements for the Bachelor of Business Administration & Computer Application (BBA-CA) under Savitribai Phule Pune University during the academic year 2026-2027.'),
    pBody('The project report embodies an original software engineering implementation demonstrating competence in software requirements analysis, system architecture design, database normalization, reactive web front-end development, and cloud-native RESTful API integrations.'),

    new Paragraph({ spacing: { before: 200 } }),
    pBody('Seat No:  ________________________'),
    pBody('Date:     ________________________'),
    pBody('Place:    Nashik'),

    new Paragraph({ spacing: { before: 500 } }),
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
            new TableCell({ children: [
              new Paragraph({ children: [new TextRun({ text: '________________________\n', bold: true, font: FONT_FAMILY }), new TextRun({ text: 'Project In-charge\n(Prof. Sudham. L. Bhabad)', font: FONT_FAMILY, size: 19 })] }),
              new Paragraph({ spacing: { before: 280 }, children: [new TextRun({ text: '________________________\n', bold: true, font: FONT_FAMILY }), new TextRun({ text: 'Head of Department\n(Department of BBA-CA)', font: FONT_FAMILY, size: 19 })] })
            ] }),
            new TableCell({ children: [
              new Paragraph({ children: [new TextRun({ text: '________________________\n', bold: true, font: FONT_FAMILY }), new TextRun({ text: 'Internal Examiner\nDate: ________________', font: FONT_FAMILY, size: 19 })] }),
              new Paragraph({ spacing: { before: 280 }, children: [new TextRun({ text: '________________________\n', bold: true, font: FONT_FAMILY }), new TextRun({ text: 'External Examiner\nDate: ________________', font: FONT_FAMILY, size: 19 })] })
            ] })
          ]
        })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 3: ACKNOWLEDGEMENT
  // ==========================================
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: COLOR_ACCENT },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: COLOR_ACCENT },
        left: { style: BorderStyle.SINGLE, size: 2, color: COLOR_ACCENT },
        right: { style: BorderStyle.SINGLE, size: 2, color: COLOR_ACCENT },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'DBEAFE' },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'ACKNOWLEDGEMENT', bold: true, size: 26, color: COLOR_ACCENT, font: FONT_FAMILY })]
              })]
            })
          ]
        })
      ]
    }),

    new Paragraph({ spacing: { before: 280 } }),
    pBody('It is with deep gratitude that I express my sincere thanks to our respected Principal, Head of Department, and project guide Prof. Sudham. L. Bhabad for providing the institutional infrastructure, laboratory facilities, and encouragement necessary for the completion of this enterprise project.'),
    pBody('I am immensely thankful to my faculty mentors who shared their technical wisdom on database design, relational algebra, asynchronous programming paradigms, and software testing practices throughout the software development life cycle (SDLC).'),
    pBody('I also record my indebtedness to the developers and open-source communities behind React, TypeScript, TailwindCSS, Zustand, Node.js, Express, and MongoDB Atlas. Their robust documentation, modular frameworks, and active development ecosystems served as the technical foundation upon which PeopleHub HRMS was constructed.'),
    pBody('Finally, I thank my family and fellow classmates for their unwavering moral support, constructive peer reviews, and creative inputs during long development sessions.'),

    new Paragraph({ spacing: { before: 360 } }),
    pBody('Place: Nashik'),
    pBody('Date:  28th October 2026'),

    new Paragraph({ spacing: { before: 240 } }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: 'Mustakim Patel\n', bold: true, size: 22, color: COLOR_PRIMARY, font: FONT_FAMILY }),
        new TextRun({ text: 'TY BBA-CA (Semester V)\n', size: 20, color: COLOR_ACCENT, font: FONT_FAMILY }),
        new TextRun({ text: 'Seat No: ______________', size: 19, color: COLOR_MUTED, font: FONT_FAMILY })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 4: DECLARATION
  // ==========================================
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: 'DECLARATION', bold: true, size: 30, color: COLOR_PRIMARY, font: FONT_FAMILY })]
    }),

    pBody('I hereby declare that the project report entitled “PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System” submitted to Savitribai Phule Pune University in partial fulfillment of the requirements for the degree of Bachelor of Business Administration & Computer Application (TY BBA-CA Semester V) is an authentic record of independent project development carried out by me under the guidance of Prof. Sudham. L. Bhabad.'),
    pBody('The web application has been developed using React 19, TypeScript, TailwindCSS, Zustand, Node.js, Express, and MongoDB. The system features an innovative continuous shift stopwatch timer persisting across logouts, an autonomous shift conclusion engine executing automatic check-outs at shift boundaries, an atomic MongoDB upsert routine eliminating administrative data loss, and strict multi-tier role segregation.'),
    pBody('I further confirm that the matter presented in this report has not been copied from any published work or submitted elsewhere for the award of any other degree or diploma.'),

    new Paragraph({ spacing: { before: 360 } }),
    pBody('Place: Nashik'),
    pBody('Date:  28th October 2026'),

    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: '_____________________________________\n', bold: true, color: COLOR_MUTED, font: FONT_FAMILY }),
        new TextRun({ text: 'Signature of the Student\n', bold: true, size: 21, color: COLOR_PRIMARY, font: FONT_FAMILY }),
        new TextRun({ text: '(Mustakim Patel)', size: 20, color: COLOR_ACCENT, font: FONT_FAMILY })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 5: ABSTRACT (Single Standalone Page)
  // ==========================================
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 200 },
      children: [new TextRun({ text: 'ABSTRACT', bold: true, size: 30, color: COLOR_PRIMARY, font: FONT_FAMILY })]
    }),

    pBody('The “PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System” is a production-ready, responsive web application engineered to solve critical operational bottlenecks in organizational workforce tracking, shift synchronization, and leave governance.'),
    pBody('Traditional attendance tracking tools (both physical sign-in registers and lightweight web apps) suffer from systemic vulnerabilities: biometric data remains stranded on local hardware; web-based stopwatch timers reset to zero when an employee logs out; forgotten clock-outs register inflated ghost hours that corrupt payroll; and administrative editing triggers MongoDB CastErrors on uninitialized attendance rows, causing silent data loss.'),
    pBody('PeopleHub HRMS resolves these issues through a modern reactive architecture. Built with React 19, TypeScript, TailwindCSS, Zustand with local storage persistence, Node.js/Express REST APIs, and MongoDB Atlas, the platform introduces three core engineering innovations:'),
    pBullet('Continuous Stopwatch Shift Engine', 'Stores an immutable epoch timestamp on punch-in (`activeSessions`), computing continuous elapsed duty time (`Math.floor((Date.now() - timestamp) / 1000)`) uninterrupted across user logouts, page reloads, and computer shutdowns without server polling.'),
    pBullet('Autonomous Shift Conclusion Engine', 'Monitors predefined shift thresholds (e.g. 18:00 cutoff or 9 hours duration), automatically concluding active shifts, registering the check-out timestamp, and logging net 8.5 work hours with an audit trail.'),
    pBullet('Atomic MongoDB Upsert Pipeline', 'Executes atomic `findOneAndUpdate` queries based on compound keys `(employeeId, date)`, allowing HR managers to edit attendance records safely regardless of whether prior logs existed.'),
    pBody('The system also incorporates a comprehensive Employee Master Directory, dynamic shift scheduling, multi-tier leave quota management (Casual, Sick, Earned leaves), and strict Role-Based Access Control (RBAC) isolating HR Admin, Manager, and Employee portals. This project exemplifies rigorous web engineering applied to an essential enterprise domain.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGE 6: INDEX (STRICTLY SINGLE PAGE - Matches Ref Page 6)
  // ==========================================
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 120 },
      children: [new TextRun({ text: 'INDEX', bold: true, size: 28, color: COLOR_PRIMARY, font: FONT_FAMILY })]
    }),

    buildStyledTable(
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
  // PAGES 7-9: CHAPTER 2 - INTRODUCTION (Matches Ref Page 7-9)
  // ==========================================
  elements.push(
    pChapter(2, 'INTRODUCTION'),
    pBody('An enterprise web platform serves as the central operational backbone for human resource management in modern corporate organizations. In place of fragmented manual records, paper leave slips, email chains, and isolated biometric hardware, a centralized web application provides a synchronized, transparent, and auditable digital environment for employee data, shift scheduling, real-time attendance tracking, and leave approvals. PeopleHub HRMS applies this concept to workforce governance.'),
    pBody('The primary goal of PeopleHub HRMS is not merely providing an informational directory, but establishing an active, real-time operational workflow engine. Built upon a modern component-driven Single Page Application (SPA) architecture, the system provides strict role-based segmentation. Navigation bars, action buttons, and supervisory oversight tools are dynamically scoped for HR Administrators, Department Managers, and Staff Employees to guarantee privacy, operational efficiency, and data integrity.'),

    pSection('2.1', 'Motivation'),
    pBody('The motivation behind the engineering of PeopleHub HRMS stems from concrete operational failures identified in legacy workforce administration:'),
    pBullet('Manual attendance books and hardware biometric clocks require manual weekly extraction, consuming up to 35% of administrative time in routine reconciliation.', 'Pervasive Administrative Overhead'),
    pBullet('Lightweight web applications store stopwatch timers in component state (`useState`), which immediately vanishes when an employee logs out or refreshes the page, forcing workstations to remain open.', 'Session Amnesia in Web Applications'),
    pBullet('Unmonitored shifts where staff forget to punch out result in 16-to-24 hour ghost records that corrupt automated salary calculation algorithms.', 'Payroll Inaccuracies from Ghost Hours'),
    pBullet('Administrative updates on uninitialized attendance rows frequently trigger database CastErrors in document databases like MongoDB, resulting in unnotified data loss.', 'Database CastErrors During Administrative Editing'),
    pBullet('Employees lack immediate visibility into their live duty duration, late arrivals, and remaining leave quotas, generating repetitive HR inquiry tickets.', 'Lack of Self-Service Transparency'),

    pSection('2.2', 'Problem Statement'),
    pBody('In traditional operational setups relying on standalone biometric clocks, physical punch registers, or disconnected spreadsheets, organizations suffer from data latency, high error rates, and vulnerability to buddy punching. Staff frequently forget to punch out at the conclusion of their shift, while standard web portals fail to retain active punch timers across user logouts. Furthermore, manual editing of attendance records in database-driven web applications often fails due to type mismatches on uninitialized documents.'),
    pBody('The problem is formally stated as: “To design, architect, and implement a secure, responsive, and resilient enterprise Human Resource Management System that guarantees continuous stopwatch shift timer persistence across user logouts, automatically concludes shifts at defined operational boundaries, supports zero-data-loss atomic attendance updates in MongoDB, and enforces strict role-based operational segregation across administrative, managerial, and employee portals.”'),

    pSection('2.3', 'Purpose / Objective and Goals'),
    pNumbered(1, 'Develop a modern, highly responsive web application using React 19, TypeScript, and TailwindCSS.'),
    pNumbered(2, 'Construct an Employee Master Directory managing personnel profiles, employee codes, departments, designations, and supervisory hierarchies.'),
    pNumbered(3, 'Implement a Continuous Stopwatch Shift Engine that calculates duty elapsed time via persistent epoch timestamp deltas, preserving stopwatch state across user logouts.'),
    pNumbered(4, 'Engineer an Autonomous Shift Conclusion Engine that monitors shift thresholds (18:00 cutoff or 9 hours max) and marks automatic check-out with 8.5 logged hours.'),
    pNumbered(5, 'Provide an Administrative Daily Attendance Register featuring live counters for Present, Absent, Late, Half-day, and On Leave staff.'),
    pNumbered(6, 'Eliminate MongoDB CastErrors during administrative attendance editing by architecting an atomic upsert routine matching on compound keys (employeeId, date).'),
    pNumbered(7, 'Implement a Multi-Type Leave Management System supporting Casual, Sick, and Earned leaves with automatic duration calculation and balance deduction.'),
    pNumbered(8, 'Enforce strict Role-Based Access Control (RBAC) preventing unauthorized access between HR Admin, Department Manager, and Employee viewports.'),
    pNumbered(9, 'Ensure high visual usability with responsive layouts, accessible ARIA controls, and seamless Dark/Light theme switching.'),
    pNumbered(10, 'Deliver a scalable full-stack solution integrating React client components with Node.js/Express REST APIs and MongoDB Atlas cloud document storage.'),

    pSection('2.4', 'Literature Survey'),
    pBody('A rigorous comparative study was conducted examining established workforce tracking methods against the proposed PeopleHub HRMS architecture:'),
    buildStyledTable(
      ['Reference / Study Area', 'Legacy Method / Tool', 'Application in PeopleHub HRMS'],
      [
        ['Physical Biometric Standalone Hardware', 'Local optical fingerprint scanner with offline USB export.', 'Replaced by web-based live punch terminal with real-time cloud synchronization.'],
        ['Spreadsheet Attendance Trackers', 'Manual Excel / Google Sheet cell entry by HR managers.', 'Replaced by structured MongoDB database with Zod validation schemas and atomic upserts.'],
        ['Session Continuity Patterns', 'Transient client memory (`useState`) resetting on logout or refresh.', 'Implemented persistent epoch timestamp delta engine (`activeSessions` in `localStorage`).'],
        ['Shift Lifecycle Automation', 'Manual check-out edits or unclosed ghost attendance records.', 'Engineered autonomous shift conclusion checking elapsed time against shift end thresholds.'],
        ['Role Governance & RBAC', 'Single shared administrative password or unsegregated views.', 'Architected 3-tier isolated navigation and viewports for Admin, Manager, and Employee roles.'],
        ['Leave Quota Management', 'Paper leave slips and manual balance deduction calculations.', 'Built automated leave application workflow with day difference calculation and quota ledgers.'],
      ],
      [2400, 3200, 3600]
    ),

    pSection('2.5', 'Project Scope'),
    pBullet('Employee Master Directory Management (Onboarding, Directory, Profiles, Contact info, Hierarchy).'),
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
  // PAGES 10-12: CHAPTER 3 - SYSTEM ANALYSIS (Matches Ref Page 10-12)
  // ==========================================
  elements.push(
    pChapter(3, 'SYSTEM ANALYSIS'),
    pBody('The system analysis phase examines traditional workforce management practices, identifies operational bottlenecks, maps stakeholder responsibilities, and formalizes engineering specifications.'),

    pSection('3.1', 'Existing System'),
    pBody('In traditional corporate setups, workforce administration operates via disconnected channels. Attendance is registered on physical sign-in sheets or local optical biometric terminals. Leave requests are filed through paper slips or unstructured email threads. Shift assignments are pinned on physical bulletin boards or communicated informally via messaging apps. This fragmented approach prevents executive visibility, delays payroll processing, and creates vulnerabilities to time theft and unrecorded leaves.'),

    pSection('3.2', 'Scope and Limitations of Existing Systems'),
    buildStyledTable(
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

    pSection('3.3', 'Project Perspective and Features'),
    pBody('PeopleHub HRMS functions as a reactive, cloud-native enterprise application. Its architecture establishes a unified single-source-of-truth across all operational modules:'),
    pBullet('Modern Glassmorphic Interface with responsive navigation and Dark/Light theme switching.'),
    pBullet('Live Hero Welcome Banner featuring employee greeting, system date, live time, and active shift badge.'),
    pBullet('Continuous Stopwatch Shift Terminal calculating elapsed time via persistent epoch timestamps across logouts.'),
    pBullet('Autonomous Shift Closure Engine enforcing shift cutoff boundaries (18:00 / 8.5 hrs logged).'),
    pBullet('Daily Attendance Register with filter tabs (All, Present, Absent, Late, Half-day, On Leave) and search bar.'),
    pBullet('Instant Record Editor Modal with automated total hours calculation and atomic MongoDB upserts.'),
    pBullet('Employee Master Directory with active workforce counters, search filtering, and CRUD controls.'),
    pBullet('Leave Application Pipeline with date span validation, manager approval actions, and quota balance tracking.'),
    pBullet('Robust RESTful API Architecture with Zod schema validation and Mongoose ODM integration.'),

    pSection('3.4', 'Stakeholders'),
    buildStyledTable(
      ['Stakeholder', 'Interest / Responsibility'],
      [
        ['Standard Employee', 'Clocks in and out daily, views continuous duty timer, submits leave requests, inspects personal monthly logs.'],
        ['HR Administrator', 'Maintains employee directory, configures shifts, audits daily attendance, corrects punch errors, monitors compliance.'],
        ['Department Manager', 'Monitors team attendance presence, reviews and approves/rejects team leave applications, oversees daily shifts.'],
        ['Project Guide / College', 'Evaluates software engineering architecture, database normalization, and project report against academic standards.'],
      ],
      [2600, 6600]
    ),

    pSection('3.5', 'Requirement Analysis – Functional Requirements'),
    pBullet('The system shall authenticate users using email and password credentials, routing to role-appropriate dashboards.', 'FR-01 (Authentication)'),
    pBullet('The system shall persist check-in timestamps in local storage, allowing the elapsed timer to continue running across user logouts and reloads.', 'FR-02 (Session Continuity)'),
    pBullet('The system shall automatically terminate active shift sessions when current time passes shift end time (18:00) or elapsed hours reach shift ceiling.', 'FR-03 (Auto Checkout)'),
    pBullet('The system shall execute atomic upserts on attendance records matching on (employeeId, date), eliminating MongoDB CastErrors on uninitialized records.', 'FR-04 (Atomic Upsert)'),
    pBullet('The system shall provide full CRUD operations for employee master profiles, including employee code, department, designation, and supervisor.', 'FR-05 (Employee Master)'),
    pBullet('The system shall calculate net calendar days between fromDate and toDate, enforcing quota balance ceilings prior to leave application submission.', 'FR-06 (Leave Processing)'),
    pBullet('The system shall dynamically hide administrative navigation items and manager approval queues when an Employee role is logged in.', 'FR-07 (Role Segregation)'),

    pSubSection('Performance Requirements'),
    pBullet('The user interface shall respond to user interactions (punch toggles, filter clicks, modal triggers) within 50 milliseconds.'),
    pBullet('Database read and write operations shall execute within 500 milliseconds over standard broadband network connections.'),
    pBullet('The frontend bundle shall be optimized using Vite code-splitting and asset minification to achieve sub-2-second initial page load times.'),

    pSubSection('Security Requirements'),
    pBullet('All incoming request payloads must be validated against strict Zod schemas on both client and server before processing.'),
    pBullet('User authentication passwords must be stored using industry-standard hashing algorithms.'),
    pBullet('Sensitive environment variables (such as MongoDB connection URIs and session secrets) must remain strictly on the server in `.env` files.'),
    pBullet('The application shall enforce role-governed endpoint guards, preventing unauthorized users from accessing administrative APIs.'),

    pSubSection('Usability and Accessibility Requirements'),
    pBullet('All interactive buttons, input fields, and icons shall feature accessible ARIA labels and focus indicators.'),
    pBullet('The layout shall adapt seamlessly across desktop monitors (1920x1080), laptops (1366x768), tablets, and mobile displays.'),
    pBullet('Color schemes shall maintain WCAG 2.1 contrast ratios in both Dark and Light visual themes.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGES 13-19: CHAPTER 4 - SYSTEM DESIGN (Matches Ref Page 13-19)
  // ==========================================
  elements.push(
    pChapter(4, 'SYSTEM DESIGN'),
    pBody('System design translates the software requirements into concrete architectural blueprints, data flow diagrams (DFDs), entity-relationship models (ERD), normalized database schemas, and interface wireframes.'),

    pSection('4.1', 'Design Constraints'),
    pBullet('Stateless HTTP Protocols: RESTful services do not hold continuous connection state. Continuous watch timing is achieved through client-side epoch timestamp deltas rather than heavy server polling.'),
    pBullet('Browser Resource Throttling: Background browser tabs throttle execution intervals; the design calculates elapsed duration mathematically upon active frame ticks.'),
    pBullet('Database Concurrency & Idempotency: Multiple updates to the same daily attendance record are handled via atomic `findOneAndUpdate` operations with `upsert: true`.'),
    pBullet('Zero External UI Framework Dependencies: Built using native TailwindCSS utility classes to maximize runtime rendering performance and reduce bundle size.'),

    pSection('4.2', 'System Model: ERD & DFD (Context Level)'),
    pSubSection('0 Level Context Diagram -:'),
    pBody('The Context Diagram models the boundary of PeopleHub HRMS and external entities interacting with the core application:'),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
        left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
        right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC' },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CONTEXT LEVEL DATA FLOW DIAGRAM (DFD LEVEL 0)', bold: true, size: 20, color: COLOR_PRIMARY, font: FONT_FAMILY })] }),
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

    pSubSection('1 Level Diagram (Detailed Process Decomposition) -:'),
    pBullet('Process 1.0 (Authentication & Access Control): Validates credentials, sets user session, and enforces RBAC portal routing.'),
    pBullet('Process 2.0 (Employee Master Management): Executes CRUD operations for workforce profiles and hierarchy allocations.'),
    pBullet('Process 3.0 (Continuous Attendance Engine): Captures punch events, calculates epoch elapsed duration, and checks auto-checkout thresholds.'),
    pBullet('Process 4.0 (Leave Processing Engine): Evaluates leave day durations, checks yearly quota ledger, and executes manager approval updates.'),
    pBullet('Process 5.0 (Audit & Reporting Service): Compiles daily attendance registers and workforce analytics.'),

    pSubSection('ERD – Logical Model:'),
    pBody('The Entity-Relationship Diagram represents the complete normalized database schema governing PeopleHub HRMS. All organizational entities, primary keys (PK), foreign keys (FK), attributes, and cardinalities are formally modeled:'),
    new Paragraph({ spacing: { before: 100 } })
  );

  // Embed High-Res ERD Diagram (image1.png)
  if (imgERD) {
    elements.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgERD] }),
      pFigureCaption('Fig 4.1. Entity Relationship Diagram (ERD) – PeopleHub HRMS')
    );
  }

  elements.push(
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

    pSection('4.3', 'Data Model (Complete 11-Entity Data Dictionary)'),
    pBody('The Data Model defines the schema specifications, constraints, data types, and operational purposes for all 11 system entities:'),

    pSubSection('Table 1: EMPLOYEE Entity'),
    buildStyledTable(
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

    pSubSection('Table 2: USER Entity'),
    buildStyledTable(
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

    pSubSection('Table 3: DEPARTMENT & Table 4: DESIGNATION Entities'),
    buildStyledTable(
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

    pSubSection('Table 5: SHIFT Entity'),
    buildStyledTable(
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

    pSubSection('Table 6: ATTENDANCE Entity (Core Upsert Table)'),
    buildStyledTable(
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

    pSubSection('Tables 7-11: Leave Management & Global Settings Entities'),
    buildStyledTable(
      ['Table Name', 'Field Name', 'Type & Constraints', 'Description'],
      [
        ['LEAVE_TYPE', 'name / code', 'VARCHAR, UNIQUE, NOT NULL', 'Leave category name and short code (CL, SL, PL).'],
        ['LEAVE_TYPE', 'yearly_quota', 'DOUBLE, NOT NULL (Default: 12)', 'Annual allotment of leaves credited to employees.'],
        ['LEAVE_REQUEST', 'from_date / to_date', 'DATE, NOT NULL', 'Commencement and concluding dates of requested leave.'],
        ['LEAVE_REQUEST', 'status', 'ENUM(Pending, Approved, Rejected)', 'Approval workflow state evaluated by managers.'],
        ['LEAVE_BALANCE', 'allocated / used', 'DECIMAL(4,1), NOT NULL', 'Ledger of credited quota vs consumed days for year.'],
        ['HOLIDAY', 'name / date', 'VARCHAR / DATE, UNIQUE, NOT NULL', 'Official title and calendar date of company holiday.'],
        ['WORK_SETTINGS', 'office_start / end', 'TIME, NOT NULL (09:00 / 18:00)', 'Enterprise-wide core duty benchmark boundaries.'],
      ],
      [1800, 2200, 2600, 2600]
    ),

    pSection('4.4', 'User Interface Design'),
    pBody('The user experience is built upon modern glassmorphic enterprise design principles. Below are the primary production viewports:'),
    new Paragraph({ spacing: { before: 100 } })
  );

  // Screen 5: Login Page (image4.png)
  if (imgLogin) {
    elements.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgLogin] }),
      pFigureCaption('Fig 4.2. System Authentication & Login Portal (Role Routing: HR Admin, Manager, Employee)')
    );
  }

  // Screen 6: HR Admin Dashboard (image5.png)
  if (imgAdminDash) {
    elements.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgAdminDash] }),
      pFigureCaption('Fig 4.3. HR Administrator Central Operations Dashboard (Real-Time Workforce Metrics)')
    );
  }

  // Screen 1: Employee Self-Service Dashboard (image2.png)
  if (imgEmpDash) {
    elements.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgEmpDash] }),
      pFigureCaption('Fig 4.4. Employee Self-Service Dashboard (Greeting, Live Clock, Continuous Shift Watch Timer)')
    );
  }

  // Screen 7: Employee Directory (image6.png)
  if (imgDirectory) {
    elements.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgDirectory] }),
      pFigureCaption('Fig 4.5. Employee Master Directory Management (Full CRUD Operations & Role Badges)')
    );
  }

  // Screen 2: Daily Attendance Grid (image3.png)
  if (imgAttGrid) {
    elements.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgAttGrid] }),
      pFigureCaption('Fig 4.6. Daily Attendance Monitoring Grid (Status Counters, Search, Filter & Inline Edit)')
    );
  }

  // Supplementary Placeholders for upcoming images
  elements.push(
    pBody('Below are designated layouts for supplementary system viewports being finalized:'),
    buildPlaceholderBox('Fig 4.7. Attendance Correction Modal Dialog', 'Displays In/Out time editors, Status dropdown, Notes field, and live auto-recalculated work hours.'),
    pFigureCaption('Fig 4.7. Attendance Correction Modal Dialog (Administrative Correction View)'),
    new Paragraph({ spacing: { before: 120 } }),
    buildPlaceholderBox('Fig 4.8. Leave Management & Balance Tracking Screen', 'Displays multi-type leave request form, quota balance progress bars, and approval table.'),
    pFigureCaption('Fig 4.8. Leave Management & Balance Tracking Screen'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGES 20-21: CHAPTER 5 - IMPLEMENTATION DETAILS (Matches Ref Page 20-21)
  // ==========================================
  elements.push(
    pChapter(5, 'IMPLEMENTATION DETAILS'),
    pBody('The implementation phase realizes the architectural designs into a functional, resilient enterprise software application. The development adheres to clean code paradigms, strong TypeScript typing, optimistic client updates, and defensive backend schema validation.'),

    pSection('5.1', 'Software / Hardware Specifications'),
    buildStyledTable(
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

    pSubSection('Project Structure:'),
    pBody('The repository is organized following clean architectural separation of concerns:'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
        left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
        right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC' },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
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
    pSubSection('Core Algorithmic Implementations (Source Logic)'),
    pBullet('Continuous Shift Stopwatch Watch Timer: Captures immutable timestamp `Date.now()` on punch-in, stores session in `localStorage`, and computes continuous elapsed seconds: `Math.floor((Date.now() - session.checkInTimestamp) / 1000)`. Timer never resets across user logouts or device reboots.'),
    pBullet('Autonomous Shift Conclusion Engine: Background monitor checks if `Date.now()` exceeded maximum shift seconds (9 hours) or passed shift end boundary (18:00). When triggered, automatically executes check-out and logs 8.5 work hours with audit note "Shift concluded - Auto logged out".'),
    pBullet('Atomic MongoDB Upsert Pipeline: Administrative edits and punch events utilize `findOneAndUpdate({ employeeId, date }, { $set: payload }, { new: true, upsert: true })`, eliminating CastErrors on uninitialized attendance rows and guaranteeing permanent persistence.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGES 22-24: CHAPTER 6 - SYSTEM OUTPUTS AND VALIDATION (Matches Ref Page 22-24)
  // ==========================================
  elements.push(
    pChapter(6, 'SYSTEM OUTPUTS AND VALIDATION'),
    pBody('This chapter documents the empirical output screens, live cloud database storage verification, input validation rules, and comprehensive black-box and white-box test matrices.'),

    pSection('6.1', 'Output Screen'),
    pSubSection('Database Verification Output - MongoDB Atlas Live Cluster:'),
    pBody('The image below confirms real-time cloud document persistence in MongoDB Atlas (`cluster0.xzpdily.mongodb.net`), displaying employee records with ObjectIds, employee codes, roles, and credentials:'),
    new Paragraph({ spacing: { before: 100 } })
  );

  // Screen 8: MongoDB Atlas Live View (image7.png)
  if (imgMongoDB) {
    elements.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [imgMongoDB] }),
      pFigureCaption('Fig 6.1. Live Backend Cloud Storage – MongoDB Atlas Cluster (Document Record View)')
    );
  }

  elements.push(
    pSubSection('System Operation Outputs:'),
    pBullet('Real-Time Punch Confirmation: Emits an instant visual toast notification (`Clocked in at 09:15 AM! Timer is running continuously`) and synchronizes with the HR Admin panel within 500ms.'),
    pBullet('Automated Shift Conclusion Badge: Renders "Shift Completed" with registered out-time (18:00) and net 8.5 work hours logged.'),
    pBullet('Zero-Data-Loss Administrative Update: Emits confirmation toast (`Attendance record updated and saved to MongoDB!`) and instantly updates all analytics counters.'),

    pSection('6.2', 'Input Validation & Report Format'),
    pSubSection('Input Validation Specifications:'),
    pBody('All user input fields are constrained via Zod schemas to guarantee data sanitization:'),
    buildStyledTable(
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

    pSubSection('Report Format Standards:'),
    pBody('The final academic report maintains consistent heading hierarchies, formal A4 page borders, numbered figures and tables, and strict alignment matching the curriculum index of Savitribai Phule Pune University.'),

    pSubSection('Comprehensive Test Case Execution Matrix:'),
    buildStyledTable(
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
  // PAGES 25-26: CHAPTER 7 - CONCLUSION (Matches Ref Page 25-26)
  // ==========================================
  elements.push(
    pChapter(7, 'CONCLUSION AND RECOMMENDATIONS, LIMITATIONS & FUTURE SCOPE'),
    pSection('7.1', 'Conclusion'),
    pBody('The “PeopleHub HRMS – Enterprise Human Resource Management & Shift Automation System” successfully demonstrates the practical application of modern web technologies (React 19, TypeScript, TailwindCSS, Zustand, Node.js, Express, and MongoDB) to an authentic enterprise human capital management problem. It creates a centralized digital presence for organizational workforce governance, transparently automates daily shift attendances, prevents payroll ghost hours through autonomous checkout, eliminates administrative data loss via atomic database upserts, and provides a streamlined leave request and quota ledger.'),
    pBody('The project is presented as an enterprise-grade web application. Its key engineering achievements include continuous session persistence across logouts, atomic schema-validated database mutations, strict multi-role viewport isolation, and sub-100ms UI responsiveness. The system is fully compliant with the TY BBA-CA Semester V curriculum standards under Savitribai Phule Pune University.'),

    pSection('7.2', 'Recommendations'),
    pBullet('Insert actual high-resolution screenshots of the final operational application before university project submission.'),
    pBullet('Maintain regular automated backups of the MongoDB Atlas cloud database cluster.'),
    pBullet('Deploy the web application over HTTPS to safeguard user authentication tokens and sensitive employee profiles.'),
    pBullet('Conduct cross-browser testing across Google Chrome, Microsoft Edge, Mozilla Firefox, and mobile viewports.'),
    pBullet('Keep organizational shift start and grace periods updated as company working policies evolve.'),

    pSection('7.3', 'Limitations'),
    pBullet('The current release operates through web interfaces; direct hardware-level integration with physical optical fingerprint devices requires vendor-specific USB drivers.'),
    pBullet('Real-time database synchronization requires an active internet connection to communicate with the cloud MongoDB server.'),
    pBullet('Automated salary bank disbursements are currently prepared as calculation ledgers rather than direct payment gateway API transfers.'),

    pSection('7.4', 'Future Scope'),
    pBullet('Develop cross-platform native mobile applications (React Native / Flutter) enforcing campus GPS geofencing radiuses for on-duty mobile check-ins.'),
    pBullet('Integrate automated payroll generation computing tax brackets, provident fund (PF) deductions, and direct bank transfers.'),
    pBullet('Implement AI-driven attendance forecasting to identify employee burnout, predict absenteeism, and optimize department staffing.'),
    pBullet('Incorporate facial recognition biometrics through browser webcams for touchless multi-factor authentication check-ins.'),
    pBullet('Add multi-language internationalization (English, Marathi, Hindi) for diversified regional branch office deployments.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==========================================
  // PAGES 27-28: CHAPTER 8 - BIBLIOGRAPHY & REFERENCES (Matches Ref Page 27-28)
  // ==========================================
  elements.push(
    pChapter(8, 'BIBLIOGRAPHY AND REFERENCES'),
    pSection('8.1', 'APPENDIX A – Project Feature Summary'),
    buildStyledTable(
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
    pSection('8.2', 'APPENDIX B – Evidence-Based Source Code Analysis'),
    buildStyledTable(
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
    pSection('8.3', 'References'),
    pBullet('React Documentation Team, "React 19 Architecture and Server Components," Meta Open Source, 2024. [Online]. https://react.dev'),
    pBullet('P. Hunt, "Zustand: Bear Necessities for State Management in React," GitHub Repository, 2024. [Online]. https://github.com/pmndrs/zustand'),
    pBullet('K. Chodorow, "MongoDB: The Definitive Guide - Powerful and Scalable Data Storage," 3rd ed., O\'Reilly Media, 2020.'),
    pBullet('C. Collet, "Zod: TypeScript-First Schema Declaration and Validation Library," 2024. [Online]. https://zod.dev'),
    pBullet('M. Fowler, "Patterns of Enterprise Application Architecture," Addison-Wesley, Boston, MA, 2002.'),
    pBullet('Savitribai Phule Pune University, "Bachelor of Business Administration & Computer Application (BBA-CA) CBCS Curriculum Guide," 2026.'),
    pBullet('World Wide Web Consortium (W3C), "Web Content Accessibility Guidelines (WCAG) 2.1," W3C Recommendation, 2018.'),

    new Paragraph({ spacing: { before: 360 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '--- END OF PROJECT REPORT ---', bold: true, size: 20, color: COLOR_MUTED, font: FONT_FAMILY })]
    })
  );

  // ==========================================
  // COMPILE FINAL A4 DOCUMENT WITH TIMES NEW ROMAN & JUSTIFIED ALIGNMENT
  // ==========================================
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: 23,
            color: COLOR_TEXT,
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
              pageBorderTop: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              pageBorderLeft: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              pageBorderRight: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
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
                    size: 17,
                    color: COLOR_MUTED,
                    font: FONT_FAMILY,
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
                  new TextRun({ text: 'Page ', size: 19, color: COLOR_MUTED, font: FONT_FAMILY }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 19, color: COLOR_MUTED, font: FONT_FAMILY }),
                  new TextRun({ text: ' of ', size: 19, color: COLOR_MUTED, font: FONT_FAMILY }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 19, color: COLOR_MUTED, font: FONT_FAMILY }),
                ],
              }),
            ],
          }),
        },
        children: elements,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_MAIN, buffer);
  fs.writeFileSync(OUTPUT_SYNC, buffer);
  console.log(`Professional A4 Report successfully compiled at: ${OUTPUT_MAIN}`);
  console.log(`Synchronized to: ${OUTPUT_SYNC}`);
  console.log(`Total generated file size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

generate().catch(console.error);

