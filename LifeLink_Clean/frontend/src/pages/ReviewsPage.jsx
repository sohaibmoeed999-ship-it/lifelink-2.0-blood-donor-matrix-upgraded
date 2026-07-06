// ReviewsPage.jsx
// This page displays community feedback and allows logged-in users to submit their own reviews.

import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons for visual appeal
import { Star, MessageSquareQuote, User, Send, ShieldCheck, Heart } from 'lucide-react';
// API to talk to the backend, and AuthContext to see if user is logged in
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function ReviewsPage() {
  // Check if a user is logged in
  const { user } = useContext(AuthContext);
  
  // Store the list of reviews fetched from the backend
  const [reviewList, setReviewList] = useState([]);
  
  // Store what the user is typing into the new review form. Default rating is 5 stars.
  const [newReviewForm, setNewReviewForm] = useState({ rating: 5, comment: '' });
  
  // State for success/error messages
  const [systemMessage, setSystemMessage] = useState(null);
  
  // State to show a loading spinner when sending the review
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State to track which star the user is currently hovering over with their mouse
  const [hoveredStarNumber, setHoveredStarNumber] = useState(null);

  // Fetch reviews as soon as the page loads
  useEffect(() => { 
    fetchAllReviews(); 
  }, []);

  // Function to ask the backend for all reviews
  const fetchAllReviews = async () => {
    try { 
      const response = await api.get('/review'); 
      setReviewList(response.data); 
    } catch (error) { 
      console.error('Failed to fetch reviews'); 
    }
  };

  // Function to handle when the user clicks "Publish Review"
  const handleReviewSubmit = async (event) => {
    event.preventDefault(); // Stop page from refreshing
    
    // Safety check 1: Must be logged in
    if (user === null) { 
      setSystemMessage({ type: 'error', text: 'Please sign in to leave a review.' }); 
      return; 
    }
    
    // Safety check 2: Comment cannot be empty
    if (newReviewForm.comment.trim() === '') { 
      setSystemMessage({ type: 'error', text: 'Please write a comment.' }); 
      return; 
    }
    
    setIsSubmitting(true);
    
    try {
      // Send the review to the backend
      await api.post('/review', newReviewForm);
      
      // Success! Show a thank you message
      setSystemMessage({ type: 'success', text: 'Thank you for your feedback!' });
      
      // Reset the form back to empty and 5 stars
      setNewReviewForm({ rating: 5, comment: '' });
      
      // Fetch the reviews again so the new one shows up immediately
      fetchAllReviews();
      
      // Hide the success message after 3 seconds
      setTimeout(() => setSystemMessage(null), 3000);
      
    } catch (error) { 
      // If the backend gives an error, show it to the user
      setSystemMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit review' }); 
    }
    
    setIsSubmitting(false);
  };

  // Calculate the average rating across all reviews. 
  // We use reduce to add up all ratings, then divide by the total number of reviews.
  let averageRatingValue = null;
  if (reviewList.length > 0) {
    const sumOfAllRatings = reviewList.reduce((total, review) => total + review.rating, 0);
    averageRatingValue = (sumOfAllRatings / reviewList.length).toFixed(1); // Keep 1 decimal place, e.g., 4.5
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page">
      
      {/* ===== HEADER SECTION ===== */}
      <div style={{ background: 'linear-gradient(160deg, var(--surface) 0%, var(--bg2) 100%)', padding: '4rem 4rem 3rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Left Side: Title and Description */}
          <div>
            <div className="section-label">Community Feedback</div>
            <h1 className="section-title">Stories That Save Lives</h1>
            <p className="section-desc">Real experiences from our donors and patients. Trust built through transparency.</p>
          </div>
          
          {/* Right Side: Large Average Rating Display */}
          {averageRatingValue !== null && (
            <div style={{ textAlign: 'center', padding: '1.5rem 2rem', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* The big number (e.g. 4.8) */}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                {averageRatingValue}
              </div>
              
              {/* The stars under the big number */}
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', margin: '6px 0' }}>
                {Array.from({ length: 5 }).map((_, index) => {
                  // If the star's index is less than the rounded average rating, fill it with gold.
                  const isFilled = index < Math.round(parseFloat(averageRatingValue));
                  return (
                    <Star 
                      key={index} 
                      size={16} 
                      fill={isFilled ? 'var(--warning)' : 'transparent'} 
                      color="var(--warning)" 
                    />
                  );
                })}
              </div>
              
              {/* Review count text */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text3)', fontWeight: 500 }}>
                {reviewList.length} reviews
              </div>
              
            </div>
          )}
          
        </div>
      </div>

      <section className="section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
            
            {/* ===== LEFT COLUMN: LIST OF REVIEWS ===== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* If there are no reviews yet, show a friendly message */}
              {reviewList.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <MessageSquareQuote size={48} color="var(--border)" style={{ margin: '0 auto 1.5rem' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>No stories yet</h3>
                  <p style={{ color: 'var(--text3)' }}>Be the first to share your Life Link experience.</p>
                </div>
              ) : (
                // If there ARE reviews, loop through them and draw a card for each
                <AnimatePresence>
                  {reviewList.map((review, index) => (
                    
                    <motion.div 
                      key={review.id} 
                      initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.08 }}
                      className="glass-card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}
                      whileHover={{ y: -3 }}
                    >
                      {/* Big decorative quote icon in the top right corner */}
                      <MessageSquareQuote size={80} color="rgba(200,29,37,0.04)" style={{ position: 'absolute', top: -8, right: -8 }} />
                      
                      <div style={{ position: 'relative' }}>
                        {/* Top Area: User Info and Stars */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          
                          {/* User Avatar & Name */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={18} color="var(--primary)" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                {review.userName} <ShieldCheck size={13} color="var(--success)" />
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                                Verified User • {review.createdAt}
                              </div>
                            </div>
                          </div>
                          
                          {/* The 5 Stars for this specific review */}
                          <div style={{ display: 'flex', gap: 2 }}>
                            {Array.from({ length: 5 }).map((_, starIndex) => {
                              const isFilled = starIndex < review.rating;
                              return (
                                <Star 
                                  key={starIndex} 
                                  size={15} 
                                  fill={isFilled ? 'var(--warning)' : 'transparent'} 
                                  color={isFilled ? 'var(--warning)' : 'var(--border)'} 
                                />
                              );
                            })}
                          </div>
                          
                        </div>
                        
                        {/* The actual review text */}
                        <p style={{ color: 'var(--text2)', fontSize: '0.95rem', lineHeight: 1.75, fontStyle: 'italic' }}>
                          "{review.comment}"
                        </p>
                      </div>
                    </motion.div>
                    
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* ===== RIGHT COLUMN: "WRITE A REVIEW" FORM ===== */}
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="glass-card card-accent-cyan" style={{ position: 'sticky', top: 90, padding: '2rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                <Heart size={20} color="var(--primary)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Share Your Experience</h3>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: 'var(--text3)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Your story encourages more donors and builds trust in the community.
              </p>

              {/* If the user is NOT logged in, hide the form and show a message */}
              {user === null ? (
                <div className="alert alert-info">Please sign in to share your story.</div>
              ) : (
                // If they ARE logged in, show the form!
                <form onSubmit={handleReviewSubmit}>
                  
                  {/* Show success/error messages here */}
                  <AnimatePresence>
                    {systemMessage !== null && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className={`alert alert-${systemMessage.type}`} style={{ marginBottom: '1.25rem' }}>{systemMessage.text}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* INTERACTIVE STAR RATING SELECTOR */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Overall Rating</span>
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{newReviewForm.rating} / 5</span>
                    </label>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', padding: '14px', background: 'var(--bg)', borderRadius: 10, border: '1.5px solid var(--border)' }}>
                      {/* Loop to create exactly 5 clickable stars */}
                      {[1, 2, 3, 4, 5].map((starNumber) => {
                        
                        // A star should be filled if the user is hovering over it OR if they have clicked it (saved in state)
                        const isActive = (hoveredStarNumber || newReviewForm.rating) >= starNumber;
                        
                        return (
                          <motion.div key={starNumber} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Star 
                              size={28} 
                              style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                              fill={isActive ? 'var(--warning)' : 'transparent'}
                              color={isActive ? 'var(--warning)' : 'var(--border)'}
                              
                              // Track where the mouse is pointing
                              onMouseEnter={() => setHoveredStarNumber(starNumber)}
                              onMouseLeave={() => setHoveredStarNumber(null)}
                              
                              // Save the rating when they click
                              onClick={() => setNewReviewForm({ ...newReviewForm, rating: starNumber })} 
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COMMENT TEXT BOX */}
                  <div className="form-group">
                    <label className="form-label">Your Review</label>
                    <textarea className="form-textarea" rows="5"
                      placeholder="Tell us about your experience with Life Link..."
                      value={newReviewForm.comment} 
                      onChange={(event) => setNewReviewForm({ ...newReviewForm, comment: event.target.value })}
                      style={{ resize: 'none', lineHeight: 1.7 }} 
                    />
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button className="btn-primary" type="submit" disabled={isSubmitting}
                    style={{ width: '100%', justifyContent: 'center', height: 48 }}>
                    {isSubmitting ? (
                      <span className="spinner" /> 
                    ) : (
                      <><Send size={16} /> Publish Review</>
                    )}
                  </button>
                  
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
