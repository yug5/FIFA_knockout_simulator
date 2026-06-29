import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16 px-4">
      <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-lg">
        <ShieldAlert className="w-12 h-12 text-slate-550 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white tracking-tight uppercase mb-2">
          Page Not Found
        </h2>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          We couldn't find the page you're looking for. Check the address and try again.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-white hover:bg-slate-250 text-navy-dark font-extrabold px-6 py-3 rounded-xl transition-all duration-300 transform active:scale-95 shadow-md shadow-white/5 text-xs"
        >
          Back to Bracket
        </Link>
      </div>
    </div>
  );
}
