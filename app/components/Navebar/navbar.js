"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaSearch,
  FaPlusCircle,
  FaTh,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaCog,
  FaSignOutAlt,
  FaHome
} from 'react-icons/fa';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    closeAll();
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .nav-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: all 0.3s ease;
        }
        
        .nav-scrolled {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        
        .nav-link-hover {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-link-hover::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: white;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-link-hover:hover::after {
          width: 80%;
        }
        
        .profile-dropdown {
          animation: fadeIn 0.2s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .profile-dropdown .dropdown-item {
          transition: all 0.2s ease;
          border-radius: 8px;
          margin: 4px;
        }
        
        .profile-dropdown .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(4px);
        }
        
        .mobile-menu-dropdown {
          animation: slideDown 0.2s ease-out;
        }
        
        .logo-glow {
          filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
        }
        
        .nav-margin {
          margin-bottom: 5rem;
        }
        
        .nav-content {
          margin-top: 4.5rem;
        }
        
        .btn-profile-hover:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }
      `}</style>

      <nav className={`navbar navbar-expand-lg fixed-top py-2 ${scrolled ? 'nav-scrolled' : 'nav-gradient'} shadow-lg nav-margin`} style={{ zIndex: 1030 }}>
        <div className="container position-relative">
          <Link className="navbar-brand d-flex align-items-center" href="/" onClick={closeAll}>
            <div className="position-relative">
              <img
                src="/images/lost and found logo.png"
                alt="Lost & Found Logo"
                width="65"
                height="45"
                className="me-2 logo-glow"
              />
            </div>
          </Link>

          <div className="d-none d-lg-flex align-items-center ms-auto gap-3">
            <ul className="navbar-nav me-3">
              <li className="nav-item">
                <Link className="nav-link px-3 d-flex align-items-center nav-link-hover text-white" href="/" onClick={closeAll}>
                  <FaHome className="me-2" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 d-flex align-items-center nav-link-hover text-white" href="/lost" onClick={closeAll}>
                  <FaSearch className="me-2" />
                  <span>Lost</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 d-flex align-items-center nav-link-hover text-white" href="/found" onClick={closeAll}>
                  <FaPlusCircle className="me-2" />
                  <span>Found</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 d-flex align-items-center nav-link-hover text-white" href="/browse" onClick={closeAll}>
                  <FaTh className="me-2" />
                  <span>Browse</span>
                </Link>
              </li>
            </ul>

            <div className="position-relative">
              <button
                className="btn  border-2 d-flex align-items-center gap-2 rounded-pill px-3 py-2 btn-profile-hover"
                onClick={toggleProfile}
                aria-expanded={isProfileOpen}
                style={{ 
                  background: isProfileOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                }}
              >
              <FaUserCircle size={20} style={{color:"white"}} />
               
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown position-absolute end-0 mt-2 text-white" style={{ minWidth: '270px', zIndex: 1040 }}>
                  {user ? (
                    <>
                      <div className="p-4 border-bottom border-white border-opacity-10">
                        <div className="d-flex align-items-center">
                          <div className="bg-white text-primary rounded-circle p-2 me-3">
                            <FaUserCircle size={24} />
                          </div>
                          <div>
                            <strong className="d-block">{user.name || "User"}</strong>
                            <small className="opacity-90">{user.email}</small>
                          </div>
                        </div>
                      </div>
                      <div className="py-2 px-2">
                        <Link href="/userProfile" className="dropdown-item d-flex align-items-center px-3 py-2 text-white" onClick={closeAll}>
                          <FaUserCircle className="me-3" />
                          <div>
                            <div className="fw-medium">My Profile</div>
                            <small className="opacity-75">View your profile</small>
                          </div>
                        </Link>
                        <Link href="/myItems" className="dropdown-item d-flex align-items-center px-3 py-2 text-white" onClick={closeAll}>
                          <FaTh className="me-3" />
                          <div>
                            <div className="fw-medium">My Items</div>
                            <small className="opacity-75">Manage your reports</small>
                          </div>
                        </Link>
                       
                        <div className="dropdown-divider my-1 border-white border-opacity-10"></div>
                        <button
                          className="dropdown-item d-flex align-items-center text-white px-3 py-2 w-100 border-0 bg-transparent"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="me-3" />
                          <div>
                            <div className="fw-medium">Logout</div>
                            <small className="opacity-75">Sign out of account</small>
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-3 px-4">
                      <div className="text-center mb-3">
                        <div className="bg-white text-primary rounded-circle d-inline-flex p-3 mb-2">
                          <FaUserCircle size={24} />
                        </div>
                        <h6 className="fw-bold mb-1">Welcome!</h6>
                        <p className="opacity-75 small mb-3">Sign in to access all features</p>
                      </div>
                      <div className="d-grid gap-2">
                        <Link href="/loginPage" className="btn btn-light btn-sm rounded-pill text-primary fw-medium" onClick={closeAll}>
                          <FaSignInAlt className="me-2" />
                          Login
                        </Link>
                        <Link href="/signup" className="btn btn-outline-light btn-sm rounded-pill" onClick={closeAll}>
                          <FaUserPlus className="me-2" />
                          Register
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex d-lg-none align-items-center ms-auto gap-2">
            <button
              className="btn  rounded-circle p-2 btn-profile-hover"
              onClick={toggleProfile}
              aria-expanded={isProfileOpen}
              style={{ 
                background: isProfileOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
              }}
            >
              <FaUserCircle size={18} style={{color:"white"}} />
            </button>

           <button
  className="navbar-toggler navbar-dark rounded-2 px-2"
  type="button"
  onClick={toggleMenu}
>
  <span className="navbar-toggler-icon"></span>
</button>

          </div>

         
          {isProfileOpen && (
            <div className="d-lg-none position-absolute top-100 start-0 w-100 bg-white shadow-lg rounded-bottom-3 mobile-menu-dropdown" style={{ zIndex: 1040 }}>
              <div className="d-flex flex-column">
                <div className="p-4 border-bottom" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="d-flex align-items-center text-white">
                    <div className="bg-white text-primary rounded-circle p-2 me-3">
                      <FaUserCircle size={24} />
                    </div>
                    <div>
                      <strong className="d-block">{user ? (user.name || "User") : "Account"}</strong>
                      {user && <small className="opacity-90">{user.email}</small>}
                    </div>
                  </div>
                </div>

                <div className="flex-grow-1 overflow-auto py-3">
                  {user ? (
                    <>
                      <Link href="/userProfile" className="dropdown-item d-flex align-items-center px-3 py-3 border-bottom" onClick={closeAll}>
                        <FaUserCircle className="me-3 text-primary" size={20} />
                        <div>
                          <div className="fw-medium">My Profile</div>
                          <small className="text-muted">Personal information</small>
                        </div>
                      </Link>
                      <Link href="/myItems" className="dropdown-item d-flex align-items-center px-3 py-3 border-bottom" onClick={closeAll}>
                        <FaTh className="me-3 text-primary" size={20} />
                        <div>
                          <div className="fw-medium">My Items</div>
                          <small className="text-muted">Manage your reports</small>
                        </div>
                      </Link>
                      <Link href="/settings" className="dropdown-item d-flex align-items-center px-3 py-3 border-bottom" onClick={closeAll}>
                        <FaCog className="me-3 text-primary" size={20} />
                        <div>
                          <div className="fw-medium">Settings</div>
                          <small className="text-muted">Account preferences</small>
                        </div>
                      </Link>
                      <div className="p-3">
                        <button
                          className="btn btn-danger w-100 rounded-pill d-flex align-items-center justify-content-center py-2"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="me-2" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4">
                      <div className="text-center mb-4">
                        <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                          <FaUserCircle size={28} />
                        </div>
                        <h6 className="fw-bold mb-1">Welcome!</h6>
                        <p className="text-muted small">Sign in to access all features</p>
                      </div>
                      <div className="d-grid gap-2">
                        <Link href="/loginPage" className="btn btn-primary btn-lg rounded-pill" onClick={closeAll}>
                          <FaSignInAlt className="me-2" />
                          Login
                        </Link>
                        <Link href="/signup" className="btn btn-outline-primary btn-lg rounded-pill" onClick={closeAll}>
                          <FaUserPlus className="me-2" />
                          Register
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          
          {isMenuOpen && (
            <div className="d-lg-none position-absolute top-100 start-0 w-100 bg-white shadow-lg rounded-bottom-3 border-top mobile-menu-dropdown" style={{ zIndex: 1040 }}>
              <ul className="navbar-nav flex-column m-0 p-3">
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center py-3 text-dark" href="/" onClick={closeAll}>
                    <FaHome className="me-3 text-primary" size={18} />
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center py-3 text-dark" href="/lost" onClick={closeAll}>
                    <FaSearch className="me-3 text-danger" size={18} />
                    <span>Report Lost Item</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center py-3 text-dark" href="/found" onClick={closeAll}>
                    <FaPlusCircle className="me-3 text-success" size={18} />
                    <span>Report Found Item</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center py-3 text-dark" href="/browse" onClick={closeAll}>
                    <FaTh className="me-3 text-primary" size={18} />
                    <span>Browse Items</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div className="nav-content"></div>
    </>
  );
}