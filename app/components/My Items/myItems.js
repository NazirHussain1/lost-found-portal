"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyItems } from "../../store/slices/myItemsSlice";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaSearch,
  FaCamera,
  FaTimes,
  FaCheckCircle,
  FaCheck,
  FaHistory,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { CardSkeleton } from "../Skeleton";
import Modal, { ConfirmModal } from "../Modal";

export default function MyItemsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  
  const {
    items: reduxItems = [],
    loading,
    error,
  } = useSelector((state) => state.myItems || {});

  
  const [items, setItems] = useState([]);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    location: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [updating, setUpdating] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [resolvingItem, setResolvingItem] = useState(null);
  const [resolving, setResolving] = useState(false);

  
  useEffect(() => {
    if (reduxItems.length > 0) {
      setItems(reduxItems);
    }
  }, [reduxItems]);

  useEffect(() => {
    let interval;

    async function checkAuth() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          router.push("/loginPage");
          return;
        }
        dispatch(fetchMyItems());
      } catch (err) {
        router.push("/loginPage");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();

    interval = setInterval(async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) router.push("/loginPage");
      } catch (e) {
        router.push("/loginPage");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch, router]);

  const filteredItems = (items || []).filter((item) => {
    if (activeFilter !== "all" && item.type !== activeFilter) return false;
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    total: items.length,
    lost: items.filter((item) => item.type === "lost").length,
    found: items.filter((item) => item.type === "found").length,
    resolved: items.filter((item) => item.type === "resolved").length,
    recent: items.filter((item) => {
      const itemDate = new Date(item.date || item.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate > weekAgo;
    }).length,
  };

  function openConfirmDelete(item) {
    setConfirmDelete(item);
  }

  async function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/items/${confirmDelete._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Delete failed");
      }

      toast.success("Item deleted successfully!", {
        style: { background: "#667eea", color: "white" },
      });

      setItems((prevItems) =>
        prevItems.filter((item) => item._id !== confirmDelete._id)
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete item.", {
        style: { background: "#ef4444", color: "white" },
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  function openEditModal(item) {
    setEditingItem(item);
    setEditForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      type: item.type || "",
      location: item.location || "",
      imageUrl: item.imageUrl || "",
    });
    setImagePreview(item.imageUrl || "");
  }

  function closeEditModal() {
    setEditingItem(null);
    setImagePreview("");
  }

  function closeDeleteModal() {
    setConfirmDelete(null);
  }

  async function handleMarkAsResolved(item) {
    setResolvingItem(item);
    try {
      setResolving(true);
      const res = await fetch(`/api/items/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          type: "resolved",
          resolvedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to mark as resolved");
      }

      // Update the specific item in local state to show the resolved badge
      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem._id === item._id
            ? { ...prevItem, type: "resolved" }
            : prevItem
        )
      );

      toast.success("Item marked as resolved!", {
        style: { background: "#667eea", color: "white" },
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to mark as resolved.", {
        style: { background: "#ef4444", color: "white" },
      });
    } finally {
      setResolving(false);
      setResolvingItem(null);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;

      const uploadToastId = toast.loading("Uploading image...");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Upload failed");
        }

        setImagePreview(data.url);
        setEditForm((prev) => ({ ...prev, imageUrl: data.url }));

        toast.dismiss(uploadToastId);
        toast.success("Image uploaded successfully!", {
          style: { background: "#667eea", color: "white" },
        });
      } catch (err) {
        console.error(err);
        toast.dismiss(uploadToastId);
        toast.error("Image upload failed", {
          style: { background: "#ef4444", color: "white" },
        });
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleUpdateSubmit() {
    if (!editingItem) return;

    try {
      setUpdating(true);

      const res = await fetch(`/api/items/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Update failed");
      }

      toast.success("Item updated!", {
        style: { background: "#667eea", color: "white" },
      });

      // Update the item in local state
      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem._id === editingItem._id
            ? { ...prevItem, ...editForm }
            : prevItem
        )
      );

      closeEditModal();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update item.", {
        style: { background: "#ef4444", color: "white" },
      });
    } finally {
      setUpdating(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="container-fluid px-3 px-md-4 py-3 py-md-5">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#667eea" }}
            role="status"
          >
            <span className="visually-hidden">Checking authentication...</span>
          </div>
          <p className="mt-3" style={{ color: "#764ba2" }}>
            Verifying your identity...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
        }

        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 16px;
        }

        .stat-card {
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.05) 0%,
            rgba(118, 75, 162, 0.05) 100%
          );
          border-radius: 16px;
          border: 2px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.15);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .item-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 16px;
          overflow: hidden;
          background: white;
        }

        .item-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(102, 126, 234, 0.15),
            0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .type-badge {
          font-weight: 600;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
          text-transform: uppercase;
          font-size: 0.7rem;
        }

        .status-badge {
          font-weight: 600;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
          text-transform: uppercase;
          font-size: 0.7rem;
        }

        .image-container {
          height: 200px;
          overflow: hidden;
          border-radius: 16px 16px 0 0;
        }

        .image-container img {
          transition: transform 0.6s ease;
        }

        .item-card:hover .image-container img {
          transform: scale(1.1);
        }

        .form-control-custom {
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
          margin-bottom: 16px;
        }

        .form-control-custom:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .image-upload-container {
          border: 2px dashed rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          background: rgba(102, 126, 234, 0.03);
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }

        .image-upload-container:hover {
          background: rgba(102, 126, 234, 0.08);
          border-color: #667eea;
        }

        .image-preview {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
          max-height: 200px;
        }

        .image-preview img {
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .btn-primary-custom {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-outline-custom {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-outline-custom:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .btn-danger-custom {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-danger-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
        }

        .btn-success-custom {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-success-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }

        .action-btn {
          transition: all 0.3s ease;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
      `}</style>

      <div className="container-fluid px-3 px-md-4 py-3 py-md-5">
        <div className="gradient-bg text-white rounded-4 p-3 p-md-5 mb-3 mb-md-5 shadow-lg">
          <div className="row align-items-center">
            <div className="col-12 col-md-8 mb-3 mb-md-0">
              <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start text-center text-sm-start">
                <div className="bg-white rounded-circle p-2 p-md-3 me-0 me-sm-3 mb-2 mb-sm-0">
                  <FaUser size={20} style={{ color: "#667eea" }} />
                </div>
                <div className="flex-grow-1">
                  <h1 className="display-6 display-md-5 fw-bold mb-1">
                    Your Reported Items
                  </h1>
                  <p className="lead opacity-90 mb-0 small">
                    Manage your lost and found reports
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4 text-center text-md-end">
              <button
                className="btn-primary-custom btn-lg px-3 px-md-4 py-2 rounded-pill fw-bold"
                onClick={() => router.push("/browse")}
              >
                Browse All Items
              </button>
            </div>
          </div>
        </div>

        <div className="row g-2 g-md-4 mb-3 mb-md-5">
          <div className="col-6 col-md-3">
            <div className="stat-card text-center p-2 p-md-4">
              <div
                className="h5 h-md-3 fw-bold mb-1"
                style={{ color: "#667eea" }}
              >
                {stats.total}
              </div>
              <div className="small" style={{ color: "#764ba2" }}>
                Total Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card text-center p-2 p-md-4">
              <div
                className="h5 h-md-3 fw-bold mb-1"
                style={{ color: "#667eea" }}
              >
                {stats.lost}
              </div>
              <div className="small" style={{ color: "#764ba2" }}>
                Lost Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card text-center p-2 p-md-4">
              <div
                className="h5 h-md-3 fw-bold mb-1"
                style={{ color: "#667eea" }}
              >
                {stats.found}
              </div>
              <div className="small" style={{ color: "#764ba2" }}>
                Found Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card text-center p-2 p-md-4">
              <div
                className="h5 h-md-3 fw-bold mb-1"
                style={{ color: "#667eea" }}
              >
                {stats.resolved}
              </div>
              <div className="small" style={{ color: "#764ba2" }}>
                Resolved
              </div>
            </div>
          </div>
        </div>

        <div className="glass-effect p-3 p-md-4 mb-3 mb-md-5">
          <div className="row align-items-center">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch style={{ color: "#667eea" }} />
                </span>
                <input
                  type="text"
                  className="input-custom border-start-0"
                  placeholder="Search your items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
                <button
                  className={`filter-btn btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "all" ? "active" : ""
                    }`}
                  onClick={() => setActiveFilter("all")}
                  style={{
                    background:
                      activeFilter === "all"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: activeFilter === "all" ? "white" : "#667eea",
                    border:
                      activeFilter === "all"
                        ? "2px solid transparent"
                        : "2px solid #667eea",
                  }}
                >
                  All Items
                </button>
                <button
                  className={`filter-btn btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "lost" ? "active" : ""
                    }`}
                  onClick={() => setActiveFilter("lost")}
                  style={{
                    background:
                      activeFilter === "lost"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: activeFilter === "lost" ? "white" : "#667eea",
                    border:
                      activeFilter === "lost"
                        ? "2px solid transparent"
                        : "2px solid #667eea",
                  }}
                >
                  Lost Items
                </button>
                <button
                  className={`filter-btn btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "found" ? "active" : ""
                    }`}
                  onClick={() => setActiveFilter("found")}
                  style={{
                    background:
                      activeFilter === "found"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "transparent",
                    color: activeFilter === "found" ? "white" : "#667eea",
                    border:
                      activeFilter === "found"
                        ? "2px solid transparent"
                        : "2px solid #667eea",
                  }}
                >
                  Found Items
                </button>
                <button
                  className={`filter-btn btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "resolved" ? "active" : ""
                    }`}
                  onClick={() => setActiveFilter("resolved")}
                  style={{
                    background:
                      activeFilter === "resolved"
                        ? "linear-gradient(135deg, #667eea 0%, #667eea 100%)"
                        : "transparent",
                    color: activeFilter === "resolved" ? "white" : "#667eea",
                    border:
                      activeFilter === "resolved"
                        ? "2px solid transparent"
                        : "2px solid #667eea",
                  }}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="row g-3 g-md-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div className="display-1 mb-3">❌</div>
            <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>
              Error Loading Items
            </h3>
            <p className="mb-4" style={{ color: "#764ba2" }}>
              {error}
            </p>
            <button
              className="btn-primary-custom px-4 py-2 rounded-pill fw-bold text-white"
              onClick={() => dispatch(fetchMyItems())}
            >
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state text-center py-5 my-4">
            <div className="display-1 mb-3">
              <FaBoxOpen size={80} style={{ color: "#667eea" }} />
            </div>
            <h3 className="h4 fw-bold mb-2" style={{ color: "#667eea" }}>
              No items found
            </h3>
            <p className="mb-4" style={{ color: "#764ba2" }}>
              {searchQuery || activeFilter !== "all"
                ? "Try adjusting your filters or search"
                : "You haven't reported any items yet"}
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn-primary-custom px-4 py-2 rounded-pill fw-bold text-white"
                onClick={() => router.push("/lost")}
              >
                Report Lost Item
              </button>
              <button
                className="btn-primary-custom px-4 py-2 rounded-pill fw-bold text-white"
                onClick={() => router.push("/found")}
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-3 g-md-4">
            {filteredItems.map((item) => (
              <div key={item._id} className="col-12 col-md-6 col-lg-4">
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
                    <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1">
                      <span
                        className="badge-custom"
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
                        {item.type?.toUpperCase()}
                      </span>
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
                    <div className="mb-3">
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
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
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
                      
                      <div className="d-flex gap-2">
                        {item.type !== "resolved" && (
                          <button
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{
                              width: '32px',
                              height: '32px',
                              background: 'var(--color-success-100)',
                              color: 'var(--color-success-600)',
                              border: 'none',
                              borderRadius: 'var(--radius-md)',
                              transition: 'var(--transition-base)'
                            }}
                            onClick={() => handleMarkAsResolved(item)}
                            disabled={resolving && resolvingItem?._id === item._id}
                            title="Mark as Resolved"
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--color-success-200)';
                              e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'var(--color-success-100)';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            {resolving && resolvingItem?._id === item._id ? (
                              <span className="spinner-custom spinner-sm"></span>
                            ) : (
                              <FaCheck size={12} />
                            )}
                          </button>
                        )}
                        
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
                          onClick={() => openEditModal(item)}
                          title="Edit Item"
                          onMouseEnter={(e) => {
                            e.target.style.background = 'var(--color-primary-200)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'var(--color-primary-100)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <FaEdit size={12} />
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
                          onClick={() => {
                            openConfirmDelete(item);
                          }}
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
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="text-center mt-3 mt-md-5 pt-3 pt-md-4 border-top">
            <div className="d-flex flex-column flex-md-row flex-wrap justify-content-center gap-2 gap-md-3">
              <button
                className="btn-primary-custom px-3 px-md-4 py-2 rounded-pill fw-bold text-white"
                onClick={() => router.push("/lost")}
              >
                Report New Lost Item
              </button>
              <button
                className="btn-primary-custom px-3 px-md-4 py-2 rounded-pill fw-bold text-white"
                onClick={() => router.push("/found")}
              >
                Report New Found Item
              </button>
              <button
                className="btn-outline-custom px-3 px-md-4 py-2 rounded-pill fw-bold"
                onClick={() => router.push("/browse")}
              >
                Browse Community Items
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirmed}
        title="Confirm Delete"
        message={`Are you sure you want to permanently delete "${confirmDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleting}
      />

      {/* Edit Item Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={closeEditModal}
        title="Update Item"
        size="lg"
        footer={
          <>
            <button
              className="btn-secondary-custom"
              onClick={closeEditModal}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              className="btn-primary-custom"
              onClick={handleUpdateSubmit}
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              className="input-custom"
              placeholder="Title"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="textarea-custom"
              placeholder="Description"
              rows="3"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              className="input-custom"
              placeholder="Location"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="select-custom"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="documents">Documents</option>
                <option value="clothing">Clothing</option>
                <option value="jewelry">Jewelry</option>
                <option value="stationary">Stationary</option>
                <option value="keys">Keys</option>
                <option value="bags">Bags & Wallets</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                className="select-custom"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
              >
                <option value="">Select Type</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="preview" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                <button
                  type="button"
                  className="btn-outline-custom w-full"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                onClick={() =>
                  document.getElementById("image-upload")?.click()
                }
              >
                <FaCamera
                  size={32}
                  className="text-indigo-500 mx-auto mb-3"
                />
                <p className="text-indigo-600 font-medium mb-1">
                  Click to upload image
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}

            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
