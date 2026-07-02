import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle,
  CheckCircle2,
  Package,
  ArrowRightLeft,
  UserPlus,
  MonitorSmartphone,
  Info
} from 'lucide-react';

const InventoryManagement = () => {
  const { user, hasRole, registerUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('catalog');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // --- Catalog State ---
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  const [itemForm, setItemForm] = useState({
    itemName: '',
    sku: '',
    category: 'IT',
    description: '',
    location: '',
    totalQuantity: 1
  });

  // --- Allocations State ---
  const [allocations, setAllocations] = useState([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [allocationSearch, setAllocationSearch] = useState('');
  
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [allocateForm, setAllocateForm] = useState({
    sku: '',
    username: '',
    quantity: 1,
    daysToDue: 0
  });

  // --- Inventory Admins State ---
  const [invAdmins, setInvAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    employeeId: '',
    phone: ''
  });

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // --- API Calls ---

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const res = await api.get('/api/inventory/items', { params: { query: itemSearch, size: 50 } });
      setItems(res.data.content);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to fetch inventory catalog.');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchAllocations = async () => {
    try {
      setLoadingAllocations(true);
      const res = await api.get('/api/inventory/allocations', { params: { query: allocationSearch } });
      setAllocations(res.data);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to fetch allocations.');
    } finally {
      setLoadingAllocations(false);
    }
  };

  const fetchInvAdmins = async () => {
    if (!hasRole('ROLE_ADMIN')) return;
    try {
      setLoadingAdmins(true);
      const res = await api.get('/api/users', { params: { query: 'ROLE_INVENTORY_ADMIN', size: 100 } });
      const filtered = res.data.content.filter(u => u.roleName === 'ROLE_INVENTORY_ADMIN');
      setInvAdmins(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'catalog') fetchItems();
    else if (activeTab === 'allocations') fetchAllocations();
    else if (activeTab === 'admins') fetchInvAdmins();
  }, [activeTab, itemSearch, allocationSearch]);

  // --- Handlers ---

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditItemOpen) {
        await api.put(`/api/inventory/items/${currentItem.id}`, itemForm);
        showAlert('success', 'Item updated successfully.');
        setIsEditItemOpen(false);
      } else {
        await api.post('/api/inventory/items', itemForm);
        showAlert('success', 'New item added to inventory.');
        setIsAddItemOpen(false);
      }
      fetchItems();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/api/inventory/items/${id}`);
      showAlert('success', 'Item deleted.');
      fetchItems();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/inventory/allocations', allocateForm);
      showAlert('success', 'Asset allocated successfully.');
      setIsAllocateOpen(false);
      if (activeTab === 'allocations') fetchAllocations();
      else fetchItems();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to allocate asset.');
    }
  };

  const handleReturnAsset = async (id, condition) => {
    if (!window.confirm(`Mark this asset as ${condition}?`)) return;
    try {
      await api.post(`/api/inventory/allocations/${id}/return`, { condition });
      showAlert('success', `Asset marked as ${condition}.`);
      fetchAllocations();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to return asset.');
    }
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ ...adminForm, role: 'ROLE_INVENTORY_ADMIN' });
      showAlert('success', 'Inventory Admin registered successfully.');
      setIsAddAdminOpen(false);
      fetchInvAdmins();
    } catch (err) {
      showAlert('error', typeof err === 'string' ? err : 'Validation failed.');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Delete this admin account?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      showAlert('success', 'Admin deleted.');
      fetchInvAdmins();
    } catch (err) {
      showAlert('error', 'Failed to delete admin.');
    }
  };

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all duration-150 ${activeTab === 'catalog' ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Asset Catalog
        </button>
        <button
          onClick={() => setActiveTab('allocations')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all duration-150 ${activeTab === 'allocations' ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Allocations
        </button>
        {hasRole('ROLE_ADMIN') && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all duration-150 ${activeTab === 'admins' ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Inventory Admins
          </button>
        )}
      </div>

      {/* Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search by SKU, Name..." value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
            {hasRole('ROLE_INVENTORY_ADMIN') && (
              <button onClick={() => { setItemForm({ itemName:'', sku:'', category:'IT', description:'', location:'', totalQuantity:1 }); setIsAddItemOpen(true); }} className="px-4 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md hover:bg-primary-500">
                <Plus size={16} /> Add Asset
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Asset Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stock Availability</th>
                  {hasRole('ROLE_INVENTORY_ADMIN') && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">{item.sku}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.itemName}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{item.category}</span></td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.availableQuantity} / {item.totalQuantity} Available</td>
                    {hasRole('ROLE_INVENTORY_ADMIN') && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => { setAllocateForm({sku: item.sku, username:'', quantity:1, daysToDue:0}); setIsAllocateOpen(true); }} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200">Allocate</button>
                        <button onClick={() => { setCurrentItem(item); setItemForm(item); setIsEditItemOpen(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Edit2 size={16}/></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocations Tab */}
      {activeTab === 'allocations' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search Allocations..." value={allocationSearch} onChange={(e) => setAllocationSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
            {hasRole('ROLE_INVENTORY_ADMIN') && (
              <button onClick={() => { setAllocateForm({sku:'', username:'', quantity:1, daysToDue:0}); setIsAllocateOpen(true); }} className="px-4 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md hover:bg-primary-500">
                <ArrowRightLeft size={16} /> Allocate Asset
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Allocated To</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status</th>
                  {hasRole('ROLE_INVENTORY_ADMIN') && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {allocations.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{a.itemName} (x{a.quantity})</td>
                    <td className="px-6 py-4">{a.allocatedToName} <br/><span className="text-xs text-slate-400">@{a.allocatedToUsername}</span></td>
                    <td className="px-6 py-4 text-xs">
                      Issued: {new Date(a.allocationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold">{a.status}</td>
                    {hasRole('ROLE_INVENTORY_ADMIN') && (
                      <td className="px-6 py-4 text-right space-x-2">
                        {a.status === 'ALLOCATED' && (
                          <>
                            <button onClick={() => handleReturnAsset(a.id, 'RETURNED')} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200">Mark Returned</button>
                            <button onClick={() => handleReturnAsset(a.id, 'DAMAGED')} className="text-xs font-bold bg-rose-50 text-rose-700 px-2 py-1 rounded border border-rose-200">Mark Damaged</button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && hasRole('ROLE_ADMIN') && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Inventory Admins</h3>
            <button onClick={() => setIsAddAdminOpen(true)} className="px-4 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md hover:bg-primary-500">
              <UserPlus size={16} /> Register Admin
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {invAdmins.map(admin => (
                  <tr key={admin.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold">{admin.username}</td>
                    <td className="px-6 py-4">{admin.name}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteAdmin(admin.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {(isAddItemOpen || isEditItemOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="font-bold text-lg mb-4">{isEditItemOpen ? 'Edit Asset' : 'Add Asset'}</h3>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <input type="text" placeholder="Item Name" required value={itemForm.itemName} onChange={e => setItemForm({...itemForm, itemName: e.target.value})} className="w-full p-2 border rounded-xl" />
              <input type="text" placeholder="SKU (Unique)" required disabled={isEditItemOpen} value={itemForm.sku} onChange={e => setItemForm({...itemForm, sku: e.target.value})} className="w-full p-2 border rounded-xl" />
              <select value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value})} className="w-full p-2 border rounded-xl">
                <option value="IT">IT & Electronics</option>
                <option value="FURNITURE">Furniture</option>
                <option value="LAB_EQUIPMENT">Lab Equipment</option>
                <option value="STATIONERY">Stationery</option>
              </select>
              <input type="number" placeholder="Total Quantity" required min="1" value={itemForm.totalQuantity} onChange={e => setItemForm({...itemForm, totalQuantity: parseInt(e.target.value)})} className="w-full p-2 border rounded-xl" />
              <input type="text" placeholder="Location/Room" value={itemForm.location} onChange={e => setItemForm({...itemForm, location: e.target.value})} className="w-full p-2 border rounded-xl" />
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => { setIsAddItemOpen(false); setIsEditItemOpen(false); }} className="px-4 py-2 border rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAllocateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="font-bold text-lg mb-4">Allocate Asset</h3>
            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              <input type="text" placeholder="Asset SKU" required value={allocateForm.sku} onChange={e => setAllocateForm({...allocateForm, sku: e.target.value})} className="w-full p-2 border rounded-xl" />
              <input type="text" placeholder="User Username" required value={allocateForm.username} onChange={e => setAllocateForm({...allocateForm, username: e.target.value})} className="w-full p-2 border rounded-xl" />
              <input type="number" placeholder="Quantity" required min="1" value={allocateForm.quantity} onChange={e => setAllocateForm({...allocateForm, quantity: parseInt(e.target.value)})} className="w-full p-2 border rounded-xl" />
              <input type="number" placeholder="Days to Due (0 for indefinite)" min="0" value={allocateForm.daysToDue} onChange={e => setAllocateForm({...allocateForm, daysToDue: parseInt(e.target.value)})} className="w-full p-2 border rounded-xl" />
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsAllocateOpen(false)} className="px-4 py-2 border rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold">Allocate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddAdminOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="font-bold text-lg mb-4">Register Inventory Admin</h3>
            <form onSubmit={handleAddAdminSubmit} className="space-y-4">
              <input type="text" placeholder="Username" required value={adminForm.username} onChange={e => setAdminForm({...adminForm, username: e.target.value})} className="w-full p-2 border rounded-xl" />
              <input type="password" placeholder="Password" required value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} className="w-full p-2 border rounded-xl" />
              <input type="text" placeholder="Full Name" required value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} className="w-full p-2 border rounded-xl" />
              <input type="email" placeholder="Email" required value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} className="w-full p-2 border rounded-xl" />
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsAddAdminOpen(false)} className="px-4 py-2 border rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryManagement;
