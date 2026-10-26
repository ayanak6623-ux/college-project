import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Printer, Copy, CheckCircle2, Building2, 
  ShieldCheck, Download, Award, Clock, Calendar, 
  Mail, Phone, Globe, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import { Card, CardContent } from '../../components/Card';
import { useAuthStore } from '../../store';

export const PoliciesPage = () => {
  const { user } = useAuthStore();
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [acknowledgedDate, setAcknowledgedDate] = useState<string | null>(null);

  const policyLetter = {
    companyName: 'PEOPLEHUB TECHNOLOGIES PRIVATE LIMITED',
    tagline: 'Enterprise Workforce & Human Resource Management Systems',
    regOffice: 'Plot 14, IT Cyber Park, Phase-II, MP Nagar, Bhopal, MP - 462011, India',
    cin: 'CIN: U72200MP2026PTC049182 | GSTIN: 23AAACP9182K1ZU',
    contactEmail: 'hr@peoplehub.com',
    supportDesk: 'compliance@peoplehub.com',
    phone: '+91 (0755) 489-2200 / +91 98765 43210',
    website: 'www.peoplehub-hrms.com',
    refNo: 'PH/HR/CIR-2026/01',
    dateOfIssue: 'October 26, 2026',
    effectiveDate: 'November 01, 2026 (Applicable FY 2026-27)',
    targetAudience: 'All Full-Time Employees, Department Managers, Operations Leads & Trainees',
    subject: 'OFFICIAL CIRCULAR: UNIFIED EMPLOYEE HANDBOOK, ATTENDANCE REGULATIONS, LEAVE POLICY & CODE OF CONDUCT',
    clauses: [
      {
        num: '1',
        title: 'Working Hours, Shift Schedules & Attendance Protocols',
        body: 'The standard working hours for all employees are from 09:30 AM to 06:30 PM (Monday through Friday), comprising an 8-hour productive work shift and a 1-hour lunch break. Daily attendance must be registered digitally via the PeopleHub portal upon arrival. A grace period of 15 minutes is permissible up to three instances per month. Field operations staff must verify GPS geo-fence logs on mobile check-in.'
      },
      {
        num: '2',
        title: 'Leave Entitlements & Absence Regularization',
        body: 'Every employee is entitled to 18 Annual Paid Leaves (PL) and 12 Casual / Medical Leaves (CL/SL) per financial year. All planned leaves require a minimum of 48 hours prior submission via the Leave Management portal. Unscheduled medical absences exceeding two consecutive working days must be accompanied by a certificate from a certified medical practitioner upon resumption.'
      },
      {
        num: '3',
        title: 'Salary Disbursement & Digital Payslips History',
        body: 'Salaries are disbursed on the final working day of each calendar month directly via electronic bank transfer (NEFT/RTGS). Comprehensive monthly payslips detailing basic salary, allowances, statutory deductions, and tax withholdings are generated automatically and archived securely in the digital Payslips module for personal reference and tax filing.'
      },
      {
        num: '4',
        title: 'Workplace Conduct, Professionalism & POSH Compliance',
        body: 'PeopleHub maintains strict zero-tolerance policies towards harassment, discrimination, or abusive conduct of any nature. We strictly enforce the Prevention of Sexual Harassment (POSH) framework with an independent Internal Complaints Committee (ICC). All staff members are required to uphold mutual respect, professional demeanor, and workplace harmony.'
      },
      {
        num: '5',
        title: 'Information Security, Confidentiality & Company Assets',
        body: 'All internal repositories, customer records, database configurations, and proprietary source code remain the exclusive intellectual property of PeopleHub. Personnel must ensure multi-factor authentication hygiene, adhere to non-disclosure obligations, and protect company-issued hardware from unauthorized access.'
      },
      {
        num: '6',
        title: 'Employee Welfare, Health & Grievance Redressal',
        body: 'The company provides group health insurance coverage and an open-door grievance escalation mechanism. Any operational issues, peer concerns, or compensation queries may be escalated sequentially to the Reporting Manager and the HR Administration Directorate for resolution within three business days.'
      }
    ],
    signatories: [
      {
        name: 'Sarah Jenkins',
        title: 'Director — Human Resources',
        department: 'HR Administration Directorate'
      },
      {
        name: 'Ayaan Khan',
        title: 'Chief Operations Officer',
        department: 'Executive Operations Board'
      }
    ]
  };

  const handleCopyLetter = () => {
    const letterText = `
${policyLetter.companyName}
${policyLetter.regOffice}
CIN: ${policyLetter.cin}
Email: ${policyLetter.contactEmail} | Web: ${policyLetter.website}

Ref: ${policyLetter.refNo}                                         Date: ${policyLetter.dateOfIssue}

TO: ${policyLetter.targetAudience}
SUBJECT: ${policyLetter.subject}

Dear Team Members,

Please find herein the unified corporate regulations, employee code of conduct, and standard operating procedures adopted by PeopleHub Technologies Pvt. Ltd. for the ongoing operational year.

${policyLetter.clauses.map(c => `CLAUSE ${c.num}: ${c.title.toUpperCase()}\n${c.body}`).join('\n\n')}

By Order of the Board of Directors,
${policyLetter.signatories.map(s => `${s.name}\n${s.title} — ${s.department}`).join('\n\n')}
    `.trim();

    navigator.clipboard.writeText(letterText);
    toast.success('Official policy letter copied to clipboard!', { icon: '📋' });
  };

  const handleAcknowledge = () => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setIsAcknowledged(true);
    setAcknowledgedDate(today);
    toast.success('You have formally acknowledged the company policy circular.', { icon: '✍️' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Official Corporate Circular
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white">
            PeopleHub Enterprise Policy Document
          </h2>
          <p className="text-xs text-slate-400">
            Reference: {policyLetter.refNo} · Validated for FY 2026-27
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={handleCopyLetter}
            variant="outline"
            size="sm"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Copy size={14} />
            <span>Copy Text</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Print Letter</span>
          </Button>

          {!isAcknowledged ? (
            <Button
              onClick={handleAcknowledge}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 size={14} />
              <span>Acknowledge Policy</span>
            </Button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <Check size={14} />
              <span>Acknowledged on {acknowledgedDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Official Company Policy Letter (A4 Letterhead Format) */}
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 p-8 sm:p-12 md:p-16 relative overflow-hidden font-sans">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
          <span className="text-8xl md:text-9xl font-black uppercase tracking-widest text-slate-900 -rotate-12">
            PEOPLEHUB
          </span>
        </div>

        {/* 1. Letterhead Header */}
        <div className="border-b-2 border-indigo-950 pb-6 mb-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-950 text-white flex items-center justify-center font-black text-2xl shadow-md">
                P
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-indigo-950 leading-none">
                  {policyLetter.companyName}
                </h1>
                <p className="text-[11px] font-semibold text-indigo-800 tracking-wide mt-1">
                  {policyLetter.tagline}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-[10px] text-slate-600 space-y-0.5 leading-relaxed font-mono">
              <p>{policyLetter.regOffice}</p>
              <p className="text-slate-500 font-bold">{policyLetter.cin}</p>
              <p className="text-indigo-900">Email: {policyLetter.contactEmail} | Web: {policyLetter.website}</p>
            </div>
          </div>
        </div>

        {/* 2. Reference & Date Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono mb-8 relative z-10">
          <div>
            <span className="text-slate-500">Ref. Circular No:</span>{' '}
            <strong className="text-indigo-900 font-bold">{policyLetter.refNo}</strong>
          </div>
          <div className="sm:text-right">
            <span className="text-slate-500">Date of Issuance:</span>{' '}
            <strong className="text-slate-900 font-bold">{policyLetter.dateOfIssue}</strong>
          </div>
          <div>
            <span className="text-slate-500">Recipient Group:</span>{' '}
            <strong className="text-slate-900 font-bold">{policyLetter.targetAudience}</strong>
          </div>
          <div className="sm:text-right">
            <span className="text-slate-500">Effective Date:</span>{' '}
            <strong className="text-emerald-700 font-bold">{policyLetter.effectiveDate}</strong>
          </div>
        </div>

        {/* 3. Subject Line */}
        <div className="mb-6 relative z-10 border-l-4 border-indigo-700 pl-4 py-1">
          <p className="text-xs uppercase font-extrabold text-indigo-900 tracking-wider">
            SUBJECT:
          </p>
          <h2 className="text-sm sm:text-base font-black text-slate-950 leading-snug">
            {policyLetter.subject}
          </h2>
        </div>

        {/* 4. Letter Body Opening */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed relative z-10 mb-8">
          <p className="font-semibold text-slate-900">Dear Team Members,</p>
          <p className="text-justify text-slate-700">
            This executive circular establishes the unified operational code, employee rights, leave guidelines, attendance discipline, and data security mandates governing all staff members across the organization. This document supersedes all prior informal communications and is enforceable across all departments with immediate effect.
          </p>
        </div>

        {/* 5. Policy Clauses Section */}
        <div className="space-y-5 mb-10 relative z-10">
          {policyLetter.clauses.map((clause) => (
            <div 
              key={clause.num} 
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-colors shadow-xs"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {clause.num}
                </span>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
                    {clause.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed text-justify">
                    {clause.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 6. Formal Closing & Signatures */}
        <div className="pt-8 border-t-2 border-slate-200 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600">By Order of the Board of Directors,</p>
              <p className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                PeopleHub Technologies Private Limited
              </p>
              <div className="pt-4 flex items-center gap-3">
                {/* Official Digital Seal Stamp */}
                <div className="px-3 py-2 rounded-xl border-2 border-dashed border-indigo-700 bg-indigo-50/70 text-indigo-900 text-center font-mono text-[9px] uppercase tracking-wider font-extrabold rotate-[-3deg] shadow-xs">
                  <ShieldCheck size={14} className="mx-auto mb-0.5 text-indigo-700" />
                  <span>★ PEOPLEHUB HRMS ★</span>
                  <span className="block text-[8px] text-emerald-700">VERIFIED OFFICIAL SEAL</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-left">
              {policyLetter.signatories.map((sig, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="h-10 border-b border-slate-300 flex items-end pb-1 font-serif italic text-slate-500 text-xs">
                    [Digitally Signed]
                  </div>
                  <h5 className="font-extrabold text-xs text-slate-950">{sig.name}</h5>
                  <p className="text-[10px] text-indigo-800 font-semibold">{sig.title}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{sig.department}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7. Employee Acknowledgement Footer Stamp */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <span>Employee Document ID: {(user as any)?.id || (user as any)?.empId || 'EMP-2026-HQ'}</span>
          <span>Logged in as: {user?.name || 'Staff Member'} ({user?.role || 'Employee'})</span>
          <span className="text-emerald-700 font-bold">Status: {isAcknowledged ? 'Formally Acknowledged ✓' : 'Pending Signature'}</span>
        </div>
      </div>
    </div>
  );
};
