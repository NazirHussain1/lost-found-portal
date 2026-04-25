"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
 
} from "react-icons/fa";

export default function ProfessionalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
      case 'email':
        if (!value) {
          fieldErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          fieldErrors.email = "Please enter a valid email address";
        }
        break;
      case 'password':
        if (!value) {
          fieldErrors.password = "Password is required";
        }
        break;
    }

    return fieldErrors;
  };

  const handleInputChange = (name, value) => {
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
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

    const emailErrors = validateField('email', email);
    const passwordErrors = validateField('password', password);

    Object.assign(newErrors, emailErrors, passwordErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const login = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, rememberMe }),
     

    });

    if (res.ok) {
      router.push("/browse");
    } else {
      const data = await res.json();
      toast.error(data.message || "Login Failed. Please check your credentials.");
    }
  } catch (error) {
    toast.error("Network error. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login(e);
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
        
        .brand-logo {
          filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
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
        
        .form-control, .input-custom {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>

      <div className="login-gradient-bg d-flex align-items-center justify-content-center page-fade-in">
        <div className="container py-3">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-4">
              <div className="text-center mb-3">
                
                <p className="text-white opacity-90">Sign in to continue to your account</p>
              </div>
              
              <div className="login-card p-4 p-md-5 fade-in" style={{ animationDelay: '0.1s' }}>
               
                <form onSubmit={login} noValidate>
                  <fieldset>
                    <legend className="sr-only">Login credentials</legend>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-medium d-flex align-items-center" style={{ color: '#667eea' }}>
                        <FaEnvelope className="me-2" size={14} aria-hidden="true" />
                        Email Address <span className="text-danger ms-1" aria-label="required">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text login-input-icon border-end-0" aria-hidden="true">
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
                          aria-describedby={errors.email ? "email-error" : undefined}
                          aria-invalid={errors.email ? "true" : "false"}
                          style={{
                            borderColor: errors.email ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                          }}
                          required
                        />
                      </div>
                      {errors.email && (
                        <div id="email-error" className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }} role="alert">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium d-flex align-items-center" style={{ color: '#667eea' }}>
                      <FaLock className="me-2" size={14} aria-hidden="true" />
                      Password <span className="text-danger ms-1" aria-label="required">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text login-input-icon border-end-0" aria-hidden="true">
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
                        autoComplete="current-password"
                        aria-describedby={errors.password ? "password-error" : "password-toggle-help"}
                        aria-invalid={errors.password ? "true" : "false"}
                        style={{
                          borderColor: errors.password ? 'var(--color-error-500)' : 'var(--color-gray-300)'
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text password-toggle-btn border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-describedby="password-toggle-help"
                      >
                        {showPassword ? <FaEyeSlash size={16} aria-hidden="true" /> : <FaEye size={16} aria-hidden="true" />}
                      </button>
                    </div>
                    <div id="password-toggle-help" className="sr-only">
                      Use the button to toggle password visibility
                    </div>
                    {errors.password && (
                      <div id="password-error" className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }} role="alert">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="rememberMe" style={{ color: '#764ba2' }}>
                        Remember me on this device
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-custom w-100 py-3 mb-2 fw-semibold"
                    disabled={isLoading}
                    aria-describedby={isLoading ? "loading-status" : undefined}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-custom me-2" role="status" aria-hidden="true"></span>
                        <span id="loading-status">Signing in...</span>
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  </fieldset>
                </form>
                
                <div className="text-center mt-3">
                  <p className="mb-2" style={{ color: '#764ba2' }}>
                    Don't have an account?{" "}
                    <a href="/signup" className="fw-bold text-decoration-none" style={{ color: '#667eea' }}>
                      Sign up
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-3">
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