import React, { useState } from 'react';

export default function AdminDashboard({ 
  usersList = [], 
  allItemsList = [], 
  archivedUsersList = [],
  archivedItemsList = [],
  handleDeleteUser, 
  handleDeleteItem, 
  handleRestoreUser,
  handleRestoreItem,
  handleEditItem 
}) {
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminViewTab, setAdminViewTab] = useState('items');
  const [archiveSubFilter, setArchiveSubFilter] = useState('items');

  // Filtering Logic
  const filteredItems = allItemsList.filter(item => 
    item.title?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
    item.description?.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid text-light py-4">
      {/* Header and Controls */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-12 col-md-4">
          <h2 className="fw-bold text-warning">🛡️ Admin Center</h2>
        </div>
        <div className="col-12 col-md-4">
          <input 
            type="text" className="form-control bg-dark text-white border-secondary"
            placeholder="Search..."
            value={adminSearchQuery}
            onChange={(e) => setAdminSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-4 d-flex justify-content-md-end gap-2">
          <button className={`btn btn-sm ${adminViewTab === 'items' ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setAdminViewTab('items')}>Items</button>
          <button className={`btn btn-sm ${adminViewTab === 'users' ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setAdminViewTab('users')}>Users</button>
          <button className={`btn btn-sm ${adminViewTab === 'archive' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setAdminViewTab('archive')}>Archive</button>
        </div>
      </div>

      {/* Tables */}
      <div className="table-responsive bg-dark rounded-3 border border-secondary">
        <table className="table table-dark table-hover m-0">
          <thead>
            {adminViewTab === 'items' && <tr><th>Title</th><th>Status</th><th>Actions</th></tr>}
            {adminViewTab === 'users' && <tr><th>Name</th><th>Email</th><th>Actions</th></tr>}
          </thead>
          <tbody>
            {adminViewTab === 'items' && filteredItems.map(item => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.status}</td>
                <td>
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEditItem(item)}>✏️ Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item._id)}>Archive</button>
                </td>
              </tr>
            ))}
            {adminViewTab === 'users' && filteredUsers.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u._id)}>Archive</button></td>
              </tr>
            ))}
            {/* In the table body */}
{adminViewTab === 'archive' && (
  <tr>
    <td colSpan="3">
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-sm btn-outline-light" onClick={() => setArchiveSubFilter('items')}>Items</button>
        <button className="btn btn-sm btn-outline-light" onClick={() => setArchiveSubFilter('users')}>Users</button>
      </div>
      {archiveSubFilter === 'items' 
        ? archivedItemsList.map(item => (
            <div key={item._id} className="d-flex justify-content-between p-2 border-bottom">
              {item.title} 
              <button className="btn btn-sm btn-success" onClick={() => handleRestoreItem(item._id)}>Restore</button>
            </div>
          ))
        : archivedUsersList.map(u => (
            <div key={u._id} className="d-flex justify-content-between p-2 border-bottom">
              {u.name} 
              <button className="btn btn-sm btn-success" onClick={() => handleRestoreUser(u._id)}>Restore</button>
            </div>
          ))
      }
    </td>
  </tr>
)}
          </tbody>
        </table>
      </div>
    </div>
  );
}