// AuthPage.jsx
// This page handles both User Login and User Registration.

import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shield, Activity, ArrowRight, LogIn, HeartPulse, CheckCircle } from 'lucide-react';
// We need AuthContext to call the actual login and register functions.
import { AuthContext } from '../context/AuthContext';

// Animation settings for the form swapping between Login and Signup.
const formAnimationVariants = {
  hidden: (direction) => ({ opacity: 0, x: direction === 'login' ? -20 : 20 }),
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: (direction) => ({ opacity: 0, x: direction === 'login' ? 20 : -20, transition: { duration: 0.2 } }),
};

export default function AuthPage({ setPage }) {
  // Get functions from AuthContext
  const { login, register } = useContext(AuthContext);
  
  // State to track if the user wants to 'login' or 'signup'
  const [currentTab, setCurrentTab] = useState('login');
  
  // State to store all the text input from the form
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'User' // Default role is a regular User
  });
  
  // State to show error or success messages
  const [systemMessage, setSystemMessage] = useState(null);
  
  // State to show a loading spinner when waiting for backend
  const [isLoading, setIsLoading] = useState(false);

  // This function runs when the user clicks "Sign In" or "Create Account"
  const handleFormSubmit = async (event) => {
    // Prevent the page from refreshing on submit
    event.preventDefault(); 
    
    // Check if essential fields are empty
    if (formData.email === '' || formData.password === '') { 
      setSystemMessage({ type: 'error', text: 'Please fill all required fields.' }); 
      return; 
    }
    
    setIsLoading(true); 
    setSystemMessage(null); // Clear previous messages

    if (currentTab === 'login') {
      // --- LOG IN LOGIC ---
      const response = await login(formData.email, formData.password);
      
      if (response.success === true) { 
        setSystemMessage({ type: 'success', text: 'Welcome back! Redirecting...' }); 
        // Wait almost 1 second, then go to Home page
        setTimeout(() => { setPage('Home'); }, 800); 
      } else { 
        // If login failed, show the error message from the backend
        setSystemMessage({ type: 'error', text: response.message }); 
      }
    } 
    else {
      // --- SIGN UP LOGIC ---
      if (formData.name === '') { 
        setSystemMessage({ type: 'error', text: 'Full name is required.' }); 
        setIsLoading(false); 
        return; 
      }
      
      const response = await register(formData.name, formData.email, formData.password, formData.role);
      
      if (response.success === true) {
        setSystemMessage({ type: 'success', text: 'Account created! Please sign in.' });
        // After 1.5 seconds, switch back to the login tab
        setTimeout(() => { 
          setCurrentTab('login'); 
          // Erase the password from the form for safety
          setFormData((previousData) => ({ ...previousData, password: '' })); 
          setSystemMessage(null); 
        }, 1500);
      } else {
        setSystemMessage({ type: 'error', text: response.message }); 
      }
    }
    
    setIsLoading(false);
  };

  // Small bullets shown on the left panel
  const platformPerks = [
    { icon: <HeartPulse size={16} color="var(--primary)" />, text: 'Find donors in minutes' },
    { icon: <CheckCircle size={16} color="var(--success)" />, text: 'Verified & safe network' },
    { icon: <Shield size={16} color="var(--blue)" />, text: 'Hospital-grade privacy' },
  ];

  return (
    // Wrap the entire page so it fades in
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

      {/* ===== LEFT PANEL — Brand Identity ===== */}
      <div style={{ background: 'linear-gradient(160deg, var(--primary) 0%, #7F1D1D 100%)', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Faint circles in the background */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <Activity color="white" size={32} strokeWidth={2.5} />
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '1rem' }}>
            Life<span style={{ opacity: 0.7 }}>Link</span><br />2.0
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '3rem', maxWidth: 340 }}>
            Pakistan's smart blood donation platform connecting donors, patients, and hospitals in real-time.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Render the perks list */}
            {platformPerks.map((perk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.9)', fontSize: '0.92rem', fontWeight: 500 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {perk.icon}
                </div>
                {perk.text}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — The Form ===== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 3rem', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
              {currentTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: '0.92rem', marginBottom: '2rem' }}>
              {currentTab === 'login' ? 'Sign in to continue saving lives.' : 'Join the donor network today.'}
            </p>

            {/* TAB SELECTOR: Switch between Login and Signup */}
            <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 10, padding: 4, marginBottom: '2rem', border: '1px solid var(--border)', position: 'relative' }}>
              {/* This is the white slider box that moves behind the text */}
              <motion.div
                style={{ position: 'absolute', top: 4, bottom: 4, width: 'calc(50% - 4px)', background: 'var(--surface)', borderRadius: 7, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}
                animate={{ left: currentTab === 'login' ? 4 : 'calc(50%)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              />
              
              <button onClick={() => { setCurrentTab('login'); setSystemMessage(null); }}
                style={{ flex: 1, padding: '10px 0', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', position: 'relative', zIndex: 1, color: currentTab === 'login' ? 'var(--text)' : 'var(--text3)' }}>
                Sign In
              </button>
              
              <button onClick={() => { setCurrentTab('signup'); setSystemMessage(null); }}
                style={{ flex: 1, padding: '10px 0', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', position: 'relative', zIndex: 1, color: currentTab === 'signup' ? 'var(--text)' : 'var(--text3)' }}>
                Register
              </button>
            </div>

            {/* ALERT MESSAGE: Shows errors or success messages */}
            <AnimatePresence>
              {systemMessage !== null && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className={`alert alert-${systemMessage.type}`}>
                    {systemMessage.text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTUAL FORM */}
            <form onSubmit={handleFormSubmit}>
              <AnimatePresence mode="wait">
                <motion.div key={currentTab} custom={currentTab} variants={formAnimationVariants} initial="hidden" animate="visible" exit="exit">
                  
                  {/* FULL NAME (Only show if registering) */}
                  {currentTab === 'signup' && (
                    <div className="form-group">
                      <label className="form-label"><User size={14} color="var(--text3)" /> Full Name</label>
                      <div className="form-input-wrap">
                        <User size={16} className="input-icon" />
                        <input className="form-input with-icon" placeholder="Ali Hassan" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                      </div>
                    </div>
                  )}
                  
                  {/* EMAIL ADDRESS */}
                  <div className="form-group">
                    <label className="form-label"><Mail size={14} color="var(--text3)" /> Email Address</label>
                    <div className="form-input-wrap">
                      <Mail size={16} className="input-icon" />
                      <input className="form-input with-icon" type="email" placeholder="you@example.com" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                    </div>
                  </div>
                  
                  {/* PASSWORD */}
                  <div className="form-group">
                    <label className="form-label"><Lock size={14} color="var(--text3)" /> Password</label>
                    <div className="form-input-wrap">
                      <Lock size={16} className="input-icon" />
                      <input className="form-input with-icon" type="password" placeholder="••••••••" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} />
                    </div>
                  </div>
                  
                  {/* ROLE SELECTION (Only show if registering) */}
                  {currentTab === 'signup' && (
                    <div className="form-group">
                      <label className="form-label"><Shield size={14} color="var(--text3)" /> Account Type</label>
                      <div className="form-input-wrap">
                        <Shield size={16} className="input-icon" />
                        <select className="form-select with-icon" value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })}>
                          <option value="User">Regular User (Donor / Patient)</option>
                          <option value="Admin">Administrator</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button className="btn-primary" type="submit" disabled={isLoading}
                    style={{ width: '100%', marginTop: '0.5rem', height: 50, fontSize: '1rem', justifyContent: 'center' }}>
                    {isLoading ? (
                       <span className="spinner" /> 
                    ) : currentTab === 'login' ? (
                       <><LogIn size={18} /> Sign In</>
                    ) : (
                       <><ArrowRight size={18} /> Create Account</>
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>
            </form>

            {/* DEMO ADMIN HINT (Only on login page) */}
            {currentTab === 'login' && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '12px', background: 'var(--warning-soft)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 8 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Shield size={13} /> Demo Admin: admin@lifelink.com / admin123
                </p>
              </div>
            )}
            
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
