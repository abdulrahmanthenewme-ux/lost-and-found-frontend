import React from 'react';

export default function ChatBox({ activeChat, setActiveChat, chatMessages, user, typedMessage, setTypedMessage, handleSendChatText, messagesEndRef }) {
  if (!activeChat) return null;

  // Detect mobile sizing for layout overrides
  const isMobile = window.innerWidth < 768;

  return (
    <div 
      className="position-fixed shadow-lg d-flex flex-column border border-secondary transition-all" 
      style={{ 
        backgroundColor: '#1e293b', 
        zIndex: 1080,
        /* RESPONSIVE LAYOUT CALCULATION:
           If mobile, stick perfectly to the bottom edges and expand upwards.
           If desktop, float beautifully in the corner.
        */
        bottom: isMobile ? '0' : '0',
        right: isMobile ? '0' : '0',
        margin: isMobile ? '0' : '1.5rem', // Eliminates margins on mobile screen viewports
        width: isMobile ? '100vw' : '360px',
        height: isMobile ? '75vh' : '420px',
        borderRadius: isMobile ? '20px 20px 0 0' : '16px 16px 0 0' // Nice curved top lip on phone views
      }}
    >
      {/* HEADER SECTION */}
      <div className="p-3 d-flex justify-content-between align-items-center bg-dark text-white rounded-top-4" style={{ borderBottom: '1px solid #334155' }}>
        <div className="overflow-hidden d-flex align-items-center gap-2">
          {/* Back Arrow indicator explicitly helpful on mobile view strings */}
          {isMobile && (
            <button 
              className="btn text-white-50 p-0 me-1 border-0 bg-transparent fs-5"
              onClick={() => setActiveChat(null)}
              type="button"
            >
              ←
            </button>
          )}
          <div className="overflow-hidden">
            <div className="fw-bold text-truncate text-white" style={{ fontSize: '0.95rem' }}>
              💬 {activeChat.itemTitle}
            </div>
            <div className="small text-success fw-medium" style={{ fontSize: '0.75rem' }}>● Connected</div>
          </div>
        </div>
        
        {/* Close Button - Acts as another way to dismiss on desktop */}
        <button className="btn text-white-50 p-0 h4 m-0 border-0 bg-transparent" onClick={() => setActiveChat(null)}>×</button>
      </div>

      {/* CHAT MESSAGES BODY STREAM AREA */}
      <div className="p-3 flex-grow-1 overflow-y-auto d-flex flex-column gap-2" style={{ backgroundColor: '#0f172a' }}>
        {chatMessages.length === 0 ? (
          <div className="text-center my-auto text-white-50 small px-3">No messages yet. Send a note to coordinate item recovery!</div>
        ) : (
          chatMessages.map((msg, index) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={index} className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                <span className="text-white-50 mb-1" style={{ fontSize: '0.70rem' }}>{isMe ? 'You' : msg.senderName}</span>
                <div className="p-2 px-3 text-wrap text-white" style={{ maxWidth: '80%', borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0', backgroundColor: isMe ? '#6366f1' : '#334155', fontSize: '0.875rem' }}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT FORM FIELD FOOTER ROW */}
      <form onSubmit={handleSendChatText} className="p-2 bg-dark d-flex gap-2 align-items-center" style={{ borderTop: '1px solid #334155', paddingBottom: isMobile ? 'calc(10px + env(safe-area-inset-bottom))' : '8px' }}>
        <input type="text" className="form-control border-secondary text-white bg-dark shadow-none px-3" style={{ fontSize: '0.85rem', backgroundColor: '#0f172a', borderColor: '#334155' }} placeholder="Type your message..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} required />
        <button type="submit" className="btn btn-sm text-white border-0 fw-bold px-3 py-2" style={{ backgroundColor: '#6366f1', borderRadius: '8px' }}>Send</button>
      </form>
    </div>
  );
}