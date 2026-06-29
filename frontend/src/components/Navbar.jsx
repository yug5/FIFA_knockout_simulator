import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="glass-panel border-b border-glass-border py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <Trophy className="w-6 h-6 text-gold shrink-0" />
          <span className="font-extrabold text-xl tracking-wider text-white transition-colors duration-300">
            FIFA 2026 <span className="text-gold">KNOCKOUT</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
              isActive('/')
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Predict Bracket
          </Link>
          <Link
            to="/leaderboard"
            className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
              isActive('/leaderboard')
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Leaderboard
          </Link>
          <Link
            to="/predictions"
            className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
              isActive('/predictions') || location.pathname.startsWith('/predictions/')
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            All Brackets
          </Link>
          <Link
            to="/admin"
            className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
              isActive('/admin')
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
