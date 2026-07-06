// HospitalsPage.jsx
// This page shows a list of partner hospitals and allows them to submit an emergency blood request.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Droplet, AlertCircle, CheckCircle, Clock, MapPin, Phone, Activity } from 'lucide-react';
import api from '../api/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HospitalsPage() {
  // Store the list of hospitals fetched from the backend
  const [hospitalList, setHospitalList] = useState([]);
  
  // Store what is typed into the emergency request form
  const [requestFormData, setRequestFormData] = useState({ 
    patientName: '', 
    bloodGroup: '', 
    hospitalId: '' 
  });
  
  // Status states
  const [systemMessage, setSystemMessage] = useState(null);
  const [isFetchingHospitals, setIsFetchingHospitals] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Fetch hospital data as soon as the page loads
  useEffect(() => { 
    fetchHospitalData(); 
  }, []);

  // Function to ask the backend for the list of hospitals
  const fetchHospitalData = async () => {
    setIsFetchingHospitals(true);
    try { 
      const response = await api.get('/hospital'); 
      setHospitalList(response.data); 
    }
    catch (error) { 
      console.error('Failed to fetch hospitals'); 
    }
    setIsFetchingHospitals(false);
  };

  // Function to submit the emergency blood request
  const handleRequestSubmit = async (event) => {
    event.preventDefault(); // Stop page reload
    
    // Make sure no fields are empty
    if (requestFormData.patientName === '' || requestFormData.bloodGroup === '' || requestFormData.hospitalId === '') {
      setSystemMessage({ type: 'error', text: 'Please fill all fields.' }); 
      return;
    }
    
    setIsSubmittingForm(true);
    
    try {
      // Send the request to the backend. We convert hospitalId to a number just in case.
      const response = await api.post('/hospital/request', { 
        patientName: requestFormData.patientName, 
        bloodGroup: requestFormData.bloodGroup, 
        hospitalId: parseInt(requestFormData.hospitalId) 
      });
      
      // Success! Show message, clear form, and re-fetch hospitals to update the "pending requests" count
      setSystemMessage({ type: 'success', text: response.data.message });
      setRequestFormData({ patientName: '', bloodGroup: '', hospitalId: '' });
      fetchHospitalData();
      
    } catch (error) { 
      // Failed to submit
      setSystemMessage({ type: 'error', text: error.response?.data?.message || 'Request failed' }); 
    }
    
    setIsSubmittingForm(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page">
      
      {/* ===== HEADER SECTION ===== */}
      <div style={{ background: 'linear-gradient(160deg, var(--surface) 0%, var(--bg2) 100%)', padding: '4rem 4rem 3rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label">Partner Network</div>
          <h1 className="section-title">Hospitals & Blood Banks</h1>
          <p className="section-desc">
            View real-time blood availability across our partner network and submit emergency requests for admitted patients.
          </p>
        </div>
      </div>

      <section className="section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
            
            {/* ===== LEFT COLUMN: HOSPITAL LIST ===== */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} color="var(--blue)" /> Partner Hospitals
                {/* Show total count badge if we have hospitals */}
                {hospitalList.length > 0 && <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{hospitalList.length} hospitals</span>}
              </h2>

              {/* Show loading skeleton if we are still fetching data */}
              {isFetchingHospitals === true ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1,2,3].map(item => (
                    <div key={item} style={{ background: 'var(--bg2)', borderRadius: 14, height: 100, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              ) : (
                // Show the actual hospital cards
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {hospitalList.map((hospital, index) => (
                    
                    <motion.div 
                      key={hospital.id} 
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                      className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }}
                      whileHover={{ y: -3 }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        
                        {/* Hospital Icon Box */}
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--blue-soft)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Building2 size={24} color="var(--blue)" />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          {/* Top Row: Name and Pending Requests Badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{hospital.name}</h3>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {hospital.pendingRequests > 0 && (
                                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                                  <Clock size={10} /> {hospital.pendingRequests} Pending
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* City Location */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                            <MapPin size={12} /> {hospital.city}
                          </div>

                          {/* Blood Availability Tags */}
                          <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Available Blood Groups
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {hospital.bloodAvailable?.length > 0
                                ? hospital.bloodAvailable.map(blood => <span key={blood} className="bg-tag" style={{ fontSize: '0.7rem', padding: '3px 9px' }}>{blood}</span>)
                                : <span style={{ fontSize: '0.78rem', color: 'var(--text3)', fontStyle: 'italic' }}>No eligible donors in this city</span>
                              }
                            </div>
                          </div>

                          {/* Bottom Stats Row */}
                          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
                            <div>
                              <span style={{ color: 'var(--text3)' }}>Total Requests: </span>
                              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{hospital.totalRequests}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text3)' }}>Pending: </span>
                              <span style={{ fontWeight: 700, color: hospital.pendingRequests > 0 ? 'var(--warning)' : 'var(--success)' }}>{hospital.pendingRequests}</span>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </motion.div>
                    
                  ))}
                </div>
              )}
            </div>

            {/* ===== RIGHT COLUMN: EMERGENCY REQUEST FORM ===== */}
            <div>
              {/* 'position: sticky' makes the form stay on screen while you scroll the hospital list */}
              <div className="glass-card card-accent-top" style={{ position: 'sticky', top: 90, padding: '2rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Patient Blood Request</h3>
                  </div>
                </div>
                
                <p style={{ fontSize: '0.875rem', color: 'var(--text3)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                  Hospital staff will review and dispatch alerts to matched eligible donors in the area.
                </p>

                {/* Show any success or error messages here */}
                <AnimatePresence>
                  {systemMessage !== null && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <div className={`alert alert-${systemMessage.type}`} style={{ marginBottom: '1.25rem' }}>
                        {systemMessage.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                        {systemMessage.text}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRequestSubmit}>
                  {/* PATIENT NAME */}
                  <div className="form-group">
                    <label className="form-label">Patient Full Name *</label>
                    <input className="form-input" placeholder="e.g. Muhammad Ali" 
                      value={requestFormData.patientName} 
                      onChange={(event) => setRequestFormData({ ...requestFormData, patientName: event.target.value })} 
                    />
                  </div>
                  
                  {/* BLOOD GROUP CHIPS */}
                  <div className="form-group">
                    <label className="form-label"><Droplet size={13} color="var(--primary)" /> Required Blood Group *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 6 }}>
                      {BLOOD_GROUPS.map(bg => (
                        <button 
                          key={bg} 
                          type="button" 
                          onClick={() => setRequestFormData({ ...requestFormData, bloodGroup: bg })}
                          style={{ 
                            padding: '6px 14px', borderRadius: 7, 
                            border: `1.5px solid ${requestFormData.bloodGroup === bg ? 'var(--primary)' : 'var(--border)'}`, 
                            background: requestFormData.bloodGroup === bg ? 'var(--primary-soft)' : 'var(--bg)', 
                            color: requestFormData.bloodGroup === bg ? 'var(--primary)' : 'var(--text2)', 
                            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' 
                          }}>
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* HOSPITAL DROPDOWN */}
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label"><Building2 size={13} color="var(--blue)" /> Select Hospital *</label>
                    <select className="form-select" 
                      value={requestFormData.hospitalId} 
                      onChange={(event) => setRequestFormData({ ...requestFormData, hospitalId: event.target.value })}>
                      <option value="">Choose hospital...</option>
                      {hospitalList.map(hospital => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name} — {hospital.city}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* SUBMIT BUTTON */}
                  <button className="btn-primary" type="submit" disabled={isSubmittingForm}
                    style={{ width: '100%', marginTop: '0.5rem', height: 50, justifyContent: 'center' }}>
                    {isSubmittingForm ? (
                      <span className="spinner" /> 
                    ) : (
                      <><Activity size={17} /> Submit Blood Request</>
                    )}
                  </button>
                </form>

                {/* Emergency Warning */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--warning-soft)', borderRadius: 8, border: '1px solid rgba(217,119,6,0.2)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 500 }}>
                    🚨 For life-threatening emergencies, also call emergency services directly.
                  </p>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </motion.div>
  );
}
