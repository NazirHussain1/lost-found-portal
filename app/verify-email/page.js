'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEnvelope } from 'react-icons/fa';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const res = await fetch(`/api/verify-email?token=${token}`);
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail(data.data.email);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/loginPage?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.errors?.[0]?.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to verify email. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Verification email sent! Please check your inbox.');
      } else {
        alert(data.errors?.[0]?.message || 'Failed to resend verification email');
      }
    } catch (error) {
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        {status === 'verifying' && (
          <>
            <div className="icon-container verifying-icon">
              <FaSpinner className="spinner" />
            </div>
            <h1 className="verify-title">Verifying Your Email</h1>
            <p className="verify-message">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="icon-container success-icon">
              <FaCheckCircle />
            </div>
            <h1 className="verify-title">Email Verified Successfully!</h1>
            <p className="verify-message">
              {message}
              <br />
              <br />
              Redirecting you to login page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="icon-container error-icon">
              <FaTimesCircle />
            </div>
            <h1 className="verify-title">Verification Failed</h1>
            <p className="verify-message">{message}</p>

            <div className="resend-section">
              <p style={{ fontSize: '14px', color: '#718096', marginBottom: '15px' }}>
                <FaEnvelope style={{ marginRight: '8px' }} />
                Need a new verification link?
              </p>
              <input
                type="email"
                className="resend-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="verify-button"
                onClick={handleResendVerification}
                disabled={resending}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>

            <button
              className="verify-button"
              onClick={() => router.push('/loginPage')}
              style={{ marginTop: '15px', background: '#718096' }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <style jsx global>{`
        .verify-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .verify-card {
          background: white;
          border-radius: 20px;
          padding: 50px 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .icon-container {
          font-size: 80px;
          margin-bottom: 30px;
          animation: scaleIn 0.5s ease-out 0.2s both;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .verify-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #2d3748;
        }

        .verify-message {
          font-size: 16px;
          color: #718096;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .verify-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
          margin-top: 20px;
        }

        .verify-button:hover {
          transform: translateY(-2px);
        }

        .verify-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resend-section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
        }

        .resend-input {
          width: 100%;
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 15px;
          transition: border-color 0.3s;
        }

        .resend-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .success-icon {
          color: #48bb78;
        }

        .error-icon {
          color: #f56565;
        }

        .verifying-icon {
          color: #667eea;
        }
      `}</style>

      <Suspense fallback={
        <div className="verify-container">
          <div className="verify-card">
            <div className="icon-container verifying-icon">
              <FaSpinner className="spinner" />
            </div>
            <h1 className="verify-title">Loading...</h1>
          </div>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </>
  );
}
