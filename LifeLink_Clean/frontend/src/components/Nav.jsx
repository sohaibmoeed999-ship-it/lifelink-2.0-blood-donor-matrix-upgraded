// Nav.jsx
// This component is the top navigation bar that appears on every single page.

import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// We import AuthContext to know who is logged in and to get the logout function.
import { AuthContext } from '../context/AuthContext';
// Import some helpful icons.
import { Activity, User, Menu, X, LogOut, Shield } from 'lucide-react';

export default function Nav({ page, setPage }) {
  // Extract user details and the logout function from context.
  const { user, logout } = useContext(AuthContext);
  
  // This state tracks if the user has scrolled down the page. 
  // If true, we add a shadow to make the navbar stand out.
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // This state tracks whether the mobile menu is open or closed.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // This is the list of standard links shown in the navbar.
  const navigationLinks = [
    { label: 'Home', value: 'Home' },
    { label: 'Find Donor', value: 'Find' },
    { label: 'Become Donor', value: 'Donors' },
    { label: 'Hospitals', value: 'Hospitals' },
    { label: 'Reviews', value: 'Reviews' },
  ];

  // We use this effect to listen to the user's scrolling.
  useEffect(() => {
    const handleScroll = () => {
      // If the user scrolls down more than 20 pixels, set hasScrolled to true.
      if (window.scrollY > 20) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    
    // Add the listener when the component loads.
    window.addEventListener('scroll', handleScroll);
    
    // Clean up the listener when the component is removed.
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Helper function to change the page and close the mobile menu automatically.
  const handleNavigate = (newPageName) => { 
    setPage(newPageName); 
    setIsMobileMenuOpen(false); 
  };

  return (
    <>
      {/* The main navbar. If 'hasScrolled' is true, we add the 'scrolled' class for styling. */}
      <nav className={`nav ${hasScrolled ? 'scrolled' : ''}`}>
        
        {/* Brand/Logo Area on the left */}
        <div className="nav-brand" onClick={() => handleNavigate('Home')}>
          <Activity color="var(--primary)" size={24} strokeWidth={2.5} />
          Life<span className="nav-brand-dot">Link</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text3)', marginLeft: 4, fontFamily: 'var(--font-body)' }}>2.0</span>
        </div>

        {/* Desktop Navigation Links (Hidden on small screens via CSS) */}
        <div className="nav-links">
          {/* Loop through our list and create a button for each link */}
          {navigationLinks.map((link) => (
            <button
              key={link.value}
              // If the current page matches this link, add the 'active' class to highlight it.
              className={`nav-link ${page === link.value ? 'active' : ''}`}
              onClick={() => handleNavigate(link.value)}
            >
              {link.label}
            </button>
          ))}
          
          {/* Admin Link: Only show this if the user is actually an Admin. */}
          {user !== null && user.role === 'Admin' && (
            <button
              className={`nav-link ${page === 'Admin' ? 'active' : ''}`}
              onClick={() => handleNavigate('Admin')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Shield size={14} /> Admin
            </button>
          )}
        </div>

        {/* Action Buttons on the right side (Login / Profile) */}
        <div className="nav-actions">
          {user !== null ? (
            // If the user IS logged in, show their name and the Logout button.
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="var(--primary)" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{user.name}</span>
              </div>
              
              <button className="btn-ghost" onClick={logout} style={{ gap: 6 }}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            // If the user IS NOT logged in, show the Sign In button.
            <button className="btn-primary" onClick={() => handleNavigate('Auth')} style={{ padding: '9px 22px', fontSize: '0.875rem' }}>
              Sign In
            </button>
          )}
          
          {/* Mobile Menu Toggle Button (Hamburger icon). Only visible on small screens. */}
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            // These animations slide the menu down smoothly.
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 72, left: 0, right: 0, zIndex: 999,
              background: 'var(--surface)', borderBottom: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 4
            }}
          >
            {/* Same links as desktop, but styled for vertical mobile list. */}
            {navigationLinks.map((link) => (
              <button
                key={link.value}
                className={`nav-link ${page === link.value ? 'active' : ''}`}
                onClick={() => handleNavigate(link.value)}
                style={{ textAlign: 'left', borderRadius: 8 }}
              >
                {link.label}
              </button>
            ))}
            
            {/* Admin link for mobile */}
            {user !== null && user.role === 'Admin' && (
              <button className={`nav-link ${page === 'Admin' ? 'active' : ''}`} onClick={() => handleNavigate('Admin')} style={{ textAlign: 'left' }}>
                <Shield size={14} style={{ marginRight: 6 }} /> Admin
              </button>
            )}
            
            {/* Mobile Footer Area (Profile / Sign In) */}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12 }}>
              {user !== null ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
                  <button className="btn-ghost" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              ) : (
                <button className="btn-primary" onClick={() => handleNavigate('Auth')} style={{ width: '100%' }}>Sign In</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
