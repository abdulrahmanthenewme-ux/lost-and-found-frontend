import React from 'react';

export default function ItemCard({ 
  itemCard, 
  user, 
  handleInitiateChatConnectionBox, 
  handleDeleteItemListing,
  setEditingItem 
}) {
  const isOwnedByCurrentUser = user && itemCard.userId === user.id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="col">
      <div 
        className="card h-100 bg-dark text-light border-secondary shadow-sm overflow-hidden rounded-4" 
        style={{ 
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'default'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {itemCard.image ? (
          <div style={{ height: '200px', overflow: 'hidden', position: 'relative', backgroundColor: '#1e293b' }}>
           <img 
  src={`http://localhost:5000/${itemCard.image}`} 
  className="w-100 h-100" 
  alt={itemCard.title} 
  style={{ objectFit: 'contain', maxHeight: '200px' }} 
/>
            <span className={`position-absolute top-0 end-0 m-3 badge px-3 py-1.5 rounded-pill fw-bold ${itemCard.status === 'Lost' ? 'bg-danger' : 'bg-success'}`}>
              {itemCard.status.toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: '200px', backgroundColor: '#1e293b', position: 'relative' }}>
            <span className="small text-white-50">No Image Provided</span>
            <span className={`position-absolute top-0 end-0 m-3 badge px-3 py-1.5 rounded-pill fw-bold ${itemCard.status === 'Lost' ? 'bg-danger' : 'bg-success'}`}>
              {itemCard.status.toUpperCase()}
            </span>
          </div>
        )}

        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title fw-bold text-white text-truncate m-0" style={{ maxWidth: '75%' }}>{itemCard.title}</h5>
            <span className="text-muted small fw-medium text-nowrap">{itemCard.date}</span>
          </div>

          <p className="card-text text-white-50 small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {itemCard.description}
          </p>

          <div className="p-3 bg-opacity-10 rounded-3 mb-4 d-flex flex-column gap-2 border border-secondary" style={{ backgroundColor: '#1e293b', fontSize: '0.825rem' }}>
            <div className="text-white-50 text-truncate">
              <strong className="text-white fw-semibold">📍 Location:</strong>{" "}
              <span className="text-light">{itemCard.location}</span>
            </div>
            <div className="text-white-50 text-truncate">
              <strong className="text-white fw-semibold">📞 Contact Email:</strong>{" "}
              <span className="text-light">{itemCard.contact}</span>
            </div>
          </div>

          <div className="d-flex gap-2 mt-auto">
            {/* 🛡️ CONDITION OVERRIDE: Show management actions if user owns it OR is an administrator */}
            {isOwnedByCurrentUser || isAdmin ? (
              <>
                <button 
                  className="btn btn-outline-warning btn-sm w-50 py-2 fw-semibold rounded-3 text-warning border-warning"
                  onClick={() => setEditingItem(itemCard)}
                >
                  ✏️ Edit {isAdmin && !isOwnedByCurrentUser && '(Admin)'}
                </button>
                <button 
                  className="btn btn-outline-danger btn-sm w-50 py-2 fw-semibold rounded-3" 
                  onClick={() => handleDeleteItemListing(itemCard._id)}
                >
                  🗑️ Delete
                </button>
              </>
            ) : (
              /* Regular user browsing another person's card listing */
              <button className="btn btn-primary btn-sm w-100 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#6366f1', border: 'none' }} onClick={() => handleInitiateChatConnectionBox(itemCard)}>
                💬 Contact Listing Owner
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}