// DonorsPage.jsx
// This page allows users to register as a blood donor. It checks if they are eligible based on their last donation date.

import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import { Phone, Droplet, MapPin, Calendar, CheckCircle, XCircle, Users, Heart, Info, ArrowRight } from 'lucide-react';
// API and Auth
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

// Standard lists to populate our form options
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other'];

export default function DonorsPage() {
  // We need to know if a user is logged in to allow them to register
  const { user } = useContext(AuthContext);
  
  // This state holds all the information the user types into the registration form
  const [formData, setFormData] = useState({ 
    age: '', 
    bloodGroup: '', 
    city: '', 
    contactNumber: '', 
    lastDonationDate: '' 
  });
  
  // States for messages, loading, and recently registered donors list
  const [systemMessage, setSystemMessage] = useState(null);
  const [recentDonorsList, setRecentDonorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlreadyDonor, setIsAlreadyDonor] = useState(false);

  // When the page loads, fetch the 6 most recent donors from the backend
  useEffect(() => {
    api.get('/dashboard/donors')
      .then((response) => {
        // Take only the first 6 donors from the list
        setRecentDonorsList(response.data.slice(0, 6));
      })
      .catch((error) => {
        console.log('Could not fetch recent donors.');
      });
  }, []);

  // --- ELIGIBILITY CHECKER ---
  // A donor is eligible IF they haven't donated before OR if their last donation was 90+ days ago.
  let isEligibleNow = true; // Assume true by default
  
  if (formData.lastDonationDate !== '') {
    // If they provided a date, calculate how many days ago it was.
    const today = new Date();
    const lastDonation = new Date(formData.lastDonationDate);
    // Convert the time difference into days (1000ms * 60s * 60m * 24h)
    const daysSinceLastDonation = (today - lastDonation) / (1000 * 60 * 60 * 24);
    
    // If it's been less than 90 days, they are NOT eligible to donate right now.
    if (daysSinceLastDonation < 90) {
      isEligibleNow = false;
    }
  }

  // --- FORM SUBMIT FUNCTION ---
  const handleRegistrationSubmit = async (event) => {
    event.preventDefault(); // Stop the page from refreshing
    
    // 1. Check if user is logged in
    if (user === null) { 
      setSystemMessage({ type: 'error', text: 'You must be signed in to register as a donor.' }); 
      return; 
    }
    
    // 2. Check if all required fields are filled
    if (formData.age === '' || formData.bloodGroup === '' || formData.city === '' || formData.contactNumber === '') { 
      setSystemMessage({ type: 'error', text: 'Please fill all required fields.' }); 
      return; 
    }
    
    // 3. Check Age restrictions
    const ageAsNumber = parseInt(formData.age);
    if (ageAsNumber < 18 || ageAsNumber > 65) { 
      setSystemMessage({ type: 'error', text: 'Donor age must be between 18 and 65.' }); 
      return; 
    }
    
    // 4. Check 90-day waiting rule
    if (isEligibleNow === false) { 
      setSystemMessage({ type: 'error', text: 'You must wait at least 90 days since your last donation.' }); 
      return; 
    }

    // All checks passed! Now try to send to backend.
    setIsLoading(true);
    
    try {
      // Send the data to our API
      const response = await api.post('/donor', {
        bloodGroup: formData.bloodGroup, 
        city: formData.city.trim(),
        contactNumber: formData.contactNumber.trim(), 
        age: ageAsNumber,
        // If the date is empty, send 'null' to the backend
        lastDonationDate: formData.lastDonationDate === '' ? null : formData.lastDonationDate
      });
      
      // Success!
      setSystemMessage({ type: 'success', text: response.data.message || 'Successfully registered as a donor!' });
      setIsAlreadyDonor(true);
      
      // Clear the form fields
      setFormData({ age: '', bloodGroup: '', city: '', contactNumber: '', lastDonationDate: '' });
      
      // Refresh the recent donors list so the new user shows up
      api.get('/dashboard/donors')
        .then((res) => setRecentDonorsList(res.data.slice(0, 6)))
        .catch(() => {});
        
    } catch (error) {
      // If the backend says "no", show the error.
      const backendErrorMessage = error.response?.data?.message || 'Registration failed. You may already be registered.';
      setSystemMessage({ type: 'error', text: backendErrorMessage });
      
      // If the error means they are already registered, disable the form.
      if (backendErrorMessage.includes('already registered')) {
        setIsAlreadyDonor(true);
      }
    }
    
    setIsLoading(false);
  };

  // Basic eligibility rules we want to show the user
  const eligibilityRules = [
    ['Age', '18–65 years old'],
    ['Weight', 'At least 50 kg'],
    ['Health', 'No major illness or medication'],
    ['Last Donation', 'Minimum 90 days ago'],
    ['Hemoglobin', '≥ 12.5 g/dL'],
    ['Blood Pressure', 'Normal range (80/120)'],
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page">
      
      {/* ===== HEADER BANNER ===== */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #991B1B 100%)', padding: '3.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: 800, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
            <Heart size={13} /> Save up to 3 lives with one donation
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: '0.75rem' }}>
            Become a Donor
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', maxWidth: 560, lineHeight: 1.7 }}>
            Join our verified donor network. Your eligibility is checked automatically — it takes less than 2 minutes to register.
          </p>
        </div>
      </div>

      <section className="section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
            
            {/* ===== LEFT COLUMN: REGISTRATION FORM ===== */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text)' }}>Donor Registration</h2>

              {/* Warning if they are not logged in */}
              {user === null && (
                <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
                  <Info size={16} /> Please <strong>sign in</strong> first to register as a donor.
                </div>
              )}
              
              {/* Success if already a donor */}
              {isAlreadyDonor === true && (
                <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                  <CheckCircle size={16} /> You're registered as a donor. Thank you for saving lives!
                </div>
              )}
              
              {/* Other error or success messages */}
              <AnimatePresence>
                {systemMessage !== null && isAlreadyDonor === false && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className={`alert alert-${systemMessage.type}`} style={{ marginBottom: '1rem' }}>{systemMessage.text}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Real-time Eligibility Checker Alert (Shows up only if they picked a date) */}
              {formData.lastDonationDate !== '' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`alert alert-${isEligibleNow ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
                  {isEligibleNow ? <CheckCircle size={15} /> : <XCircle size={15} />}
                  {isEligibleNow ? 'You are eligible to donate.' : 'Must wait 90 days since last donation.'}
                </motion.div>
              )}

              {/* The Actual Form Box */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleRegistrationSubmit}>
                  
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    {/* BLOOD GROUP CHIPS */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label"><Droplet size={13} color="var(--primary)" /> Blood Group *</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 6 }}>
                        {BLOOD_GROUPS.map(bg => (
                          <button 
                            key={bg} 
                            type="button"
                            onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                            // Disable if user is not logged in OR already a donor
                            disabled={user === null || isAlreadyDonor === true}
                            // Style changes dynamically if the button is selected
                            style={{ 
                              padding: '6px 14px', borderRadius: 7, 
                              border: `1.5px solid ${formData.bloodGroup === bg ? 'var(--primary)' : 'var(--border)'}`, 
                              background: formData.bloodGroup === bg ? 'var(--primary-soft)' : 'var(--bg)', 
                              color: formData.bloodGroup === bg ? 'var(--primary)' : 'var(--text2)', 
                              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' 
                            }}>
                            {bg}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* AGE INPUT */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Age *</label>
                      <input className="form-input" type="number" min="18" max="65" placeholder="25"
                        value={formData.age} 
                        onChange={(event) => setFormData({ ...formData, age: event.target.value })} 
                        disabled={user === null || isAlreadyDonor === true} 
                      />
                    </div>
                  </div>

                  {/* CITY DROPDOWN */}
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label className="form-label"><MapPin size={13} color="var(--blue)" /> City *</label>
                    <select className="form-select" value={formData.city} 
                      onChange={(event) => setFormData({ ...formData, city: event.target.value })} 
                      disabled={user === null || isAlreadyDonor === true}>
                      <option value="">Select city...</option>
                      {CITIES.map((cityName) => <option key={cityName} value={cityName}>{cityName}</option>)}
                    </select>
                  </div>

                  {/* CONTACT NUMBER */}
                  <div className="form-group">
                    <label className="form-label"><Phone size={13} color="var(--success)" /> Contact Number *</label>
                    <input className="form-input" placeholder="e.g. 0300-1234567"
                      value={formData.contactNumber} 
                      onChange={(event) => setFormData({ ...formData, contactNumber: event.target.value })} 
                      disabled={user === null || isAlreadyDonor === true} 
                    />
                  </div>

                  {/* LAST DONATION DATE */}
                  <div className="form-group">
                    <label className="form-label"><Calendar size={13} color="var(--text3)" /> Last Donation Date (Optional)</label>
                    <input className="form-input" type="date"
                      value={formData.lastDonationDate} 
                      onChange={(event) => setFormData({ ...formData, lastDonationDate: event.target.value })} 
                      disabled={user === null || isAlreadyDonor === true} 
                    />
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button className="btn-primary" type="submit" 
                    disabled={user === null || isLoading === true || isAlreadyDonor === true}
                    style={{ width: '100%', height: 50, justifyContent: 'center', marginTop: '0.5rem' }}>
                    
                    {isLoading === true ? (
                      <span className="spinner" /> 
                    ) : isAlreadyDonor === true ? (
                      <><CheckCircle size={17} /> Already Registered</>
                    ) : (
                      <><ArrowRight size={17} /> Register as Donor</>
                    )}
                    
                  </button>
                </form>
              </div>
            </div>

            {/* ===== RIGHT COLUMN: SIDEBAR ===== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Eligibility Rules Card */}
              <div className="glass-card card-accent-blue">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <CheckCircle size={17} color="var(--success)" /> Eligibility Criteria
                </h3>
                {/* Loop through our rules array and display them */}
                {eligibilityRules.map(([title, detail]) => (
                  <div key={title} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text3)', fontWeight: 500 }}>{title}</span>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{detail}</span>
                  </div>
                ))}
              </div>

              {/* Recent Donors List (Only show if we actually fetched some donors) */}
              {recentDonorsList.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Users size={17} color="var(--primary)" /> Recent Donors
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {recentDonorsList.map((donor, index) => (
                      <motion.div 
                        key={donor.id} 
                        initial={{ x: 12, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        transition={{ delay: index * 0.06 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', transition: 'all 0.2s' }}
                        whileHover={{ x: 4 }}
                      >
                        {/* Blood Group Tag */}
                        <span className="bg-tag" style={{ fontSize: '0.72rem', padding: '4px 9px' }}>{donor.bloodGroup}</span>
                        {/* Donor Name */}
                        <span style={{ fontSize: '0.875rem', flex: 1, fontWeight: 500, color: 'var(--text)' }}>{donor.name}</span>
                        {/* City */}
                        <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{donor.city}</span>
                        {/* Eligibility Status Icon */}
                        <span className={`badge badge-${donor.isEligible ? 'green' : 'red'}`} style={{ fontSize: '0.72rem' }}>
                          {donor.isEligible ? '✓' : '⏳'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>
    </motion.div>
  );
}
