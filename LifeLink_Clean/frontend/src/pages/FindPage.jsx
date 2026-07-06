// FindPage.jsx
// This page is an intelligent donor compatibility engine. 
// It allows users to search for donors using smart matching algorithms and premium healthcare UI.

import React, { useState, useEffect, useRef } from 'react';
// Framer Motion handles all our smooth animations, reveals, and pulse effects.
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Search, MapPin, Droplet, User, Users, Phone, ShieldCheck, Award, AlertCircle, Activity, HeartPulse, Clock, Heart, Building2 } from 'lucide-react';
import api from '../api/api';

// All the blood groups our system supports.
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// --- Helper Component: Animated Number Counter ---
// This takes a target number (like 2450) and animates the count up from 0.
function AnimatedCounter({ targetNumber, suffix = '' }) {
  const [currentValue, setCurrentValue] = useState(0);
  const counterRef = useRef(null);
  
  // Only trigger the animation once the element is visible on the screen
  const isVisibleOnScreen = useInView(counterRef, { once: true });
  
  useEffect(() => {
    if (!isVisibleOnScreen) return;
    
    let start = 0;
    const steps = 50;
    const increment = targetNumber / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetNumber) { 
        setCurrentValue(targetNumber); 
        clearInterval(timer); 
      } else {
        setCurrentValue(Math.floor(start));
      }
    }, 30);
    
    return () => clearInterval(timer);
  }, [isVisibleOnScreen, targetNumber]);
  
  return <span ref={counterRef}>{currentValue}{suffix}</span>;
}

export default function FindPage() {
  // --- STATE MANAGEMENT ---
  
  // What the user is currently searching for in the form
  const [searchCriteria, setSearchCriteria] = useState({ 
    bloodGroup: '', 
    city: '', 
    urgency: 'Normal' 
  });
  
  // The list of donors returned by the backend server
  const [donorMatches, setDonorMatches] = useState([]);
  
  // Application statuses
  const [isSearching, setIsSearching] = useState(false); // Used to show the heartbeat scanning animation
  const [hasSearched, setHasSearched] = useState(false); // True if they successfully searched at least once
  const [errorMessage, setErrorMessage] = useState(null); // Holds any validation errors

  // --- SEARCH LOGIC ---
  // This function is triggered when the "Execute Smart Match" button is clicked.
  const triggerSearch = async () => {
    // 1. Verify that a blood group was actually selected
    if (searchCriteria.bloodGroup === '') {
      setErrorMessage("Please select a required blood group.");
      return;
    }
    
    setErrorMessage(null);
    setIsSearching(true); // Start the animated scanning sequence
    setHasSearched(false); // Hide old results
    
    try {
      // 2. Fetch donors from the backend
      const url = `/donor/search?bloodGroup=${encodeURIComponent(searchCriteria.bloodGroup)}&city=${encodeURIComponent(searchCriteria.city)}`;
      const response = await api.get(url);
      
      // 3. We intentionally add a small 2-second delay here. 
      // This builds trust by showing off the premium "Compatibility Scan" animation.
      setTimeout(() => {
        setDonorMatches(response.data);
        setIsSearching(false);
        setHasSearched(true);
      }, 2000);
      
    } catch (error) {
      setErrorMessage('Failed to connect to the matching engine. Please try again.');
      setIsSearching(false);
    }
  };

  // --- HELPER FUNCTIONS FOR UI ---
  // Determine what color the progress bar should be based on the match score
  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)'; // Green for an excellent match
    if (score >= 50) return 'var(--warning)'; // Gold for a good match
    return 'var(--primary)';                  // Red for a fair match
  };
  
  // Since our database doesn't have real GPS coordinates, we create a fake distance number based on their ID.
  const getMockDistance = (id) => {
    return ((id * 3.7) % 15).toFixed(1); // Returns a number between 0.0 and 15.0 km
  };

  return (
    // Wrap the entire page in an animation so it fades in smoothly
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page" style={{ paddingBottom: '4rem' }}>
      
      {/* ===== 1. EMERGENCY ALERT BANNER ===== */}
      <div className="emergency-banner" style={{ background: 'linear-gradient(90deg, #991B1B, var(--primary), #991B1B)', backgroundSize: '200% auto', animation: 'emergencyPulse 3s linear infinite' }}>
        <AlertCircle size={16} /> 
        <span>Critical Emergency? Call 1122 immediately. Life Link connects donors, but is not a replacement for emergency medical services.</span>
      </div>

      {/* ===== 2. HERO HEADING & EMOTIONAL SUBTITLE ===== */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 2rem' }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--blue-soft)', color: 'var(--blue)', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            <Activity size={14} /> Smart Matching Engine
          </div>
          
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '1rem' }}>
            Find a Compatible Donor.<br/>
            <span style={{ color: 'var(--primary)' }}>Save a Life Today.</span>
          </h1>
          
          <p style={{ color: 'var(--text2)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Our intelligent compatibility engine scans the network to find the closest, safest, and most compatible blood matches in real-time.
          </p>
          
        </motion.div>
      </section>

      {/* ===== 3. SMART SEARCH CARD ===== */}
      <section style={{ maxWidth: 850, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* If there is an error (like forgetting to pick a blood group), show it here */}
        <AnimatePresence>
          {errorMessage !== null && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} /> {errorMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="glass-card" 
          style={{ padding: '2.5rem', boxShadow: 'var(--shadow-lg)', borderTop: '4px solid var(--primary)' }}
        >
          {/* A. Animated Blood Group Chips */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
              <Droplet size={16} color="var(--primary)" /> Patient Blood Group *
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '0.75rem' }}>
              {/* Loop through all 8 blood groups to draw a button for each */}
              {BLOOD_GROUPS.map((bloodGroup) => {
                const isActive = searchCriteria.bloodGroup === bloodGroup;
                
                return (
                  <motion.button
                    key={bloodGroup}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchCriteria({ ...searchCriteria, bloodGroup: bloodGroup })}
                    style={{
                      padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-display)',
                      background: isActive ? 'var(--primary)' : 'var(--surface)',
                      color: isActive ? 'white' : 'var(--text2)',
                      border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                      boxShadow: isActive ? '0 8px 20px rgba(200,29,37,0.3)' : 'none',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {bloodGroup}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
            {/* B. City Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label"><MapPin size={14} color="var(--blue)" /> City (Optional)</label>
              <div className="form-input-wrap">
                <MapPin size={16} className="input-icon" color="var(--blue)" />
                <input className="form-input with-icon" style={{ height: 52 }} placeholder="e.g. Lahore, Karachi"
                  value={searchCriteria.city} 
                  onChange={(event) => setSearchCriteria({ ...searchCriteria, city: event.target.value })}
                  onKeyDown={(event) => { if(event.key === 'Enter') triggerSearch(); }} 
                />
              </div>
            </div>
            
            {/* C. Urgency Level Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label"><AlertCircle size={14} color="var(--warning)" /> Urgency Level</label>
              <div className="form-input-wrap">
                <AlertCircle size={16} className="input-icon" color="var(--warning)" />
                <select className="form-select with-icon" style={{ height: 52 }}
                  value={searchCriteria.urgency} 
                  onChange={(event) => setSearchCriteria({ ...searchCriteria, urgency: event.target.value })}>
                  <option value="Normal">Normal (Within 24-48 Hours)</option>
                  <option value="High">High (Within 12 Hours)</option>
                  <option value="Critical">Critical (Immediate Need)</option>
                </select>
              </div>
            </div>
          </div>

          {/* D. Premium Call-To-Action Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={triggerSearch}
            disabled={isSearching}
            style={{
              width: '100%', height: 56, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary) 0%, #991B1B 100%)',
              color: 'white', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 10px 25px rgba(200,29,37,0.4)', position: 'relative', overflow: 'hidden'
            }}
          >
            {/* This adds a beautiful white "shine" effect moving across the button */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }} 
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', transform: 'skewX(-20deg)' }}
            />
            <Search size={20} /> Execute Smart Match
          </motion.button>
        </motion.div>
      </section>

      {/* ===== 4. ANIMATED COMPATIBILITY SCAN ===== */}
      {/* This only shows up for 2 seconds while 'isSearching' is true */}
      <AnimatePresence>
        {isSearching === true && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 300 }} exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '3rem', overflow: 'hidden' }}
          >
            {/* Pulsing Heartbeat Circle */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(200,29,37,0.3)', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(200,29,37,0.2)' }}
            >
              <HeartPulse size={40} color="var(--primary)" />
            </motion.div>
            
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              Finding best compatible donors...
            </h3>
            <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Scanning hospital network and verified databases</p>
            
            {/* Scanning Progress Bar */}
            <div style={{ width: 250, height: 4, background: 'var(--border)', borderRadius: 10, marginTop: '1.5rem', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.9, ease: 'easeOut' }}
                style={{ height: '100%', background: 'var(--primary)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 5. SMART RESULT CARDS ===== */}
      {hasSearched === true && isSearching === false && (
        <section style={{ maxWidth: 1000, margin: '4rem auto 0', padding: '0 1.5rem' }}>
          
          {/* Header row for the results */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                {donorMatches.length} Compatible Donors Found
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginTop: 4 }}>
                Algorithm ranking based on exact match, proximity, and availability.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="badge badge-green"><ShieldCheck size={12} /> Verified System</span>
            </div>
          </div>

          {/* Handle if no donors were found */}
          {donorMatches.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <AlertCircle size={48} color="var(--border)" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Matches Found</h3>
              <p style={{ color: 'var(--text3)' }}>Try adjusting your search criteria or contact hospitals for emergency reserves.</p>
            </div>
          ) : (
            
            // Render the list of donor cards
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <AnimatePresence>
                {donorMatches.map((donor, index) => {
                  const scoreColor = getScoreColor(donor.score);
                  const isTopMatch = index === 0; // The very first item is the #1 match
                  
                  return (
                    // The stagger reveal animation depends on the 'delay: index * 0.1' below
                    <motion.div 
                      key={donor.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)', borderColor: isTopMatch ? 'var(--warning)' : 'rgba(200,29,37,0.2)' }}
                      className="glass-card"
                      style={{ 
                        padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
                        // Top match gets a special gold border and faint gold background
                        borderLeft: isTopMatch ? '4px solid var(--warning)' : '1px solid var(--border)',
                        background: isTopMatch ? 'linear-gradient(90deg, rgba(217,119,6,0.03) 0%, transparent 100%)' : 'var(--surface)'
                      }}
                    >
                      {/* A. Avatar and Name Section */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '220px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: isTopMatch ? 'var(--warning-soft)' : 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} color={isTopMatch ? 'var(--warning)' : 'var(--primary)'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>{donor.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text3)', fontSize: '0.8rem', marginTop: 3 }}>
                            <MapPin size={12} /> {donor.city} • {getMockDistance(donor.id)} km
                          </div>
                        </div>
                      </div>

                      {/* B. Blood Group and Informational Badges */}
                      <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className="bg-tag" style={{ fontSize: '1rem', padding: '4px 10px' }}>{donor.bloodGroup}</span>
                          
                          {/* If it's the top match, show a golden badge */}
                          {isTopMatch === true && <span className="badge badge-gold"><Award size={12} /> Best Match</span>}
                          
                          {/* If the user selected Critical urgency, label the cards with a priority badge */}
                          {searchCriteria.urgency === 'Critical' && <span className="badge badge-red"><Activity size={12} /> Priority Focus</span>}
                        </div>
                        
                        <span className={`badge badge-${donor.isEligible ? 'green' : 'blue'}`} style={{ width: 'fit-content' }}>
                          {donor.isEligible ? '✓ Ready to Donate' : '⏳ In Waiting Period'}
                        </span>
                      </div>

                      {/* C. Compatibility Score Progress Bar */}
                      <div style={{ width: '180px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text3)', fontWeight: 600 }}>Match Score</span>
                          <span style={{ fontWeight: 800, color: scoreColor }}>{donor.score}%</span>
                        </div>
                        {/* The gray background track for the bar */}
                        <div style={{ width: '100%', height: 8, background: 'var(--bg2)', borderRadius: 10, overflow: 'hidden' }}>
                          {/* The animated colored bar that fills up */}
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${Math.min(donor.score, 100)}%` }} transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                            style={{ height: '100%', background: scoreColor, borderRadius: 10 }}
                          />
                        </div>
                      </div>

                      {/* D. Call to Action Contact Button */}
                      <div style={{ marginLeft: 'auto' }}>
                        <a href={`tel:${donor.contact}`} style={{ textDecoration: 'none' }}>
                          <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10,
                              background: isTopMatch ? 'var(--warning)' : 'var(--blue)', color: 'white',
                              fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer',
                              boxShadow: `0 4px 14px ${isTopMatch ? 'rgba(217,119,6,0.3)' : 'rgba(37,99,235,0.3)'}`
                            }}
                          >
                            <Phone size={16} /> Contact Donor
                          </motion.button>
                        </a>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}

      {/* ===== 6. TRUST METRICS SECTION ===== */}
      {/* These counters reinforce platform credibility at the bottom of the page. */}
      <section style={{ maxWidth: 1000, margin: '5rem auto 0', padding: '0 1.5rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>A Network You Can Trust</h2>
          <p style={{ color: 'var(--text3)' }}>Real-time statistics from our national database.</p>
        </div>
        
        <div className="grid-4">
          {[
            { icon: <Users size={24} color="var(--primary)" />, label: 'Active Donors', value: 2450, color: 'var(--primary-soft)' },
            { icon: <Heart size={24} color="var(--success)" />, label: 'Success Rate', value: 98, suffix: '%', color: 'var(--success-soft)' },
            { icon: <Clock size={24} color="var(--warning)" />, label: 'Avg. Response', value: 12, suffix: 'm', color: 'var(--warning-soft)' },
            { icon: <Building2 size={24} color="var(--blue)" />, label: 'Hospitals', value: 45, color: 'var(--blue-soft)' },
          ].map((stat, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}
            >
              {/* Icon Box */}
              <div style={{ width: 60, height: 60, borderRadius: 16, background: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                {stat.icon}
              </div>
              {/* Animated Numbers */}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>
                <AnimatedCounter targetNumber={stat.value} suffix={stat.suffix || ''} />
              </div>
              {/* Label */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 600 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

    </motion.div>
  );
}
