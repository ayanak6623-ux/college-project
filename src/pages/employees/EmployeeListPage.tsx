import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, LayoutGrid, List as ListIcon, 
  MoreVertical, Eye, Edit, Trash2, UserCheck, UserX 
} from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { cn } from '../../utils/cn';

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const { employees, deleteEmployee, updateEmployee } = useEmployeeStore();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(searchLower) ||
      emp.lastName.toLowerCase().includes(searchLower) ||
      emp.empId.toLowerCase().includes(searchLower) ||
      emp.department.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteEmployee(deleteId);
      setDeleteId(null);
    }
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    updateEmployee(id, { status: newStatus });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your team members and their information</p>
        </div>
        <Button onClick={() => navigate('/employees/add')}>
          <Plus size={18} className="mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Search employees..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="px-3">
                <Filter size={18} className="mr-2" />
                Filters
              </Button>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                >
                  <ListIcon size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <EmptyState 
              title="No employees found" 
              description="We couldn't find any employees matching your search criteria."
              actionLabel="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm text-left whitespace-nowrap hidden md:table">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-sm">
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-500">{emp.empId} • {emp.employmentType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                      <td className="px-4 py-3">
                        <Badge variant={emp.status === 'Active' ? 'success' : emp.status === 'On Leave' ? 'warning' : 'destructive'}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/employees/${emp.id}`)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => navigate(`/employees/${emp.id}/edit`)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => setDeleteId(emp.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Mobile Card View for List Mode */}
              <div className="md:hidden flex flex-col gap-3 p-3">
                {filteredEmployees.map((emp) => (
                  <div key={emp.id} className="p-4 border border-border rounded-xl bg-white dark:bg-slate-900 flex flex-col gap-3 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-lg">
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{emp.firstName} {emp.lastName}</p>
                        <p className="text-sm text-slate-500">{emp.designation}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-border pt-3 mt-1">
                      <span className="text-slate-500">{emp.department}</span>
                      <Badge variant={emp.status === 'Active' ? 'success' : emp.status === 'On Leave' ? 'warning' : 'destructive'}>
                        {emp.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                       <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/employees/${emp.id}`)}>View</Button>
                       <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/employees/${emp.id}/edit`)}>Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredEmployees.map((emp, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={emp.id} 
                  className="p-5 border border-border rounded-2xl bg-white dark:bg-slate-900 hover:shadow-md transition-shadow relative flex flex-col items-center text-center group"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                    <button onClick={() => navigate(`/employees/${emp.id}/edit`)} className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-border rounded-lg text-slate-400 hover:text-amber-600 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setDeleteId(emp.id)} className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-border rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 text-primary-600 flex items-center justify-center font-bold text-2xl mb-4 border-2 border-white dark:border-slate-800 shadow-sm">
                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{emp.firstName} {emp.lastName}</h3>
                  <p className="text-sm text-slate-500 mb-1">{emp.designation}</p>
                  <p className="text-xs text-slate-400 mb-4">{emp.department}</p>
                  
                  <Badge className="mb-4" variant={emp.status === 'Active' ? 'success' : emp.status === 'On Leave' ? 'warning' : 'destructive'}>
                    {emp.status}
                  </Badge>

                  <div className="w-full grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/employees/${emp.id}`)} className="text-slate-500">
                      Profile
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(emp.id, emp.status)} className={emp.status === 'Active' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}>
                      {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone and will remove all their data from the system."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
