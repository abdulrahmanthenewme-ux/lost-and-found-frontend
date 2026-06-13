import React from 'react';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ 
  user, 
  currentTab, 
  setCurrentTab, 
  isNotifOpen, 
  setIsNotifOpen, 
  notifications, 
  handleLogoutAction,
  clearUnreadNotifications,
  handleInitiateChatConnectionBox,
  setAuthMode
}) {

  const renderUserAvatarIcon = (targetUser, sizeDimension = '32px') => {
    if (!targetUser) return null;
    if (targetUser.avatar) {
      return (
        <div className="d-flex align-items-center justify-content-center bg-secondary rounded-circle" style={{ width: sizeDimension, height: sizeDimension, fontSize: `calc(${sizeDimension} * 0.55)`, userSelect: 'none' }}>
          {targetUser.avatar}
        </div>
      );
    }
    const displayInitial = targetUser.name ? targetUser.name.charAt(0).toUpperCase() : '?';
    return (
      <div className="d-flex align-items-center justify-content-center text-white rounded-circle fw-bold" style={{ width: sizeDimension, height: sizeDimension, backgroundColor: '#4f46e5', fontSize: `calc(${sizeDimension} * 0.45)`, userSelect: 'none', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
        {displayInitial}
      </div>
    );
  };

  const handleTabNavigation = (targetTab) => {
    // Restrict access if the user attempts to enter restricted tabs without being logged in
    if (!user && (targetTab === 'report' || targetTab === 'settings' || targetTab === 'admin')) {
      if (typeof setAuthMode === 'function') setAuthMode('login');
      setCurrentTab('auth');
    } else if (targetTab === 'admin' && user?.role !== 'admin') {
      // Direct unauthorized logged-in users back to safety
      setCurrentTab('dashboard');
    } else {
      setCurrentTab(targetTab);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4 py-3 sticky-top glass-navbar">
      {/* Keeping position-relative on the main navbar container for desktop anchoring */}
      <div className="container-fluid position-relative d-flex flex-wrap align-items-center justify-content-between">
        <span className="navbar-brand fw-bold fs-4 text-white d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => handleTabNavigation('dashboard')}>
          🔍 TracePulse
        </span>

        <div className="d-flex align-items-center gap-3 msg-nav-wrapper">
          {/* User Profile Info Area & Notifications */}
          {user && (
            <div className="d-flex align-items-center gap-3 me-2">
              <div className="d-flex align-items-center gap-2" title={`Logged in as ${user.name}`}>
                {renderUserAvatarIcon(user, '35px')}
                <span className="text-white small fw-medium d-none d-sm-inline">{user.name}</span>
              </div>

              <NotificationCenter 
                notifications={notifications} 
                isNotifOpen={isNotifOpen} 
                setIsNotifOpen={setIsNotifOpen} 
                clearUnreadNotifications={clearUnreadNotifications}
                handleInitiateChatConnectionBox={handleInitiateChatConnectionBox}
              />
            </div>
          )}

          {/* Core Navigation Actions */}
          <div className="d-flex gap-2 flex-wrap justify-content-end">
            {/* DYNAMIC AMENDMENT: Display Admin Panel Tab explicitly to administrative roles */}
            {user && user.role === 'admin' && (
              <button 
                className={`btn btn-sm ${currentTab === 'admin' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`} 
                onClick={() => handleTabNavigation('admin')}
              >
                🛡️ Admin Panel
              </button>
            )}

            <button 
              className={`btn btn-sm ${currentTab === 'dashboard' ? 'btn-primary' : 'btn-outline-light'}`} 
              onClick={() => handleTabNavigation('dashboard')}
            >
              Dashboard
            </button>
            
            <button 
              className={`btn btn-sm ${currentTab === 'report' ? 'btn-primary' : 'btn-outline-light'}`} 
              onClick={() => handleTabNavigation('report')}
            >
              Report Item
            </button>
            
            <button 
              className={`btn btn-sm ${currentTab === 'settings' ? 'btn-primary' : 'btn-outline-light'}`} 
              onClick={() => handleTabNavigation('settings')}
            >
              Settings
            </button>

            {user ? (
              <button className="btn btn-sm btn-outline-danger" onClick={handleLogoutAction}>
                Logout
              </button>
            ) : (
              <button 
                className="btn btn-sm btn-primary fw-bold animate-fade-in" 
                style={{ backgroundColor: '#6366f1', border: 'none' }}
                onClick={() => {
                  if (typeof setAuthMode === 'function') setAuthMode('login');
                  setCurrentTab('auth');
                }}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}