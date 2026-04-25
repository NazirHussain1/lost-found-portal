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
    <>
      <style jsx global>{`
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .hero-gradient {
          background: var(--gradient-primary);
          position: relative;
          overflow: hidden;
        }
        
        .hero-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }
        
        .category-btn {
          transition: var(--transition-base);
          border: 2px solid var(--color-gray-200);
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
        }
        
        .category-btn:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-primary);
          border-color: var(--color-primary-500);
        }
        
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        
        .hero-title {
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
        }
        
        .category-icon {
          color: var(--color-primary-500);
          margin-bottom: var(--spacing-3);
        }
      `}</style>

      <div className="min-vh-100 bg-gray-50">
        {/* Hero Section */}
        <section className="hero-gradient text-white py-5 position-relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="container position-relative z-10 py-5">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-5 mb-lg-0 animate-slideUp">
                <div className="mb-4">
                  <h1 id="hero-heading" className="display-4 fw-bold mb-4 hero-title">
                    GAMICA Lost & Found Portal
                  </h1>

                  <p className="lead mb-5 opacity-90 fs-5">
                    Report lost items or found belongings within our Campus community.
                    Our portal connects campus members to help reunite items with their owners.
                  </p>

                  <div className="d-flex flex-wrap gap-3" role="group" aria-label="Main actions">
                    <Link
                      href="/lost"
                      className="btn-primary-custom btn-lg px-4 py-3 fw-bold rounded-pill shadow"
                      aria-describedby="lost-item-desc"
                    >
                      <FaBullhorn className="me-2" aria-hidden="true" />
                      Report Lost Item
                    </Link>
                    <div id="lost-item-desc" className="sr-only">Report an item you have lost</div>
                    <Link
                      href="/found"
                      className="btn-outline-custom btn-lg px-4 py-3 fw-bold rounded-pill"
                      aria-describedby="found-item-desc"
                    >
                      Report Found Item
                    </Link>
                    <div id="found-item-desc" className="sr-only">Report an item you have found</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <div className="position-relative">
                  <div className="floating" style={{ animationDelay: '1s' }}>
                    <div className="card-custom p-5 mx-auto" style={{ maxWidth: '500px' }} role="region" aria-labelledby="stats-heading">
                      <div className="text-center mb-4">
                        <div className="display-3 fw-bold mb-2" style={{ color: '#667eea' }} aria-label={`${stats.total || 0} total active reports`}>{stats.total || 0}</div>
                        <h2 id="stats-heading" className="h5" style={{ color: '#667eea' }}>Active Reports</h2>
                      </div>

                      <div className="row g-3">
                        <div className="col-6">
                          <div className="text-center p-3">
                            <div className="h3 fw-bold mb-1" style={{ color: '#667eea' }} aria-label={`${stats.lost || 0} lost items`}>{stats.lost || 0}</div>
                            <div className="text-muted small">Lost Items</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center p-3">
                            <div className="h3 fw-bold mb-1"  style={{ color: "#667eea" }} aria-label={`${stats.found || 0} found items`}>{stats.found || 0}</div>
                            <div className="text-muted small">Found Items</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted small">Campus Community</span>
                          <span className="fw-bold" style={{ color: '#667eea' }}>
                            <FaUsers className="me-1" aria-hidden="true" />
                            Active Portal
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-5 bg-white" aria-labelledby="categories-heading">
          <div className="container">
            <div className="text-center mb-5 animate-fadeIn">
              <h2 id="categories-heading" className="display-5 fw-bold mb-3 text-gray-800">Browse By Category</h2>
              <p className="lead text-muted mb-4">Find items based on their type</p>
            </div>

            <div className="row g-4 justify-content-center animate-slideUp" role="group" aria-labelledby="categories-heading">
              {categories.map((category, index) => (
                <div key={category.id} className="col-6 col-md-4 col-lg-2">
                  <button
                    className="category-btn w-100 p-4 rounded-3"
                    onClick={() => handleCategoryClick(category.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    aria-label={`Browse ${category.name} items`}
                  >
                    <div className="category-icon mb-3" aria-hidden="true">
                      {category.icon}
                    </div>
                    <div className="fw-bold mb-2 text-gray-800">{category.name}</div>
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <Link 
                href="/browse" 
                className="btn-primary-custom btn-lg px-5 py-3 rounded-pill fw-bold"
                aria-describedby="browse-all-desc"
              >
                <FaSearch className="me-2" aria-hidden="true" />
                Browse All Categories
              </Link>
              <div id="browse-all-desc" className="sr-only">View all items across all categories</div>
            </div>
          </div>
        </section>

        {/* Support Services Section */}
        <section className="py-5 bg-white" aria-labelledby="services-heading">
          <div className="container">
            <div className="text-center mb-5 animate-fadeIn">
              <h2 id="services-heading" className="display-5 fw-bold mb-3 text-gray-800">GAMICA Support Services</h2>
              <p className="lead text-muted mb-4">Additional resources available on campus</p>
            </div>

            <div className="row g-4">
              <div className="col-md-4 animate-slideUp">
                <article className="service-card p-4 h-100">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }} aria-hidden="true">
                      <FaShieldAlt size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-gray-800">Campus Security</h3>
                      <p className="text-muted small mb-0">24/7 security assistance for urgent lost items</p>
                    </div>
                  </div>
                  <div className="fw-bold" style={{ color: '#667eea' }}>
                    <a href="tel:911" className="text-decoration-none" style={{ color: '#667eea' }}>Ext. 911</a>
                  </div>
                </article>
              </div>

              <div className="col-md-4 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <article className="service-card p-4 h-100">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }} aria-hidden="true">
                      <FaBookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-gray-800">Library Desk</h3>
                      <p className="text-muted small mb-0">Common location for found academic items</p>
                    </div>
                  </div>
                  <div className="fw-bold" style={{ color: '#667eea' }}>
                    <a href="mailto:library@uni.edu" className="text-decoration-none" style={{ color: '#667eea' }}>library@uni.edu</a>
                  </div>
                </article>
              </div>

              <div className="col-md-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <article className="service-card p-4 h-100">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }} aria-hidden="true">
                      <FaUsers size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-gray-800">Student Affairs</h3>
                      <p className="text-muted small mb-0">Official documentation and ID assistance</p>
                    </div>
                  </div>
                  <div className="fw-bold" style={{ color: '#667eea' }}>
                    <a href="mailto:student@uni.edu" className="text-decoration-none" style={{ color: '#667eea' }}>student@uni.edu</a>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="container">
            <div className="text-center py-5 animate-fadeIn">
              <h2 className="display-5 fw-bold mb-4 text-white">Need to Report Something?</h2>
              <p className="lead mb-5 opacity-90 text-white">
                Our portal is the fastest way to report lost or found items on campus.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link
                      href="/lost"
                      className="btn-primary-custom btn-lg px-4 py-3 fw-bold rounded-pill shadow"
                    >
                      <FaBullhorn className="me-2" />
                      Report Lost Item
                    </Link>
                <Link
                  href="/browse"
                  className="btn-outline-custom btn-lg px-5 py-3 fw-bold rounded-pill"
                >
                  <FaSearch className="me-2" />
                  Browse Current Items
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}