import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InboxDrawer from './components/InboxDrawer';
import ChatBox from './components/ChatBox';
import EditItemModal from './components/EditItemModal';
import AdminDashboard from './components/AdminDashboard';
import API_URL from './config.js';

const socket = io(API_URL)
const AVATAR_OPTIONS = ['🦊', '🐱', '🐼', '🦁', '🐸', '🐨', '🤖', '🥷', '🚀', '🌟', '👻', '👾'];

function App() {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to TracePulse! Track your lost items here.", unread: true },
    { id: 2, text: "Tip: Provide clear location details for faster recovery.", unread: false }
  ])
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [currentTab, setCurrentTab] = useState('dashboard')

  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authCurrentPassword, setAuthCurrentPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  const [settingsName, setSettingsName] = useState('')
  const [settingsEmail, setSettingsEmail] = useState('')
  const [settingsPassword, setSettingsPassword] = useState('')
  const [settingsStatus, setSettingsStatus] = useState({ type: '', msg: '' })
  const [settingsAvatar, setSettingsAvatar] = useState('')

  const [items, setItems] = useState([])
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [reportTitle, setReportTitle] = useState('')
  const [reportStatus, setReportStatus] = useState('Lost')
  const [reportLocation, setReportLocation] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reportContact, setReportContact] = useState('')
  const [reportImage, setReportImage] = useState(null)
  const [reportError, setReportError] = useState('')

  const [activeChat, setActiveChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [typedMessage, setTypedMessage] = useState('')
  const messagesEndRef = useRef(null)

  const [myConversations, setMyConversations] = useState([])
  const [isInboxOpen, setIsInboxOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [adminUsers, setAdminUsers] = useState([])
  const [totalUsersCount, setTotalUsersCount] = useState(0)

  const [archivedItems, setArchivedItems] = useState([])
  const [archivedUsers, setArchivedUsers] = useState([])

  const triggerNewNotification = (textMessage) => {
    setNotifications((prev) => [{ id: Date.now(), text: textMessage, unread: true }, ...prev]);
  };

  const clearUnreadNotifications = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, unread: false })));
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('lostFoundUser')
    if (savedSession) {
      const parsedUser = JSON.parse(savedSession)
      setUser(parsedUser)
      setSettingsName(parsedUser.name)
      setSettingsEmail(parsedUser.email)
      setSettingsAvatar(parsedUser.avatar || '')
    }
    fetchItemsDatabase()
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  useEffect(() => {
    if (currentTab === 'admin' && user?.role === 'admin') {
      fetchAdminUserData();
      fetchArchivedUsers();
    }
  }, [currentTab, user])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchArchivedItems();
    }
  }, [user])

  useEffect(() => {
    const handleIncomingMessage = (incomingData) => {
      if (activeChat && incomingData.room === activeChat.roomId) {
        setChatMessages((prev) => [...prev, incomingData]);
      }
      if (user && incomingData.senderId !== user.id) {
        if (!activeChat || incomingData.room !== activeChat.roomId) {
          const itemTitleFromRoom = incomingData.room.split('_')[0]?.replace(/-/g, ' ') || "an item";
          const itemIdFromRoom = incomingData.room.split('_')[1] || "";
          const ownerIdFromRoom = incomingData.room.split('_')[2] || "";

          setNotifications((prev) => [
            {
              id: Date.now(),
              text: `💬 New message from ${incomingData.senderName} regarding "${itemTitleFromRoom}": "${incomingData.text}"`,
              unread: true,
              chatMeta: {
                roomId: incomingData.room,
                itemTitle: itemTitleFromRoom,
                _id: itemIdFromRoom,
                userId: ownerIdFromRoom
              }
            },
            ...prev
          ]);
        }
      }
    };

    socket.on('receive_message', handleIncomingMessage);
    return () => {
      socket.off('receive_message', handleIncomingMessage);
    };
  }, [activeChat, user]);

  useEffect(() => {
    if (isInboxOpen && user?.id) { fetchMyInbox() }
  }, [isInboxOpen, user])

  useEffect(() => {
    const handleLiveAlert = (alertData) => {
      setNotifications((prev) => [{ id: Date.now(), text: alertData.text, unread: true }, ...prev])
    }
    socket.on('new_notification', handleLiveAlert)
    return () => { socket.off('new_notification', handleLiveAlert) }
  }, [])

  const fetchItemsDatabase = async () => {
    try {
      const response = await fetch(`${API_URL}/api/items`)
      const databaseItems = await response.json()
      setItems(databaseItems)
    } catch (err) { console.error("Error fetching items:", err) }
  }

  const fetchMyInbox = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`${API_URL}/api/chat-rooms/${user.id}`)
      const data = await response.json()
      setMyConversations(data)
    } catch (error) { console.error(error) }
  }

  const handleDeleteItem = async (id) => {
    const token = localStorage.getItem('lostFoundToken');
    try {
      const res = await fetch(`${API_URL}/api/admin/items/${id}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchItemsDatabase();
    } catch (err) { console.error("Archive failed", err); }
  };

  const handleSave = async (e, formData, id) => {
    e.preventDefault();
    const token = localStorage.getItem('lostFoundToken');
    try {
      const res = await fetch(`${API_URL}/api/admin/items/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setEditingItem(null);
        fetchItemsDatabase();
      } else {
        alert("Failed to save changes to the item listing.");
      }
    } catch (err) { console.error("Update failed", err); }
  };

  const fetchAdminUserData = async () => {
    const token = localStorage.getItem('lostFoundToken');
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {  // ✅ fixed: was single quotes
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) { console.error(data.message); return; }
      setAdminUsers(data.users);
      setTotalUsersCount(data.totalUsers);
    } catch (err) {
      console.error("Could not fetch user tables:", err);
    }
  };

  const fetchArchivedUsers = async () => {
    const token = localStorage.getItem('lostFoundToken');
    try {
      const res = await fetch(`${API_URL}/api/admin/archived-users`, {  // ✅ fixed: was single quotes
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) { console.error("Failed archived users fetch:", data); return; }
      const users = data?.users || data?.archivedUsers || data?.data || data;
      setArchivedUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("Archived users fetch error:", err);
      setArchivedUsers([]);
    }
  };

  const handleAdminDeleteUser = async (targetUserId) => {
    const userToArchive = adminUsers.find(u => u._id === targetUserId);
    if (!userToArchive) return;
    if (!window.confirm(`Are you sure you want to suspend and archive workspace for user "${userToArchive.name}"?`)) return;
    const token = localStorage.getItem('lostFoundToken')
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${targetUserId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setArchivedUsers(prev => [...prev, { ...userToArchive, archivedAt: new Date().toLocaleDateString() }]);
        triggerNewNotification(`Account profile for "${userToArchive.name}" has been safely archived under suspension.`);
        fetchAdminUserData()
        fetchItemsDatabase()
      }
    } catch (err) { console.error(err) }
  }

  const handleRestoreUser = async (targetUserId) => {
    const userToRestore = archivedUsers.find(u => u._id === targetUserId);
    if (!userToRestore) return;
    const token = localStorage.getItem('lostFoundToken');
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${targetUserId}/restore`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setArchivedUsers(prev => prev.filter(u => u._id !== targetUserId));
        triggerNewNotification(`Suspension lifted! Profile account for "${userToRestore.name}" restored.`);
        fetchAdminUserData();
      } else {
        console.error("Restore failed:", await res.json());
      }
    } catch (err) {
      console.error("Restore user error:", err);
    }
  };

  const handleAuthenticationSubmit = async (e) => {
    e.preventDefault()
    setAuthError(''); setAuthSuccess('')

    if (authMode === 'forgot') {
      try {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {  // ✅ fixed: was single quotes
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            currentPassword: authCurrentPassword,
            newPassword: authPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          setAuthSuccess(data.message);
          setAuthPassword('');
          setAuthCurrentPassword('');
          setTimeout(() => setAuthMode('login'), 2500);
        } else {
          setAuthError(data.message);
        }
      } catch (err) {
        setAuthError("Failed to communicate with authorization server.");
      }
      return;
    }

    const urlEndpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const packetPayload = authMode === 'login'
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword }

    try {
      const res = await fetch(`${API_URL}${urlEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packetPayload)
      })
      const data = await res.json()
      if (!res.ok) { setAuthError(data.message || "An error occurred."); return }
      if (authMode === 'login') {
        localStorage.setItem('lostFoundToken', data.token)
        localStorage.setItem('lostFoundUser', JSON.stringify(data.user))
        setUser(data.user); setSettingsName(data.user.name); setSettingsEmail(data.user.email); setSettingsAvatar(data.user.avatar || '')
        setAuthEmail(''); setAuthPassword('')
        setCurrentTab('dashboard')
        triggerNewNotification(`Logged in successfully. Welcome back, ${data.user.name}!`)
      } else {
        setAuthSuccess(data.message); setAuthMode('login'); setAuthName(''); setAuthEmail(''); setAuthPassword('')
      }
    } catch (err) { setAuthError("Connection error.") }
  }

  const handleUpdateSettingsProfile = async (e) => {
    e.preventDefault(); setSettingsStatus({ type: '', msg: '' })
    try {
      const token = localStorage.getItem('lostFoundToken');
      const response = await fetch(`${API_URL}/api/auth/update`, {  // ✅ fixed: was single quotes
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: settingsName,
          email: settingsEmail,
          password: settingsPassword
        })
      });
      const data = await response.json()
      if (!response.ok) { setSettingsStatus({ type: 'danger', msg: data.message || "Failed update." }); return }
      const refreshedUserStructure = { ...data.user, avatar: settingsAvatar }
      localStorage.setItem('lostFoundUser', JSON.stringify(refreshedUserStructure))
      setUser(refreshedUserStructure); setSettingsPassword('')
      setSettingsStatus({ type: 'success', msg: "Workspace parameters configured safely!" })
      triggerNewNotification("Account settings saved successfully.")
    } catch (err) { setSettingsStatus({ type: 'danger', msg: "Network error." }) }
  }

  const handleReportItemSubmit = async (e) => {
    e.preventDefault(); setReportError('')
    if (!user) { setReportError("Unauthorized access."); return }
    const multipartFormStructure = new FormData()
    multipartFormStructure.append('title', reportTitle)
    multipartFormStructure.append('status', reportStatus)
    multipartFormStructure.append('location', reportLocation)
    multipartFormStructure.append('description', reportDescription)
    multipartFormStructure.append('contact', reportContact)
    multipartFormStructure.append('userId', user.id)
    if (reportImage) { multipartFormStructure.append('image', reportImage) }
    try {
      const res = await fetch(`${API_URL}/api/items`, { method: 'POST', body: multipartFormStructure })  // ✅ fixed: was single quotes
      if (!res.ok) { setReportError("Failed saving."); return }
      const savedTitle = reportTitle;
      setReportTitle(''); setReportLocation(''); setReportDescription(''); setReportContact(''); setReportImage(null); setCurrentTab('dashboard')
      fetchItemsDatabase()
      triggerNewNotification(`Success! Your listing "${savedTitle}" has been posted.`)
    } catch (err) { setReportError("Server connection lost.") }
  }

  const handleDeleteItemListing = async (targetId) => {
    const itemToArchive = items.find(item => item._id === targetId);
    if (!itemToArchive) return;
    if (!window.confirm(`Are you sure you want to archive the item listing "${itemToArchive.title}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/items/${targetId}`, { method: 'DELETE' })
      if (res.ok) {
        setArchivedItems(prev => prev.filter(item => item._id !== targetId));
        await fetchItemsDatabase();
        await fetchArchivedItems();
        triggerNewNotification(`Item "${itemToArchive.title}" archived successfully.`);
      }
    } catch (err) { console.error(err) }
  }

  const handleRestoreItemListing = async (targetId) => {
    const itemToRestore = archivedItems.find(item => item._id === targetId);
    if (!itemToRestore) return;
    try {
      const res = await fetch(`${API_URL}/api/items/${targetId}/restore`, { method: 'PUT' });
      if (res.ok) {
        setArchivedItems(prev => prev.filter(item => item._id !== targetId));
        await fetchItemsDatabase();
        triggerNewNotification(`Item "${itemToRestore.title}" restored successfully.`);
      }
    } catch (err) { console.error(err); }
  };

  const fetchArchivedItems = async () => {
    try {
      const token = localStorage.getItem('lostFoundToken');
      const res = await fetch(`${API_URL}/api/admin/archived-items`, {  // ✅ fixed: was single quotes
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setArchivedItems(data);
    } catch (err) {
      console.error("Failed to fetch archived items:", err);
    }
  };

  const handleUpdateItemSubmit = async (e, formData, id) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/items/${id}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        setEditingItem(null);
        fetchItemsDatabase();
        triggerNewNotification(`Listing updated successfully.`);
      } else {
        alert("Failed to save changes to the item listing.");
      }
    } catch (err) {
      console.error("Connection error while sending updates to backend:", err);
    }
  };

  const handleInitializeChatConnectionBox = async (targetItemCard) => {
    if (!user) { alert("Please log in."); return }
    if (!targetItemCard?._id || !targetItemCard?.userId) {
      console.error("handleInitializeChatConnectionBox received an invalid item — missing _id or userId:", targetItemCard);
      return;
    }
    const generatedRoomStringId = `${targetItemCard.title.replace(/\s+/g, '-')}_${targetItemCard._id}_${targetItemCard.userId}_${user.id}`
    setActiveChat({ roomId: generatedRoomStringId, itemTitle: targetItemCard.title, ownerId: targetItemCard.userId })
    setChatMessages([]); socket.emit('join_room', generatedRoomStringId)
    try {
      const response = await fetch(`${API_URL}/api/messages/${generatedRoomStringId}`)
      setChatMessages(await response.json())
    } catch (err) { console.error(err) }
  }

  const handleSendChatText = (e) => {
    e.preventDefault()
    if (!typedMessage.trim() || !activeChat || !user) return
    const chatPacketPayload = { room: activeChat.roomId, senderId: user.id, senderName: user.name, text: typedMessage }
    setChatMessages((prev) => [...prev, chatPacketPayload])
    socket.emit('send_message', chatPacketPayload)
    setTypedMessage('')
  }

  const handleLogoutAction = () => {
    localStorage.removeItem('lostFoundToken'); localStorage.removeItem('lostFoundUser')
    setUser(null); setActiveChat(null); setIsInboxOpen(false); setFilterStatus('All'); setSearchQuery(''); setCurrentTab('dashboard')
  }

  const filteredCollectionDataset = items.filter(entity => {
    const matchesStatus = filterStatus === 'All' || entity.status.toLowerCase() === filterStatus.toLowerCase();
    const cleanQuery = searchQuery.toLowerCase().trim();
    return matchesStatus && (!cleanQuery || entity.title?.toLowerCase().includes(cleanQuery) || entity.description?.toLowerCase().includes(cleanQuery) || entity.location?.toLowerCase().includes(cleanQuery));
  })

  return (
    <div className="animated-pulse-bg text-light min-vh-100 d-flex flex-column m-0 p-0">
      <Navbar
        user={user}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isNotifOpen={isNotifOpen}
        setIsNotifOpen={setIsNotifOpen}
        notifications={notifications}
        handleLogoutAction={handleLogoutAction}
        clearUnreadNotifications={clearUnreadNotifications}
        handleInitiateChatConnectionBox={handleInitializeChatConnectionBox}
        setAuthMode={setAuthMode}
      />

      <main className="flex-grow-1 w-100 px-3 px-md-4 mx-auto" style={{ maxWidth: '1400px' }}>
        <div className="container py-5">

          {!user && currentTab === 'auth' && (
            <div className="row justify-content-center my-5">
              <div className="col-12 col-md-5">
                <div className="card text-light p-4 shadow-lg border-secondary rounded-4" style={{ backgroundColor: '#1e293b' }}>
                  <div className="text-center mb-4">
                    <h2 className="fw-bold text-white m-0">
                      {authMode === 'login' && 'Welcome Back'}
                      {authMode === 'register' && 'Create Account'}
                      {authMode === 'forgot' && 'Change Password'}
                    </h2>
                    <p className="text-white-50 small mt-1">
                      {authMode === 'login' && 'Log in to track items'}
                      {authMode === 'register' && 'Register to begin tracking possessions'}
                      {authMode === 'forgot' && 'Verify your identity to assign a new password'}
                    </p>
                  </div>

                  {authError && <div className="alert alert-danger p-2 small text-center">{authError}</div>}
                  {authSuccess && <div className="alert alert-success p-2 small text-center">{authSuccess}</div>}

                  <form onSubmit={handleAuthenticationSubmit} className="d-flex flex-column gap-3">
                    {authMode === 'register' && (
                      <div>
                        <label className="form-label text-white-50 small mb-1">Full Name</label>
                        <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="John Doe" value={authName} onChange={(e) => setAuthName(e.target.value)} required />
                      </div>
                    )}

                    <div>
                      <label className="form-label text-white-50 small mb-1">Email Address</label>
                      <input type="email" className="form-control bg-transparent text-white border-secondary" placeholder="name@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
                    </div>

                    {authMode === 'forgot' && (
                      <div>
                        <label className="form-label text-white-50 small mb-1">Current Password</label>
                        <input type="password" className="form-control bg-transparent text-white border-secondary" placeholder="Type your current password" value={authCurrentPassword} onChange={(e) => setAuthCurrentPassword(e.target.value)} required />
                      </div>
                    )}

                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label text-white-50 small m-0">
                          {authMode === 'forgot' ? 'New Password' : 'Password'}
                        </label>
                        {authMode === 'login' && (
                          <span
                            className="small text-primary"
                            style={{ cursor: 'pointer', fontSize: '0.78rem', color: '#818cf8' }}
                            onClick={() => { setAuthError(''); setAuthSuccess(''); setAuthMode('forgot'); }}
                          >
                            Change Password?
                          </span>
                        )}
                      </div>
                      <input type="password" className="form-control bg-transparent text-white border-secondary" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn btn-primary fw-bold w-100 py-2.5 mt-2" style={{ backgroundColor: '#6366f1', border: 'none' }}>
                      {authMode === 'login' && 'Log In'}
                      {authMode === 'register' && 'Sign Up'}
                      {authMode === 'forgot' && 'Update Password'}
                    </button>
                  </form>

                  <div className="text-center mt-4 small">
                    {authMode === 'forgot' ? (
                      <span className="text-primary fw-medium" style={{ cursor: 'pointer', color: '#818cf8' }} onClick={() => { setAuthError(''); setAuthSuccess(''); setAuthMode('login'); }}>
                        Return to Login Screen
                      </span>
                    ) : (
                      <p className="m-0 text-white-50">
                        {authMode === 'login' ? "New to the platform? " : "Already have an account? "}
                        <span className="text-primary fw-medium" style={{ cursor: 'pointer', color: '#818cf8' }} onClick={() => { setAuthError(''); setAuthSuccess(''); setAuthMode(authMode === 'login' ? 'register' : 'login'); }}>
                          {authMode === 'login' ? 'Create an account' : 'Log back in'}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="text-center mt-2">
                    <span className="text-white-50 small" style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('dashboard')}>
                      ← Back to browsing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'dashboard' && (
            <Dashboard
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              filteredCollectionDataset={filteredCollectionDataset} user={user}
              handleInitiateChatConnectionBox={handleInitializeChatConnectionBox}
              handleDeleteItemListing={handleDeleteItemListing}
              setEditingItem={setEditingItem}
            />
          )}

          {user && user.role === 'admin' && currentTab === 'admin' && (
            <AdminDashboard
              usersList={adminUsers}
              totalUsersCount={totalUsersCount}
              allItemsList={items}
              archivedUsersList={archivedUsers}
              archivedItemsList={archivedItems}
              handleDeleteUser={handleAdminDeleteUser}
              handleDeleteItem={handleDeleteItemListing}
              handleRestoreUser={handleRestoreUser}
              handleRestoreItem={handleRestoreItemListing}
              handleEditItem={(item) => setEditingItem(item)}
            />
          )}

          {user && currentTab === 'report' && (
            <div className="row justify-content-center animate-fade-in py-4">
              <div className="col-12 col-md-8 col-lg-6">
                <div className="card p-4 shadow-lg text-light border-secondary" style={{ backgroundColor: '#1e293b' }}>
                  <h3 className="fw-bold mb-1 text-white">Report a New Item</h3>
                  <p className="text-white-50 small mb-4">Provide details about the lost or found item to list it on TracePulse.</p>

                  {reportError && <div className="alert alert-danger p-2 small text-center">{reportError}</div>}

                  <form onSubmit={handleReportItemSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-medium text-white-50">Item Title</label>
                      <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="e.g., iPhone 13, Leather Wallet" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-medium text-white-50">Status Category</label>
                      <select className="form-select bg-dark border-secondary text-white" value={reportStatus} onChange={(e) => setReportStatus(e.target.value)}>
                        <option value="Lost">Lost (I mislaid this item)</option>
                        <option value="Found">Found (I discovered this item)</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-medium text-white-50">Location</label>
                      <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="e.g., Campus Library, Saida Street" value={reportLocation} onChange={(e) => setReportLocation(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-medium text-white-50">Contact Information</label>
                      <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="e.g., Phone number or email address" value={reportContact} onChange={(e) => setReportContact(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-medium text-white-50">Description</label>
                      <textarea className="form-control bg-dark border-secondary text-white" rows="3" placeholder="Describe unique identification markers..." value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} required></textarea>
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-medium text-white-50">Item Picture (Optional)</label>
                      <input type="file" className="form-control bg-dark border-secondary text-white" onChange={(e) => setReportImage(e.target.files[0])} />
                    </div>

                    <button type="submit" className="btn w-100 fw-bold text-white py-2" style={{ backgroundColor: '#6366f1', border: 'none' }}>
                      Submit Listing
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {user && currentTab === 'settings' && (
            <div className="row justify-content-center animate-fade-in py-4">
              <div className="col-12 col-md-8 col-lg-6">
                <div className="card p-4 shadow-lg text-light border-secondary" style={{ backgroundColor: '#1e293b' }}>
                  <h3 className="fw-bold mb-1 text-white">Account Settings</h3>
                  <p className="text-white-50 small mb-4">Manage your profile credentials and application preferences.</p>

                  {settingsStatus.msg && (
                    <div className={`alert alert-${settingsStatus.type} p-2 small text-center`}>{settingsStatus.msg}</div>
                  )}

                  <form onSubmit={handleUpdateSettingsProfile}>
                    <div className="mb-3">
                      <label className="form-label small fw-medium text-white-50">Full Name</label>
                      <input type="text" className="form-control bg-dark border-secondary text-white" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-medium text-white-50">Email Address</label>
                      <input type="email" className="form-control bg-dark border-secondary text-white" value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-medium text-white-50">Change Password (Leave blank to keep current)</label>
                      <input type="password" className="form-dark border-secondary text-white" placeholder="••••••••" value={settingsPassword} onChange={(e) => setSettingsPassword(e.target.value)} />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-medium text-white-50 d-block mb-2">Choose Avatar Symbol</label>
                      <div className="d-flex flex-wrap gap-2 p-2 bg-dark bg-opacity-50 rounded border border-secondary">
                        {AVATAR_OPTIONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            className="btn btn-sm p-2 fs-5 transition-all"
                            style={{
                              backgroundColor: settingsAvatar === icon ? '#6366f1' : 'transparent',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                            onClick={() => setSettingsAvatar(icon)}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn w-100 fw-bold text-white py-2" style={{ backgroundColor: '#6366f1', border: 'none' }}>
                      Save Profile Parameters
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {user && (
        <button className="position-fixed bottom-0 start-0 m-4 btn btn-primary shadow-lg d-flex align-items-center gap-2 px-4 py-2.5" style={{ zIndex: 1079, borderRadius: '30px', backgroundColor: '#6366f1', border: 'none' }} onClick={() => setIsInboxOpen(!isInboxOpen)}>💬 My Messages</button>
      )}
      <InboxDrawer isInboxOpen={isInboxOpen} setIsInboxOpen={setIsInboxOpen} myConversations={myConversations} setActiveChat={setActiveChat} setChatMessages={setChatMessages} socket={socket} />

      <ChatBox activeChat={activeChat} setActiveChat={setActiveChat} chatMessages={chatMessages} user={user} typedMessage={typedMessage} setTypedMessage={setTypedMessage} handleSendChatText={handleSendChatText} messagesEndRef={messagesEndRef} />

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateItemSubmit}
        />
      )}
    </div>
  )
}

export default App;
