"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaSearch,
  FaPlusCircle,
  FaTh,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaHome,
  FaBars
} from 'react-icons/fa';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  // Check if current path is active
  const isActiveLink = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  // Fetch user data
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
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top" style={{ background: 'var(--gradient-primary)', zIndex: 1050 }}>
        <div className="container-fluid">
          {/* Logo */}
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <Image
              src="/images/lost and found logo.png"
              alt="Lost & Found Portal"
              width={32}
              height={32}
              className="me-2"
              priority
            />
            <span className="text-white fw-bold d-none d-sm-inline">GAMICA Portal</span>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ color: 'white' }}
          >
            <FaBars />
          </button>

          {/* Navigation Links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link 
                  href="/" 
                  className={`nav-link text-white ${isActiveLink('/') ? 'active fw-bold' : ''}`}
                >
                  <FaHome className="me-1" />
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  href="/lost" 
                  className={`nav-link text-white ${isActiveLink('/lost') ? 'active fw-bold' : ''}`}
                >
                  <FaSearch className="me-1" />
                  Lost
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  href="/found" 
                  className={`nav-link text-white ${isActiveLink('/found') ? 'active fw-bold' : ''}`}
                >
                  <FaPlusCircle className="me-1" />
                  Found
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  href="/browse" 
                  className={`nav-link text-white ${isActiveLink('/browse') ? 'active fw-bold' : ''}`}
                >
                  <FaTh className="me-1" />
                  Browse
                </Link>
              </li>
            </ul>

            {/* User Menu */}
            <ul className="navbar-nav">
              {user ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle text-white d-flex align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaUserCircle className="me-1" />
                    {user.name || 'User'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link href="/userProfile" className="dropdown-item">
                        <FaUserCircle className="me-2" />
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/myItems" className="dropdown-item">
                        <FaTh className="me-2" />
                        My Items
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item text-danger">
                        <FaSignOutAlt className="me-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link href="/loginPage" className="nav-link text-white">
                      <FaSignInAlt className="me-1" />
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/signup" className="btn btn-outline-light btn-sm ms-2">
                      <FaUserPlus className="me-1" />
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Add Bootstrap JS for dropdowns */}
      <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        async
      />

      {/* Spacer */}
      <div style={{ height: '76px' }} />
    </>
  );
}