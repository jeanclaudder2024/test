import React from 'react';
import { Link } from 'wouter';
import { 
  Ship,
  Anchor, 
  BarChart4, 
  ChevronRight, 
  Globe, 
  Layers, 
  Map, 
  MessageSquare,
  Users,
  Shield, 
  Zap,
  Factory
} from 'lucide-react';

export default function LandingPageBootstrap() {
  return (
    <div className="min-h-screen">
      {/* Navigation - Bootstrap Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <Ship className="me-2" size={24} />
            <span className="fw-bold">Maritime Tracker</span>
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
                <a className="nav-link" href="#pricing">Pricing</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#testimonials">Testimonials</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#faq">FAQ</a>
              </li>
              <li className="nav-item ms-lg-3">
                <Link href="/auth">
                  <a className="btn btn-outline-light">Log In</a>
                </Link>
              </li>
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <Link href="/dashboard">
                  <a className="btn btn-light text-primary">
                    Get Started
                    <ChevronRight className="ms-1" size={16} />
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section with Bootstrap */}
      <div className="bg-dark text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">Track Your Fleet in Real-Time</h1>
              <p className="lead mb-4">
                Our maritime tracking platform gives you complete visibility into your vessel operations, with real-time location data, comprehensive analytics, and powerful management tools.
              </p>
              <div className="d-flex gap-3">
                <Link href="/dashboard">
                  <a className="btn btn-primary btn-lg px-4">
                    Start Free Trial
                  </a>
                </Link>
                <Link href="/live-tracking">
                  <a className="btn btn-outline-light btn-lg px-4">
                    Live Demo
                  </a>
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img 
                  src="https://images.unsplash.com/photo-1561361398-a957b93dbf35?q=80&w=1000&auto=format&fit=crop" 
                  alt="Oil vessel at sea" 
                  className="img-fluid rounded-3 shadow"
                  style={{ height: '450px', objectFit: 'cover', width: '100%' }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25 rounded-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-4 mb-md-0">
              <div className="bg-white rounded-3 shadow-sm p-4">
                <h2 className="display-5 fw-bold text-primary mb-0">2,500+</h2>
                <p className="text-muted mb-0">Vessels Tracked</p>
              </div>
            </div>
            <div className="col-md-3 mb-4 mb-md-0">
              <div className="bg-white rounded-3 shadow-sm p-4">
                <h2 className="display-5 fw-bold text-primary mb-0">70+</h2>
                <p className="text-muted mb-0">Refineries</p>
              </div>
            </div>
            <div className="col-md-3 mb-4 mb-md-0">
              <div className="bg-white rounded-3 shadow-sm p-4">
                <h2 className="display-5 fw-bold text-primary mb-0">73</h2>
                <p className="text-muted mb-0">Ports Worldwide</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="bg-white rounded-3 shadow-sm p-4">
                <h2 className="display-5 fw-bold text-primary mb-0">24/7</h2>
                <p className="text-muted mb-0">Live Updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Bootstrap */}
      <section id="features" className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Powerful Maritime Tools</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Our comprehensive vessel tracking system provides unparalleled visibility into your maritime operations
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                    <Ship className="text-primary" size={32} />
                  </div>
                  <h3 className="fs-4 fw-bold mb-3">Vessel Tracking</h3>
                  <p className="text-muted">
                    Real-time position updates with detailed vessel information and voyage history
                  </p>
                  <hr className="my-4" />
                  <ul className="list-unstyled text-start">
                    <li className="mb-2 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Live position tracking with AIS data</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Historical voyage replays</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>ETA predictions and port alerts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                    <Map className="text-primary" size={32} />
                  </div>
                  <h3 className="fs-4 fw-bold mb-3">Interactive Maps</h3>
                  <p className="text-muted">
                    Detailed maritime maps showing vessels, ports, and refineries with real-time connections
                  </p>
                  <hr className="my-4" />
                  <ul className="list-unstyled text-start">
                    <li className="mb-2 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Global coverage with detailed mapping</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Port and refinery connections</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Customizable filters and views</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                    <BarChart4 className="text-primary" size={32} />
                  </div>
                  <h3 className="fs-4 fw-bold mb-3">Advanced Analytics</h3>
                  <p className="text-muted">
                    Comprehensive data analysis tools to optimize your maritime operations
                  </p>
                  <hr className="my-4" />
                  <ul className="list-unstyled text-start">
                    <li className="mb-2 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Performance metrics and KPIs</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <ChevronRight className="text-primary me-2" size={18} />
                      <span>Fuel consumption analytics</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
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

      {/* Maritime Assets Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h2 className="display-5 fw-bold mb-4">Complete Maritime Asset Visibility</h2>
              <p className="lead mb-4">
                Track not just vessels, but all key maritime infrastructure in one powerful platform. Our system connects vessels, refineries, and ports to give you the complete picture.
              </p>
              
              <div className="row g-4 mt-2">
                <div className="col-md-6">
                  <div className="d-flex">
                    <div className="bg-primary text-white p-2 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
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
                    <div className="bg-primary text-white p-2 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
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
                    <div className="bg-primary text-white p-2 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
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
                    <div className="bg-primary text-white p-2 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
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
                className="img-fluid rounded-3 shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Bootstrap */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-5 text-center">
          <h2 className="display-5 fw-bold mb-3">Ready to Transform Your Maritime Operations?</h2>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: '700px' }}>
            Join thousands of shipping companies already using our platform for better fleet management
          </p>
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
            <Link href="/auth">
              <a className="btn btn-outline-light btn-lg px-5">Book a Demo</a>
            </Link>
            <Link href="/dashboard">
              <a className="btn btn-light text-primary btn-lg px-5">
                Get Started Now
                <ChevronRight className="ms-1" size={16} />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with Bootstrap */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <Ship className="me-2" size={24} />
                  <span className="fs-4 fw-bold">Maritime Tracker</span>
                </div>
                <p className="text-light opacity-75">
                  The next generation of maritime intelligence for modern fleet operations
                </p>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold mb-3">Product</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Features</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Pricing</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">API</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Integrations</a></li>
              </ul>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold mb-3">Resources</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Documentation</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Blog</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Case Studies</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Support</a></li>
              </ul>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <h5 className="fw-bold mb-3">Company</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">About</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Careers</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Privacy Policy</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-light opacity-75">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <hr className="my-4 opacity-25" />
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-3 mb-md-0 text-light opacity-75">
              © 2025 Maritime Tracker. All rights reserved.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-decoration-none text-light opacity-75">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-decoration-none text-light opacity-75">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-decoration-none text-light opacity-75">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="text-decoration-none text-light opacity-75">
                <i className="bi bi-instagram"></i>
              </a>
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