"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleInputChange = (value) => {
    setEmail(value);
    if (errors.email) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      toast.error(emailError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setEmailSent(true);
        toast.success(data.message || "Password reset link sent to your email!");
      } else {
        const errorMessage = data.errors?.[0]?.message || data.message || "Failed to send reset link.";
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                <h1 className="text-white mb-2">Forgot Password?</h1>
                <p className="text-white opacity-90">
                  {emailSent 
                    ? "Check your email for reset instructions" 
                    : "Enter your email to receive a password reset link"}
                </p>
              </div>
              
              <div className="login-card p-4 p-md-5 fade-in">
                {emailSent ? (
                  <div className="text-center">
                    <div className="success-icon">
                      <FaEnvelope size={40} color="white" />
                    </div>
                    <h3 className="mb-3" style={{ color: '#667eea' }}>Email Sent!</h3>
                    <p className="text-muted mb-4">
                      We've sent a password reset link to <strong>{email}</strong>. 
                      Please check your inbox and follow the instructions.
                    </p>
                    <div className="alert alert-info" role="alert">
                      <small>
                        <strong>Note:</strong> The reset link will expire in 1 hour for security reasons.
                        If you don't see the email, check your spam folder.
                      </small>
                    </div>
                    <a 
                      href="/loginPage" 
                      className="btn-primary-custom w-100 py-3 mt-3 fw-semibold text-decoration-none d-inline-block"
                    >
                      <FaArrowLeft className="me-2" />
                      Back to Login
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
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
                          onChange={(e) => handleInputChange(e.target.value)}
                          autoComplete="email"
                          autoFocus
                          required
                        />
                      </div>
                      {errors.email && (
                        <div className="invalid-feedback d-block mt-2" style={{ color: '#ef4444' }}>
                          {errors.email}
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
                          Sending Reset Link...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>

                    <div className="text-center">
                      <a href="/loginPage" className="text-decoration-none d-inline-flex align-items-center" style={{ color: '#667eea' }}>
                        <FaArrowLeft className="me-2" size={14} />
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
