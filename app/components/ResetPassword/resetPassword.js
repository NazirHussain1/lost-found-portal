"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
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
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }

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

    const passwordErrors = validateField('password', password);
    const confirmPasswordErrors = validateField('confirmPassword', confirmPassword);

    Object.assign(newErrors, passwordErrors, confirmPasswordErrors);

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.warning(Object.values(newErrors)[0]);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.success) {
        setResetSuccess(true);
        toast.success(data.message || "Password reset successful!");
        setTimeout(() => {
          router.push("/loginPage");
        }, 3000);
      } else {
        const errorMessage = data.errors?.[0]?.message || data.message || "Failed to reset password.";
        toast.error(errorMessage);
        if (data.errors) {
          const newErrors = {};
          data.errors.forEach(err => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
        }
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
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
        
        .login-input-icon {
          border: 2px solid rgba(102, 126, 234, 0.1);
          background: rgba(255, 255, 255, 0.9);
          color: #667eea;
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
        
        .success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          animation: scaleIn 0.5s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>

      <div className="login-gradient-bg d-flex align-items-center justify-content-center page-fade-in">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-4">
              <div className="text-center mb-4">
                <h1 className="text-white mb-2">Reset Password</h1>
                <p className="text-white opacity-90">
                  {resetSuccess ? "Your password has been reset" : "Enter your new password"}
                </p>
              </div>
              
              <div className="login-card p-4 p-md-5 fade-in">
                {resetSuccess ? (
                  <div className="text-center">
                    <div className="success-icon">
                      <FaCheckCircle size={40} color="white" />
                    </div>
                    <h3 className="mb-3" style={{ color: '#10b981' }}>Password Reset Successful!</h3>
                    <p className="text-muted mb-4">
                      Your password has been successfully reset. You can now login with your new password.
                    </p>
                    <a 
                      href="/loginPage" 
                      className="btn-primary-custom w-100 py-3 fw-semibold text-decoration-none d-inline-block"
                    >
                      Go to Login
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label fw-medium d-flex align-items-center" style={{ color: '#667eea' }}>
                        <FaLock className="me-2" size={14} />
                        New Password
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
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          onBlur={(e) => handleInputBlur('password', e.target.value)}
                          autoComplete="new-password"
                          autoFocus
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
                      <div className="form-text small text-muted mt-1">
                        Password must be at least 6 characters
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label fw-medium d-flex align-items-center" style={{ color: '#667eea' }}>
                        <FaLock className="me-2" size={14} />
                        Confirm New Password
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
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          onBlur={(e) => handleInputBlur('confirmPassword', e.target.value)}
                          autoComplete="new-password"
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

                    <button
                      type="submit"
                      className="btn-primary-custom w-100 py-3 mb-3 fw-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-custom me-2" role="status" aria-hidden="true"></span>
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>

                    <div className="text-center">
                      <a href="/loginPage" className="text-decoration-none" style={{ color: '#667eea' }}>
                        Back to Login
                      </a>
                    </div>
                  </form>
                )}
              </div>
              
              <div className="text-center mt-4">
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

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="login-gradient-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
