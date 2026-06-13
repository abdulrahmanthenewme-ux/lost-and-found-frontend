import React, { useState } from 'react';

export default function EditItemModal({ item, onClose, onSave }) {
  const [title, setTitle] = useState(item.title);
  const [status, setStatus] = useState(item.status);
  const [location, setLocation] = useState(item.location);
  const [description, setDescription] = useState(item.description);
  const [contact, setContact] = useState(item.contact);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.image ? `http://localhost:5000/${item.image.replace(/\\/g, '/')}` : null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData to handle text fields AND the image file simultaneously
    const formData = new FormData();
    formData.append('title', title);
    formData.append('status', status);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('contact', contact);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    // Pass the formData object to the parent
    const id = item?._id || item?.id;

if (!id) {
  console.error("EditItemModal: Missing item ID", item);
  return;
}

onSave(e, formData, id);
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000 }}>
      <div className="card text-light p-4 shadow-lg rounded-4 border-secondary w-100 m-3" style={{ backgroundColor: '#1e293b', maxWidth: '500px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold text-white m-0">Edit Listing Details</h4>
          <button className="btn text-white-50 p-0 fs-4 bg-transparent border-0" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {/* Inputs remain the same as your original code */}
          <div className="row g-2">
            <div className="col-8">
              <label className="form-label text-white-50 small mb-1">Item Title</label>
              <input type="text" className="form-control text-white border-secondary" style={{ backgroundColor: '#0f172a' }} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="col-4">
              <label className="form-label text-white-50 small mb-1">Status</label>
              <select className="form-select text-white border-secondary" style={{ backgroundColor: '#0f172a' }} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label text-white-50 small mb-1">Location</label>
            <input type="text" className="form-control text-white border-secondary" style={{ backgroundColor: '#0f172a' }} value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div>
            <label className="form-label text-white-50 small mb-1">Item Description</label>
            <textarea className="form-control text-white border-secondary" style={{ backgroundColor: '#0f172a' }} rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <label className="form-label text-white-50 small mb-1">Contact Information</label>
            <input type="text" className="form-control text-white border-secondary" style={{ backgroundColor: '#0f172a' }} value={contact} onChange={(e) => setContact(e.target.value)} required />
          </div>
          <div>
            <label className="form-label text-white-50 small mb-1">Item Image</label>
            <input type="file" accept="image/*" className="form-control text-white border-secondary mb-2" style={{ backgroundColor: '#0f172a' }} onChange={handleImageChange} />
            {imagePreview && (
              <div className="text-center mt-2 p-2 border border-secondary rounded" style={{ backgroundColor: '#0f172a' }}>
                <img src={imagePreview} alt="Preview" className="img-fluid rounded" style={{ maxHeight: '120px', objectFit: 'contain' }} />
              </div>
            )}
          </div>
          <div className="d-flex gap-2 mt-2">
            <button type="button" className="btn btn-outline-secondary text-white w-50 rounded-3" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary w-50 fw-bold rounded-3" style={{ backgroundColor: '#6366f1', border: 'none' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}