import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useLeaveStore } from '../../store/leaveStore';
import type { LeaveType } from '../../types/leave';
import toast from 'react-hot-toast';

export const LeaveTypesPage = () => {
  const { leaveTypes, addLeaveType, updateLeaveType, deleteLeaveType } = useLeaveStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultFormState = {
    name: '', code: '', color: '#3b82f6', yearlyQuota: 10,
    isPaid: true, carryForward: false, maxCarryForward: 0,
    requiresApproval: true, applicableGender: 'All' as any,
    description: '', isActive: true
  };
  
  const [formData, setFormData] = useState(defaultFormState);

  const handleEdit = (lt: LeaveType) => {
    setFormData(lt);
    setEditingId(lt.id);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return toast.error('Name and Code are required');
    
    if (editingId) {
      updateLeaveType(editingId, formData);
      toast.success('Leave type updated');
    } else {
      addLeaveType(formData);
      toast.success('Leave type created');
    }
    
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(defaultFormState);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This may break existing leave requests.`)) {
      deleteLeaveType(id);
      toast.success('Leave type deleted');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Types</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure organizational leave policies and allocations.</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData(defaultFormState);
          setIsFormOpen(!isFormOpen);
        }}>
          {isFormOpen ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Leave Type</>}
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="mb-6 border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10">
              <CardHeader>
                <CardTitle>{editingId ? 'Edit Leave Type' : 'Create New Leave Type'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input label="Leave Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Vacation" required />
                    <Input label="Code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. VL" required />
                    <Input label="Yearly Quota (Days)" type="number" value={formData.yearlyQuota} onChange={e => setFormData({...formData, yearlyQuota: Number(e.target.value)})} required />
                    <Input label="Color Theme" type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="h-11 cursor-pointer p-1" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select label="Applicable Gender" options={['All','Male','Female'].map(g=>({label:g,value:g}))} value={formData.applicableGender} onChange={e => setFormData({...formData, applicableGender: e.target.value as any})} />
                    <div className="lg:col-span-3">
                      <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-border">
                    <Switch label="Is Paid Leave?" checked={formData.isPaid} onCheckedChange={v => setFormData({...formData, isPaid: v})} />
                    <Switch label="Requires Approval?" checked={formData.requiresApproval} onCheckedChange={v => setFormData({...formData, requiresApproval: v})} />
                    <Switch label="Is Active?" checked={formData.isActive} onCheckedChange={v => setFormData({...formData, isActive: v})} />
                    <div className="space-y-3">
                      <Switch label="Carry Forward?" checked={formData.carryForward} onCheckedChange={v => setFormData({...formData, carryForward: v})} />
                      {formData.carryForward && (
                        <Input label="Max Days to Carry" type="number" value={formData.maxCarryForward} onChange={e => setFormData({...formData, maxCarryForward: Number(e.target.value)})} />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingId ? 'Update' : 'Save'} Leave Type</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {leaveTypes.map(lt => (
          <motion.div key={lt.id} whileHover={{ y: -4 }}>
            <Card className="h-full overflow-hidden flex flex-col relative" style={{ borderTopWidth: 4, borderTopColor: lt.color }}>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleEdit(lt)} className="p-1.5 text-slate-400 hover:text-primary-600 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(lt.id, lt.name)} className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="mb-4 pr-16">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{lt.name}</h3>
                    <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">{lt.code}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{lt.description || 'No description provided.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-center">
                    <span className="text-xs text-slate-500 mb-1">Yearly Quota</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{lt.yearlyQuota} <span className="text-sm font-medium text-slate-500">Days</span></span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-center items-start">
                    <span className="text-xs text-slate-500 mb-1">Payment Type</span>
                    <Badge variant={lt.isPaid ? 'success' : 'outline'} className="px-2 py-0.5">{lt.isPaid ? 'Paid' : 'Unpaid'}</Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-border mt-auto">
                  {lt.carryForward && <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 border-indigo-200">Carry Forward: {lt.maxCarryForward}</Badge>}
                  {lt.requiresApproval && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 border-amber-200">Requires Approval</Badge>}
                  {lt.applicableGender !== 'All' && <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 dark:bg-pink-900/30 border-pink-200">For {lt.applicableGender}s</Badge>}
                  {!lt.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
