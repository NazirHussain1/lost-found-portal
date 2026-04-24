"use client";

import { useEffect, useState, memo } from "react";
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
  FaCheck,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { CardSkeleton } from "../Skeleton";
import Modal, { ConfirmModal } from "../Modal";

// Memoized ItemCard component for better performance
const ItemCard = memo(({ 
  item, 
  onEdit, 
  onDelete, 
  onMarkResolved, 
  resolving, 
  resolvingItem 
}) => {
  return (
    <div 
      className="card-custom h-100 position-relative"
      style={{
        transition: 'var(--transition-all)',
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
      {/* Image Container */}
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
        />

        {/* Type Badge */}
        <div className="position-absolute top-0 start-0 m-3">
          <span
            className="badge"
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
      <div className="p-3 d-flex flex-column">
        {/* Title */}
        <h5
          className="fw-bold mb-2 text-truncate"
          style={{ 
            color: 'var(--color-gray-900)',
            fontSize: 'var(--font-size-lg)'
          }}
        >
          {item.title}
        </h5>

        {/* Description */}
        <p
          className="text-muted mb-3 flex-grow-1"
          style={{ 
            fontSize: 'var(--font-size-sm)',
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
            <FaMapMarkerAlt 
              size={12} 
              className="me-2 text-primary" 
            />
            <span className="text-truncate small text-muted">
              {item.location}
            </span>
          </div>

          {item.date && (
            <div className="d-flex align-items-center">
              <FaCalendarAlt 
                size={12} 
                className="me-2 text-primary" 
              />
              <span className="small text-muted">
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
          <span className="badge bg-primary bg-opacity-10 text-primary">
            {item.category}
          </span>
          
          <div className="d-flex gap-2">
            {item.type !== "resolved" && (
              <button
                className="btn btn-sm btn-success"
                style={{ width: '32px', height: '32px' }}
                onClick={() => onMarkResolved(item)}
                disabled={resolving && resolvingItem?._id === item._id}
                title="Mark as Resolved"
              >
                {resolving && resolvingItem?._id === item._id ? (
                  <div className="spinner-border spinner-border-sm"></div>
                ) : (
                  <FaCheck size={12} />
                )}
              </button>
            )}
            
            <button
              className="btn btn-sm btn-primary"
              style={{ width: '32px', height: '32px' }}
              onClick={() => onEdit(item)}
              title="Edit Item"
            >
              <FaEdit size={12} />
            </button>
            
            <button
              className="btn btn-sm btn-danger"
              style={{ width: '32px', height: '32px' }}
              onClick={() => onDelete(item)}
              title="Delete Item"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ItemCard.displayName = 'ItemCard';

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
    <div className="container-fluid px-3 px-md-4 py-3 py-md-5">
        <div className="bg-gradient-primary text-white rounded-4 p-3 p-md-5 mb-3 mb-md-5 shadow-lg">
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
            <div className="card shadow-sm border-primary border-opacity-25 text-center p-2 p-md-4 transition-all">
              <div className="h5 h-md-3 fw-bold mb-1 text-primary">
                {stats.total}
              </div>
              <div className="small text-muted">
                Total Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card shadow-sm border-primary border-opacity-25 text-center p-2 p-md-4 transition-all">
              <div className="h5 h-md-3 fw-bold mb-1 text-primary">
                {stats.lost}
              </div>
              <div className="small text-muted">
                Lost Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card shadow-sm border-primary border-opacity-25 text-center p-2 p-md-4 transition-all">
              <div className="h5 h-md-3 fw-bold mb-1 text-primary">
                {stats.found}
              </div>
              <div className="small text-muted">
                Found Items
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card shadow-sm border-primary border-opacity-25 text-center p-2 p-md-4 transition-all">
              <div className="h5 h-md-3 fw-bold mb-1 text-primary">
                {stats.resolved}
              </div>
              <div className="small text-muted">
                Resolved
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 p-3 p-md-4 mb-3 mb-md-5">
          <div className="row align-items-center">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch style={{ color: "#667eea" }} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search your items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
                <button
                  className={`btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveFilter("all")}
                >
                  All Items
                </button>
                <button
                  className={`btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "lost" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveFilter("lost")}
                >
                  Lost Items
                </button>
                <button
                  className={`btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "found" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveFilter("found")}
                >
                  Found Items
                </button>
                <button
                  className={`btn px-3 py-2 rounded-pill fw-medium ${activeFilter === "resolved" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveFilter("resolved")}
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
              className="btn btn-primary px-3 px-md-4 py-2 rounded-pill fw-bold text-white"
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
            <div className="d-flex flex-column flex-md-row flex-wrap justify-content-center gap-2 gap-md-3">
              <button
                className="btn btn-primary px-3 px-md-4 py-2 rounded-pill fw-bold text-white"
                onClick={() => router.push("/lost")}
              >
                Report Lost Item
              </button>
              <button
                className="btn btn-primary px-3 px-md-4 py-2 rounded-pill fw-bold text-white"
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
                <ItemCard
                  item={item}
                  onEdit={openEditModal}
                  onDelete={openConfirmDelete}
                  onMarkResolved={handleMarkAsResolved}
                  resolving={resolving}
                  resolvingItem={resolvingItem}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="text-center mt-3 mt-md-5 pt-3 pt-md-4 border-top">
            <div className="d-flex flex-column flex-md-row flex-wrap justify-content-center gap-2 gap-md-3">
              <button
                className="btn btn-primary px-3 px-md-4 py-2 rounded-pill fw-bold text-white"
                onClick={() => router.push("/lost")}
              >
                Report New Lost Item
              </button>
              <button
                className="btn btn-primary px-3 px-md-4 py-2 rounded-pill fw-bold text-white"
                onClick={() => router.push("/found")}
              >
                Report New Found Item
              </button>
              <button
                className="btn btn-outline-primary px-3 px-md-4 py-2 rounded-pill fw-bold"
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
              className="btn btn-secondary"
              onClick={closeEditModal}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
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
              className="form-control"
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
              className="form-control"
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
              className="form-control"
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
                className="form-select"
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
                className="form-select"
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
