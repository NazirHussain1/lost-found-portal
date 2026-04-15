"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../../store/slices/itemsSlice";
import { FaSearch, FaWhatsapp, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaUser, FaPhone, FaEnvelope, FaTimes, FaEye } from 'react-icons/fa';
import { useSearchParams, useRouter } from "next/navigation";

export default function Browse() {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector((state) => state.items.list);
  const status = useSelector((state) => state.items.status);

  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("cat") || "all";

  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);


  const checkAuth = async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    dispatch(fetchItems({ type: typeFilter, category: categoryFilter }));
  }, [dispatch, typeFilter, categoryFilter]);

  const filteredItems = items.filter(item => {
    if (item.type === "resolved") return false;
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query);
  });


  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0);
      case "oldest":
        return new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0);
      default:
        return 0;
    }
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  const handleWhatsAppClick = (phone) => {
    if (!user) {
      router.push("/loginPage");
      return;
    }


    const formattedPhone = phone.replace(/\D/g, "");

    const message = encodeURIComponent(`Hello, I Think ${selectedItem.title} belongs to me you posted on lost and found portal`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --primary-color: #667eea;
          --secondary-color: #764ba2;
          --light-primary: rgba(102, 126, 234, 0.1);
          --light-secondary: rgba(118, 75, 162, 0.1);
        }
        
        .glass-effect {
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(102, 126, 234, 0.1);
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.08);
        }
        
        .gradient-bg {
          background: var(--primary-gradient);
          position: relative;
          overflow: hidden;
        }
        
        .gradient-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 2px, transparent 2px);
          background-size: 60px 60px;
          opacity: 0.3;
          animation: float 20s linear infinite;
        }
        
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-50px, -50px) rotate(360deg); }
        }
        
        .card-hover-3d {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: none;
          overflow: hidden;
          background: white;
          border-radius: 20px !important;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .card-hover-3d:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(102, 126, 234, 0.15), 0 15px 30px rgba(118, 75, 162, 0.1) !important;
          border-color: rgba(102, 126, 234, 0.3);
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          transition: all 0.4s ease;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.05);
        }
        
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15) !important;
        }
        
        .type-badge {
          font-weight: 700;
          letter-spacing: 1px;
          padding: 8px 20px;
          border-radius: 25px;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
          font-size: 0.8rem;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }
        
        .image-container {
          position: relative;
          overflow: hidden;
          height: 240px;
          border-radius: 20px 20px 0 0;
        }
        
        .image-container img {
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover-3d:hover .image-container img {
          transform: scale(1.15);
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.3) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .card-hover-3d:hover .image-overlay {
          opacity: 1;
        }
        
        .view-details-btn {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          opacity: 0;
          transition: all 0.4s ease;
          padding: 5px 10px;
          background: var(--primary-gradient);
          color: white;
          border: none;
          border-radius: 15px;
          font-weight: 600;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .card-hover-3d:hover .view-details-btn {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        
        .search-input:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 0.3rem rgba(102, 126, 234, 0.15) !important;
          transform: translateY(-2px);
        }
        
        .form-select, .form-control {
          border-radius: 12px !important;
          border: 2px solid rgba(102, 126, 234, 0.1);
          padding: 12px 16px;
          transition: all 0.3s ease;
        }
        
        .form-select:focus, .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.3rem rgba(102, 126, 234, 0.15) !important;
        }
        
        .filter-label {
          color: var(--secondary-color);
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(102, 126, 234, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }
        
        .modal-content {
          background: white;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(102, 126, 234, 0.3);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .modal-header {
          background: var(--primary-gradient);
          color: white;
          padding: 25px 30px;
          position: relative;
        }
        
        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
        
        .modal-title {
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0;
        }
        
        .modal-body {
          padding: 30px;
        }
        
        .detail-label {
          color: var(--primary-color);
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .detail-value {
          color: #2d3748;
          font-weight: 500;
          font-size: 1.1rem;
          margin-bottom: 20px;
        }
        
        .item-image-modal {
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.1);
          margin-bottom: 25px;
        }
        
        .contact-info {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 15px;
          padding: 20px;
          margin-top: 20px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .loading-shimmer {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .modal-footer {
          padding: 20px 30px;
          border-top: 1px solid rgba(102, 126, 234, 0.1);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .btn {
          padding: 10px 20px;
          border-radius: 25px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #5a6268;
        }
        
        .btn-primary {
          background: var(--primary-gradient);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .text-primary {
          color: var(--primary-color) !important;
        }
        
        .text-gradient {
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .category-icon {
          color: var(--primary-color);
        }
        
        .icon-container {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(102, 126, 234, 0.1);
          color: var(--primary-color);
          margin-right: 12px;
        }
        
        .card-title {
          color: var(--secondary-color) !important;
        }
        
        .card-text {
          color: #5a6c7d !important;
        }
      `}</style>

      <div className="container py-5 fade-in">
        <div className="gradient-bg text-white rounded-4 p-5 mb-5 shadow-lg position-relative overflow-hidden">
          <div className="position-relative z-2">
            <h1 className="display-4 fw-bold mb-3">GAMICA Lost & Found Hub</h1>
            <p className="lead mb-4 opacity-90">
              A dedicated platform for our campus community to report lost items and return found belongings.
              Every reunion starts here.
            </p>

            <div className="d-flex gap-3 flex-wrap">
              <div className="stat-card text-dark rounded-3 p-4 flex-grow-1" style={{ minWidth: '220px' }}>
                <div className="display-5 fw-bold text-gradient mb-1">{items.length}</div>
                <div className="small text-muted fw-medium">Total Items</div>
              </div>
              <div className="stat-card text-dark rounded-3 p-4 flex-grow-1" style={{ minWidth: '220px' }}>
                <div className="display-5 fw-bold text-gradient mb-1">
                  {items.filter(i => i.type === 'found').length}
                </div>
                <div className="small text-muted fw-medium">Found Items</div>
              </div>
              <div className="stat-card text-dark rounded-3 p-4 flex-grow-1 pulse" style={{ minWidth: '220px' }}>
                <div className="display-5 fw-bold text-gradient mb-1">
                  {items.filter(i => i.type === 'lost').length}
                </div>
                <div className="small text-muted fw-medium">Lost Items</div>
              </div>
            </div>
          </div>
        </div>


        <div className="glass-effect rounded-4 p-5 mb-5">
          <div className="row g-4 align-items-end">
            <div className="col-lg-4">
              <label className="filter-label"><FaSearch /> Search Items</label>
              <div className="input-group search-input">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch className="text-primary" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search items (e.g., iPhone, wallet, keys)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-3">
              <label className="filter-label"><FaFilter /> Item Type</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaTag className="text-primary" />
                </span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="form-select border-start-0"
                >
                  <option value="all">All Items</option>
                  <option value="lost">Lost Items</option>
                  <option value="found">Found Items</option>
                </select>
              </div>
            </div>

            <div className="col-lg-3">
              <label className="filter-label">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Categories</option>
                <option value="electronics"> Electronics</option>
                <option value="stationary"> Stationary</option>
                <option value="documents">Documents</option>
                <option value="jewelry">Jewelry</option>
                <option value="clothing"> Clothing</option>
                <option value="keys">Keys</option>
                <option value="bags">Bags & Wallets</option>
                <option value="other">Other Items</option>
              </select>
            </div>

            <div className="col-lg-2">
              <label className="filter-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
              >
                <option value="newest"> Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>


        <div className="fade-in">
          {status === "loading" && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fw-medium">Loading items from database...</p>
            </div>
          )}

          {status === "succeeded" && sortedItems.length === 0 && (
            <div className="text-center py-5">
              <div className="display-1 mb-3 text-muted" style={{ color: 'var(--primary-color)' }}>🔍</div>
              <h4 className="mb-3 fw-bold" style={{ color: 'var(--secondary-color)' }}>No items found</h4>
              <p className="text-muted mb-4">Try adjusting your search criteria or clear the filters</p>
              <button
                className="btn btn-primary px-4 py-3 fw-bold rounded-pill"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setCategoryFilter("all");
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {status === "succeeded" && sortedItems.length > 0 && (
            <div className="row g-4">
              {sortedItems.map((item) => (
                <div
                  key={item._id}
                  className="col-md-6 col-lg-4 col-xl-3"
                  onMouseEnter={() => setHoveredItem(item._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    className="card card-hover-3d h-100 border-0 shadow-sm position-relative"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="image-container">
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-100 h-100 object-cover"
                          />
                          <div className="image-overlay"></div>
                        </>
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
                          <div className="text-center" style={{ color: 'var(--primary-color)' }}>
                            <FaSearch size={40} className="mb-2 opacity-50" />
                            <small className="d-block" style={{ color: 'var(--secondary-color)' }}>No Image Available</small>
                          </div>
                        </div>
                      )}

                      <span className="type-badge position-absolute top-0 start-0 m-2 text-white"
                        style={{
                          fontSize: '0.7rem',
                          padding: '6px 15px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          letterSpacing: '0.5px',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          textTransform: 'uppercase',
                          background: item.type === "lost"
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : item.type === "found"
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}>
                        {item.type === "lost" ? "LOST" : item.type === "found" ? "FOUND" : "RESOLVED"}
                      </span>

                      <button className="view-details-btn">
                        View Details
                      </button>
                    </div>

                    <div className="card-body d-flex flex-column p-4">
                      <h5 className="card-title fw-bold mb-2 line-clamp-1">{item.title}</h5>
                      <p className="card-text small flex-grow-1 mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-2 small" style={{ color: 'var(--secondary-color)' }}>
                          <div className="icon-container">
                            <FaUser size={14} />
                          </div>
                          <span className="fw-medium">{item.user?.name || "Anonymous"}</span>
                        </div>

                        <div className="d-flex align-items-center mb-2 small" style={{ color: 'var(--secondary-color)' }}>
                          <div className="icon-container">
                            <FaMapMarkerAlt size={14} />
                          </div>
                          <span className="text-truncate">{item.location}</span>
                        </div>

                        {item.date && (
                          <div className="d-flex align-items-center mb-2 small" style={{ color: 'var(--secondary-color)' }}>
                            <div className="icon-container">
                              <FaCalendarAlt size={14} />
                            </div>
                            <span>
                              {new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {showModal && selectedItem && (
          <div className="modal-backdrop" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                  <span className="badge px-3 py-2" style={{
                    background: 'var(--primary-gradient)',
                    fontSize: '0.85rem'
                  }}>
                    {selectedItem.type.toUpperCase()}
                  </span>
                </div>
                <h5 className="modal-title w-100 text-center">{selectedItem.title}</h5>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="modal-body">
                {selectedItem.imageUrl && (
                  <div className="item-image-modal">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                      style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <div className="detail-label">Description</div>
                      <div className="detail-value">{selectedItem.description}</div>
                    </div>

                    <div className="mb-4">
                      <div className="detail-label">Location</div>
                      <div className="detail-value">
                        <div className="d-flex align-items-center">
                          <div className="icon-container me-2">
                            <FaMapMarkerAlt />
                          </div>
                          {selectedItem.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-4">
                      <div className="detail-label">Date Reported</div>
                      <div className="detail-value">
                        <div className="d-flex align-items-center">
                          <div className="icon-container me-2">
                            <FaCalendarAlt />
                          </div>
                          {new Date(selectedItem.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="detail-label">Category</div>
                      <div className="detail-value text-capitalize">
                        <div className="d-flex align-items-center">
                          <div className="icon-container me-2">
                            <FaTag />
                          </div>
                          {selectedItem.category}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <div className="contact-info">
                  <h6 className="mb-3 fw-bold" style={{ color: 'var(--primary-color)' }}>
                    <div className="d-flex align-items-center">
                      <div className="icon-container me-2">
                        <FaUser />
                      </div>
                      Contact Information
                    </div>
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="detail-label">Reported By</div>
                      <div className="detail-value fw-bold" style={{ color: 'var(--secondary-color)' }}>
                        {selectedItem.user?.name || "Anonymous"}
                      </div>
                    </div>
                    {selectedItem.user?.email && (
                      <div className="col-md-6 mb-3">
                        <div className="detail-label">Email</div>
                        <div className="detail-value">
                          <div className="d-flex align-items-center">
                            <div className="icon-container me-2">
                              <FaEnvelope />
                            </div>
                            {selectedItem.user.email}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedItem.user?.phone && user && user.id !== selectedItem.user._id && (
                      <div className="col-md-6 mb-3">
                        <div className="detail-label">Phone</div>
                        <div className="detail-value d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="icon-container me-2">
                              <FaPhone />
                            </div>
                            {selectedItem.user.phone}
                          </div>
                          <button
                            className="btn btn-success btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleWhatsAppClick(selectedItem.user.phone)}
                          >
                            <FaWhatsapp /> Message
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
