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
      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onClick(item)}
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
    <div className="container py-5">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">GAMICA Lost & Found Hub</h1>
          <p className="text-lg opacity-90 mb-4">
            A dedicated platform for our campus community to report lost items and return found belongings.
            Every reunion starts here.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{items?.length || 0}</div>
              <div className="text-sm opacity-80">Total Items</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {items?.filter(i => i.type === 'found').length || 0}
              </div>
              <div className="text-sm opacity-80">Found Items</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {items?.filter(i => i.type === 'lost').length || 0}
              </div>
              <div className="text-sm opacity-80">Lost Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Search Items
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search items (e.g., iPhone, wallet, keys)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFilter className="inline mr-2" />
              Item Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Items</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-4 border-t">
          <div className="mb-2 sm:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Items</h3>
            <p className="text-gray-600 mb-4">{error || "Something went wrong while loading items."}</p>
            <button
              onClick={() => dispatch(fetchItems({ type: typeFilter, category: categoryFilter, page: currentPage, limit: 20 }))}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {status === "succeeded" && sortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || typeFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search criteria or clear the filters"
                : "No items have been reported yet"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/lost")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Report Lost Item
              </button>
              <button
                onClick={() => router.push("/found")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
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
    </div>
  );
}