import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Download, Printer, Eye, CheckCircle2, 
  Calendar, DollarSign, Building2, Shield, ArrowUpRight, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';

interface PayslipItem {
  id: string;
  month: string;
  year: number;
  period: string;
  disbursedDate: string;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  pfDeduction: number;
  professionalTax: number;
  incomeTaxTDS: number;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Disbursed' | 'Processing';
}

const payslipsData: PayslipItem[] = [
  {
    id: 'SLIP-OCT-2026',
    month: 'October',
    year: 2026,
    period: '01 Oct 2026 - 31 Oct 2026',
    disbursedDate: '2026-10-31',
    basicSalary: 55000,
    hra: 22000,
    specialAllowance: 12000,
    conveyance: 6000,
    pfDeduction: 6600,
    professionalTax: 200,
    incomeTaxTDS: 4000,
    grossEarnings: 95000,
    totalDeductions: 10800,
    netSalary: 84200,
    status: 'Disbursed',
  },
  {
    id: 'SLIP-SEP-2026',
    month: 'September',
    year: 2026,
    period: '01 Sep 2026 - 30 Sep 2026',
    disbursedDate: '2026-09-30',
    basicSalary: 55000,
    hra: 22000,
    specialAllowance: 12000,
    conveyance: 6000,
    pfDeduction: 6600,
    professionalTax: 200,
    incomeTaxTDS: 4000,
    grossEarnings: 95000,
    totalDeductions: 10800,
    netSalary: 84200,
    status: 'Disbursed',
  },
  {
    id: 'SLIP-AUG-2026',
    month: 'August',
    year: 2026,
    period: '01 Aug 2026 - 31 Aug 2026',
    disbursedDate: '2026-08-31',
    basicSalary: 55000,
    hra: 22000,
    specialAllowance: 12000,
    conveyance: 6000,
    pfDeduction: 6600,
    professionalTax: 200,
    incomeTaxTDS: 4000,
    grossEarnings: 95000,
    totalDeductions: 10800,
    netSalary: 84200,
    status: 'Disbursed',
  },
];

export const PayslipsPage = () => {
  const { user } = useAuthStore();
  const [activeSlip, setActiveSlip] = useState<PayslipItem | null>(null);

  const handleDownloadSlip = (slip: PayslipItem) => {
    toast.success(`Downloading PDF statement for ${slip.month} ${slip.year}...`, { icon: '📄' });
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Receipt size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Salary Statements & Monthly Payslips
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View detailed Indian Rupee (₹) earnings, statutory deductions, Provident Fund (PF), and download signed monthly tax slips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleDownloadSlip(payslipsData[0])}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Download Latest (Oct 2026)</span>
          </Button>
        </div>
      </div>

      {/* Latest Salary Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Net Salary</span>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹84,200</h3>
            <p className="text-xs text-slate-400 pt-1">Disbursed into HDFC Bank Account (xx8492)</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Monthly CTC</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">₹95,000</h3>
            <p className="text-xs text-slate-400 pt-1">Annual Package: ₹11,40,000 / annum</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Deductions</span>
            <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400">₹10,800</h3>
            <p className="text-xs text-slate-400 pt-1">PF ₹6,600 + PT ₹200 + TDS ₹4,000</p>
          </CardContent>
        </Card>
      </div>

      {/* Payslip History Table */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Payslip Disbursement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Slip ID & Month</th>
                  <th className="px-4 py-3">Pay Period</th>
                  <th className="px-4 py-3">Gross Earnings</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net Disbursed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payslipsData.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        {slip.month} {slip.year}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{slip.id}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{slip.period}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      ₹{slip.grossEarnings.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
                      -₹{slip.totalDeductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{slip.netSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                        {slip.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActiveSlip(slip)}
                          className="text-indigo-600 dark:text-indigo-400 font-bold text-xs"
                        >
                          <Eye size={13} className="mr-1" /> View Breakup
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadSlip(slip)}
                          className="rounded-xl text-xs"
                        >
                          <Download size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Slip Modal View */}
      <AnimatePresence>
        {activeSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveSlip(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Salary Statement · {activeSlip.month} {activeSlip.year}
                  </h3>
                  <p className="text-xs text-slate-400">{activeSlip.period}</p>
                </div>
                <button onClick={() => setActiveSlip(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Earnings Breakdown</h4>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                    <div className="flex justify-between"><span>Basic Salary:</span><strong className="font-mono">₹{activeSlip.basicSalary.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span>House Rent Allowance (HRA):</span><strong className="font-mono">₹{activeSlip.hra.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span>Special Allowance:</span><strong className="font-mono">₹{activeSlip.specialAllowance.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span>Conveyance Allowance:</span><strong className="font-mono">₹{activeSlip.conveyance.toLocaleString()}</strong></div>
                    <div className="border-t pt-1 font-bold flex justify-between text-slate-900 dark:text-white"><span>Gross Earnings:</span><strong className="font-mono">₹{activeSlip.grossEarnings.toLocaleString()}</strong></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Deductions</h4>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                    <div className="flex justify-between"><span>Employee Provident Fund (EPF):</span><strong className="font-mono text-rose-500">₹{activeSlip.pfDeduction.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span>Professional Tax (PT):</span><strong className="font-mono text-rose-500">₹{activeSlip.professionalTax.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span>Income Tax (TDS):</span><strong className="font-mono text-rose-500">₹{activeSlip.incomeTaxTDS.toLocaleString()}</strong></div>
                    <div className="border-t pt-1 font-bold flex justify-between text-rose-600 dark:text-rose-400"><span>Total Deductions:</span><strong className="font-mono">-₹{activeSlip.totalDeductions.toLocaleString()}</strong></div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-sm">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Net Take-Home Pay:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">₹{activeSlip.netSalary.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => window.print()} className="rounded-xl text-xs flex items-center gap-1.5">
                  <Printer size={13} /> Print
                </Button>
                <Button onClick={() => handleDownloadSlip(activeSlip)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                  <Download size={13} /> Download PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
