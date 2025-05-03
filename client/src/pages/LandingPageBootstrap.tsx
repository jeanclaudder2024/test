import React from 'react';
import { Link } from 'wouter';
import { 
  Ship,
  Anchor, 
  BarChart4, 
  ChevronRight, 
  Globe, 
  Layers, 
  Map as MapIcon, 
  MessageSquare,
  Users,
  Shield, 
  Zap,
  Factory,
  Navigation
} from 'lucide-react';
import '../assets/vesselian-style.css';

export default function LandingPageBootstrap() {
  return (
    <div className="min-h-screen">
      {/* Navigation - Vesselian Style */}
      <nav className="navbar navbar-expand-lg navbar-dark navbar-vesselian sticky-top">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <Anchor className="me-2" size={24} />
            <span className="fw-bold">Vesselian</span>
          </a>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="#features">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how-it-works">How It Works</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#vessels">Vessels</a>
              </li>
              <li className="nav-item ms-lg-3">
                <Link href="/auth">
                  <button className="btn btn-vesselian-outline">Log In</button>
                </Link>
              </li>
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <Link href="/dashboard">
                  <button className="btn btn-vesselian">
                    Get Started
                    <ChevronRight className="ms-1" size={16} />
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section with Vesselian Style */}
      <div className="hero-container py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-heading display-4 mb-4">
                Track Your Fleet in Real-Time.
                <br />
                Optimize Your Ship Operations.
              </h1>
              <p className="lead mb-4">
                Manage up to 10 ships with live location tracking, fuel monitoring, and trip management.
              </p>
              <div className="d-flex gap-3">
                <Link href="/dashboard">
                  <button className="btn btn-vesselian btn-lg">
                    Get Started Now
                  </button>
                </Link>
              </div>
            </div>
            <div className="col-lg-5 offset-lg-1">
              <div className="row">
                <div className="col-6 mb-4">
                  <div className="vesselian-card h-100 bg-white p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="step-number">01</div>
                      <h5 className="fw-bold mb-0">Sign Up</h5>
                    </div>
                    <p className="text-muted small mb-0">Create an account and register your ships in the app</p>
                  </div>
                </div>
                <div className="col-6 mb-4">
                  <div className="vesselian-card h-100 bg-white p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="step-number">02</div>
                      <h5 className="fw-bold mb-0">Track</h5>
                    </div>
                    <p className="text-muted small mb-0">Monitor location, status and performance of vessels</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="vesselian-card h-100 bg-white p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="step-number">03</div>
                      <h5 className="fw-bold mb-0">Optimize</h5>
                    </div>
                    <p className="text-muted small mb-0">Use insights to improve efficiency and reduce costs</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="vesselian-card h-100 bg-white p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="step-number">04</div>
                      <h5 className="fw-bold mb-0">Manage</h5>
                    </div>
                    <p className="text-muted small mb-0">Complete maritime operations in one platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-5">
        <div className="container py-2">
          <div className="row g-4">
            <div className="col-md-3">
              <div className="stat-card">
                <h2>2,500+</h2>
                <p className="text-muted mb-0">Vessels Tracked</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <h2>70+</h2>
                <p className="text-muted mb-0">Refineries</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <h2>73</h2>
                <p className="text-muted mb-0">Ports Worldwide</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <h2>24/7</h2>
                <p className="text-muted mb-0">Live Updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Vesselian Style */}
      <section id="features" className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="section-heading display-5 mb-3">Powerful Maritime Tools</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Our comprehensive vessel tracking system provides unparalleled visibility into your maritime operations
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="vesselian-card bg-white">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="feature-icon mx-auto">
                      <Ship size={32} />
                    </div>
                    <h3 className="fs-4 fw-bold mb-3">Vessel Tracking</h3>
                    <p className="text-muted">
                      Real-time position updates with detailed vessel information and voyage history
                    </p>
                  </div>
                  <hr className="my-4" />
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Live position tracking with AIS data</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Historical voyage replays</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>ETA predictions and port alerts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="vesselian-card bg-white">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="feature-icon mx-auto">
                      <MapIcon size={32} />
                    </div>
                    <h3 className="fs-4 fw-bold mb-3">Interactive Maps</h3>
                    <p className="text-muted">
                      Detailed maritime maps showing vessels, ports, and refineries with real-time connections
                    </p>
                  </div>
                  <hr className="my-4" />
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Global coverage with detailed mapping</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Port and refinery connections</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Customizable filters and views</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="vesselian-card bg-white">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="feature-icon mx-auto">
                      <BarChart4 size={32} />
                    </div>
                    <h3 className="fs-4 fw-bold mb-3">Advanced Analytics</h3>
                    <p className="text-muted">
                      Comprehensive data analysis tools to optimize your maritime operations
                    </p>
                  </div>
                  <hr className="my-4" />
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Performance metrics and KPIs</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Fuel consumption analytics</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Custom reports and dashboards</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h2 className="section-heading display-5 mb-4">Empowering Ship Owners & Drivers</h2>
              <p className="lead mb-4">
                At Vesselian, we believe in making ship management simple, efficient, and data-driven. Our mission is to empower ship owners and drivers with real-time tracking, fuel monitoring, and comprehensive fleet management.
              </p>
              
              <div className="vesselian-card bg-white p-4 mb-4">
                <h3 className="fs-4 fw-bold mb-3">Simple Steps to Manage Your Fleet</h3>
                <p className="text-muted mb-4">
                  How the app works in a step-by-step process to make it easier for new users to understand.
                </p>
                <Link href="/dashboard">
                  <button className="btn btn-vesselian">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="col-lg-6">
              <img 
                src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=1000&auto=format&fit=crop" 
                alt="Ship management" 
                className="img-fluid vesselian-card"
                style={{ objectFit: 'cover', height: '400px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vessel List Section */}
      <section id="vessels" className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="section-heading display-5 mb-3">Vessel Fleet Management</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              View and manage your entire fleet of vessels with detailed information and status updates
            </p>
          </div>
          
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="vessel-card">
                <div className="vessel-detail">
                  <div className="d-flex align-items-center">
                    <Ship className="text-primary me-2" size={20} />
                    <div className="vessel-name">SS Voyager</div>
                    <div className="ms-auto">
                      <span className="status-indicator status-active"></span>
                      <small className="text-success">Active</small>
                    </div>
                  </div>
                  <div className="vessel-info mt-2">Atlantic Ocean • Ro-Ro Ship • Vessel Id: 249645</div>
                </div>
              </div>
              
              <div className="vessel-card">
                <div className="vessel-detail">
                  <div className="d-flex align-items-center">
                    <Ship className="text-primary me-2" size={20} />
                    <div className="vessel-name">SS Pioneer</div>
                    <div className="ms-auto">
                      <span className="status-indicator status-docked"></span>
                      <small className="text-warning">Docked</small>
                    </div>
                  </div>
                  <div className="vessel-info mt-2">Port of Rotterdam • Container Ship • Vessel Id: 249122</div>
                </div>
              </div>
              
              <div className="vessel-card">
                <div className="vessel-detail">
                  <div className="d-flex align-items-center">
                    <Ship className="text-primary me-2" size={20} />
                    <div className="vessel-name">SS Explorer</div>
                    <div className="ms-auto">
                      <span className="status-indicator status-active"></span>
                      <small className="text-success">Active</small>
                    </div>
                  </div>
                  <div className="vessel-info mt-2">Pacific Ocean • Tanker Ship • Vessel Id: 249331</div>
                </div>
              </div>
              
              <div className="vessel-card">
                <div className="vessel-detail">
                  <div className="d-flex align-items-center">
                    <Ship className="text-primary me-2" size={20} />
                    <div className="vessel-name">Naval Ship Warship</div>
                    <div className="ms-auto">
                      <span className="status-indicator status-active"></span>
                      <small className="text-success">Active</small>
                    </div>
                  </div>
                  <div className="vessel-info mt-2">Mediterranean Sea • Vessel Id: 249345 • Captain: David Morich</div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <Link href="/dashboard">
                  <button className="btn btn-vesselian">
                    View All Vessels
                    <ChevronRight className="ms-1" size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maritime Assets Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h2 className="section-heading display-5 mb-4">Complete Maritime Asset Visibility</h2>
              <p className="lead mb-4">
                Track not just vessels, but all key maritime infrastructure in one powerful platform. Our system connects vessels, refineries, and ports to give you the complete picture.
              </p>
              
              <div className="row g-4 mt-2">
                <div className="col-md-6">
                  <div className="d-flex">
                    <div className="feature-icon me-3" style={{ width: '60px', height: '60px' }}>
                      <Ship size={24} />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">Vessels</h5>
                      <p className="text-muted mb-0">All types of maritime vessels tracked in real-time</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex">
                    <div className="feature-icon me-3" style={{ width: '60px', height: '60px' }}>
                      <Factory size={24} />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">Refineries</h5>
                      <p className="text-muted mb-0">Monitor active refineries and their connections</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex">
                    <div className="feature-icon me-3" style={{ width: '60px', height: '60px' }}>
                      <Anchor size={24} />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">Ports</h5>
                      <p className="text-muted mb-0">Track port activity and linked infrastructure</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex">
                    <div className="feature-icon me-3" style={{ width: '60px', height: '60px' }}>
                      <Layers size={24} />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">Connections</h5>
                      <p className="text-muted mb-0">Visualize relationships between maritime assets</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <img 
                src="https://images.unsplash.com/photo-1612284296123-eebf9e30e3ec?q=80&w=1000&auto=format&fit=crop" 
                alt="Maritime infrastructure" 
                className="img-fluid vesselian-card"
                style={{ objectFit: 'cover', height: '450px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-5 text-center">
          <h2 className="display-5 fw-bold mb-3">Ready to Transform Your Maritime Operations?</h2>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: '700px' }}>
            Join thousands of shipping companies already using our platform for better fleet management
          </p>
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
            <Link href="/auth">
              <button className="btn btn-outline-light btn-lg px-5">Book a Demo</button>
            </Link>
            <Link href="/dashboard">
              <button className="btn btn-light text-primary btn-lg px-5">
                Get Started Now
                <ChevronRight className="ms-1" size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-vesselian">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <Anchor className="me-2" size={24} />
                  <span className="fs-4 fw-bold">Vesselian</span>
                </div>
                <p className="opacity-75">
                  The next generation of maritime intelligence for modern fleet operations
                </p>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <h5 className="footer-heading">Product</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#">Features</a></li>
                <li className="mb-2"><a href="#">Pricing</a></li>
                <li className="mb-2"><a href="#">API</a></li>
                <li className="mb-2"><a href="#">Integrations</a></li>
              </ul>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <h5 className="footer-heading">Resources</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#">Documentation</a></li>
                <li className="mb-2"><a href="#">Blog</a></li>
                <li className="mb-2"><a href="#">Case Studies</a></li>
                <li className="mb-2"><a href="#">Support</a></li>
              </ul>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <h5 className="footer-heading">Company</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#">About</a></li>
                <li className="mb-2"><a href="#">Careers</a></li>
                <li className="mb-2"><a href="#">Privacy Policy</a></li>
                <li className="mb-2"><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <hr className="my-4 opacity-25" />
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-3 mb-md-0 opacity-75">
              © 2025 Vesselian. All rights reserved.
            </p>
            <div className="d-flex gap-3">
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-twitter"></i></a>
              <a href="#"><i className="bi bi-linkedin"></i></a>
              <a href="#"><i className="bi bi-instagram"></i></a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Bootstrap Icons CSS */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      
      {/* Bootstrap JS */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
        integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
        crossOrigin="anonymous">
      </script>
    </div>
  );
}