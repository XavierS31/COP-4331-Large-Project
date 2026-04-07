import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import knightLabLogo from '../assets/KnightLabLogo.png';

interface TopNavBarProps {
  showAuthButtons?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ showAuthButtons = true, searchQuery, onSearchChange }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f9f9f7]/80 dark:bg-[#1a1c1b]/80 backdrop-blur-md flex justify-between items-center px-8 py-4 max-w-full border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={knightLabLogo}
            alt=""
            className="h-8 w-auto max-h-10 object-contain object-left"
          />
          <span className="text-xl font-black tracking-tight whitespace-nowrap font-headline">
            <span className="text-[#1a1c1b] dark:text-[#f9f9f7]">Knight</span>
            <span className="text-[#755b00] dark:text-[#ffc909]"> Lab</span>
          </span>
        </Link>
        {onSearchChange !== undefined && (
          <div className="hidden md:flex relative ml-4 w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search research opportunities..."
              className="w-full bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary text-sm font-body outline-none"
            />
          </div>
        )}
        
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center">
            <button onClick={logout} className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors mx-4">Sign Out</button>
            <div className="font-headline font-bold text-[#755b00] dark:text-[#ffc909] px-4 py-2">
              Welcome, {user.username}
            </div>
          </div>
        ) : showAuthButtons ? (
          <>
            <Link to="/" className="font-headline font-bold text-[#755b00] dark:text-[#ffc909] px-4 py-2 hover:scale-95 duration-150 ease-in-out">
              Log In
            </Link>
            <Link to="/register" className="bg-primary px-6 py-2 rounded-lg font-headline font-bold text-on-primary hover:scale-95 duration-150 ease-in-out">
              Register
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
};
