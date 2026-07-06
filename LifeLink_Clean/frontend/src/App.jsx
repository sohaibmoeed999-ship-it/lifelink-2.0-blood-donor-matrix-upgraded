// App.jsx
// This is the main starting file of our website. It controls which page the user is currently seeing.

import React, { useState, useContext } from 'react';
// Framer Motion is a library used to make smooth animations (like fading in/out) when we switch pages.
import { AnimatePresence, motion } from 'framer-motion';

// Import all the different pages that make up our website.
import Nav from './components/Nav';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DonorsPage from './pages/DonorsPage';
import FindPage from './pages/FindPage';
import HospitalsPage from './pages/HospitalsPage';
import ReviewsPage from './pages/ReviewsPage';
import AdminPage from './pages/AdminPage';

// Import the AuthContext so we can check if the user is logged in.
import { AuthContext } from './context/AuthContext';

// This configuration tells Framer Motion exactly how to animate the pages when they appear and disappear.
const pageTransitionAnimations = {
  initial: { opacity: 0, y: 12 }, // When page starts loading, it is transparent and slightly pushed down.
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }, // Page smoothly fades in and moves to normal position.
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }, // When leaving the page, it fades out and moves up.
};

function App() {
  // We use this state variable 'page' to keep track of what the user is looking at right now.
  // By default, everyone starts on the "Home" page.
  const [page, setPage] = useState('Home');
  
  // We get the 'user' object from our AuthContext to see who is currently logged in.
  const { user } = useContext(AuthContext);

  // This function acts like a traffic controller. 
  // It looks at the 'page' variable and returns the correct Page Component.
  const renderPage = () => {
    if (page === 'Home') {
      return <HomePage setPage={setPage} />;
    } 
    else if (page === 'Auth') {
      return <AuthPage setPage={setPage} />;
    } 
    else if (page === 'Donors') {
      return <DonorsPage />;
    } 
    else if (page === 'Find') {
      return <FindPage />;
    } 
    else if (page === 'Hospitals') {
      return <HospitalsPage />;
    } 
    else if (page === 'Reviews') {
      return <ReviewsPage />;
    } 
    else if (page === 'Admin') {
      // Extra security check: Only let the user see the Admin page if their role is actually "Admin".
      // If they are not an Admin, we send them to the Login (Auth) page instead.
      if (user !== null && user.role === 'Admin') {
        return <AdminPage />;
      } else {
        return <AuthPage setPage={setPage} />;
      }
    } 
    else {
      // If something goes wrong and the page name is unknown, always fall back to the Home page.
      return <HomePage setPage={setPage} />;
    }
  };

  return (
    <>
      {/* The Navigation bar sits at the very top of the app at all times. */}
      {/* We pass the 'page' state so the Navbar knows which link to highlight, and 'setPage' so clicking a link actually changes the page. */}
      <Nav page={page} setPage={setPage} />
      
      {/* AnimatePresence makes sure the exit animation finishes before removing the old page from the screen. */}
      <AnimatePresence mode="wait">
        
        {/* motion.div wraps our current page to apply the animation effects defined earlier. */}
        <motion.div
          key={page} // The key is important! It tells Framer Motion to restart the animation whenever the 'page' changes.
          variants={pageTransitionAnimations}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* This simply calls our traffic controller function to show the actual page content. */}
          {renderPage()}
        </motion.div>
        
      </AnimatePresence>
    </>
  );
}

export default App;
