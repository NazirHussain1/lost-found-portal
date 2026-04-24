"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "../../store/slices/itemsSlice";
import { FaCamera, FaUpload, FaTrash, FaMapMarkerAlt, FaTag, FaInfoCircle, FaUser, FaCheckCircle, FaHandHolding, FaGift, FaExclamationTriangle } from "react-icons/fa";

export default function FoundItemForm() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    imageUrl: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        window.location.href = "/loginPage"; 
      }
    }
    fetchUser();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (form.title.trim().length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }
    
    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (form.description.trim().length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }
    
    if (!form.category) {
      newErrors.category = "Category is required";
    }
    
    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    } else if (form.location.trim().length < 3) {
      newErrors.location = "Location must be at least 3 characters";
    }
    
    return newErrors;
  };

  const validateField = (name, value) => {
    const fieldErrors = {};
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          fieldErrors.title = "Title is required";
        } else if (value.trim().length < 3) {
          fieldErrors.title = "Title must be at least 3 characters";
        } else if (value.trim().length > 100) {
          fieldErrors.title = "Title must not exceed 100 characters";
        }
        break;
      case 'description':
        if (!value.trim()) {
          fieldErrors.description = "Description is required";
        } else if (value.trim().length < 10) {
          fieldErrors.description = "Description must be at least 10 characters";
        } else if (value.trim().length > 500) {
          fieldErrors.description = "Description must not exceed 500 characters";
        }
        break;
      case 'category':
        if (!value) {
          fieldErrors.category = "Category is required";
        }
        break;
      case 'location':
        if (!value.trim()) {
          fieldErrors.location = "Location is required";
        } else if (value.trim().length < 3) {
          fieldErrors.location = "Location must be at least 3 characters";
        }
        break;
    }
    
    return fieldErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldErrors = validateField(name, value);
    
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    } else {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: "error", text: "Please upload an image file" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size should be less than 5MB" });
        return;
      }
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setMessage({ type: "", text: "" });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64 = reader.result;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          });
          const data = await res.json();
          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await dispatch(addItem({ ...form, type: "found", imageUrl })).unwrap();

      setMessage({ 
        type: "success", 
        text: "Found item reported successfully! The owner will be grateful for your honesty." 
      });
      
      setForm({ 
        title: "", 
        description: "", 
        category: "", 
        location: "", 
        imageUrl: "" 
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: "Failed to submit report. Please try again." 
      });
    }

    setLoading(false);
  };

  const handleClearForm = () => {
    setForm({ 
      title: "", 
      description: "", 
      category: "", 
      location: "", 
      imageUrl: "" 
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    setMessage({ type: "", text: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-md-4 animate-fadeIn">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10 col-xxl-8">
          
            {user && (
              <div className="card shadow-sm border-0 mb-3 mb-md-4">
                <div className="card-body p-3 p-md-4" style={{ background: 'var(--gradient-primary)', opacity: 0.05 }}>
                  <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start text-center text-sm-start">
                    <div className="rounded-circle p-2 me-0 me-sm-3 mb-2 mb-sm-0 bg-gradient-primary">
                      <FaUser size={20} className="text-white" />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold text-primary">Reporting as: {user.name || "Student"}</h6>
                      <small className="text-muted">GAMICA Campus Member</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

          
            <div className="card shadow-lg border-0 overflow-hidden mb-3 mb-md-4 transition-all">
             
              <div className="card-header bg-gradient-primary text-white py-3 py-md-4 px-3 px-md-4">
                <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start text-center text-sm-start">
                  <div className="rounded-circle p-2 me-0 me-sm-3 mb-2 mb-sm-0">
                    <FaHandHolding size={24} className="text-white" />
                  </div>
                  <div className="flex-grow-1">
                    <h1 className="h3 h-md-2 fw-bold mb-1">Report Found Item</h1>
                    <p className="mb-0 opacity-90 small">Help reunite lost items with their grateful owners</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-3 p-md-4">
                {message.text && (
                  <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show d-flex align-items-center p-3 mb-4 rounded-lg`} role="alert">
                    <FaCheckCircle className="me-3" size={18} />
                    <div className="flex-grow-1 fw-medium">{message.text}</div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage({ type: "", text: "" })}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                
                  <div className="mb-3 mb-md-4">
                    <label htmlFor="title" className="form-label d-flex align-items-center mb-2 text-primary fw-semibold">
                      <FaTag className="me-2" size={16} />
                      Item Title <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., 'Black Wallet', 'Laptop Bag', 'Student ID'"
                      className={`form-control ${errors.title ? "is-invalid" : ""}`}
                      style={{
                        borderColor: errors.title ? 'var(--color-error-500)' : 'var(--color-gray-300)',
                        transition: 'var(--transition-base)'
                      }}
                      required
                    />
                    {errors.title && (
                      <div className="invalid-feedback d-flex align-items-center mt-1">
                        <FaExclamationTriangle className="me-1" size={12} />
                        {errors.title}
                      </div>
                    )}
                    <div className="form-text small text-muted mt-1">
                      {form.title.length}/100 characters
                    </div>
                  </div>

               
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label d-flex align-items-center mb-2">
                      <FaInfoCircle className="me-2" style={{ color: '#667eea' }} size={16} />
                      Description <span className="text-danger ms-1">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Describe what you found. Include details like color, brand, contents (if applicable), and condition..."
                      rows="3"
                      className={`form-control ${errors.description ? "is-invalid" : ""} input-focus-effect`}
                      style={{
                        borderColor: errors.description ? 'var(--color-error-500)' : 'var(--color-gray-300)',
                        transition: 'var(--transition-base)',
                        resize: 'vertical'
                      }}
                      required
                    />
                    {errors.description && (
                      <div className="invalid-feedback d-flex align-items-center mt-1">
                        <FaExclamationTriangle className="me-1" size={12} />
                        {errors.description}
                      </div>
                    )}
                    <div className="form-text small d-flex justify-content-between mt-1">
                      <span className="text-muted">{form.description.length}/500 characters</span>
                      <span className={form.description.length > 450 ? 'text-warning' : 'text-muted'}>
                        {form.description.length > 450 ? `${500 - form.description.length} remaining` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="row g-2 g-md-3 mb-3 mb-md-4">
                
                    <div className="col-12 col-md-6">
                      <label htmlFor="category" className="form-label d-flex align-items-center mb-2">
                        <FaTag className="me-2" style={{ color: '#667eea' }} size={16} />
                        Category <span className="text-danger ms-1">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`form-select ${errors.category ? "is-invalid" : ""} input-focus-effect`}
                        style={{
                          borderColor: errors.category ? 'var(--color-error-500)' : 'var(--color-gray-300)',
                          transition: 'var(--transition-base)'
                        }}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="electronics">Electronics</option>
                        <option value="stationary">Stationary</option>
                        <option value="documents">Documents</option>
                        <option value="jewelry">Jewelry</option>
                        <option value="clothing">Clothing</option>
                        <option value="keys">Keys</option>
                        <option value="bags">Bags & Wallets</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.category && (
                        <div className="invalid-feedback d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="me-1" size={12} />
                          {errors.category}
                        </div>
                      )}
                    </div>

                   
                    <div className="col-12 col-md-6">
                      <label htmlFor="location" className="form-label d-flex align-items-center mb-2">
                        <FaMapMarkerAlt className="me-2" style={{ color: '#667eea' }} size={16} />
                        Found Location <span className="text-danger ms-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 'Library Entrance', 'Cafeteria Table #3'"
                        className={`form-control ${errors.location ? "is-invalid" : ""} input-focus-effect`}
                        style={{
                          borderColor: errors.location ? 'var(--color-error-500)' : 'var(--color-gray-300)',
                          transition: 'var(--transition-base)'
                        }}
                        required
                      />
                      {errors.location && (
                        <div className="invalid-feedback d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="me-1" size={12} />
                          {errors.location}
                        </div>
                      )}
                    </div>
                  </div>

                
                  <div className="mb-4">
                    <label className="form-label d-flex align-items-center mb-2">
                      <FaCamera className="me-2" style={{ color: '#667eea' }} size={16} />
                      Item Photo (Optional)
                    </label>
                    
                    {imagePreview ? (
                      <div className="image-preview-container mb-3">
                        <div className="image-preview position-relative" style={{ maxWidth: '300px' }}>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            loading="lazy"
                            className="img-fluid rounded-lg shadow-sm"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 m-2 shadow-sm"
                            onClick={removeImage}
                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="image-upload-area text-center p-4 mb-3 rounded-lg"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaUpload size={28} className="mb-3" style={{ color: '#667eea' }} />
                        <p className="mb-2 fw-semibold" style={{ color: '#4a5568' }}>Click to upload a photo</p>
                        <p className="text-muted small mb-0">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="d-none"
                    />
                  </div>

                 
                  <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 justify-content-end mt-3 mt-md-4 pt-3 pt-md-4 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-primary px-3 px-md-4 py-2 rounded-pill fw-medium order-2 order-sm-1"
                      onClick={handleClearForm}
                      disabled={loading}
                    >
                      <FaTrash className="me-2" size={14} />
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 px-md-5 py-2 rounded-pill fw-bold order-1 order-sm-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="me-2" />
                          Submit Found Item
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          
            <div className="card shadow-sm border-0">
              <div className="card-body p-3 p-md-4" style={{ background: 'var(--gradient-primary)', opacity: 0.05 }}>
                <div className="row g-2 g-md-3">
                  <div className="col-4">
                    <div className="text-center p-2">
                      <div className="h5 h-md-4 fw-bold mb-1 mb-md-2">
                        <FaHandHolding className="text-primary" />
                      </div>
                      <div className="small fw-semibold text-muted">Helping Others</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center p-2">
                      <div className="h5 h-md-4 fw-bold mb-1 mb-md-2">
                        <FaCheckCircle className="text-primary" />
                      </div>
                      <div className="small fw-semibold text-muted">Good Deeds</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center p-2">
                      <div className="h5 h-md-4 fw-bold mb-1 mb-md-2">
                        <FaGift className="text-primary" />
                      </div>
                      <div className="small fw-semibold text-muted">Positive Impact</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}