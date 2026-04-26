"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaUsers, FaBullhorn, FaBookOpen, FaShieldAlt, FaTag, FaMobileAlt, FaBook, FaFileAlt, FaGem, FaTshirt, FaBox } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        const statsRes = await fetch("/api/items?limit=100");
        const data = await statsRes.json();
        
        // Handle paginated response structure
        const allItems = data.items || [];
        
        setStats({
          total: allItems.length,
          lost: allItems.filter(item => item.type === 'lost').length,
          found: allItems.filter(item => item.type === 'found').length
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setStats({ total: 0, lost: 0, found: 0 });
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  const categories = [
    { id: "all", name: "All Items", icon: <FaBox size={24} />, count: stats.total },
    { id: "electronics", name: "Electronics", icon: <FaMobileAlt size={24} /> },
    { id: "stationary", name: "Stationary", icon: <FaBook size={24} /> },
    { id: "documents", name: "Documents", icon: <FaFileAlt size={24} /> },
    { id: "jewelry", name: "Jewelry", icon: <FaGem size={24} /> },
    { id: "clothing", name: "Clothing", icon: <FaTshirt size={24} /> },
  ];

  const handleCategoryClick = (categoryId) => {
    if (categoryId === "all") {
      router.push("/browse");
    } else {

      router.push(`/browse?cat=${categoryId}`);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Hero Section */}
      <section className="py-5 text-white position-relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="mb-4">
                <h1 className="display-4 fw-bold mb-4">
                  GAMICA Lost & Found Portal
                </h1>

                <p className="lead mb-5 fs-5" style={{ opacity: 0.9 }}>
                  Report lost items or found belongings within our Campus community.
                  Our portal connects campus members to help reunite items with their owners.
                </p>

                <div className="d-flex flex-wrap gap-3">
                  <Link
                    href="/lost"
                    className="btn-primary-custom btn-lg px-4 py-3 fw-bold rounded-pill shadow text-decoration-none"
                  >
                    <FaBullhorn className="me-2" />
                    Report Lost Item
                  </Link>
                  <Link
                    href="/found"
                    className="btn-outline-custom btn-lg px-4 py-3 fw-bold rounded-pill text-decoration-none"
                  >
                    Report Found Item
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="position-relative">
                <div className="card-custom p-5 mx-auto" style={{ maxWidth: '500px' }}>
                  <div className="text-center mb-4">
                    <div className="display-3 fw-bold mb-2" style={{ color: '#667eea' }}>{stats.total || 0}</div>
                    <h2 className="h5" style={{ color: '#667eea' }}>Active Reports</h2>
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <div className="text-center p-3">
                        <div className="h3 fw-bold mb-1" style={{ color: '#667eea' }}>{stats.lost || 0}</div>
                        <div className="text-muted small">Lost Items</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3">
                        <div className="h3 fw-bold mb-1" style={{ color: "#667eea" }}>{stats.found || 0}</div>
                        <div className="text-muted small">Found Items</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Campus Community</span>
                      <span className="fw-bold" style={{ color: '#667eea' }}>
                        <FaUsers className="me-1" />
                        Active Portal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-dark">Browse By Category</h2>
            <p className="lead text-muted mb-4">Find items based on their type</p>
          </div>

          <div className="row g-4 justify-content-center">
            {categories.map((category, index) => (
              <div key={category.id} className="col-6 col-md-4 col-lg-2">
                <button
                  className="btn btn-outline-primary w-100 p-4 h-100 d-flex flex-column align-items-center justify-content-center category-btn"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="mb-3" style={{ color: 'var(--color-primary-500)' }}>
                    {category.icon}
                  </div>
                  <div className="fw-bold text-dark">{category.name}</div>
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <Link 
              href="/browse" 
              className="btn-primary-custom btn-lg px-5 py-3 rounded-pill fw-bold text-decoration-none"
            >
              <FaSearch className="me-2" />
              Browse All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Support Services Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-dark">GAMICA Support Services</h2>
            <p className="lead text-muted mb-4">Additional resources available on campus</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }}>
                      <FaShieldAlt size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-dark">Campus Security</h3>
                      <p className="text-muted small mb-0">24/7 security assistance for urgent lost items</p>
                    </div>
                  </div>
                  <div className="fw-bold">
                    <a href="tel:911" className="text-decoration-none" style={{ color: '#667eea' }}>Ext. 911</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }}>
                      <FaBookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-dark">Library Desk</h3>
                      <p className="text-muted small mb-0">Common location for found academic items</p>
                    </div>
                  </div>
                  <div className="fw-bold">
                    <a href="mailto:library@uni.edu" className="text-decoration-none" style={{ color: '#667eea' }}>library@uni.edu</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }}>
                      <FaUsers size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-dark">Student Affairs</h3>
                      <p className="text-muted small mb-0">Official documentation and ID assistance</p>
                    </div>
                  </div>
                  <div className="fw-bold">
                    <a href="mailto:student@uni.edu" className="text-decoration-none" style={{ color: '#667eea' }}>student@uni.edu</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-5 text-white" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container">
          <div className="text-center py-5">
            <h2 className="display-5 fw-bold mb-4">Need to Report Something?</h2>
            <p className="lead mb-5" style={{ opacity: 0.9 }}>
              Our portal is the fastest way to report lost or found items on campus.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link
                href="/lost"
                className="btn-primary-custom btn-lg px-4 py-3 fw-bold rounded-pill shadow text-decoration-none"
              >
                <FaBullhorn className="me-2" />
                Report Lost Item
              </Link>
              <Link
                href="/browse"
                className="btn-outline-custom btn-lg px-5 py-3 fw-bold rounded-pill text-decoration-none"
              >
                <FaSearch className="me-2" />
                Browse Current Items
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}