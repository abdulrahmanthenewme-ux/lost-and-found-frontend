import React from 'react';

export default function NotificationCenter({
  notifications = [],
  isNotifOpen,
  setIsNotifOpen,
  clearUnreadNotifications,
  handleInitiateChatConnectionBox
}) {
  
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="position-static position-md-relative">
      {/* Bell Button Customization */}
      <button 
        onClick={() => {
          setIsNotifOpen(!isNotifOpen);
          if (!isNotifOpen && typeof clearUnreadNotifications === 'function') {
            clearUnreadNotifications();
          }
        }}
        className="btn p-1 position-relative bg-transparent border-0 d-flex align-items-center justify-content-center text-white"
        style={{ width: '32px', height: '32px' }}
        title="Notifications"
      >
        {/* Rendered a crisp white vector bell icon instead of the yellow emoji */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-bell-fill" viewBox="0 0 16 16">
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
        </svg>

        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger p-1" style={{ width: '8px', height: '8px' }}>
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      {/* DYNAMIC DROPDOWN PANEL */}
      {isNotifOpen && (
        <div 
          className="position-absolute mt-2 p-3 rounded-3 shadow-lg text-light border border-secondary"
          style={{
            backgroundColor: '#1e293b',
            zIndex: 1050,
            /* Adaptive Logic: 
               On mobile: drops down to a new row below all buttons, takes full width minus safety margins.
               On desktop: anchors cleanly directly under the navbar edge.
            */
            ...(window.innerWidth < 768 ? {
              top: '100%',
              left: '12px',
              right: '12px',
              width: 'auto',
              marginTop: '15px'
            } : {
              top: '100%',
              right: '0px',
              left: 'auto',
              width: '340px'
            })
          }}
        >
          {/* Header Row */}
          <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-2">
            <h6 className="fw-bold m-0 text-white small d-flex align-items-center gap-2">
              Notifications {unreadCount > 0 && <span className="badge bg-primary fs-7">{unreadCount}</span>}
            </h6>
            <button 
              className="btn btn-sm text-white-50 p-0 border-0 fs-5 line-height-1" 
              onClick={() => setIsNotifOpen(false)}
              style={{ background: 'transparent' }}
            >
              &times;
            </button>
          </div>
          
          {/* Notifications Scroll Area */}
          <div className="d-flex flex-column gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p className="text-white-50 small m-0 text-center py-3">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id || Math.random()} 
                  className={`p-2 rounded small border-start border-3 transition-all ${
                    notif.unread 
                      ? 'bg-primary bg-opacity-10 border-primary text-white' 
                      : 'bg-dark bg-opacity-20 border-secondary text-white-50'
                  }`}
                >
                  <div className="mb-1">{notif.text || notif.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}