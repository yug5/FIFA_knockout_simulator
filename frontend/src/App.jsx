import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import BracketPage from './pages/BracketPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PredictionsPage from './pages/PredictionsPage';
import SingleBracketPage from './pages/SingleBracketPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Reusable page transition wrapper
const AnimatedRoute = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedRoute><BracketPage /></AnimatedRoute>} />
        <Route path="/leaderboard" element={<AnimatedRoute><LeaderboardPage /></AnimatedRoute>} />
        <Route path="/predictions" element={<AnimatedRoute><PredictionsPage /></AnimatedRoute>} />
        <Route path="/predictions/:name" element={<AnimatedRoute><SingleBracketPage /></AnimatedRoute>} />
        <Route path="/admin" element={<AnimatedRoute><AdminPage /></AnimatedRoute>} />
        <Route path="*" element={<AnimatedRoute><NotFoundPage /></AnimatedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-navy text-gray-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
            <AppRoutes />
          </main>
          <footer className="py-6 border-t border-glass-border/30 text-center text-xs text-gray-500">
            World Cup 2026 Knockout Prediction App. Built with React & Spring Boot.
          </footer>
        </div>
      </Router>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#050814',
            color: '#fff',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            fontSize: '13px',
            fontWeight: 'bold',
          },
        }}
      />
    </QueryClientProvider>
  );
}
