import React from 'react';

export default function InboxDrawer({ isInboxOpen, setIsInboxOpen, myConversations, setActiveChat, setChatMessages, socket }) {
  if (!isInboxOpen) return null;

  return (
    <div className="position-fixed top-0 start-0 h-100 bg-dark text-white border-end border-secondary shadow-lg p-3" style={{ width: '340px', zIndex: 1090, paddingTop: '90px', backgroundColor: '#0f172a' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
        <h5 className="m-0 fw-bold text-white">Messages Inbox</h5>
        <button className="btn text-white-50 p-0 h4 m-0 bg-transparent border-0" onClick={() => setIsInboxOpen(false)}>×</button>
      </div>

      <div className="overflow-y-auto h-75 d-flex flex-column gap-2 pe-1">
        {myConversations.length === 0 ? (
          <div className="text-muted text-center small my-5">No conversations found yet.</div>
        ) : (
          myConversations.map((chat) => (
            <div 
              key={chat.roomId} className="p-3 rounded border border-secondary text-start"
              style={{ backgroundColor: '#1e293b', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => {
                const roomMetaChunks = chat.roomId.split('_')
                const inferredTitle = roomMetaChunks[0] ? roomMetaChunks[0].replace(/-/g, ' ') : "Item Chat"
                setActiveChat({ roomId: chat.roomId, itemTitle: inferredTitle })
                setChatMessages([])
                socket.emit('join_room', chat.roomId)

                fetch(`http://localhost:5000/api/messages/${chat.roomId}`)
                  .then(res => res.json())
                  .then(historyLogs => setChatMessages(historyLogs))
                  .catch(err => console.error(err))

                // FIX: If the user is on a mobile phone size screen, close the drawer automatically!
                if (window.innerWidth < 768) {
                  setIsInboxOpen(false);
                }
              }}
            >
              <div className="fw-bold text-truncate text-white mb-1" style={{ fontSize: '0.875rem' }}>
                📦 {chat.roomId.split('_')[0]?.replace(/-/g, ' ') || "Item Inquiry"}
              </div>
              <div className="text-white-50 small text-truncate" style={{ fontSize: '0.75rem' }}>
                <strong>{chat.senderName}:</strong> {chat.lastMessage}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}