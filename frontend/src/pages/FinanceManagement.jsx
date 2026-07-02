import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Landmark, TrendingUp, TrendingDown, DollarSign, PieChart,
  Plus, Trash2, Edit2, X, CheckCircle2, AlertCircle,
  FileText, Download, Search, ChevronDown, Users, Building2,
  Receipt, Wallet, BarChart3, Calendar
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const FEE_TYPES    = ['TUITION','HOSTEL','EXAM','LIBRARY','OTHER'];
const FEE_STATUSES = ['PAID','UNPAID','PARTIAL'];
const EXP_CATS     = ['EQUIPMENT','EVENTS','UTILITIES','SALARIES','MAINTENANCE','OTHER'];
const SAL_STATUSES = ['PENDING','PAID'];

const currentYear  = new Date().getFullYear();
const academicYear = new Date().getMonth() >= 6
  ? `${currentYear}-${String(currentYear + 1).slice(2)}`
  : `${currentYear - 1}-${String(currentYear).slice(2)}`;

const statusPill = (s) => {
  const map = {
    PAID:    'bg-emerald-100 text-emerald-700',
    UNPAID:  'bg-rose-100 text-rose-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
    PENDING: 'bg-amber-100 text-amber-700',
  };
  return `text-xs font-bold px-2.5 py-0.5 rounded-full ${map[s] ?? 'bg-slate-100 text-slate-600'}`;
};

// ─── Reusable modal wrapper ──────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
        <h3 className="font-bold text-slate-800 text-base">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  </div>
);

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl border ${color}`}><Icon size={20} /></div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Label + Input helper ─────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
    {children}
  </div>
);
const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white";

// ─────────────────────────────────────────────────────────────────────────────
//  TAB: Overview
// ─────────────────────────────────────────────────────────────────────────────
const OverviewTab = ({ summary }) => {
  if (!summary) return <div className="text-center py-16 text-slate-400">Loading summary…</div>;
  const util = summary.budgetUtilizationPercent ?? 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp}  label="Total Fees Collected" value={fmt(summary.totalFeesCollected)} color="bg-emerald-50 border-emerald-100 text-emerald-600" />
        <StatCard icon={TrendingDown} label="Fees Pending"         value={fmt(summary.totalFeesPending)}  color="bg-rose-50 border-rose-100 text-rose-600" />
        <StatCard icon={Users}        label="Salary Paid (This Month)" value={fmt(summary.salaryPaidThisMonth)} color="bg-blue-50 border-blue-100 text-blue-600" />
        <StatCard icon={Wallet}       label="Expenses (This Month)"    value={fmt(summary.expensesThisMonth)}  color="bg-amber-50 border-amber-100 text-amber-600" />
      </div>

      {/* Budget utilization */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800">Annual Budget Utilization</h3>
            <p className="text-xs text-slate-500 mt-0.5">Academic year {academicYear}</p>
          </div>
          <span className="text-2xl font-bold text-primary-600">{util.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-700 ${util > 90 ? 'bg-rose-500' : util > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(util, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
          <span>Spent: {fmt(summary.totalBudgetSpent)}</span>
          <span>Allocated: {fmt(summary.totalBudgetAllocated)}</span>
        </div>
      </div>

      {/* Fee breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 font-bold uppercase mb-3">Fee Records</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-600">Paid</span><span className="font-bold text-emerald-600">{summary.paidFeeCount}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-600">Unpaid / Partial</span><span className="font-bold text-rose-600">{summary.unpaidFeeCount}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
          <div className="p-3 bg-primary-50 rounded-xl border border-primary-100 text-primary-600"><BarChart3 size={22}/></div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Collection Rate</p>
            <p className="text-xl font-bold text-slate-800">
              {summary.paidFeeCount + summary.unpaidFeeCount > 0
                ? ((summary.paidFeeCount / (summary.paidFeeCount + summary.unpaidFeeCount)) * 100).toFixed(1) + '%'
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TAB: Fee Management
// ─────────────────────────────────────────────────────────────────────────────
const FeesTab = ({ showAlert }) => {
  const [fees, setFees]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('');
  const [modal, setModal]           = useState(null); // 'add' | 'edit'
  const [current, setCurrent]       = useState(null);
  const [students, setStudents]     = useState([]);
  const [form, setForm] = useState({
    studentId: '', feeType: 'TUITION', academicYear, semester: 1,
    amount: '', status: 'UNPAID', remarks: ''
  });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/api/finance/fees'); setFees(r.data); }
    catch { showAlert('error','Failed to load fee records.'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    api.get('/api/students/list').then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const openAdd  = () => { setForm({ studentId: '', feeType: 'TUITION', academicYear, semester: 1, amount: '', status: 'UNPAID', remarks: '' }); setModal('add'); };
  const openEdit = (f) => { setCurrent(f); setForm({ studentId: f.studentId, feeType: f.feeType, academicYear: f.academicYear, semester: f.semester, amount: f.amount, status: f.status, remarks: f.remarks || '' }); setModal('edit'); };
  const inp      = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') await api.post('/api/finance/fees', form);
      else await api.put(`/api/finance/fees/${current.id}`, form);
      setModal(null); showAlert('success', modal === 'add' ? 'Fee record created.' : 'Fee record updated.'); fetch();
    } catch (err) { showAlert('error', err.response?.data?.message || 'Failed to save fee record.'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this fee record?')) return;
    try { await api.delete(`/api/finance/fees/${id}`); showAlert('success','Deleted.'); fetch(); }
    catch { showAlert('error','Failed to delete.'); }
  };

  const downloadReceipt = (id) => {
    window.open(`${api.defaults.baseURL}/api/finance/fees/${id}/receipt`, '_blank');
  };

  const visible = fees.filter(f =>
    (!filterStatus || f.status === filterStatus) &&
    (!search || f.studentName?.toLowerCase().includes(search.toLowerCase()) ||
                f.studentRollNumber?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student…" className={`${inputCls} pl-9`}/>
          </div>
          <select value={filterStatus} onChange={e=>setFilter(e.target.value)} className={inputCls + ' max-w-[140px]'}>
            <option value="">All Status</option>
            {FEE_STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="shrink-0 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md transition-colors">
          <Plus size={16}/> Add Fee Record
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Fee Type</th>
                <th className="px-5 py-3">Year / Sem</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10"><div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"/></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No fee records found.</td></tr>
              ) : visible.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900">{f.studentName}</p>
                    <p className="text-xs text-slate-400">{f.studentRollNumber}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{f.feeType}</td>
                  <td className="px-5 py-3 text-slate-500">{f.academicYear} / Sem {f.semester}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{fmt(f.amount)}</td>
                  <td className="px-5 py-3"><span className={statusPill(f.status)}>{f.status}</span></td>
                  <td className="px-5 py-3 text-right space-x-1">
                    {f.status === 'PAID' && (
                      <button onClick={()=>downloadReceipt(f.id)} className="p-1.5 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Download Receipt"><Download size={15}/></button>
                    )}
                    <button onClick={()=>openEdit(f)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-colors"><Edit2 size={15}/></button>
                    <button onClick={()=>remove(f.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Fee Record' : 'Edit Fee Record'} onClose={()=>setModal(null)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Student">
              <select name="studentId" value={form.studentId} onChange={inp} className={inputCls} required>
                <option value="">— Select Student —</option>
                {students.map(s=><option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fee Type">
                <select name="feeType" value={form.feeType} onChange={inp} className={inputCls}>
                  {FEE_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select name="status" value={form.status} onChange={inp} className={inputCls}>
                  {FEE_STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Academic Year">
                <input name="academicYear" value={form.academicYear} onChange={inp} className={inputCls} placeholder="e.g. 2024-25" required/>
              </Field>
              <Field label="Semester">
                <input name="semester" type="number" min={1} max={10} value={form.semester} onChange={inp} className={inputCls} required/>
              </Field>
            </div>
            <Field label="Amount (₹)">
              <input name="amount" type="number" step="0.01" min="0" value={form.amount} onChange={inp} className={inputCls} required/>
            </Field>
            <Field label="Remarks (optional)">
              <textarea name="remarks" value={form.remarks} onChange={inp} className={inputCls} rows={2}/>
            </Field>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={()=>setModal(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TAB: Salary & Payroll
// ─────────────────────────────────────────────────────────────────────────────
const SalaryTab = ({ showAlert }) => {
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterMonth, setFMonth]    = useState(new Date().getMonth() + 1);
  const [filterYear, setFYear]      = useState(currentYear);
  const [modal, setModal]           = useState(false);
  const [current, setCurrent]       = useState(null);
  const [users, setUsers]           = useState([]);
  const [form, setForm] = useState({ userId: '', month: new Date().getMonth()+1, year: currentYear, netAmount: '', status: 'PENDING', remarks: '' });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/api/finance/salaries'); setRecords(r.data); }
    catch { showAlert('error','Failed to load salary records.'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    api.get('/api/users', { params: { page: 0, size: 200 } }).then(r => setUsers(r.data.content || [])).catch(()=>{});
  }, []);

  const inp = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd  = () => { setForm({ userId:'', month: filterMonth, year: filterYear, netAmount:'', status:'PENDING', remarks:'' }); setCurrent(null); setModal(true); };
  const openEdit = (r) => { setCurrent(r); setForm({ userId: r.userId, month: r.month, year: r.year, netAmount: r.netAmount, status: r.status, remarks: r.remarks||'' }); setModal(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (current) await api.put(`/api/finance/salaries/${current.id}`, form);
      else await api.post('/api/finance/salaries', form);
      setModal(false); showAlert('success', 'Salary record saved.'); fetch();
    } catch (err) { showAlert('error', err.response?.data?.message || 'Failed.'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete salary record?')) return;
    try { await api.delete(`/api/finance/salaries/${id}`); showAlert('success','Deleted.'); fetch(); }
    catch { showAlert('error','Failed to delete.'); }
  };

  const visible = records.filter(r => r.month === Number(filterMonth) && r.year === Number(filterYear));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <select value={filterMonth} onChange={e=>setFMonth(Number(e.target.value))} className={inputCls + ' max-w-[160px]'}>
            {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <input type="number" value={filterYear} onChange={e=>setFYear(Number(e.target.value))} className={inputCls + ' max-w-[100px]'} min={2020} max={2099}/>
        </div>
        <button onClick={openAdd} className="shrink-0 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md transition-colors">
          <Plus size={16}/> Add Salary Record
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase flex justify-between">
          <span>{MONTHS[filterMonth-1]} {filterYear}</span>
          <span className="text-primary-600">{visible.length} records · Total Paid: {fmt(visible.filter(r=>r.status==='PAID').reduce((a,r)=>a+Number(r.netAmount),0))}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Net Salary</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Paid On</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10"><div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"/></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No salary records for this period.</td></tr>
              ) : visible.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-900">{r.employeeName || r.username}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{r.roleName?.replace('ROLE_','')}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{fmt(r.netAmount)}</td>
                  <td className="px-5 py-3"><span className={statusPill(r.status)}>{r.status}</span></td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{r.paidAt ? new Date(r.paidAt).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <button onClick={()=>openEdit(r)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600"><Edit2 size={15}/></button>
                    <button onClick={()=>remove(r.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={current ? 'Edit Salary Record' : 'Add Salary Record'} onClose={()=>setModal(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Employee (User)">
              <select name="userId" value={form.userId} onChange={inp} className={inputCls} required>
                <option value="">— Select User —</option>
                {users.map(u=><option key={u.id} value={u.id}>{u.name || u.username} ({u.roleName?.replace('ROLE_','')})</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Month">
                <select name="month" value={form.month} onChange={inp} className={inputCls}>
                  {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
              </Field>
              <Field label="Year">
                <input name="year" type="number" value={form.year} onChange={inp} className={inputCls} min={2020} max={2099} required/>
              </Field>
            </div>
            <Field label="Net Salary (₹)">
              <input name="netAmount" type="number" step="0.01" min="0" value={form.netAmount} onChange={inp} className={inputCls} required/>
            </Field>
            <Field label="Status">
              <select name="status" value={form.status} onChange={inp} className={inputCls}>
                {SAL_STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Remarks (optional)">
              <textarea name="remarks" value={form.remarks} onChange={inp} className={inputCls} rows={2}/>
            </Field>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={()=>setModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TAB: Budget
// ─────────────────────────────────────────────────────────────────────────────
const BudgetTab = ({ showAlert }) => {
  const [budgets, setBudgets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [year, setYear]         = useState(academicYear);
  const [modal, setModal]       = useState(false);
  const [departments, setDepts] = useState([]);
  const [form, setForm] = useState({ departmentId: '', academicYear, allocatedAmount: '', remarks: '' });

  const fetch = useCallback(async (y) => {
    try { setLoading(true); const r = await api.get('/api/finance/budgets', { params: { academicYear: y } }); setBudgets(r.data); }
    catch { showAlert('error','Failed to load budgets.'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(year); }, [year, fetch]);
  useEffect(() => {
    api.get('/api/departments').then(r => setDepts(r.data)).catch(()=>{});
  }, []);

  const inp = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/finance/budgets', form);
      setModal(false); showAlert('success','Budget saved.'); fetch(year);
    } catch (err) { showAlert('error', err.response?.data?.message || 'Failed.'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Academic Year</label>
          <input value={year} onChange={e=>setYear(e.target.value)} className={inputCls + ' max-w-[120px]'} placeholder="2024-25"/>
        </div>
        <button onClick={()=>{ setForm({ departmentId:'', academicYear: year, allocatedAmount:'', remarks:'' }); setModal(true); }}
          className="shrink-0 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md transition-colors">
          <Plus size={16}/> Set Budget
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl"/>)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center py-14 text-slate-400">
          <Building2 size={32} className="mb-3"/>
          <p className="font-semibold">No budgets set for {year}.</p>
          <p className="text-sm mt-1">Click "Set Budget" to allocate funds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map(b => {
            const pct = b.allocatedAmount > 0 ? Math.min((b.spentAmount / b.allocatedAmount) * 100, 100) : 0;
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{b.departmentName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{b.academicYear}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct > 90 ? 'bg-rose-100 text-rose-700' : pct > 70 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className={`h-2.5 rounded-full transition-all duration-700 ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}/>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Spent: <strong className="text-slate-700">{fmt(b.spentAmount)}</strong></span>
                  <span>Allocated: <strong className="text-slate-700">{fmt(b.allocatedAmount)}</strong></span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Remaining: <strong className={b.remainingAmount < 0 ? 'text-rose-600' : 'text-emerald-600'}>{fmt(b.remainingAmount)}</strong></p>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title="Set Department Budget" onClose={()=>setModal(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Department">
              <select name="departmentId" value={form.departmentId} onChange={inp} className={inputCls} required>
                <option value="">— Select Department —</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Academic Year">
              <input name="academicYear" value={form.academicYear} onChange={inp} className={inputCls} placeholder="2024-25" required/>
            </Field>
            <Field label="Allocated Amount (₹)">
              <input name="allocatedAmount" type="number" step="0.01" min="0" value={form.allocatedAmount} onChange={inp} className={inputCls} required/>
            </Field>
            <Field label="Remarks (optional)">
              <textarea name="remarks" value={form.remarks} onChange={inp} className={inputCls} rows={2}/>
            </Field>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={()=>setModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md">Save Budget</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TAB: Expenses
// ─────────────────────────────────────────────────────────────────────────────
const ExpensesTab = ({ showAlert }) => {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal]         = useState(false);
  const [departments, setDepts]   = useState([]);
  const [form, setForm] = useState({ departmentId: '', category: 'OTHER', amount: '', description: '', expenseDate: new Date().toISOString().split('T')[0] });

  const fetch = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/api/finance/expenses'); setExpenses(r.data); }
    catch { showAlert('error','Failed to load expenses.'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    api.get('/api/departments').then(r => setDepts(r.data)).catch(()=>{});
  }, []);

  const inp = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/finance/expenses', form);
      setModal(false); showAlert('success','Expense logged.'); fetch();
    } catch (err) { showAlert('error', err.response?.data?.message || 'Failed.'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await api.delete(`/api/finance/expenses/${id}`); showAlert('success','Deleted.'); fetch(); }
    catch { showAlert('error','Failed.'); }
  };

  const visible = expenses.filter(e => !filterCat || e.category === filterCat);
  const total   = visible.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between">
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className={inputCls + ' max-w-[180px]'}>
          <option value="">All Categories</option>
          {EXP_CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <button onClick={()=>{ setForm({ departmentId:'', category:'OTHER', amount:'', description:'', expenseDate: new Date().toISOString().split('T')[0] }); setModal(true); }}
          className="shrink-0 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md transition-colors">
          <Plus size={16}/> Log Expense
        </button>
      </div>

      {!loading && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 flex justify-between text-sm">
          <span className="text-amber-700 font-medium">Showing {visible.length} expense{visible.length!==1?'s':''}</span>
          <span className="font-bold text-amber-800">Total: {fmt(total)}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Logged By</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"/></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No expenses found.</td></tr>
              ) : visible.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(e.expenseDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-medium text-slate-700">{e.departmentName}</td>
                  <td className="px-5 py-3"><span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{e.category}</span></td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{e.description}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{fmt(e.amount)}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{e.loggedByUsername || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={()=>remove(e.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Log Expense" onClose={()=>setModal(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Department">
              <select name="departmentId" value={form.departmentId} onChange={inp} className={inputCls} required>
                <option value="">— Select Department —</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select name="category" value={form.category} onChange={inp} className={inputCls}>
                  {EXP_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Date">
                <input name="expenseDate" type="date" value={form.expenseDate} onChange={inp} className={inputCls} required/>
              </Field>
            </div>
            <Field label="Amount (₹)">
              <input name="amount" type="number" step="0.01" min="0" value={form.amount} onChange={inp} className={inputCls} required/>
            </Field>
            <Field label="Description">
              <textarea name="description" value={form.description} onChange={inp} className={inputCls} rows={2} required/>
            </Field>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={()=>setModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md">Log Expense</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',         icon: PieChart   },
  { id: 'fees',      label: 'Fee Management',   icon: Receipt    },
  { id: 'salary',    label: 'Salary & Payroll', icon: Users      },
  { id: 'budget',    label: 'Budget',           icon: Building2  },
  { id: 'expenses',  label: 'Expenses',         icon: Wallet     },
];

const FinanceManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary]     = useState(null);
  const [message, setMessage]     = useState({ type: '', text: '' });

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    api.get('/api/finance/summary').then(r => setSummary(r.data)).catch(()=>{});
  }, []);

  // Refresh summary whenever switching back to overview
  useEffect(() => {
    if (activeTab === 'overview') {
      api.get('/api/finance/summary').then(r => setSummary(r.data)).catch(()=>{});
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600"><Landmark size={22}/></div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Finance Department</h2>
          <p className="text-sm text-slate-500">Fee collections, payroll, budgets & expense management</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={15} className={activeTab === tab.id ? 'text-primary-600' : ''}/>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview'  && <OverviewTab  summary={summary}/>}
      {activeTab === 'fees'      && <FeesTab      showAlert={showAlert}/>}
      {activeTab === 'salary'    && <SalaryTab    showAlert={showAlert}/>}
      {activeTab === 'budget'    && <BudgetTab    showAlert={showAlert}/>}
      {activeTab === 'expenses'  && <ExpensesTab  showAlert={showAlert}/>}
    </div>
  );
};

export default FinanceManagement;
