"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Edit, Trash2, LogOut, Ban, CheckCircle, X, Save } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isPremium, setIsPremium] = useState('');

  // Selected User Modal/Edit State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create Admin Modal State
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'Admin' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminMsg, setAdminMsg] = useState({ type: '', text: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    setAdminMsg({ type: '', text: '' });
    try {
      const response = await axios.post('/api/v1/admin/create-admin', newAdmin, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setAdminMsg({ type: 'success', text: 'New Admin account created successfully!' });
        setNewAdmin({ firstName: '', lastName: '', email: '', password: '', role: 'Admin' });
        fetchUsers(1);
        setTimeout(() => { setIsCreateAdminOpen(false); setAdminMsg({ type: '', text: '' }); }, 1500);
      }
    } catch (err) {
      setAdminMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create admin.' });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/admin/users`, {
        params: { page, limit: 10, search, role, isPremium },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(response.data.data.currentPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessions = async () => {
    try {
      const response = await axios.get('/api/v1/profession');
      if (response.data.status) {
        setProfessions(response.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [search, role, isPremium]);

  useEffect(() => {
    fetchProfessions();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      const response = await axios.put(`/api/v1/admin/users/${user._id}/status`, 
        { isActive: !user.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status) {
        fetchUsers(currentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleForceLogout = async (userId) => {
    try {
      const response = await axios.post(`/api/v1/admin/users/${userId}/force-logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        alert('User device session cleared successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to soft delete this user?')) return;
    try {
      const response = await axios.delete(`/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        fetchUsers(currentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await axios.get(`/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setSelectedUser(response.data.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditUser = (user) => {
    setEditUser({
      ...user,
      trialEndDate: user.trialEndDate ? new Date(user.trialEndDate).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/v1/admin/users/${editUser._id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setIsEditModalOpen(false);
        fetchUsers(currentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search and filter toolbar */}
      <div className="neu-card p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full neu-input py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="neu-input px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Editor">Editor</option>
            <option value="Moderator">Moderator</option>
            <option value="Support">Support</option>
          </select>

          <select 
            value={isPremium} 
            onChange={(e) => setIsPremium(e.target.value)}
            className="neu-input px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="">All Members</option>
            <option value="true">Premium Only</option>
            <option value="false">Free Tier</option>
          </select>

          <button
            onClick={() => setIsCreateAdminOpen(true)}
            className="neu-btn text-xs px-4 py-2.5 flex items-center gap-2"
          >
            <span>+ Create Admin Account</span>
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Profession</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Premium Status</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-400 font-medium">{user._id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{user.email}</p>
                    <p className="text-xs text-slate-400">
                      {typeof user.phoneNumber === 'object' && user.phoneNumber
                        ? user.phoneNumber.$numberLong || JSON.stringify(user.phoneNumber)
                        : user.phoneNumber || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {user.professionId?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'Super Admin' ? 'bg-red-50 text-red-700' :
                      user.role === 'Admin' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.isPremium ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.isPremium ? 'Premium' : 'Free Tier'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-1 text-xs font-bold focus:outline-none`}
                    >
                      {user.isActive ? (
                        <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Active</span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1"><Ban className="h-4 w-4" /> Suspended</span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleViewUser(user._id)} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100" title="View details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleEditUserClick(user)} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100" title="Edit details">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleForceLogout(user._id)} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100" title="Force Logout">
                      <LogOut className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteUser(user._id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100" title="Soft delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            <button
              disabled={currentPage === 1}
              onClick={() => fetchUsers(currentPage - 1)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => fetchUsers(currentPage + 1)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View User Profile Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative border border-slate-100">
            <button onClick={() => setIsViewModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Detailed User Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">User Details</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{selectedUser.user.firstName} {selectedUser.user.lastName}</p>
                <p className="text-sm text-slate-600">{selectedUser.user.email} | {selectedUser.user.phoneNumber || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Role</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedUser.user.role}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Profession</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedUser.user.professionId?.name || 'Unassigned'}</p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs text-slate-400 uppercase font-semibold">Activity Statistics</p>
                <p className="text-sm text-slate-600">Total Sections Read: <span className="font-bold text-slate-800">{selectedUser.readingHistoryCount}</span></p>
                <p className="text-sm text-slate-600">Bookmarked Items Count: <span className="font-bold text-slate-800">{selectedUser.bookmarks.length}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <form onSubmit={handleSaveUser} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative border border-slate-100 space-y-4">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Profile Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">First Name</label>
                <input
                  type="text"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Last Name</label>
                <input
                  type="text"
                  value={editUser.lastName}
                  onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone Number</label>
              <input
                type="text"
                value={editUser.phoneNumber}
                onChange={(e) => setEditUser({...editUser, phoneNumber: e.target.value})}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Profession</label>
                <select
                  value={editUser.professionId}
                  onChange={(e) => setEditUser({...editUser, professionId: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {professions.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Manual Premium Status</span>
                <input
                  type="checkbox"
                  checked={editUser.isPremium}
                  onChange={(e) => setEditUser({...editUser, isPremium: e.target.checked})}
                  className="h-5 w-5 text-emerald-500 rounded border-slate-200 focus:ring-emerald-500"
                />
              </div>

              {editUser.isPremium && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Premium Expiry Date</label>
                  <input
                    type="date"
                    value={editUser.trialEndDate}
                    onChange={(e) => setEditUser({...editUser, trialEndDate: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-400"
            >
              <Save className="h-4 w-4" />
              <span>Save User Details</span>
            </button>
          </form>
        </div>
      )}

      {/* Create Admin Account Modal */}
      {isCreateAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="neu-card w-full max-w-md p-6 space-y-4 relative">
            <button
              onClick={() => setIsCreateAdminOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-800 pb-2 border-b border-[#c6deeb]">Create New Admin Account</h2>

            {adminMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${
                adminMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {adminMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newAdmin.firstName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                    className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newAdmin.lastName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                    className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email / Username *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@yopmail.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full neu-input p-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#25AAE2]"
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="neu-btn w-full py-3 text-sm font-bold disabled:opacity-50"
                >
                  {creatingAdmin ? 'Creating Account...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
