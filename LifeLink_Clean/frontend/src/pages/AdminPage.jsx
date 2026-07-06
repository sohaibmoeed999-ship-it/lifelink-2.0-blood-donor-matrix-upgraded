// AdminPage.jsx
// This page is a dashboard exclusively for Administrators. 
// It shows charts, total numbers, and allows the admin to manage data (like deleting reviews).

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// We use a library called 'recharts' to easily draw bar charts, pie charts, and line graphs.
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
// Icons for the dashboard
import { Trash2, Users, Building2, Activity, Star, AlertCircle, RefreshCw, TrendingUp, Droplet, ShieldCheck } from 'lucide-react';
// API to get data from backend
import api from '../api/api';

// A predefined list of pretty colors to use inside our charts
const CHART_COLORS = ['#C81D25', '#2563EB', '#06B6D4', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0EA5E9'];

// --- Helper Component: Custom Chart Tooltip ---
// When you hover over a chart, this little box pops up to show exact numbers.
const CustomTooltip = ({ active, payload, label }) => {
  // If the user is hovering (active) and there is data to show (payload)
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontSize: '0.875rem' }}>{label}</p>
        {/* Loop through the data points and display them in their assigned color */}
        {payload.map((dataPoint, index) => (
          <p key={index} style={{ color: dataPoint.color, fontSize: '0.82rem', fontWeight: 600 }}>
            {dataPoint.name}: {dataPoint.value}
          </p>
        ))}
      </div>
    );
  }
  return null; // Return nothing if not hovering
};

export default function AdminPage() {
  // State variables to hold all the different types of data the admin needs to see
  const [generalStats, setGeneralStats] = useState(null);
  const [allDonors, setAllDonors] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  
  // This state holds the data specifically formatted for our 3 charts
  const [chartData, setChartData] = useState({ 
    bloodGroups: [], 
    cities: [], 
    monthly: [] 
  });
  
  // State to show a loading screen while we fetch all this data
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // State to track which Tab the admin is currently looking at (Overview, Donors, or Reviews)
  const [currentTab, setCurrentTab] = useState('overview');
  
  // State to track which review ID is currently being deleted (so we can show a spinner on that specific button)
  const [reviewBeingDeleted, setReviewBeingDeleted] = useState(null);

  // When the Admin page first loads, call our fetch function
  useEffect(() => { 
    fetchAllDashboardData(); 
  }, []);

  // Function to gather everything from the backend at once
  const fetchAllDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // Promise.all lets us fetch 6 different things at the exact same time to speed things up
      const [statsRes, donorsRes, bgRes, citiesRes, monthlyRes, reviewsRes] = await Promise.all([
        api.get('/dashboard/stats'), 
        api.get('/dashboard/donors'),
        api.get('/dashboard/bloodgroups'), 
        api.get('/dashboard/cities'),
        api.get('/dashboard/monthly'), 
        api.get('/review')
      ]);
      
      // Save all the fetched data into our state variables
      setGeneralStats(statsRes.data); 
      setAllDonors(donorsRes.data);
      setChartData({ bloodGroups: bgRes.data, cities: citiesRes.data, monthly: monthlyRes.data });
      setAllReviews(reviewsRes.data);
      
    } catch (error) { 
      console.error('Admin data fetch failed'); 
    }
    setIsLoadingData(false);
  };

  // Function to delete a review if an admin decides it's inappropriate
  const handleDeleteReview = async (reviewId) => {
    // Show a standard browser popup asking "Are you sure?"
    const userConfirmed = window.confirm('Delete this review?');
    if (!userConfirmed) return; // If they click Cancel, stop here.
    
    setReviewBeingDeleted(reviewId); // Show a loading spinner on the button
    
    try {
      // Tell the backend to delete it
      await api.delete(`/review/${reviewId}`);
      
      // Remove it from our screen instantly without refreshing the page
      setAllReviews((previousReviews) => previousReviews.filter((review) => review.id !== reviewId));
      
      // Also update the total review count in the top stat boxes
      if (generalStats !== null) {
        setGeneralStats((previousStats) => ({ ...previousStats, totalReviews: previousStats.totalReviews - 1 }));
      }
      
    } catch (error) { 
      alert('Failed to delete review.'); 
    }
    
    setReviewBeingDeleted(null); // Remove the loading spinner
  };

  // --- RENDERING VIEWS ---

  // 1. SHOW A LOADING SCREEN IF WE ARE WAITING FOR DATA
  if (isLoadingData === true) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
          <Activity size={36} color="var(--primary)" />
        </motion.div>
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  // 2. SHOW AN ERROR IF THE DATA FAILED TO LOAD COMPLETELY
  if (generalStats === null) {
    return (
      <div className="page" style={{ padding: '6rem 4rem' }}>
        <div className="alert alert-error">
          <AlertCircle size={16} /> Failed to load dashboard. Ensure you are logged in as Admin.
        </div>
      </div>
    );
  }

  // Calculate data for the "Eligible vs Waiting" Pie Chart
  const eligibilityPieChartData = [
    { name: 'Eligible', value: generalStats.eligibleDonors, color: '#059669' },
    { name: 'Waiting', value: generalStats.totalDonors - generalStats.eligibleDonors, color: '#C81D25' },
  ];

  // Define the 3 navigation tabs for the admin interface
  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={15} /> },
    { id: 'donors', label: `Donors (${generalStats.totalDonors})`, icon: <Users size={15} /> },
    { id: 'reviews', label: `Reviews (${generalStats.totalReviews})`, icon: <Star size={15} /> },
  ];

  // Define the 4 big colorful statistic boxes shown at the top
  const topStatisticCards = [
    { label: 'Total Donors', value: generalStats.totalDonors, subtext: `${generalStats.eligibleDonors} eligible now`, icon: <Users size={20} color="var(--primary)" />, bgColor: 'var(--primary-soft)', borderColor: 'rgba(200,29,37,0.15)', accentColor: 'var(--primary)' },
    { label: 'Blood Requests', value: generalStats.totalRequests, subtext: `${generalStats.pendingRequests} pending action`, icon: <AlertCircle size={20} color="var(--warning)" />, bgColor: 'var(--warning-soft)', borderColor: 'rgba(217,119,6,0.15)', accentColor: 'var(--warning)' },
    { label: 'Hospitals', value: generalStats.totalHospitals, subtext: `${generalStats.citiesCovered} cities covered`, icon: <Building2 size={20} color="var(--blue)" />, bgColor: 'var(--blue-soft)', borderColor: 'rgba(37,99,235,0.15)', accentColor: 'var(--blue)' },
    { label: 'Reviews', value: generalStats.totalReviews, subtext: 'Community feedback', icon: <Star size={20} color="var(--cyan)" />, bgColor: 'var(--cyan-soft)', borderColor: 'rgba(6,182,212,0.15)', accentColor: 'var(--cyan)' },
  ];

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      
      {/* ===== ADMIN HEADER SECTION ===== */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '2rem 3rem' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary-soft)', border: '1px solid rgba(200,29,37,0.2)', padding: '4px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <ShieldCheck size={12} /> Admin Console
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
              System Dashboard
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginTop: 3 }}>
              Real-time metrics and platform management
            </p>
          </div>
          
          {/* Refresh button to fetch data again without reloading the page */}
          <button className="btn-secondary" onClick={fetchAllDashboardData} style={{ gap: 7, padding: '10px 20px' }}>
            <RefreshCw size={15} /> Refresh Data
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 3rem' }}>
        
        {/* ===== TOP 4 STATISTIC CARDS ===== */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {topStatisticCards.map((card, index) => (
            <motion.div key={card.label} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.07 }}
              className="stat-card" style={{ borderTop: `3px solid ${card.accentColor}` }}>
              
              <div className="stat-card-icon" style={{ background: card.bgColor, border: `1px solid ${card.borderColor}` }}>
                {card.icon}
              </div>
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-sub">{card.subtext}</div>
              
            </motion.div>
          ))}
        </div>

        {/* ===== TAB SWITCHER ===== */}
        {/* A row of buttons to switch between the 3 main admin views */}
        <div className="tab-bar" style={{ marginBottom: '2rem' }}>
          {navigationTabs.map((tab) => (
            <button key={tab.id} className={`tab-btn ${currentTab === tab.id ? 'active' : ''}`} onClick={() => setCurrentTab(tab.id)}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================= */}
        {/* TAB 1: OVERVIEW (Contains all the charts) */}
        {/* ========================================= */}
        {currentTab === 'overview' && (
          <div>
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              
              {/* CHART 1: Blood Group Bar Chart */}
              <div className="glass-card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Droplet size={16} color="var(--primary)" /> Blood Group Distribution
                </h3>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.bloodGroups} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="bloodGroup" stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Donors" radius={[6,6,0,0]}>
                        {/* Color each bar uniquely using our predefined colors array */}
                        {chartData.bloodGroups.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CHART 2: Monthly Registrations Line Graph */}
              <div className="glass-card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <TrendingUp size={16} color="var(--success)" /> Monthly Registrations
                </h3>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.monthly} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="count" name="Registrations" stroke="var(--success)" strokeWidth={2.5}
                        dot={{ r: 4, fill: 'var(--surface)', stroke: 'var(--success)', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: 'var(--success)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid-2">
              
              {/* CHART 3: City Distribution Pie Chart */}
              <div className="glass-card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Building2 size={16} color="var(--blue)" /> Donors by City
                </h3>
                <div style={{ height: 260, display: 'flex', alignItems: 'center' }}>
                  {/* Left half: The actual pie chart circle */}
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie data={chartData.cities} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="count" nameKey="city">
                        {chartData.cities.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                      </Pie>
                      <ReTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Right half: The legend list (shows what color means what city) */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1rem', overflowY: 'auto', maxHeight: 240 }}>
                    {chartData.cities.map((cityData, index) => (
                      <div key={cityData.city} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Tiny colored dot */}
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[index % CHART_COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text2)', fontWeight: 500 }}>{cityData.city}</div>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.875rem' }}>{cityData.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CHART 4: Eligibility Pie Chart & Big Numbers */}
              <div className="glass-card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Activity size={16} color="var(--cyan)" /> Eligible vs Waiting Donors
                </h3>
                
                {/* A small pie chart showing the ratio */}
                <div style={{ height: 200, marginBottom: '1.25rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={eligibilityPieChartData} cx="50%" cy="50%" outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name" 
                           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {eligibilityPieChartData.map((e, index) => <Cell key={index} fill={e.color} />)}
                      </Pie>
                      <ReTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Big colorful numbers below the pie chart */}
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ flex: 1, padding: '1rem', background: 'var(--success-soft)', borderRadius: 10, border: '1px solid rgba(5,150,105,0.2)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>{generalStats.eligibleDonors}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 500 }}>Eligible</div>
                  </div>
                  <div style={{ flex: 1, padding: '1rem', background: 'var(--primary-soft)', borderRadius: 10, border: '1px solid rgba(200,29,37,0.2)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{generalStats.totalDonors - generalStats.eligibleDonors}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>Waiting Period</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: DONORS LIST (A giant table of all users) */}
        {/* ========================================= */}
        {currentTab === 'donors' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
                Donor Master List — {allDonors.length} records
              </h3>
              
              {/* Responsive table wrapper */}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Group</th>
                      <th>City</th>
                      <th>Age</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDonors.map((donor, index) => (
                      // Animate each row so they fade in one by one like a cascade
                      <motion.tr key={donor.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}>
                        
                        <td style={{ color: 'var(--text3)', fontSize: '0.8rem', fontFamily: 'monospace' }}>#{donor.id}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{donor.name}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{donor.email}</td>
                        <td><span className="bg-tag" style={{ fontSize: '0.72rem', padding: '3px 9px' }}>{donor.bloodGroup}</span></td>
                        <td style={{ fontSize: '0.875rem' }}>{donor.city}</td>
                        <td style={{ fontSize: '0.875rem' }}>{donor.age}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{donor.contactNumber || '—'}</td>
                        <td>
                          <span className={`badge badge-${donor.isEligible ? 'green' : 'red'}`}>
                            {donor.isEligible ? '✓ Eligible' : '⏳ Waiting'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{donor.createdAt}</td>
                        
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
            </div>
          </motion.div>
        )}

        {/* ========================================= */}
        {/* TAB 3: REVIEWS MANAGEMENT */}
        {/* ========================================= */}
        {currentTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* If there are no reviews, show a message */}
            {allReviews.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                <Star size={44} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text3)' }}>No reviews yet.</p>
              </div>
            ) : (
              // Otherwise, list them out as cards with a delete button attached
              allReviews.map((review, index) => (
                <motion.div key={review.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                  className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.5rem' }}>
                  
                  {/* Left Side: The actual review text and stars */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{review.userName}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {/* Draw the 5 stars */}
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star key={starIndex} size={13} fill={starIndex < review.rating ? 'var(--warning)' : 'transparent'} color={starIndex < review.rating ? 'var(--warning)' : 'var(--border)'} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{review.createdAt}</span>
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: '0.875rem', lineHeight: 1.65, fontStyle: 'italic' }}>
                      "{review.comment}"
                    </p>
                  </div>
                  
                  {/* Right Side: The Delete Button */}
                  <button 
                    onClick={() => handleDeleteReview(review.id)} 
                    disabled={reviewBeingDeleted === review.id}
                    style={{ marginLeft: '1.25rem', padding: '8px', background: 'var(--primary-soft)', border: '1px solid rgba(200,29,37,0.2)', borderRadius: 8, cursor: 'pointer', color: 'var(--primary)', transition: 'all 0.2s', flexShrink: 0 }}
                  >
                    {/* Show a red spinning circle if this exact review is currently being deleted, otherwise show a trash icon */}
                    {reviewBeingDeleted === review.id ? (
                      <span className="spinner spinner-red" style={{ width: 16, height: 16 }} />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                  
                </motion.div>
              ))
            )}
          </motion.div>
        )}
        
      </div>
    </div>
  );
}
