"use client";

import { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../../store/slices/itemsSlice";
import { FaSearch, FaWhatsapp, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaUser, FaPhone, FaEnvelope, FaEye } from 'react-icons/fa';
import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "../Pagination/Pagination";
import { CardSkeleton } from "../Skeleton";
import Modal from "../Modal";

// Memoized ItemCard component for better performance
const ItemCard = memo(({ item, onClick }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border card-hover cursor-pointer"
      onClick={() => onClick(item)}
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-100 h-100"
            style={{ 
              objectFit: 'cover',
              transition: 'transform var(--duration-300) var(--ease-out)'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="text-center">
              <FaSearch size={32} className="text-indigo-400 mb-2" />
              <span className="text-sm text-gray-500">No Image Available</span>
            </div>
          </div>
        )}

        {/* Type Badge */}
        <div className="position-absolute top-3 start-3">
          <span
            className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${
              item.type === "lost"
                ? "bg-gradient-to-r from-red-500 to-pink-500"
                : item.type === "found"
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gray-500"
            }`}
          >
            {item.type?.toUpperCase()}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="position-absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 d-flex align-items-center justify-content-center">
          <div className="d-flex align-items-center gap-2 text-white fw-medium">
            <FaEye size={16} />
            View Details
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="fw-semibold text-gray-900 mb-2 text-truncate">
          {item.title}
        </h3>

        {/* Description */}
        <p 
          className="text-muted small mb-3"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {item.description}
        </p>

        {/* Metadata */}
        <div className="d-flex flex-column gap-2">
          <div className="d-flex align-items-center small text-muted">
            <FaUser size={12} className="me-2" />
            <span className="text-truncate">{item.user?.name || "Anonymous"}</span>
          </div>
          
          <div className="d-flex align-items-center small text-muted">
            <FaMapMarkerAlt size={12} className="me-2" />
            <span className="text-truncate">{item.location}</span>
          </div>

          {item.date && (
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center small text-muted">
                <FaCalendarAlt size={12} className="me-2" />
                <span>
                  {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <span className="badge bg-primary bg-opacity-10 text-primary text-capitalize">
                {item.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ItemCard.displayName = 'ItemCard';

export default function Browse() {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector((state) => state.items.list);
  const pagination = useSelector((state) => state.items.pagination);
  const status = useSelector((state) => state.items.status);
  const error = useSelector((state) => state.items.error);

  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("cat") || "all";

  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
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

  // Filter items based on search query and exclude resolved items
  const filteredItems = (items || []).filter(item => {
    if (item.type === "resolved") return false;
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query);
  });

  // Sort filtered items
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
    <div className="container py-5 page-fade-in">
      {/* Header Section */}
      <div className="bg-primary text-white rounded-3 p-4 p-md-5 mb-4 shadow-lg" style={{ background: 'var(--gradient-primary)' }}>
        <div className="text-center">
          <h1 className="display-4 fw-bold mb-3">GAMICA Lost & Found Hub</h1>
          <p className="lead mb-4" style={{ opacity: 0.9 }}>
            A dedicated platform for our campus community to report lost items and return found belongings.
            Every reunion starts here.
          </p>

          {/* Stats Cards */}
          <div className="row g-3 mt-4">
            <div className="col-12 col-md-4">
              <div className="bg-white bg-opacity-10 rounded-3 p-4" style={{ backdropFilter: 'blur(10px)' }}>
                <div className="display-6 fw-bold">{items?.length || 0}</div>
                <div className="small" style={{ opacity: 0.8 }}>Total Items</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="bg-white bg-opacity-10 rounded-3 p-4" style={{ backdropFilter: 'blur(10px)' }}>
                <div className="display-6 fw-bold">
                  {items?.filter(i => i.type === 'found').length || 0}
                </div>
                <div className="small" style={{ opacity: 0.8 }}>Found Items</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="bg-white bg-opacity-10 rounded-3 p-4" style={{ backdropFilter: 'blur(10px)' }}>
                <div className="display-6 fw-bold">
                  {items?.filter(i => i.type === 'lost').length || 0}
                </div>
                <div className="small" style={{ opacity: 0.8 }}>Lost Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-3 p-4 p-md-5 mb-4 shadow-sm border">
        <div className="row g-4">
          {/* Search */}
          <div className="col-12 col-lg-6">
            <label className="form-label fw-medium text-dark">
              <FaSearch className="me-2" />
              Search Items
            </label>
            <div className="position-relative">
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control ps-5 py-3 border-2 rounded-3"
                placeholder="Search items (e.g., iPhone, wallet, keys)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  borderColor: 'var(--color-gray-300)',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium text-dark">
              <FaFilter className="me-2" />
              Item Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-select py-3 border-2 rounded-3"
              style={{ 
                borderColor: 'var(--color-gray-300)',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Items</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium text-dark">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select py-3 border-2 rounded-3"
              style={{ 
                borderColor: 'var(--color-gray-300)',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="stationary">Stationary</option>
              <option value="documents">Documents</option>
              <option value="jewelry">Jewelry</option>
              <option value="clothing">Clothing</option>
              <option value="keys">Keys</option>
              <option value="bags">Bags & Wallets</option>
              <option value="other">Other Items</option>
            </select>
          </div>
        </div>

        {/* Sort and Clear Filters */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mt-4 pt-4 border-top">
          <div className="mb-2 mb-sm-0">
            <label className="form-label fw-medium text-dark mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select border-2 rounded-3"
              style={{ 
                borderColor: 'var(--color-gray-300)',
                minWidth: '150px'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          {(searchQuery || typeFilter !== "all" || categoryFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setCategoryFilter("all");
              }}
              className="btn btn-outline-primary btn-sm fw-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div>
        {/* Loading State */}
        {status === "loading" && (
          <div className="row g-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4 col-xl-3">
                <CardSkeleton />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {status === "failed" && (
          <div className="text-center py-5">
            <div className="display-1 mb-4">❌</div>
            <h3 className="h4 fw-semibold text-dark mb-3">Error Loading Items</h3>
            <p className="text-muted mb-4">{error || "Something went wrong while loading items."}</p>
            <button
              onClick={() => dispatch(fetchItems({ type: typeFilter, category: categoryFilter, page: currentPage, limit: 20 }))}
              className="btn-primary-custom btn-hover-lift"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {status === "succeeded" && sortedItems.length === 0 && (
          <div className="text-center py-5">
            <div className="display-1 mb-4">🔍</div>
            <h3 className="h4 fw-semibold text-dark mb-3">No items found</h3>
            <p className="text-muted mb-4">
              {searchQuery || typeFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search criteria or clear the filters"
                : "No items have been reported yet"}
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button
                onClick={() => router.push("/lost")}
                className="btn-primary-custom btn-hover-lift"
              >
                Report Lost Item
              </button>
              <button
                onClick={() => router.push("/found")}
                className="btn-success-custom btn-hover-lift"
              >
                Report Found Item
              </button>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {status === "succeeded" && sortedItems.length > 0 && (
          <>
            <div className="row g-4">
              {sortedItems.map((item) => (
                <div key={item._id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                  <ItemCard item={item} onClick={handleItemClick} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  loading={status === "loading"}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
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
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white ${
                selectedItem.type === "lost"
                  ? "bg-gradient-to-r from-red-500 to-pink-500"
                  : selectedItem.type === "found"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gray-500"
              }`}
            >
              {selectedItem.type?.toUpperCase()}
            </span>
          </div>

          {/* Item Image */}
          {selectedItem.imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                loading="lazy"
                className="w-100"
                style={{ height: '16rem', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Item Details */}
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="mb-4">
                <h6 className="small fw-semibold text-primary text-uppercase tracking-wide mb-2">
                  Description
                </h6>
                <p className="text-dark">{selectedItem.description}</p>
              </div>

              <div className="mb-4">
                <h6 className="small fw-semibold text-primary text-uppercase tracking-wide mb-2">
                  Location
                </h6>
                <div className="d-flex align-items-center text-dark">
                  <div className="d-flex align-items-center justify-content-center me-3 bg-primary bg-opacity-10 rounded-3" style={{ width: '32px', height: '32px' }}>
                    <FaMapMarkerAlt className="text-primary" size={14} />
                  </div>
                  {selectedItem.location}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="mb-4">
                <h6 className="small fw-semibold text-primary text-uppercase tracking-wide mb-2">
                  Date Reported
                </h6>
                <div className="d-flex align-items-center text-dark">
                  <div className="d-flex align-items-center justify-content-center me-3 bg-primary bg-opacity-10 rounded-3" style={{ width: '32px', height: '32px' }}>
                    <FaCalendarAlt className="text-primary" size={14} />
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
                <h6 className="small fw-semibold text-primary text-uppercase tracking-wide mb-2">
                  Category
                </h6>
                <div className="d-flex align-items-center text-dark">
                  <div className="d-flex align-items-center justify-content-center me-3 bg-primary bg-opacity-10 rounded-3" style={{ width: '32px', height: '32px' }}>
                    <FaTag className="text-primary" size={14} />
                  </div>
                  <span className="text-capitalize">{selectedItem.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-4 p-4 rounded-3 border" style={{ background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-secondary-50) 100%)', borderColor: 'var(--color-primary-200)' }}>
            <h6 className="d-flex align-items-center text-primary fw-semibold mb-4">
              <div className="d-flex align-items-center justify-content-center me-3 bg-primary bg-opacity-10 rounded-3" style={{ width: '32px', height: '32px' }}>
                <FaUser className="text-primary" size={14} />
              </div>
              Contact Information
            </h6>
            
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <p className="small fw-medium text-primary mb-1">Reported By</p>
                <p className="fw-semibold text-dark mb-0">
                  {selectedItem.user?.name || "Anonymous"}
                </p>
              </div>
              
              {selectedItem.user?.email && (
                <div className="col-12 col-md-6">
                  <p className="small fw-medium text-primary mb-1">Email</p>
                  <div className="d-flex align-items-center text-dark">
                    <FaEnvelope className="text-primary me-2" size={14} />
                    {selectedItem.user.email}
                  </div>
                </div>
              )}
              
              {selectedItem.user?.phone && user && user.id !== selectedItem.user._id && (
                <div className="col-12">
                  <p className="small fw-medium text-primary mb-2">Phone</p>
                  <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-3 border" style={{ borderColor: 'var(--color-primary-200)' }}>
                    <div className="d-flex align-items-center text-dark">
                      <FaPhone className="text-primary me-2" size={14} />
                      {selectedItem.user.phone}
                    </div>
                    <button
                      className="btn-success-custom btn-hover-lift d-flex align-items-center gap-2"
                      onClick={() => handleWhatsAppClick(selectedItem.user.phone)}
                    >
                      <FaWhatsapp size={16} />
                      Message
                    </button>
                  </div>
                </div>
              )}
              
              {!selectedItem.user?.phone && user && user.id !== selectedItem.user._id && (
                <div className="col-12">
                  <div className="d-flex align-items-center p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3">
                    <FaPhone className="text-info me-3" size={16} />
                    <span className="text-info small">
                      Contact not available - Please use email to reach out
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}