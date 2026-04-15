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
        const statsRes = await fetch("/api/items");
        const allItems = await statsRes.json();
        setStats({
          total: allItems.length,
          lost: allItems.filter(item => item.type === 'lost').length,
          found: allItems.filter(item => item.type === 'found').length
        });
      } catch (error) {
        console.error("Error fetching data:", error);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .category-btn {
          transition: all 0.3s ease;
          border: 2px solid #e5e7eb;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .category-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }
        
        .floating {
          animation: float 6s ease-in-out infinite;
          
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .btn-hover-grow {
          transition: all 0.3s ease;
        }
        
        .btn-hover-grow:hover {
          transform: scale(1.05);
        }
        
        .hero-title {
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
        }
        
        .btn-website-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-website-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-outline-website {
          border: 2px solid white;
          color: white;
          background: transparent;
          transition: all 0.3s ease;
        }
        
        .btn-outline-website:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .service-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
          border-radius: 16px;
          border: 2px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }
        
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.15);
          border-color: rgba(102, 126, 234, 0.3);
        }
        
        .category-icon {
          color: #667eea;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="min-vh-100 bg-gray-50">
        <section className="hero-gradient text-white py-5 position-relative overflow-hidden">
          <div className="container position-relative z-10 py-5">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-5 mb-lg-0 fade-in">
                <div className="mb-4">
                  <h1 className="display-4 fw-bold mb-4 hero-title">
                    GAMICA Lost & Found Portal
                  </h1>

                  <p className="lead mb-5 opacity-90 fs-5">
                    Report lost items or found belongings within our Camous community.
                    Our portal connects campus members to help reunite items with their owners.
                  </p>

                  <div className="d-flex flex-wrap gap-3">
                    <Link
                      href="/lost"
                      className="btn btn-light btn-lg px-4 py-3 fw-bold rounded-pill btn-hover-grow shadow"
                      style={{ color: "#667eea" }}
                    >
                      <FaBullhorn className="me-2" />
                      Report Lost Item
                    </Link>
                    <Link
                      href="/found"
                      className="btn btn-outline-website btn-lg px-4 py-3 fw-bold rounded-pill"
                    >
                      Report Found Item
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="position-relative">
                  <div className="floating" style={{ animationDelay: '1s' }}>
                    <div className="stat-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
                      <div className="text-center mb-4">
                        <div className="display-3 fw-bold mb-2" style={{ color: '#667eea' }}>{stats.total || 0}</div>
                        <h3 className="h5" style={{ color: '#667eea' }}>Active Reports</h3>
                      </div>

                      <div className="row g-3">
                        <div className="col-6">
                          <div className="text-center p-3">
                            <div className="h2 fw-bold mb-1" style={{ color: '#667eea' }}>{stats.lost || 0}</div>
                            <div className="text-muted small">Lost Items</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center p-3">
                            <div className="h2 fw-bold mb-1"  style={{ color: "#667eea" }}>{stats.found || 0}</div>
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
          </div>
        </section>

        <section className="py-5 bg-white">
          <div className="container">
            <div className="text-center mb-5 fade-in">
              <h2 className="display-5 fw-bold mb-3 text-gray-800">Browse By Category</h2>
              <p className="lead text-muted mb-4">Find items based on their type</p>
            </div>

            <div className="row g-4 justify-content-center fade-in">
              {categories.map((category, index) => (
                <div key={category.id} className="col-6 col-md-4 col-lg-2">
                  <button
                    className="category-btn w-100 p-4 rounded-3"
                    onClick={() => handleCategoryClick(category.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="category-icon mb-3">
                      {category.icon}
                    </div>
                    <div className="fw-bold mb-2 text-gray-800">{category.name}</div>
                   
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <Link href="/browse" className="btn btn-website-gradient btn-lg px-5 py-3 rounded-pill fw-bold">
                <FaSearch className="me-2" />
                Browse All Categories
              </Link>
            </div>
          </div>
        </section>

        <section className="py-5 bg-white">
          <div className="container">
            <div className="text-center mb-5 fade-in">
              <h2 className="display-5 fw-bold mb-3 text-gray-800">GAMICA Support Services</h2>
              <p className="lead text-muted mb-4">Additional resources available on campus</p>
            </div>

            <div className="row g-4">
              <div className="col-md-4 fade-in">
                <div className="service-card p-4 h-100">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }}>
                      <FaShieldAlt size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-gray-800">Campus Security</h3>
                      <p className="text-muted small mb-0">24/7 security assistance for urgent lost items</p>
                    </div>
                  </div>
                  <div className="fw-bold" style={{ color: '#667eea' }}>Ext. 911</div>
                </div>
              </div>

              <div className="col-md-4 fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="service-card p-4 h-100">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }}>
                      <FaBookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-gray-800">Library Desk</h3>
                      <p className="text-muted small mb-0">Common location for found academic items</p>
                    </div>
                  </div>
                  <div className="fw-bold" style={{ color: '#667eea' }}>library@uni.edu</div>
                </div>
              </div>

              <div className="col-md-4 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="service-card p-4 h-100">
                  <div className="d-flex align-items-start mb-3">
                    <div className="rounded-circle p-3 me-3" style={{ background: '#667eea', color: 'white' }}>
                      <FaUsers size={24} />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1 text-gray-800">Student Affairs</h3>
                      <p className="text-muted small mb-0">Official documentation and ID assistance</p>
                    </div>
                  </div>
                  <div className="fw-bold" style={{ color: '#667eea' }}>student@uni.edu</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="container">
            <div className="text-center py-5 fade-in">
              <h2 className="display-5 fw-bold mb-4 text-white">Need to Report Something?</h2>
              <p className="lead mb-5 opacity-90 text-white">
                Our portal is the fastest way to report lost or found items on campus.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link
                      href="/lost"
                      className="btn btn-light btn-lg px-4 py-3 fw-bold rounded-pill btn-hover-grow shadow"
                      style={{ color: "#667eea" }}
                    >
                      <FaBullhorn className="me-2" />
                      Report Lost Item
                    </Link>
                <Link
                  href="/browse"
                  className="btn btn-outline-website btn-lg px-5 py-3 fw-bold rounded-pill"
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