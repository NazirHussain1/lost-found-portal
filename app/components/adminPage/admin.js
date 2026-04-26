"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchAdminItems, deleteItemAdmin, resolveItemAdmin } from "@/app/store/slices/itemsSlice";
import {
  FaSearch,
 
  FaEye,
  FaCheckCircle,
  FaTrash,
 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaSync,
  FaShieldAlt,
  FaDatabase,
  FaBell,
  FaHistory
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { CardSkeleton, StatCardSkeleton } from "../Skeleton";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector((state) => state.items.list);
  const status = useSelector((state) => state.items.status);
  const error = useSelector((state) => state.items.error);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

 
  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          window.location.href = "/loginPage";
          return;
        }
        
        const userData = await res.json();
        setUser(userData);
        
        
        if (userData.role !== "admin" && !userData.isAdmin) {
          toast.error("Admin access required");
          router.push("/");
          return;
        }
        
       
        dispatch(fetchAdminItems());
        
      } catch (err) {
        toast.error("Authentication failed");
        window.location.href = "/loginPage";
      } finally {
        setLoading(false);
      }
    }

    checkAdminAuth();
  }, [dispatch, router]);

  const filteredItems = items.filter(item => {
    if (searchQuery && !item.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (activeTab !== "all" && item.type !== activeTab) return false;
    return true;
  }).sort((a, b) => {
    switch(sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      default:
        return 0;
    }
  });

  const stats = {
    total: items.length,
    lost: items.filter(item => item.type === "lost").length,
    found: items.filter(item => item.type === "found").length,
    resolved: items.filter(item => item.type === "resolved").length,
    active: items.filter(item => item.type !== "resolved").length,
    recent: items.filter(item => {
      const itemDate = new Date(item.createdAt || item.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate > weekAgo;
    }).length,
  };

  const handleResolve = async (itemId) => {
    setActionLoading(itemId);
    try {
      await dispatch(resolveItemAdmin(itemId));
      toast.success("Item marked as resolved!", {
        style: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white" },
      });
    } catch (err) {
      toast.error("Failed to resolve item", {
        style: { background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", color: "white" },
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (itemId) => {
    setActionLoading(itemId);
    try {
      await dispatch(deleteItemAdmin(itemId));
      toast.success("Item deleted successfully!", {
        style: { background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", color: "white" },
      });
      setDeleteConfirm(null);
    } catch (err) {
      toast.error("Failed to delete item", {
        style: { background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", color: "white" },
      });
    } finally {
      setActionLoading(null);
    }
  };

  
  const openItemModal = (item) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  const openDeleteModal = (item) => {
    setDeleteConfirm(item);
    document.body.style.overflow = 'hidden';
  };

  const closeDeleteModal = () => {
    setDeleteConfirm(null);
    document.body.style.overflow = 'auto';
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "lost": return { bg: "#667eea", light: "rgba(102, 126, 234, 0.1)", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" };
      case "found": return { bg: "#10b981", light: "rgba(16, 185, 129, 0.1)", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" };
      case "resolved": return { bg: "#6b7280", light: "rgba(107, 114, 128, 0.1)", gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" };
      default: return { bg: "#667eea", light: "rgba(102, 126, 234, 0.1)", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" };
    }
  };

  // Loading states
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#667eea" }}
            role="status"
          >
            <span className="visually-hidden">Checking admin permissions...</span>
          </div>
          <p className="mt-3" style={{ color: "#764ba2" }}>
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="container py-5">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 mb-5 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-white/20 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="row g-4 mb-5">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="col-md-4 col-lg-2">
              <StatCardSkeleton />
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white border rounded-3 p-4 mb-4 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-md-3">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="col-md-3">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Items Grid Skeleton */}
        <div className="row g-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <CardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <FaExclamationTriangle size={64} style={{ color: "#ef4444" }} className="mb-3" />
          <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>Error Loading Dashboard</h3>
          <p className="mb-4" style={{ color: "#764ba2" }}>{error || "An error occurred"}</p>
          <button
            className="btn-primary-custom px-4 py-2 rounded-pill fw-bold text-white"
            onClick={() => dispatch(fetchAdminItems())}
          >
            <FaSync className="me-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
     
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px"
      }} className="text-white rounded-4 p-5 mb-5 shadow-lg">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-white rounded-circle p-3 me-3">
                <FaShieldAlt size={24} style={{ color: "#667eea" }} />
              </div>
              <div>
                <h1 className="display-5 fw-bold mb-1">Admin Dashboard</h1>
                <p className="lead opacity-90 mb-0 d-flex align-items-center">
                  <FaDatabase className="me-2" />
                  Welcome, {user?.name} • Managing {items.length} items
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 text-md-end">
            <button
              className="btn-primary-custom btn-lg px-4 py-2 rounded-pill fw-bold d-inline-flex align-items-center"
              onClick={() => dispatch(fetchAdminItems())}
            >
              <FaSync className="me-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

    
      <div className="row g-4 mb-5">
        {[
          { title: "Total Items", value: stats.total, color: "#667eea", icon: <FaBoxOpen />, bg: "rgba(102, 126, 234, 0.1)" },
          { title: "Lost Items", value: stats.lost, color: "#667eea", icon: <FaExclamationTriangle />, bg: "rgba(102, 126, 234, 0.1)" },
          { title: "Found Items", value: stats.found, color: "#10b981", icon: <FaCheckCircle />, bg: "rgba(16, 185, 129, 0.1)" },
          { title: "Resolved", value: stats.resolved, color: "#10b981", icon: <FaCheck />, bg: "rgba(16, 185, 129, 0.1)" },
          { title: "Active", value: stats.active, color: "#667eea", icon: <FaBell />, bg: "rgba(102, 126, 234, 0.1)" },
          { title: "This Week", value: stats.recent, color: "#764ba2", icon: <FaHistory />, bg: "rgba(118, 75, 162, 0.1)" }
        ].map((stat, index) => (
          <div key={index} className="col-md-4 col-lg-2">
            <div className="bg-white border rounded-3 p-3 shadow-sm h-100">
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
                style={{ backgroundColor: stat.bg }}
              >
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>
              <div className="display-6 fw-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="small text-muted">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      
      <div className="bg-white border rounded-3 p-4 mb-4 shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch style={{ color: "#667eea" }} />
              </span>
              <input
                type="text"
                className="input-custom border-start-0"
                placeholder="Search items by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="select-custom"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="select-custom"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

       
        <div className="d-flex flex-wrap gap-2 mt-3">
          {["all", "lost", "found", "resolved"].map((tab) => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? '' : 'btn-outline-'}primary px-3 py-2 rounded-pill`}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
                color: activeTab === tab ? "white" : "#667eea",
                border: activeTab === tab ? "2px solid transparent" : "2px solid #667eea",
              }}
            >
              {tab === "all" ? "All Items" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

     
      {filteredItems.length === 0 ? (
        <div className="text-center py-5 my-4">
          <FaBoxOpen size={80} style={{ color: "#667eea", opacity: 0.5 }} className="mb-3" />
          <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>No items found</h3>
          <p className="mb-4" style={{ color: "#764ba2" }}>
            {searchQuery || activeTab !== "all"
              ? "Try adjusting your filters or search"
              : "No items have been reported yet"}
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredItems.map((item) => {
            const typeColor = getTypeColor(item.type);
            return (
              <div key={item._id} className="col-md-6 col-lg-4">
                <div 
                  className="card-custom h-100 position-relative"
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
                    <img
                      src={item.imageUrl || "/placeholder.jpg"}
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

                    {/* Type Badge */}
                    <span
                      className="badge-custom position-absolute top-0 start-0 m-3"
                      style={{ 
                        background: typeColor.gradient,
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
                      {item.type?.toUpperCase()}
                    </span>
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

                    {/* User Info */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-2"
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}
                        >
                          {item.user?.name?.charAt(0) || "A"}
                        </div>
                        <div className="flex-grow-1">
                          <div 
                            className="fw-medium"
                            style={{ 
                              color: 'var(--color-gray-900)',
                              fontSize: 'var(--font-size-sm)'
                            }}
                          >
                            {item.user?.name || "Anonymous"}
                          </div>
                          <small className="text-muted">
                            {item.user?.email || "No email"}
                          </small>
                        </div>
                      </div>

                      {/* Location and Date */}
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              background: 'var(--color-primary-100)',
                              color: 'var(--color-primary-600)'
                            }}
                          >
                            <FaMapMarkerAlt size={8} />
                          </div>
                          <span 
                            className="text-truncate"
                            style={{ 
                              maxWidth: '100px',
                              fontSize: 'var(--font-size-sm)',
                              color: 'var(--color-gray-600)'
                            }}
                          >
                            {item.location || "Unknown"}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              background: 'var(--color-primary-100)',
                              color: 'var(--color-primary-600)'
                            }}
                          >
                            <FaCalendarAlt size={8} />
                          </div>
                          <span 
                            style={{ 
                              fontSize: 'var(--font-size-sm)',
                              color: 'var(--color-gray-600)'
                            }}
                          >
                            {new Date(item.createdAt || item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                      <span 
                        className="badge-custom"
                        style={{
                          background: 'var(--color-primary-100)',
                          color: 'var(--color-primary-700)',
                          fontSize: '0.625rem',
                          textTransform: 'capitalize'
                        }}
                      >
                        {item.category || "Uncategorized"}
                      </span>
                      
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          style={{
                            width: '32px',
                            height: '32px',
                            background: item.type === "resolved" 
                              ? 'var(--color-gray-400)' 
                              : 'var(--color-success-100)',
                            color: item.type === "resolved" 
                              ? 'white' 
                              : 'var(--color-success-600)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            transition: 'var(--transition-base)'
                          }}
                          onClick={() => handleResolve(item._id)}
                          disabled={actionLoading === item._id || item.type === "resolved"}
                          title={item.type === "resolved" ? "Already Resolved" : "Mark as Resolved"}
                          onMouseEnter={(e) => {
                            if (item.type !== "resolved") {
                              e.target.style.background = 'var(--color-success-200)';
                              e.target.style.transform = 'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (item.type !== "resolved") {
                              e.target.style.background = 'var(--color-success-100)';
                              e.target.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          {actionLoading === item._id ? (
                            <span className="spinner-custom spinner-sm"></span>
                          ) : item.type === "resolved" ? (
                            <FaCheck />
                          ) : (
                            <FaCheckCircle />
                          )}
                        </button>
                        
                        <button
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          style={{
                            width: '32px',
                            height: '32px',
                            background: 'var(--color-error-100)',
                            color: 'var(--color-error-600)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            transition: 'var(--transition-base)'
                          }}
                          onClick={() => openDeleteModal(item)}
                          disabled={actionLoading === item._id}
                          title="Delete Item"
                          onMouseEnter={(e) => {
                            e.target.style.background = 'var(--color-error-200)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'var(--color-error-100)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <FaTrash />
                        </button>

                        <button
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          style={{
                            width: '32px',
                            height: '32px',
                            background: 'var(--color-primary-100)',
                            color: 'var(--color-primary-600)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            transition: 'var(--transition-base)'
                          }}
                          onClick={() => openItemModal(item)}
                          title="View Details"
                          onMouseEnter={(e) => {
                            e.target.style.background = 'var(--color-primary-200)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'var(--color-primary-100)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

     
      {selectedItem && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            overflow: "auto",
            padding: "20px"
          }}
          onClick={closeItemModal}
        >
          <div 
            className="bg-white rounded-3 shadow-lg"
            style={{ 
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="text-white rounded-top-3 p-4"
              style={{ background: getTypeColor(selectedItem.type).gradient }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Item Details</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle"
                  onClick={closeItemModal}
                  style={{ width: "32px", height: "32px" }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-4" style={{ overflowY: "auto", flex: "1" }}>
              <div className="text-center mb-4">
                <img
                  src={selectedItem.imageUrl || "/placeholder.jpg"}
                  alt={selectedItem.title}
                  className="img-fluid rounded"
                  style={{ maxHeight: "200px" }}
                />
              </div>
              <h6 style={{ color: "#667eea" }} className="fw-bold mb-2">{selectedItem.title}</h6>
              <p style={{ color: "#764ba2" }} className="mb-3">{selectedItem.description}</p>
              
              <div className="row g-3">
                <div className="col-6">
                  <small className="text-muted d-block">Type</small>
                  <span className="badge" style={{ 
                    background: getTypeColor(selectedItem.type).light,
                    color: getTypeColor(selectedItem.type).bg
                  }}>
                    {selectedItem.type?.toUpperCase()}
                  </span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Category</small>
                  <span style={{ color: "#764ba2" }}>{selectedItem.category || "Uncategorized"}</span>
                </div>
                <div className="col-12">
                  <small className="text-muted d-block">Location</small>
                  <span style={{ color: "#764ba2" }}>{selectedItem.location || "Unknown"}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Reported By</small>
                  <span style={{ color: "#667eea" }}>{selectedItem.user?.name || "Anonymous"}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Date</small>
                  <span style={{ color: "#764ba2" }}>
                    {new Date(selectedItem.createdAt || selectedItem.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-top">
              <button
                type="button"
                className="btn-secondary-custom w-100"
                onClick={closeItemModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            overflow: "auto",
            padding: "20px"
          }}
          onClick={closeDeleteModal}
        >
          <div 
            className="bg-white rounded-3 shadow-lg"
            style={{ 
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="text-white rounded-top-3 p-4"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle"
                  onClick={closeDeleteModal}
                  style={{ width: "32px", height: "32px" }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-4 text-center">
              <FaExclamationTriangle size={48} style={{ color: "#ef4444" }} className="mb-3" />
              <p style={{ color: "#764ba2" }}>
                Are you sure you want to delete <strong style={{ color: "#667eea" }}>{deleteConfirm.title}</strong>?
              </p>
              <p className="small text-muted mb-0">
                This action cannot be undone. All data related to this item will be permanently removed.
              </p>
            </div>
            
            <div className="p-4 border-top d-flex gap-3">
              <button
                type="button"
                className="btn-secondary-custom flex-grow-1"
                onClick={closeDeleteModal}
                disabled={actionLoading === deleteConfirm._id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-custom flex-grow-1"
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={actionLoading === deleteConfirm._id}
              >
                {actionLoading === deleteConfirm._id ? (
                  <>
                    <span className="spinner-custom me-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="me-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}