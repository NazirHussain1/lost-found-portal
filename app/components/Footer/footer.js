"use client";

import { FaGithub, FaWhatsapp, FaLinkedin, FaHome, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBoxOpen, FaExclamationTriangle, FaHandHolding, FaShieldAlt, FaLock, FaCheckCircle, FaStar } from 'react-icons/fa';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="text-white py-5"
            style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderTop: '3px solid',
                borderImage: 'linear-gradient(90deg, #667eea, #764ba2, #667eea) 1'
            }}
        >
            <div className="container">
                <div className="row">

                    <div className="col-lg-4 mb-4 mb-lg-0">
                        <div className="d-flex align-items-center mb-3">
                            <div
                                className="me-3 rounded-3 p-2"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    border: '1px solid rgba(102, 126, 234, 0.2)'
                                }}
                            >
                                <img
                                    src="/images/lost and found logo.png"
                                    alt="Lost & Found Logo"
                                    style={{
                                        height: '50px',
                                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                                    }}
                                />
                            </div>
                            <div>
                                <h3
                                    className="fw-bold mb-0"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    Lost & Found
                                </h3>
                                <small className="text-light opacity-75">Campus Portal</small>
                            </div>
                        </div>
                        <p className="text-light opacity-75 mb-4">
                            Reuniting lost items with their owners, one post at a time.
                            Creating a community of trust and responsibility.
                        </p>
                        <div className="d-flex gap-3">
                            {[
                                { icon: <FaGithub size={18} />, href: "https://github.com/NazirHussain1", label: "GitHub" },
                                { icon: <FaWhatsapp size={18} />, href: "https://wa.me/923321716508", label: "WhatsApp" },
                                { icon: <FaLinkedin size={18} />, href: "https://www.linkedin.com/in/nazir-hussain-27b061360", label: "LinkedIn" }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                    aria-label={social.label}
                                >
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-circle social-icon"
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                                            color: '#667eea',
                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {social.icon}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
                        <h5 className="fw-bold mb-4" style={{
                            color: '#667eea',
                            fontSize: '1.1rem'
                        }}>Quick Links</h5>
                        <ul className="list-unstyled">
                            {[
                                { href: "/", icon: <FaHome size={14} />, text: "Home" },
                                { href: "/browse", icon: <FaBoxOpen size={14} />, text: "Browse Items" },
                                { href: "/lost", icon: <FaExclamationTriangle size={14} />, text: "Report Lost" },
                                { href: "/found", icon: <FaHandHolding size={14} />, text: "Report Found" }
                            ].map((link, index) => (
                                <li key={index} className="mb-2">
                                    <a
                                        href={link.href}
                                        className="text-light text-decoration-none opacity-75 d-flex align-items-center gap-2 footer-link"
                                        style={{
                                            transition: 'all 0.2s ease',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <span style={{ color: '#667eea' }}>{link.icon}</span>
                                        {link.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>


                    <div className="col-lg-3 col-md-4 mb-4 mb-md-0">
                        <h5 className="fw-bold mb-4" style={{
                            color: '#667eea',
                            fontSize: '1.1rem'
                        }}>Contact Us</h5>
                        <ul className="list-unstyled">
                            <li className="mb-3 d-flex align-items-start gap-2">
                                <div className="mt-1">
                                    <FaMapMarkerAlt size={14} style={{ color: '#667eea' }} />
                                </div>
                                <div>
                                    <span className="text-light opacity-75 small">
                                        GAMICA Campus
                                        Faisalabad
                                    </span>
                                </div>
                            </li>
                            <li className="mb-3 d-flex align-items-center gap-2">
                                <FaPhone size={14} style={{ color: '#667eea' }} />
                                <span className="text-light opacity-75 small">+92 3321716508</span>
                            </li>
                            <li className="d-flex align-items-center gap-2">

                                <FaEnvelope size={14} style={{ color: '#667eea' }} />
                                <span className="text-light opacity-75 small">nazirkhawaja251@gmail.com</span>
                            </li>
                        </ul>
                    </div>


                    <div className="col-lg-3 col-md-4">
                        <div
                            className="p-4 h-100 rounded-4"
                            style={{
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="text-center">
                                <h5 className="fw-bold mb-4" style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>Trust & Safety</h5>

                                <div className="mb-3">
                                    <div
                                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '70px',
                                            height: '70px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            fontSize: '1.8rem'
                                        }}
                                    >
                                        <FaShieldAlt />
                                    </div>
                                    <h6 className="fw-bold mb-2" style={{ color: '#667eea', fontSize: '1rem' }}>
                                        Verified Platform
                                    </h6>
                                    <p className="small text-light opacity-75 mb-0">
                                        GAMICA-approved secure system
                                    </p>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>


                <hr className="my-4" style={{
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    opacity: '0.5'
                }} />


                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
                        <small className="text-light opacity-75 d-flex align-items-center">
                            <span style={{ color: '#667eea', marginRight: '4px' }}>©</span>
                            {currentYear} Lost & Found Portal. All rights reserved.
                        </small>
                    </div>
                    <div className="col-md-6 text-center text-md-end">
                        <small className="text-light opacity-75 d-flex align-items-center justify-content-center justify-content-md-end gap-1">
                            Made by GAMICA Team
                        </small>
                    </div>
                </div>


                <div className="row mt-4">
                    <div className="col-12">
                        <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4">
                            {[
                                { value: "1,000+", label: "Items Reunited" },
                                { value: "500+", label: "Happy Users" },
                                { value: "24/7", label: "Active Support" },
                                { value: "99%", label: "Satisfaction" }
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div
                                        className="fw-bold mb-1"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            fontSize: '1.3rem'
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                    <small className="text-light opacity-75" style={{ fontSize: '0.85rem' }}>
                                        {stat.label}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            <style jsx>{`
                .social-icon:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                    color: white !important;
                    border-color: transparent !important;
                }
                
                .footer-link:hover {
                    color: #667eea !important;
                    opacity: 1 !important;
                    padding-left: 5px;
                }
            `}</style>
        </footer>
    );
}