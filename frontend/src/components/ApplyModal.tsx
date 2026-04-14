import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Use your auth context
import toast from 'react-hot-toast';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  postingTitle: string;
  postingId: string;
}

// Step 1: Re-use your buildPath logic for the modal
const app_name = 'cop4331-11-domain.xyz';
function buildPath(route: string): string {
    const isDevelopment = typeof import.meta !== 'undefined' && 
                         import.meta.env && 
                         import.meta.env.MODE === 'development';

    if (!isDevelopment) {
        return 'http://' + app_name + ':5000/' + route;
    } else {
        return 'http://localhost:5000/' + route;
    }
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, postingTitle, postingId }) => {
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Step 2: Use the live token and refreshToken from your context
  const { token, refreshToken } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!statement.trim()) {
      toast.error("Please write a short statement.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(buildPath('api/applications/create'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Use the token from useAuth()
        },
        body: JSON.stringify({ researchId: postingId, statement })
      });

      const data = await response.json();

      // Step 3: Always check for a new token to keep the session alive
      if (data.token) {
        refreshToken(data.token);
      }

      if (response.status === 401 || data.error) {
        toast.error(data.error || "Session expired. Please log in again.");
      } else {
        toast.success("Application submitted successfully!");
        onClose();
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1a1c1b] w-full max-w-lg rounded-xl p-8 shadow-2xl border border-outline-variant/20">
        <h2 className="font-headline text-2xl font-bold mb-2 text-on-surface">Apply for Research</h2>
        <p className="font-body text-secondary text-sm mb-6">
          Project: <span className="font-bold text-primary">{postingTitle}</span>
        </p>
        
        <label className="block font-label text-xs font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
          Why are you interested?
        </label>
        <textarea 
          className="w-full h-40 p-3 rounded border border-outline-variant bg-transparent text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all resize-none font-body text-sm"
          placeholder="Describe your relevant experience and why you'd be a good fit..."
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
        />
        
        <div className="flex gap-4 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md font-bold text-sm border border-outline-variant text-on-surface hover:bg-surface-variant/30 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-primary text-white py-2.5 rounded-md font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};