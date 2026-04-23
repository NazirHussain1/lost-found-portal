"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "../Modal";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBoxOpen,
  FaCheckCircle,
  FaHistory,
  FaSignOutAlt,
  FaCamera,
  FaShieldAlt,
  FaBell,
  FaGlobe,
  FaUser,
  FaArrowLeft,
  FaTrash,
  FaCheck
} from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    joinDate: "",
    avatar: "/default-avatar.png"
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ ...userData });
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = "Name is required";
        } else if (value.trim().length < 2) {
          errors.name = "Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          errors.name = "Name must not exceed 50 characters";
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = "Please enter a valid email address";
        }
        break;
      case 'phone':
        if (value && !/^[0-9+\-\s()]{10,15}$/.test(value.replace(/\s/g, ''))) {
          errors.phone = "Please enter a valid phone number";
        }
        break;
      case 'location':
        if (value && value.length > 100) {
          errors.location = "Location must not exceed 100 characters";
        }
        break;
      case 'bio':
        if (value && value.length > 500) {
          errors.bio = "Bio must not exceed 500 characters";
        }
        break;
    }
    
    return errors;
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleInputBlur = (field, value) => {
    const fieldErrors = validateField(field, value);
    
    if (fieldErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    } else {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    Object.keys(editForm).forEach(field => {
      const fieldErrors = validateField(field, editForm[field]);
      if (fieldErrors[field]) {
        errors[field] = fieldErrors[field];
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");

      let data = null;
      try {
        data = await res.json();
      } catch (e) {}

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/loginPage");
          return;
        }

        throw new Error(data?.error || "Failed to fetch profile");
      }
      
      setUserData({
        name: data.name || "User",
        email: data.email || "",
        phone: data.phone || "Not provided",
        location: data.location || "Not specified",
        bio: data.bio || "No bio added yet",
        joinDate: data.joinDate || new Date().toISOString(),
        avatar: data.avatar || "/default-avatar.png"
      });
      
      setEditForm({
        name: data.name || "User",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        joinDate: data.joinDate || new Date().toISOString(),
        avatar: data.avatar || "/default-avatar.png"
      });

      
      const activityRes = await fetch("/api/profile/activity");
      if (activityRes.ok) {
        const activityData = await activityRes.json();
       
        setRecentActivity(activityData);
      } else {
       
        setRecentActivity([
          {
            id: 1,
            title: "Welcome to Lost & Found",
            description: "You joined the platform",
            type: "joined",
            date: new Date().toISOString(),
            location: "Online"
          }
        ]);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await res.json();
      setUserData(data);
      setEditMode(false);
      setFormErrors({});
      
      toast.success("Profile updated successfully!", {
        style: { 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
          color: "white" 
        },
        duration: 3000
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result;

      try {
        const uploadToastId = toast.loading("Uploading profile picture...");

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Upload failed");
        }

        setEditForm(prev => ({ ...prev, avatar: data.url }));
        
        toast.dismiss(uploadToastId);
        toast.success("Profile picture updated!", {
          style: { 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            color: "white" 
          },
          duration: 3000
        });

      } catch (err) {
        console.error(err);
        toast.error("Failed to upload image");
      } finally {
        setUploadingImage(false);
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleLogout() {
    setShowLogoutConfirm(false);
    
    try {
      const logoutToastId = toast.loading("Logging out...");
      
     
      
      
     
      const res = await fetch("/api/logout", { method: "POST" });
      
    
      toast.dismiss(logoutToastId);

      if (!res.ok) {
        toast.error("Logout failed on server");
        return;
      }

      try {
        localStorage.setItem("logout", Date.now().toString());
      } catch (e) {}

      toast.success("Logged out successfully!", {
        style: { 
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
          color: "white" 
        },
        duration: 1500
      });
      
    
      setTimeout(() => {
        router.replace("/loginPage");
      }, 1000);
      
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  }

  function formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return "Recently";
    }
  }

  if (loading && !userData.name) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#667eea" }}
            role="status"
          >
            <span className="visually-hidden">Loading profile...</span>
          </div>
          <p className="mt-3" style={{ color: "#764ba2" }}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .profile-gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
        }

        .avatar-container {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid white;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        @media (min-width: 768px) {
          .avatar-container {
            width: 150px;
            height: 150px;
          }
        }

        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(102, 126, 234, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          cursor: pointer;
        }

        .avatar-container:hover .avatar-overlay {
          opacity: 1;
        }

        .activity-card {
          background: white;
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }

        .activity-card:hover {
          transform: translateX(5px);
          border-color: rgba(102, 126, 234, 0.3);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.1);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 16px;
        }

        .profile-input {
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
        }

        .profile-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-gradient:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-outline-gradient {
          background: transparent;
          color: #667eea;
          border: 2px solid transparent;
          border-radius: 50px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background-image: 
            linear-gradient(white, white),
            linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-origin: border-box;
          background-clip: padding-box, border-box;
        }

        .btn-outline-gradient:hover {
          background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-outline-red {
          background: transparent;
          color: #ef4444;
          border: 2px solid transparent;
          border-radius: 50px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background-image: 
            linear-gradient(white, white),
            linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          background-origin: border-box;
          background-clip: padding-box, border-box;
        }

        .btn-outline-red:hover {
          background-image: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: white;
        }
        
        .input-custom:focus, .textarea-custom:focus {
          border-color: var(--color-primary-500) !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          outline: none;
        }
        
        .input-error {
          border-color: var(--color-error-500) !important;
        }
        
        .input-error:focus {
          border-color: var(--color-error-500) !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        .profile-input, .input-custom, .textarea-custom {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>

      <div className="container py-3 py-md-5">
        
        <div className="d-block d-md-none mb-3">
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={() => router.back()}
          >
            <FaArrowLeft className="me-2" />
            Back
          </button>
        </div>

      
        <div className="profile-gradient-bg text-white rounded-4 p-4 p-md-5 mb-4 mb-md-5 shadow-lg">
          <div className="row align-items-center">
            <div className="col-12 col-md-8 mb-3 mb-md-0">
              <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start text-center text-md-start">
                <div className="avatar-container me-0 me-md-4 mb-3 mb-md-0">
                  <img
                    src={editMode ? editForm.avatar : userData.avatar}
                    className="w-100 h-100 object-cover"
                    alt="Profile"
                  />
                  {editMode && (
                    <div 
                      className="avatar-overlay"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <FaCamera size={24} color="white" />
                    </div>
                  )}
                  {editMode && (
                    <input
                      id="avatar-upload"
                      type="file"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  )}
                </div>
                <div className="flex-grow-1">
                  <h1 className="display-6 display-md-5 fw-bold mb-1">
                    {editMode ? (
                      <input
                        type="text"
                        className="profile-input"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={(e) => handleInputBlur('name', e.target.value)}
                        style={{ 
                          fontSize: "1.5rem", 
                          background: "transparent", 
                          color: "white", 
                          border: `2px solid ${formErrors.name ? 'var(--color-error-500)' : 'rgba(255, 255, 255, 0.3)'}`,
                          textAlign: "center"
                        }}
                      />
                    ) : (
                      userData.name
                    )}
                    {editMode && formErrors.name && (
                      <div className="text-center mt-1">
                        <small style={{ color: '#ffcccb' }}>{formErrors.name}</small>
                      </div>
                    )}
                  </h1>
                  <p className="lead opacity-90 mb-0 d-flex align-items-center justify-content-center justify-content-md-start">
                    <FaEnvelope className="me-2" size={14} />
                    {editMode ? (
                      <input
                        type="email"
                        className="profile-input"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => handleInputBlur('email', e.target.value)}
                        style={{ 
                          background: "transparent", 
                          color: "white", 
                          border: `2px solid ${formErrors.email ? 'var(--color-error-500)' : 'rgba(255, 255, 255, 0.3)'}`,
                          fontSize: "0.9rem",
                          textAlign: "center"
                        }}
                      />
                    ) : (
                      <span className="small">{userData.email}</span>
                    )}
                    {editMode && formErrors.email && (
                      <div className="text-center mt-1">
                        <small style={{ color: '#ffcccb' }}>{formErrors.email}</small>
                      </div>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              {editMode ? (
                <div className="d-flex flex-column flex-md-row gap-2 justify-content-center justify-content-md-end">
                  <button
                    className="btn-secondary-custom btn-sm btn-md-lg px-3 px-md-4 py-2 rounded-pill fw-bold mb-2 mb-md-0"
                    onClick={() => {
                      setEditMode(false);
                      setEditForm({ ...userData });
                    }}
                  >
                    <FaTimes className="me-2" />
                    Cancel
                  </button>
                  <button
                    className="btn-primary-custom btn-sm btn-md-lg px-3 px-md-4 py-2 rounded-pill"
                    onClick={handleSaveProfile}
                    disabled={loading || uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <span className="spinner-custom me-2" role="status"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column flex-md-row gap-2 justify-content-center justify-content-md-end">
                  <button
                    className="btn-secondary-custom btn-sm btn-md-lg px-3 px-md-4 py-2 rounded-pill fw-bold mb-2 mb-md-0"
                    onClick={() => setEditMode(true)}
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </button>
                  <button
                    className="btn-danger-custom btn-sm btn-md-lg px-3 px-md-4 py-2 rounded-pill"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3 g-md-4">
         
          <div className="col-lg-4">
            <div className="glass-effect p-3 p-md-4 mb-3 mb-md-4">
              <h4 className="fw-bold mb-3 gradient-text">Profile Information</h4>
              
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <FaPhone className="me-3 flex-shrink-0" style={{ color: "#667eea" }} />
                  <div className="w-100">
                    <small className="text-muted d-block">Phone</small>
                    {editMode ? (
                      <div>
                        <input
                          type="text"
                          className="input-custom"
                          value={editForm.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          onBlur={(e) => handleInputBlur('phone', e.target.value)}
                          placeholder="Enter phone number"
                          style={{
                            borderColor: formErrors.phone ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                          }}
                        />
                        {formErrors.phone && (
                          <div className="text-danger small mt-1">{formErrors.phone}</div>
                        )}
                      </div>
                    ) : (
                      <span className="d-block mt-1" style={{ color: "#764ba2", wordBreak: "break-word" }}>
                        {userData.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="me-3 flex-shrink-0" style={{ color: "#667eea" }} />
                  <div className="w-100">
                    <small className="text-muted d-block">Location</small>
                    {editMode ? (
                      <div>
                        <input
                          type="text"
                          className="input-custom"
                          value={editForm.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          onBlur={(e) => handleInputBlur('location', e.target.value)}
                          placeholder="Enter your location"
                          style={{
                            borderColor: formErrors.location ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                          }}
                        />
                        {formErrors.location && (
                          <div className="text-danger small mt-1">{formErrors.location}</div>
                        )}
                      </div>
                    ) : (
                      <span className="d-block mt-1" style={{ color: "#764ba2", wordBreak: "break-word" }}>
                        {userData.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <FaCalendarAlt className="me-3 flex-shrink-0" style={{ color: "#667eea" }} />
                  <div>
                    <small className="text-muted d-block">Member Since</small>
                    <span className="d-block mt-1" style={{ color: "#764ba2" }}>
                      {formatDate(userData.joinDate)}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <FaShieldAlt className="me-3 flex-shrink-0" style={{ color: "#667eea" }} />
                  <div>
                    <small className="text-muted d-block">Account Status</small>
                    <span className="badge mt-1" style={{ 
                      background: "rgba(102, 126, 234, 0.1)", 
                      color: "#667eea",
                      fontSize: "0.85em"
                    }}>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="fw-bold mb-2" style={{ color: "#667eea" }}>About</h6>
                {editMode ? (
                  <div>
                    <textarea
                      className="textarea-custom"
                      rows="3"
                      value={editForm.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      onBlur={(e) => handleInputBlur('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      style={{
                        borderColor: formErrors.bio ? 'var(--color-error-500)' : 'var(--color-gray-300)',
                        resize: 'vertical'
                      }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                      <span className="small text-muted">{editForm.bio.length}/500 characters</span>
                      {formErrors.bio && (
                        <span className="small text-danger">{formErrors.bio}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#764ba2" }} className="mb-0 small">
                    {userData.bio || "No bio added yet. Click 'Edit Profile' to add one."}
                  </p>
                )}
              </div>
            </div>

            <div className="glass-effect p-3 p-md-4">
              <h4 className="fw-bold mb-3 gradient-text">Quick Actions</h4>
              <div className="d-grid gap-2">
                <button
                  className="btn-outline-custom d-flex align-items-center justify-content-center py-2"
                  onClick={() => router.push("/my-items")}
                >
                  <FaBoxOpen className="me-2 flex-shrink-0" />
                  <span>View My Items</span>
                </button>
                <button
                  className="btn-outline-custom d-flex align-items-center justify-content-center py-2"
                  onClick={() => router.push("/lost")}
                >
                  <FaEdit className="me-2 flex-shrink-0" />
                  <span>Report Lost Item</span>
                </button>
                <button
                  className="btn-outline-custom d-flex align-items-center justify-content-center py-2"
                  onClick={() => router.push("/found")}
                >
                  <FaEdit className="me-2 flex-shrink-0" />
                  <span>Report Found Item</span>
                </button>
                <button
                  className="btn-outline-custom d-flex align-items-center justify-content-center py-2"
                  onClick={() => router.push("/browse")}
                >
                  <FaGlobe className="me-2 flex-shrink-0" />
                  <span>Browse Community</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="col-lg-8">
            <div className="glass-effect p-3 p-md-4 mb-3 mb-md-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4">
                <h4 className="fw-bold mb-2 mb-md-0 gradient-text">Recent Activity</h4>
                <div className="d-flex gap-2">
                  <button
                    className="btn-outline-custom"
                    onClick={fetchUserProfile}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {recentActivity.length > 0 ? (
                <div className="space-y-2 space-y-md-3">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="activity-card p-2 p-md-3">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "36px",
                              height: "36px",
                              background: activity.type === "lost" 
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : activity.type === "found"
                                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                : activity.type === "joined"
                                ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                            }}
                          >
                            {activity.type === "joined" ? (
                              <FaUser size={16} color="white" />
                            ) : (
                              <FaBoxOpen size={16} color="white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-2 ms-md-3">
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-1">
                            <h6 className="fw-bold mb-0" style={{ color: "#667eea", fontSize: "0.95rem" }}>
                              {activity.title}
                            </h6>
                            <span className="badge mt-1 mt-md-0" style={{
                              background: activity.type === "lost" 
                                ? "rgba(102, 126, 234, 0.1)"
                                : activity.type === "found"
                                ? "rgba(16, 185, 129, 0.1)"
                                : activity.type === "joined"
                                ? "rgba(245, 158, 11, 0.1)"
                                : "rgba(107, 114, 128, 0.1)",
                              color: activity.type === "lost" 
                                ? "#667eea"
                                : activity.type === "found"
                                ? "#10b981"
                                : activity.type === "joined"
                                ? "#f59e0b"
                                : "#6b7280",
                              fontSize: "0.75em"
                            }}>
                              {activity.type?.toUpperCase() || "ACTIVITY"}
                            </span>
                          </div>
                          <p className="small mb-1 mb-md-2" style={{ color: "#764ba2", fontSize: "0.85rem" }}>
                            {activity.description}
                          </p>
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <small className="text-muted mb-1 mb-md-0">
                              <FaCalendarAlt className="me-1" size={10} />
                              {formatDate(activity.date)}
                            </small>
                            {activity.location && (
                              <small className="text-muted">
                                <FaMapMarkerAlt className="me-1" size={10} />
                                {activity.location}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 py-md-5">
                  <FaHistory size={40} style={{ color: "#667eea", opacity: 0.5 }} className="mb-3" />
                  <h6 className="fw-bold mb-2" style={{ color: "#667eea", fontSize: "1rem" }}>No recent activity</h6>
                  <p className="small mb-0" style={{ color: "#764ba2" }}>
                    Your activity will appear here when you report items
                  </p>
                  <button
                    className="btn-outline-custom mt-3"
                    onClick={() => router.push("/lost")}
                  >
                    Report Your First Item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}