"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../../store/slices/itemsSlice";
import { FaSearch, FaWhatsapp, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaUser, FaPhone, FaEnvelope, FaTimes, FaEye } from 'react-icons/fa';
import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "../Pagination/Pagination";
import { CardSkeleton } from "../Skeleton";
import Modal from "../Modal";

export default function Browse() {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector((state) => state.items.list);
  const pagination = useSelector((state) => state.items.pagination);
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
  const [currentPage, setCurrentPage] = useState(1);

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
    dispatch(fetchItems({ 
      type: typeFilter, 
      category: categoryFilter,
      page: currentPage,
      limit: 20
    }));
  }, [dispatch, typeFilter, categoryFilter, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleWhatsAppClick = (phone) => {
    if (!user) {
      router.push("/loginPage");
      return;
    }

    const formattedPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Hi, I found your item titled '${selectedItem.title}' on Lost & Found Portal. Is it still available?`);
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
            <div className="row g-4">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="col-md-6 col-lg-4 col-xl-3">
                  <CardSkeleton />
                </div>
              ))}
            </div>
          )}

          {status === "succeeded" && sortedItems.length === 0 && (
            <div className="text-center py-5">
              <div className="display-1 mb-3 text-muted" style={{ color: 'var(--primary-color)' }}>🔍</div>
              <h4 className="mb-3 fw-bold" style={{ color: 'var(--secondary-color)' }}>No items found</h4>
              <p className="text-muted mb-4">Try adjusting your search criteria or clear the filters</p>
              <button
                className="btn-primary-custom px-4 py-3 fw-bold rounded-pill"
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
                    className="card-custom h-100 position-relative cursor-pointer"
                    onClick={() => handleItemClick(item)}
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      borderRadius: 'var(--radius-xl)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-gray-200)',
                      background: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                      e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.borderColor = 'var(--color-gray-200)';
                    }}
                  >
                    {/* Image Container with Fixed Aspect Ratio */}
                    <div 
                      className="position-relative overflow-hidden"
                      style={{ 
                        aspectRatio: '16/9',
                        background: 'var(--color-gray-100)'
                      }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-100 h-100"
                          style={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{ 
                            background: 'linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-secondary-100) 100%)'
                          }}>
                          <div className="text-center">
                            <FaSearch size={32} className="mb-2" style={{ color: 'var(--color-primary-400)' }} />
                            <small className="d-block text-muted">No Image Available</small>
                          </div>
                        </div>
                      )}

                      {/* Type Badge */}
                      <span 
                        className="badge-custom badge-primary position-absolute top-0 start-0 m-3"
                        style={{
                          background: item.type === "lost" 
                            ? 'var(--gradient-primary)' 
                            : item.type === "found" 
                              ? 'var(--gradient-success)' 
                              : 'var(--color-gray-500)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          boxShadow: 'var(--shadow-md)'
                        }}
                      >
                        {item.type === "lost" ? "LOST" : item.type === "found" ? "FOUND" : "RESOLVED"}
                      </span>

                      {/* Hover Overlay */}
                      <div 
                        className="position-absolute inset-0 d-flex align-items-center justify-content-center"
                        style={{
                          background: 'rgba(102, 126, 234, 0.9)',
                          opacity: '0',
                          transition: 'opacity 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '0';
                        }}
                      >
                        <button 
                          className="btn-primary-custom btn-sm d-flex align-items-center gap-2"
                          style={{ pointerEvents: 'none' }}
                        >
                          <FaEye size={14} />
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="card-body-custom d-flex flex-column" style={{ padding: 'var(--spacing-4)' }}>
                      {/* Title */}
                      <h5 
                        className="fw-bold mb-2"
                        style={{ 
                          color: 'var(--color-gray-900)',
                          fontSize: 'var(--font-size-lg)',
                          lineHeight: 'var(--line-height-tight)',
                          display: '-webkit-box',
                          WebkitLineClamp: '1',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.title}
                      </h5>

                      {/* Description */}
                      <p 
                        className="text-muted mb-3 flex-grow-1"
                        style={{ 
                          fontSize: 'var(--font-size-sm)',
                          lineHeight: 'var(--line-height-relaxed)',
                          display: '-webkit-box',
                          WebkitLineClamp: '2',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.description}
                      </p>

                      {/* Metadata */}
                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-2">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '24px', 
                              height: '24px', 
                              background: 'var(--color-primary-100)',
                              color: 'var(--color-primary-600)'
                            }}
                          >
                            <FaUser size={10} />
                          </div>
                          <span 
                            className="fw-medium text-truncate"
                            style={{ 
                              fontSize: 'var(--font-size-sm)',
                              color: 'var(--color-gray-700)'
                            }}
                          >
                            {item.user?.name || "Anonymous"}
                          </span>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '24px', 
                              height: '24px', 
                              background: 'var(--color-primary-100)',
                              color: 'var(--color-primary-600)'
                            }}
                          >
                            <FaMapMarkerAlt size={10} />
                          </div>
                          <span 
                            className="text-truncate"
                            style={{ 
                              fontSize: 'var(--font-size-sm)',
                              color: 'var(--color-gray-600)'
                            }}
                          >
                            {item.location}
                          </span>
                        </div>

                        {item.date && (
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{ 
                                  width: '24px', 
                                  height: '24px', 
                                  background: 'var(--color-primary-100)',
                                  color: 'var(--color-primary-600)'
                                }}
                              >
                                <FaCalendarAlt size={10} />
                              </div>
                              <span 
                                style={{ 
                                  fontSize: 'var(--font-size-sm)',
                                  color: 'var(--color-gray-600)'
                                }}
                              >
                                {new Date(item.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <span 
                              className="badge-custom"
                              style={{
                                background: 'var(--color-primary-100)',
                                color: 'var(--color-primary-700)',
                                fontSize: '0.625rem',
                                textTransform: 'capitalize'
                              }}
                            >
                              {item.category}
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
          <Modal
            isOpen={showModal}
            onClose={handleCloseModal}
            title={selectedItem.title}
            size="lg"
            ariaLabel="Item details"
          >
            {/* Item Badge */}
            <div className="mb-4">
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  background: selectedItem.type === "lost" 
                    ? 'var(--gradient-primary)' 
                    : selectedItem.type === "found" 
                      ? 'var(--gradient-success)' 
                      : 'var(--color-gray-500)',
                  color: 'white'
                }}
              >
                {selectedItem.type?.toUpperCase()}
              </span>
            </div>

            {/* Item Image */}
            {selectedItem.imageUrl && (
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <h6 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Description
                  </h6>
                  <p className="text-gray-700">{selectedItem.description}</p>
                </div>

                <div className="mb-4">
                  <h6 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Location
                  </h6>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <FaMapMarkerAlt className="text-indigo-600" size={14} />
                    </div>
                    {selectedItem.location}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <h6 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Date Reported
                  </h6>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <FaCalendarAlt className="text-indigo-600" size={14} />
                    </div>
                    {new Date(selectedItem.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Category
                  </h6>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <FaTag className="text-indigo-600" size={14} />
                    </div>
                    <span className="capitalize">{selectedItem.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <h6 className="flex items-center text-indigo-700 font-semibold mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <FaUser className="text-indigo-600" size={14} />
                </div>
                Contact Information
              </h6>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-indigo-600 mb-1">Reported By</p>
                  <p className="font-semibold text-purple-700">
                    {selectedItem.user?.name || "Anonymous"}
                  </p>
                </div>
                
                {selectedItem.user?.email && (
                  <div>
                    <p className="text-sm font-medium text-indigo-600 mb-1">Email</p>
                    <div className="flex items-center text-gray-700">
                      <FaEnvelope className="text-indigo-500 mr-2" size={14} />
                      {selectedItem.user.email}
                    </div>
                  </div>
                )}
                
                {selectedItem.user?.phone && user && user.id !== selectedItem.user._id && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-indigo-600 mb-2">Phone</p>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="flex items-center text-gray-700">
                        <FaPhone className="text-indigo-500 mr-2" size={14} />
                        {selectedItem.user.phone}
                      </div>
                      <button
                        className="btn-success-custom btn-sm flex items-center gap-2"
                        onClick={() => handleWhatsAppClick(selectedItem.user.phone)}
                      >
                        <FaWhatsapp size={16} />
                        Message
                      </button>
                    </div>
                  </div>
                )}
                
                {!selectedItem.user?.phone && user && user.id !== selectedItem.user._id && (
                  <div className="md:col-span-2">
                    <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <FaPhone className="text-blue-500 mr-3" size={16} />
                      <span className="text-blue-700 text-sm">
                        Contact not available - Please use email to reach out
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Pagination */}
        {status === "succeeded" && sortedItems.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={status === "loading"}
          />
        )}
      </div>
    </>
  );
}
