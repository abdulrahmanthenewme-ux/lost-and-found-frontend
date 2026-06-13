import React, { useEffect } from 'react';
import ItemCard from './ItemCard';

export default function Dashboard({ 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus, 
  filteredCollectionDataset, 
  user, 
  handleInitiateChatConnectionBox, 
  handleDeleteItemListing, 
  setEditingItem
}) {

  // DEBUG: This will show you exactly what is inside the array when it renders
  useEffect(() => {
    console.log("Dashboard received filteredCollectionDataset:", filteredCollectionDataset);
  }, [filteredCollectionDataset]);

  return (
    <div>
      {/* Top Search Controls */}
      <div className="row g-3 align-items-center mb-5 pb-4 border-bottom border-secondary-subtle">
        <div className="col-12 col-md-6">
          <h2 className="fw-bold m-0 text-white tracking-tight">Recent Items Activity</h2>
          <p className="text-white-50 small m-0 mt-1">Browse or search recently reported lost and found items close to you.</p>
        </div>
        
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-md-end gap-3 flex-wrap flex-sm-nowrap">
          <div className="position-relative w-100" style={{ maxWidth: '320px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" style={{ pointerEvents: 'none', fontSize: '0.9rem' }}>🔍</span>
            <input 
              type="text" 
              className="form-control text-white border-secondary-subtle shadow-none shadow-sm"
              placeholder="Search title, description, location..."
              style={{ backgroundColor: '#1e293b', paddingLeft: '42px', paddingRight: '35px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '10px', fontSize: '0.9rem', borderColor: '#334155' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center p-1 rounded-3 bg-dark shadow-sm" style={{ border: '1px solid #334155', backgroundColor: '#0f172a', height: '42px' }}>
            {['All', 'Lost', 'Found'].map((statusOption) => {
              const isActive = filterStatus === statusOption;
              return (
                <button 
                  type="button" key={statusOption}
                  className="btn btn-sm px-3 h-100 rounded-2 fw-semibold border-0"
                  style={{ fontSize: '0.875rem', backgroundColor: isActive ? '#6366f1' : 'transparent', color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', transition: 'all 0.15s ease-in-out' }}
                  onClick={() => setFilterStatus(statusOption)}
                >
                  {statusOption === 'All' ? 'All Items' : statusOption}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Dataset Validation Logic Output */}
      {(!filteredCollectionDataset || filteredCollectionDataset.length === 0) ? (
        <div className="text-center p-5 rounded-4 border border-secondary bg-dark text-muted my-4">
          No reported items match your search criteria.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredCollectionDataset.map((itemCard) => (
            <ItemCard 
              key={itemCard._id}
              itemCard={itemCard}
              user={user}
              handleInitiateChatConnectionBox={handleInitiateChatConnectionBox}
              handleDeleteItemListing={handleDeleteItemListing}
              setEditingItem={setEditingItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}