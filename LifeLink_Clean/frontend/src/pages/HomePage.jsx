// HomePage.jsx
// This is the main landing page of the website. It shows statistics, features, and blood compatibility.

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
// Icons for the page.
import { Activity, Search, ShieldCheck, HeartPulse, Droplet, Building2, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';
// API to connect to the backend.
import api from '../api/api';

// List of all possible blood groups.
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// A dictionary showing which blood groups can receive blood from which donors.
const COMPATIBILITY_RULES = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

// --- Helper Component: Animated Counter ---
// This component takes a target number and slowly counts up to it when it appears on the screen.
function AnimatedCounter({ targetNumber, textSuffix = '' }) {
  const [currentValue, setCurrentValue] = useState(0);
  
  // We use this reference to check if the user has scrolled to see this counter.
  const counterReference = useRef(null);
  const isVisibleOnScreen = useInView(counterReference, { once: true });
  
  useEffect(() => {
    // If it's not visible yet, do nothing.
    if (!isVisibleOnScreen) return;
    
    let startingValue = 0;
    const totalSteps = 60; // How many "steps" the animation takes.
    const incrementAmount = targetNumber / totalSteps;
    
    // Set a timer that runs every 20 milliseconds to increase the number.
    const animationTimer = setInterval(() => {
      startingValue += incrementAmount;
      
      // Stop the timer if we reached the target.
      if (startingValue >= targetNumber) { 
        setCurrentValue(targetNumber); 
        clearInterval(animationTimer); 
      } else {
        setCurrentValue(Math.floor(startingValue));
      }
    }, 20);
    
    // Clean up the timer.
    return () => clearInterval(animationTimer);
  }, [isVisibleOnScreen, targetNumber]);
  
  return <span ref={counterReference}>{currentValue}{textSuffix}</span>;
}

// --- Animation settings for elements floating up ---
const fadeUpAnimation = {
  hidden: { opacity: 0, y: 24 }, // Start slightly lower and invisible.
  visible: (customDelay = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: customDelay * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
  })
};

export default function HomePage({ setPage }) {
  // State to hold the numbers for our statistics section.
  const [statistics, setStatistics] = useState({ donors: 24, hospitals: 5, livesSaved: 72 });
  
  // State to track which blood group the user clicked on in the compatibility section.
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('A+');
  
  // Reference to detect when the Features section scrolls into view.
  const featuresRef = useRef(null);
  const isFeaturesSectionVisible = useInView(featuresRef, { once: true, margin: '-80px' });

  // When the component loads, fetch the latest data from the backend.
  useEffect(() => {
    // We try to fetch hospitals and total donors at the same time.
    Promise.all([
      api.get('/hospital'),
      api.get('/dashboard/stats').catch(() => null) // Ignore errors if dashboard stats fail.
    ]).then(([hospitalResponse, statsResponse]) => {
      // Update our statistics state with the real data.
      setStatistics((previousStats) => {
        const totalDonors = statsResponse?.data?.totalDonors ?? previousStats.donors;
        return {
          ...previousStats,
          hospitals: hospitalResponse.data.length,
          donors: totalDonors,
          livesSaved: totalDonors * 3 // Each donor can save up to 3 lives.
        };
      });
    }).catch(() => {
      console.log('Could not fetch home page statistics.');
    });
  }, []);

  // Data for the 3 main features shown as cards.
  const platformFeatures = [
    { icon: <HeartPulse size={28} color="var(--primary)" />, color: 'var(--primary-soft)', border: 'rgba(200,29,37,0.15)', title: 'Smart Matching Engine', description: 'Our algorithm ranks donors by blood compatibility, geographic proximity, and availability for the fastest possible match.' },
    { icon: <ShieldCheck size={28} color="var(--success)" />, color: 'var(--success-soft)', border: 'rgba(5,150,105,0.15)', title: 'Health Verification', description: 'Built-in 90-day eligibility validation protects donor health while ensuring patients get the safest possible blood supply.' },
    { icon: <Building2 size={28} color="var(--blue)" />, color: 'var(--blue-soft)', border: 'rgba(37,99,235,0.15)', title: 'Hospital Network', description: 'Direct integration with partner hospitals for real-time blood availability and instant emergency dispatch requests.' },
  ];

  // Data for user testimonials.
  const userTestimonials = [
    { name: 'Dr. Sarah Malik', role: 'Cardiologist, CMH Lahore', text: 'Life Link found a matching donor for my patient in under 10 minutes. Truly a life-saving platform.', rating: 5 },
    { name: 'Ahmed Raza', role: 'Donor, Lahore', text: 'Simple, transparent, and impactful. I donated for the first time through Life Link and felt genuinely cared for.', rating: 5 },
    { name: 'Fatima Noor', role: 'Patient Family', text: 'When we needed O- urgently, Life Link connected us with three compatible donors within minutes.', rating: 5 },
  ];

  return (
    // Wrap everything in a motion.div so the entire page fades in smoothly.
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

      {/* ===== 1. HERO SECTION (The large top area) ===== */}
      <section className="hero" style={{ position: 'relative', background: 'radial-gradient(circle at 85% 20%, rgba(200,29,37,0.08) 0%, transparent 40%), radial-gradient(circle at 15% 80%, rgba(200,29,37,0.06) 0%, transparent 40%)', overflow: 'hidden' }}>
        
        {/* Animated Blood Drops Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ top: '-10%', left: `${Math.random() * 100}%`, opacity: 0, scale: Math.random() * 0.6 + 0.4 }}
              animate={{ top: '110%', opacity: [0, 0.5, 0] }}
              transition={{ duration: Math.random() * 5 + 6, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
              style={{ position: 'absolute' }}
            >
              <Droplet size={28} color="var(--primary)" fill="var(--primary)" style={{ filter: 'drop-shadow(0 4px 8px rgba(200,29,37,0.4))' }} />
            </motion.div>
          ))}
        </div>

        {/* Animated background blobs (made slightly more red) */}
        <div className="hero-blob-1" style={{ background: 'var(--primary)', opacity: 0.12, filter: 'blur(70px)' }} />
        <div className="hero-blob-2" style={{ background: 'var(--primary)', opacity: 0.08, filter: 'blur(90px)' }} />

        {/* Decorative Floating Cards */}
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="hero-float-card hero-float-card-1" style={{ right: '6%', top: '22%' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplet size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>Blood Found</div>
            <div style={{ color: 'var(--primary)', fontWeight: 700 }}>O+ • Lahore</div>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>✓ Matched</span>
        </motion.div>
        
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="hero-float-card hero-float-card-2" style={{ right: '16%', top: '45%' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="var(--success)" />
          </div>
          <div>
            <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>New Donor</div>
            <div style={{ color: 'var(--text)', fontWeight: 700 }}>Ali Hassan</div>
          </div>
        </motion.div>
        
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 2 }} className="hero-float-card hero-float-card-3" style={{ right: '5%', top: '65%', border: '1px solid rgba(200,29,37,0.2)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>Live Match Score</div>
            <div style={{ color: 'var(--primary)', fontWeight: 800 }}>98 pts</div>
          </div>
        </motion.div>

        {/* Main Content of Hero Section */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
          
          <motion.div variants={fadeUpAnimation} initial="hidden" animate="visible" custom={0} className="hero-badge" style={{ border: '1px solid rgba(200,29,37,0.3)', background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <div className="hero-badge-dot" style={{ background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            Intelligent Blood Donor Matching System
          </motion.div>

          <motion.h1 variants={fadeUpAnimation} initial="hidden" animate="visible" custom={1} className="hero-title" style={{ textShadow: '0 10px 30px rgba(200,29,37,0.1)' }}>
            Every Drop of Blood<br />
            <span className="highlight" style={{ color: 'var(--primary)', backgroundImage: 'none', WebkitTextFillColor: 'initial' }}>Saves a Life.</span>
          </motion.h1>

          <motion.p variants={fadeUpAnimation} initial="hidden" animate="visible" custom={2} className="hero-desc">
            Life Link 2.0 connects blood donors with patients and hospitals in real-time. Our smart compatibility engine ensures the right blood reaches the right patient — faster than ever.
          </motion.p>

          <motion.div variants={fadeUpAnimation} initial="hidden" animate="visible" custom={3} className="hero-actions">
            {/* Action Buttons */}
            <motion.button 
              whileHover={{ scale: 1.04, boxShadow: '0 10px 25px rgba(200,29,37,0.4)' }} whileTap={{ scale: 0.96 }}
              className="btn-primary" onClick={() => setPage('Find')} 
              style={{ padding: '16px 36px', fontSize: '1.05rem', background: 'linear-gradient(135deg, var(--primary) 0%, #991B1B 100%)', border: 'none', position: 'relative', overflow: 'hidden' }}>
              <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', transform: 'skewX(-20deg)' }} />
              <Search size={18} style={{ position: 'relative', zIndex: 1 }} /> <span style={{ position: 'relative', zIndex: 1 }}>Find Blood Now</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.04, background: 'var(--primary-soft)' }} whileTap={{ scale: 0.96 }}
              className="btn-secondary" onClick={() => setPage('Donors')} 
              style={{ padding: '16px 36px', fontSize: '1.05rem', borderColor: 'var(--primary)', color: 'var(--primary)', borderWidth: '2px' }}>
              Become a Donor <ArrowRight size={18} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.04, background: '#fef3c7' }} whileTap={{ scale: 0.96 }}
              onClick={() => setPage('Hospitals')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 28px', border: 'none', background: 'var(--warning-soft)', color: 'var(--warning)', borderRadius: 10, fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', border: '1px solid rgba(217,119,6,0.2)' }}
            >
              🚨 Emergency
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUpAnimation} initial="hidden" animate="visible" custom={4} className="hero-stats" style={{ borderTop: '1px solid rgba(200,29,37,0.15)', paddingTop: '2rem' }}>
            {/* Display our live statistics using the AnimatedCounter component */}
            <div key="stat-1">
              <div className="hero-stat-value" style={{ color: 'var(--primary)' }}><AnimatedCounter targetNumber={statistics.donors} textSuffix="+" /></div>
              <div className="hero-stat-label">Active Donors</div>
            </div>
            <div key="stat-2">
              <div className="hero-stat-value"><AnimatedCounter targetNumber={statistics.hospitals} /></div>
              <div className="hero-stat-label">Partner Hospitals</div>
            </div>
            <div key="stat-3">
              <div className="hero-stat-value"><AnimatedCounter targetNumber={statistics.livesSaved} textSuffix="+" /></div>
              <div className="hero-stat-label">Lives Impacted</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 2. TRUST BADGES SECTION ===== */}
      <section style={{ padding: '2rem 4rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Quick list of trust factors */}
          {[
            { icon: <ShieldCheck size={18} color="var(--success)" />, text: 'Medically Verified Donors' },
            { icon: <Activity size={18} color="var(--primary)" />, text: '90-Day Eligibility Enforced' },
            { icon: <Building2 size={18} color="var(--blue)" />, text: 'Hospital Network Integration' },
            { icon: <Droplet size={18} color="var(--cyan)" />, text: 'All Blood Groups Supported' },
          ].map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: '0.875rem', fontWeight: 500 }}>
              {item.icon} {item.text}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== 3. PLATFORM FEATURES SECTION ===== */}
      <section className="section" ref={featuresRef}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div className="section-center" style={{ marginBottom: '4rem' }}>
            <div className="section-label">Platform Features</div>
            <h2 className="section-title">Built for Speed & Precision</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Every feature is designed with one goal: getting the right blood to the right patient as fast as possible.
            </p>
          </div>
          
          <div className="grid-3">
            {/* Map over our features array and create a card for each */}
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeUpAnimation} 
                initial="hidden"
                animate={isFeaturesSectionVisible ? 'visible' : 'hidden'}
                custom={index} // Pass the index as 'customDelay'
                className="glass-card"
                style={{ padding: '2rem' }}
                whileHover={{ y: -6 }} // Move up slightly when hovered.
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: feature.color, border: `1px solid ${feature.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. COMPATIBILITY SCIENCE SECTION ===== */}
      <section className="section" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          
          <div className="section-label">Blood Science</div>
          <h2 className="section-title">Smart Compatibility Awareness</h2>
          <p className="section-desc" style={{ margin: '0 auto 2.5rem' }}>
            Our system intelligently filters donors by blood compatibility. Select a blood group below to see compatible donor types.
          </p>

          {/* Row of Blood Group Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {BLOOD_GROUPS.map((bg) => (
              <button 
                key={bg} 
                className={`blood-circle ${selectedBloodGroup === bg ? 'active' : ''}`} 
                onClick={() => setSelectedBloodGroup(bg)}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* Shows the compatibility result based on the clicked button */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '1rem', fontWeight: 500 }}>
              Patient with <strong style={{ color: 'var(--primary)' }}>{selectedBloodGroup}</strong> can receive blood from:
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <AnimatePresence>
                {/* Find the compatible donors in our dictionary and display a badge for each */}
                {COMPATIBILITY_RULES[selectedBloodGroup].map((compatibleGroup, i) => {
                  
                  // Highlight the exact match in green, others in blue.
                  const isExactMatch = (compatibleGroup === selectedBloodGroup);
                  
                  return (
                    <motion.div
                      key={selectedBloodGroup + compatibleGroup}
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`compat-badge ${isExactMatch ? 'compat-green' : 'compat-blue'}`}
                    >
                      {isExactMatch && <CheckCircle size={14} style={{ marginRight: 4 }} />}
                      {compatibleGroup}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. TESTIMONIALS SECTION ===== */}
      <section className="section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div className="section-center" style={{ marginBottom: '3.5rem' }}>
            <div className="section-label">Community Stories</div>
            <h2 className="section-title">Lives Changed by Life Link</h2>
          </div>
          
          <div className="grid-3">
            {userTestimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="glass-card"
                style={{ padding: '2rem', position: 'relative' }}
                whileHover={{ y: -5 }}
              >
                {/* Draw the gold stars */}
                <div style={{ display: 'flex', gap: 4, marginBottom: '1rem' }}>
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star key={starIndex} size={16} fill="var(--warning)" color="var(--warning)" />
                  ))}
                </div>
                
                <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  "{testimonial.text}"
                </p>
                
                {/* User Info Line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{testimonial.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. CALL TO ACTION SECTION ===== */}
      <section style={{ padding: '5rem 4rem', background: 'linear-gradient(135deg, var(--primary) 0%, #991B1B 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Background decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -30, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '7px 18px', borderRadius: 100, fontSize: '0.82rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem' }}>
              <Droplet size={14} /> Ready to save a life?
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: '1rem', lineHeight: 1.15 }}>
              Join the Life Link Network
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Register as a donor today. One donation can save up to 3 lives.
            </p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setPage('Donors')}
                style={{ background: 'white', color: 'var(--primary)', border: 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              >
                <HeartPulse size={18} /> Register as Donor
              </button>
              <button
                onClick={() => setPage('Find')}
                style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.5)', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
              >
                <Search size={18} /> Search Donors
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 7. FOOTER ===== */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <Activity color="var(--primary)" size={22} />
              Life<span style={{ color: 'var(--primary)' }}>Link</span> 2.0
            </div>
            <p className="footer-desc">A smart blood donation and hospital coordination platform connecting donors with patients across Pakistan.</p>
          </div>
          <div>
            <div className="footer-col-title">Platform</div>
            <button className="footer-link" onClick={() => setPage('Find')}>Find Donor</button>
            <button className="footer-link" onClick={() => setPage('Donors')}>Become Donor</button>
            <button className="footer-link" onClick={() => setPage('Hospitals')}>Hospitals</button>
            <button className="footer-link" onClick={() => setPage('Hospitals')}>Emergency</button>
          </div>
          <div>
            <div className="footer-col-title">Community</div>
            <button className="footer-link" onClick={() => setPage('Reviews')}>Reviews</button>
            <button className="footer-link">About</button>
            <button className="footer-link">Contact Us</button>
          </div>
          <div>
            <div className="footer-col-title">Safety</div>
            <button className="footer-link">Eligibility Guide</button>
            <button className="footer-link">90-Day Rule</button>
            <button className="footer-link">Blood Compatibility</button>
            <button className="footer-link">Privacy Policy</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Life Link 2.0 — Donor Matrix. All rights reserved.</span>
          <span style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HeartPulse size={14} color="var(--primary)" /> Saving lives, one drop at a time.
          </span>
        </div>
      </footer>

    </motion.div>
  );
}
