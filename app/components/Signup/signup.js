"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function ProfessionalRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
      case 'name':
        if (!value.trim()) {
          fieldErrors.name = "Full name is required";
        } else if (value.trim().length < 2) {
          fieldErrors.name = "Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          fieldErrors.name = "Name must not exceed 50 characters";
        }
        break;
      case 'email':
        if (!value) {
          fieldErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          fieldErrors.email = "Please enter a valid email address";
        }
        break;
      case 'phone':
        if (!value) {
          fieldErrors.phone = "Phone number is required";
        } else if (!/^[0-9+\-\s()]{10,15}$/.test(value.replace(/\s/g, ''))) {
          fieldErrors.phone = "Please enter a valid phone number (10-15 digits)";
        }
        break;
      case 'password':
        if (!value) {
          fieldErrors.password = "Password is required";
        } else if (value.length < 6) {
          fieldErrors.password = "Password must be at least 6 characters";
        } else if (value.length > 128) {
          fieldErrors.password = "Password must not exceed 128 characters";
        }
        break;
      case 'confirmPassword':
        if (!value) {
          fieldErrors.confirmPassword = "Please confirm your password";
        } else if (value !== password) {
          fieldErrors.confirmPassword = "Passwords do not match";
        }
        break;
    }

    return fieldErrors;
  };

  const handleInputChange = (name, value) => {
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleInputBlur = (name, value) => {
    const fieldErrors = validateField(name, value);
    
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    } else {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    const nameErrors = validateField('name', name);
    const emailErrors = validateField('email', email);
    const phoneErrors = validateField('phone', phone);
    const passwordErrors = validateField('password', password);
    const confirmPasswordErrors = validateField('confirmPassword', confirmPassword);

    Object.assign(newErrors, nameErrors, emailErrors, phoneErrors, passwordErrors, confirmPasswordErrors);

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.warning(Object.values(newErrors)[0]);
      return false;
    }

    return true;
  };

  const register = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.update(toastId, {
          render: data.message || "Registration successful! Redirecting to login...",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        setTimeout(() => {
          router.push("/loginPage");
        }, 2000);
      } else {
        const errorMessage = data.errors?.[0]?.message || data.message || "Registration failed. Please try again.";
        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });

        if (data.errors) {
          const newErrors = {};
          data.errors.forEach(err => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
        }
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Network error. Please check your connection.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      register(e);
    }
  };


  return (
    <>
      <style jsx global>{`
        .login-gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        
        .login-gradient-bg::before {
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
        
        .login-card {
          backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(102, 126, 234, 0.15);
          transition: all 0.3s ease;
        }
        
        .login-card:hover {
          box-shadow: 0 35px 70px rgba(102, 126, 234, 0.25);
        }
        
        .login-input {
          border: 2px solid rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          padding: 7px 8px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
        }
        
        .login-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
          outline: none;
        }
        
        .login-input-icon {
          border: 2px solid rgba(102, 126, 234, 0.1);
          background: rgba(255, 255, 255, 0.9);
          color: #667eea;
        }
        
        .login-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          padding: 10px;
          font-weight: 600;
          color: white;
          transition: all 0.3s ease;
        }
        
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .form-check-input:checked {
          background-color: #667eea;
          border-color: #667eea;
        }
        
        .form-check-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
        }
        
        .text-primary {
          color: #667eea !important;
        }
        
        .text-secondary {
          color: #764ba2 !important;
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .password-toggle-btn {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 2px solid rgba(102, 126, 234, 0.1) !important;
          color: #667eea !important;
        }
        
        .password-toggle-btn:hover {
          background: rgba(102, 126, 234, 0.05) !important;
          border-color: #667eea !important;
        }
        
        .input-custom:focus {
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
      `}</style>

      <div className="login-gradient-bg d-flex align-items-center justify-content-center page-fade-in">
        <div className="container py-3">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="text-center mb-3">
                <p className="text-white opacity-90">Join our community to report lost and found items</p>
              </div>

              <div className="login-card p-2 p-md-5 animate-slideUp">
                <form onSubmit={register}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-medium d-flex align-items-center" style={{ color: '#667eea' }}>
                      <FaUser className="me-2" size={14} />
                      Full Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text login-input-icon border-end-0">
                        <FaUser size={16} />
                      </span>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className={`input-custom border-start-0 ${errors.name ? "input-error" : ""}`}
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={(e) => handleInputBlur('name', e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoComplete="name"
                        style={{
                          borderColor: errors.name ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                        }}
                        required
                      />
                    </div>
                    {errors.name && (
                      <div className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }}>
                        {errors.name}
                      </div>
                    )}
                    <div className="form-text small text-muted mt-1">
                      {name.length}/50 characters
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium d-flex align-items-center" style={{ color: '#667eea' }}>
                      <FaEnvelope className="me-2" size={14} />
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text login-input-icon border-end-0">
                        <FaEnvelope size={16} />
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`input-custom border-start-0 ${errors.email ? "input-error" : ""}`}
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => handleInputBlur('email', e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoComplete="email"
                        style={{
                          borderColor: errors.email ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                        }}
                        required
                      />
                    </div>
                    {errors.email && (
                      <div className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }}>
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="phone"
                      className="form-label fw-medium d-flex align-items-center"
                      style={{ color: "#667eea" }}
                    >
                      <FaUser className="me-2" size={14} />
                      Phone Number
                    </label>

                    <div className="input-group">
                      <span className="input-group-text login-input-icon border-end-0">
                        <FaUser size={16} />
                      </span>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`input-custom border-start-0 ${errors.phone ? "input-error" : ""
                          }`}
                        placeholder="e.g. 923001234567"
                        value={phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={(e) => handleInputBlur('phone', e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoComplete="tel"
                        style={{
                          borderColor: errors.phone ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                        }}
                        required
                      />
                    </div>

                    {errors.phone && (
                      <div
                        className="invalid-feedback d-block mt-2"
                        style={{ color: "#ef4444" }}
                      >
                        {errors.phone}
                      </div>
                    )}
                  </div>


                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium d-flex align-items-center" style={{ color: '#667eea' }}>
                      <FaLock className="me-2" size={14} />
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text login-input-icon border-end-0">
                        <FaLock size={16} />
                      </span>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className={`input-custom border-start-0 border-end-0 ${errors.password ? "input-error" : ""}`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={(e) => handleInputBlur('password', e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoComplete="new-password"
                        style={{
                          borderColor: errors.password ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text password-toggle-btn border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }}>
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-medium d-flex align-items-center" style={{ color: '#667eea' }}>
                      <FaLock className="me-2" size={14} />
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text login-input-icon border-end-0">
                        <FaLock size={16} />
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className={`input-custom border-start-0 border-end-0 ${errors.confirmPassword ? "input-error" : ""}`}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        onBlur={(e) => handleInputBlur('confirmPassword', e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoComplete="new-password"
                        style={{
                          borderColor: errors.confirmPassword ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text password-toggle-btn border-start-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }}>
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className={`form-check-input ${errors.terms ? "is-invalid" : ""}`}
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => {
                          setAcceptedTerms(e.target.checked);
                          if (errors.terms) setErrors({ ...errors, terms: "" });
                        }}
                      />
                      <label className="form-check-label" htmlFor="terms" style={{ color: '#764ba2' }}>
                        I agree to the{" "}
                        <a href="/terms" className="text-decoration-none" style={{ color: '#667eea' }}>
                          Terms and Conditions
                        </a>
                        {" "}and{" "}
                        <a href="/privacy" className="text-decoration-none" style={{ color: '#667eea' }}>
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {errors.terms && (
                      <div className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }}>
                        {errors.terms}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-custom w-100 py-3 mb-3 fw-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-custom me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="mb-2" style={{ color: '#764ba2' }}>
                      Already have an account?{" "}
                      <a href="/loginPage" className="fw-bold text-decoration-none" style={{ color: '#667eea' }}>
                        Sign In
                      </a>
                    </p>
                  </div>
                </form>
              </div>

              <div className="text-center mt-4">
                <p className="small text-white opacity-80 mb-2">
                  By continuing, you agree to our{" "}
                  <a href="/terms" className="text-white text-decoration-none">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-white text-decoration-none">Privacy Policy</a>
                </p>
                <p className="small text-white opacity-60">
                  © {new Date().getFullYear()} GAMICA Lost & Found Hub. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}