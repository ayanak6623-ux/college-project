import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Shield, Search, Download, Printer, CheckCircle2,
  Building2, Users, Lock, Award, HeartHandshake, Eye, BookOpen,
  Calendar, ArrowRight, Sparkles, ExternalLink, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn } from '../../utils/cn';

interface PolicyDocument {
  id: string;
  code: string;
  title: string;
  category: 'Workplace' | 'Conduct' | 'Compliance' | 'Leave & Benefits' | 'Security';
  version: string;
  lastUpdated: string;
  effectiveDate: string;
  summary: string;
  fullContent: {
    objective: string;
    scope: string;
    guidelines: string[];
    compliance: string;
    contact: string;
  };
}

const companyPolicies: PolicyDocument[] = [
  {
    id: 'pol-1',
    code: 'POL-WFH-01',
    title: 'Remote Work & Hybrid Workplace Attendance Policy',
    category: 'Workplace',
    version: 'v3.2',
    lastUpdated: 'October 15, 2026',
    effectiveDate: 'November 01, 2026',
    summary: 'Guidelines for flexible hybrid work schedule, core collaboration hours (10:00 AM - 4:00 PM), and digital check-in protocols.',
    fullContent: {
      objective: 'To provide high flexibility while ensuring operational synchronization and cross-department team deliverables.',
      scope: 'Applies to all full-time, probation, and contract personnel across Engineering, Operations, and Sales at PeopleHub.',
      guidelines: [
        'Team members are required to clock-in digitally via PeopleHub portal within 30 minutes of starting their shift.',
        'Core collaboration window is 10:00 AM to 4:00 PM IST where availability on Slack and Google Meet is expected.',
        'Employees operating on field visits must ensure GPS verified geo-fence tag is enabled on mobile.',
        'Home workspace internet reimbursement of up to ₹1,500/month is claimable through the expense module.'
      ],
      compliance: 'Failure to regularize unannounced absences for 3 consecutive days will prompt an HR Admin review.',
      contact: 'HR Operations Committee · hr@peoplehub.com'
    }
  },
  {
    id: 'pol-2',
    code: 'POL-ETH-02',
    title: 'Code of Conduct & Workplace Professionalism',
    category: 'Conduct',
    version: 'v4.0',
    lastUpdated: 'September 01, 2026',
    effectiveDate: 'September 15, 2026',
    summary: 'Foundational ethics governing employee integrity, zero tolerance for harassment, conflict of interest, and professional respect.',
    fullContent: {
      objective: 'To foster an inclusive, merit-driven, transparent, and psychologically safe workplace culture for all employees.',
      scope: 'All stakeholders, interns, managers, and executives associated with PeopleHub HRMS.',
      guidelines: [
        'Maintain highest level of integrity, respect, and non-discrimination irrespective of gender, religion, or background.',
        'Zero tolerance for workplace bullying, discriminatory remarks, or unauthorized disclosure of internal proprietary source code.',
        'Conflicts of interest (e.g. secondary commercial engagements with competitors) must be formally declared to HR Admin.',
        'Gifts or incentives exceeding ₹2,500 from vendors or clients must be declared to the Ethics & Compliance Board.'
      ],
      compliance: 'Strict disciplinary proceedings up to immediate contract termination for willful breaches.',
      contact: 'Ethics & Compliance Officer · ethics@peoplehub.com'
    }
  },
  {
    id: 'pol-3',
    code: 'POL-LEV-03',
    title: 'Annual Leaves, Casual Days & Maternity/Paternity Regulations',
    category: 'Leave & Benefits',
    version: 'v2.8',
    lastUpdated: 'October 01, 2026',
    effectiveDate: 'October 10, 2026',
    summary: 'Complete leave entitlements including 18 Annual Paid Leaves, 12 Casual/Sick Days, 26 weeks Maternity, and bereavement provisions.',
    fullContent: {
      objective: 'To support employee wellbeing, work-life balance, and provide structured time off during health or personal requirements.',
      scope: 'All permanent full-time employees upon completion of 30 days of active service.',
      guidelines: [
        'Annual Leaves: 18 days credited per financial year with carry-forward allowed up to 10 days into the next cycle.',
        'Casual / Sick Leave: 12 days annually. Absences beyond 2 consecutive sick days require a registered medical practitioner certificate.',
        'Maternity Leave: 26 weeks of fully paid leave as mandated under statutory Indian labor guidelines.',
        'Paternity Leave: 10 working days of fully paid parental leave available within 6 months of childbirth.'
      ],
      compliance: 'All leaves must be requested via the Leave Portal with minimum 48-hour prior notice (except emergency medical leaves).',
      contact: 'HR Leave Administrator · leave-desk@peoplehub.com'
    }
  },
  {
    id: 'pol-4',
    code: 'POL-SEC-04',
    title: 'Information Security, Device Access & Data Protection (GDPR/ISO)',
    category: 'Security',
    version: 'v3.5',
    lastUpdated: 'August 20, 2026',
    effectiveDate: 'September 01, 2026',
    summary: 'Data protection standards governing employee database access, MongoDB encryption, device passwords, and credential hygiene.',
    fullContent: {
      objective: 'To safeguard company intellectual property, customer data, and employee privacy in compliance with ISO 27001 standards.',
      scope: 'All devices, servers, cloud infrastructure, and access credentials issued by PeopleHub HRMS.',
      guidelines: [
        'Multi-factor authentication (2FA) is mandatory across corporate email, GitHub, and production server logins.',
        'Production databases and MongoDB Atlas credentials must strictly use environment variables (.env) and never be committed into public repositories.',
        'Laptops must have disk encryption (BitLocker/FileVault) enabled with screen auto-lock set to 5 minutes or less.',
        'Customer PII (Personally Identifiable Information) must be masked and handled only on encrypted staging servers.'
      ],
      compliance: 'Security infractions will be investigated by the CISO team and logged on the security audit register.',
      contact: 'Information Security Office · security@peoplehub.com'
    }
  },
  {
    id: 'pol-5',
    code: 'POL-PSH-05',
    title: 'Prevention of Sexual Harassment (POSH) & Grievance Redressal',
    category: 'Compliance',
    version: 'v2.1',
    lastUpdated: 'July 10, 2026',
    effectiveDate: 'July 15, 2026',
    summary: 'Zero tolerance policy ensuring a safe workplace for female personnel, with an independent Internal Complaints Committee (ICC).',
    fullContent: {
      objective: 'To guarantee an environment free from sexual harassment, intimidation, or coercion as mandated under the POSH Act.',
      scope: 'All workplaces, office spaces, company retreats, and digital communication platforms.',
      guidelines: [
        'Any unwelcome physical, verbal, or non-verbal conduct of a sexual nature is strictly prohibited.',
        'An independent Internal Complaints Committee (ICC) headed by a presiding female officer is established for confidential inquiries.',
        'Formal complaints can be lodged confidentially via email or physical submission within 90 days of an incident.',
        'Strict non-retaliation protections apply to all reporting individuals and witnesses.'
      ],
      compliance: 'Immediate suspension pending investigation; termination and legal action where allegations are substantiated.',
      contact: 'Internal Complaints Committee · posh-icc@peoplehub.com'
    }
  },
  {
    id: 'pol-6',
    code: 'POL-APR-06',
    title: 'Performance Appraisal, Promotions & ESOP Allocation Guidelines',
    category: 'Leave & Benefits',
    version: 'v2.0',
    lastUpdated: 'September 25, 2026',
    effectiveDate: 'October 01, 2026',
    summary: 'Bi-annual appraisal cycles, KPI evaluation framework, merit-based salary increments, and manager recommendation workflows.',
    fullContent: {
      objective: 'To provide transparent, quantifiable, and merit-based career progression and wealth-creation avenues for high performers.',
      scope: 'All employees with minimum 6 months tenure in their current role.',
      guidelines: [
        'Performance evaluations are conducted bi-annually in April and October based on OKR and KPI scorecards.',
        'Department Managers submit appraisal recommendations directly to HR Admin via the Manager Portal.',
        'Merit salary revisions are benchmarked against 75th percentile market standards in the software & enterprise tech industry.',
        'ESOP allocations vest over a standard 4-year schedule with a 1-year cliff.'
      ],
      compliance: 'Appraisals are subject to final audit and approval by HR Administration and the Compensation Committee.',
      contact: 'Compensation & Rewards Desk · comp@peoplehub.com'
    }
  }
];

export const PoliciesPage = () => {
  const [policies] = useState<PolicyDocument[]>(companyPolicies);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalPolicy, setActiveModalPolicy] = useState<PolicyDocument | null>(null);

  const filtered = policies.filter(pol => {
    const matchCat = selectedCategory === 'all' || pol.category === selectedCategory;
    const matchQuery = pol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       pol.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       pol.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleCopyTemplate = (pol: PolicyDocument) => {
    const text = `
=== ${pol.title} (${pol.code} - ${pol.version}) ===
Effective: ${pol.effectiveDate} | Last Updated: ${pol.lastUpdated}
Company: PeopleHub HRMS Enterprise

1. OBJECTIVE:
${pol.fullContent.objective}

2. SCOPE:
${pol.fullContent.scope}

3. CORE GUIDELINES:
${pol.fullContent.guidelines.map((g, i) => `${i+1}. ${g}`).join('\n')}

4. COMPLIANCE & GOVERNANCE:
${pol.fullContent.compliance}

Contact: ${pol.fullContent.contact}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Policy template copied to clipboard!', { icon: '📋' });
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={12} />
              PeopleHub Enterprise Governance
            </span>
            <span className="text-xs text-indigo-200/80">FY 2026-27 Edition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Company Policies & Standard Operating Procedures
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Standardized policy templates modelled on Fortune 500 standards — covering remote work attendance, workplace conduct, leaves, POSH compliance, and data security.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
            <span className="text-xl font-black text-indigo-400">6</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Policies</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
            <span className="text-xl font-black text-emerald-400">100%</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Compliance</p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies by title, code, or keyword..."
            className="pl-10 h-10 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'Workplace', 'Conduct', 'Compliance', 'Leave & Benefits', 'Security'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              )}
            >
              {cat === 'all' ? 'All Policies' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((pol) => (
          <Card 
            key={pol.id}
            className="rounded-2xl border-slate-200/80 dark:border-slate-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-all flex flex-col justify-between group"
          >
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {pol.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                    {pol.category}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {pol.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {pol.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Version: <strong>{pol.version}</strong></span>
                  <span>Effective: {pol.effectiveDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setActiveModalPolicy(pol)}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 font-bold text-xs py-2 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} />
                    View Full Policy
                  </Button>
                  <button
                    onClick={() => handleCopyTemplate(pol)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    title="Copy Policy Template"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Policy Modal Viewer */}
      <AnimatePresence>
        {activeModalPolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalPolicy(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 z-10 max-h-[85vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-start justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {activeModalPolicy.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {activeModalPolicy.version}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {activeModalPolicy.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Last Reviewed: {activeModalPolicy.lastUpdated} · Effective: {activeModalPolicy.effectiveDate}
                  </p>
                </div>
                <button onClick={() => setActiveModalPolicy(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
              </div>

              {/* Policy Body */}
              <div className="space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400 mb-1">
                    1. Objective & Purpose
                  </h4>
                  <p className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {activeModalPolicy.fullContent.objective}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400 mb-1">
                    2. Scope & Applicability
                  </h4>
                  <p className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {activeModalPolicy.fullContent.scope}
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400 mb-2">
                    3. Mandatory Guidelines & Protocols
                  </h4>
                  <ul className="space-y-2">
                    {activeModalPolicy.fullContent.guidelines.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400 mb-1">
                    4. Governance & Compliance
                  </h4>
                  <p className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {activeModalPolicy.fullContent.compliance}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40 text-xs flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">Questions or Escalations:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{activeModalPolicy.fullContent.contact}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  onClick={() => handleCopyTemplate(activeModalPolicy)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  Copy Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.print();
                  }}
                  className="rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  Print Policy
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
