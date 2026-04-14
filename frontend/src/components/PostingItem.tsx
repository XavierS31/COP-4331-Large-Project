import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useAuth } from '../context/AuthContext';
import { EditPostingModal } from './EditPostingModal';
import { ApplicationReviewModal } from './ApplicationReviewModal'; // New Import

// Step 1: Define your application name/domain 
const app_name = 'cop4331-11-domain.xyz';

// Step 2: Add the buildPath function to handle environment switching
function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://' + app_name + ':5000/' + route;
  } else {
    return 'http://localhost:5000/' + route;
  }
}

export interface Posting {
  _id: string;
  title: string;
  createdAt: string;
  department: string;
  applicantCount?: number;
  newApplicants?: number;
}

interface PostingItemProps {
  posting: Posting;
  onDeleted: () => void;
}

export const PostingItem: React.FC<PostingItemProps> = ({ posting, onDeleted }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAppModalOpen, setAppModalOpen] = useState(false); // State for Review Modal
  
  const { token, refreshToken } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch(buildPath(`api/postings/${posting._id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.token) {
        refreshToken(data.token);
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success('Posting deleted successfully');
      onDeleted();
    } catch (err) {
      toast.error('Failed to delete posting');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className="bg-surface-container-lowest p-6 rounded-lg flex items-center justify-between group hover:shadow-[0_20px_40px_rgba(26,28,27,0.04)] transition-all border border-transparent hover:border-outline-variant/15">
        <div className="flex gap-6 items-center">
          <div className="w-14 h-14 bg-surface-container-high rounded-md flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl select-none">layers</span>
          </div>
          <div>
            <h3 className="text-lg font-headline font-bold text-on-surface tracking-tight">{posting.title}</h3>
            <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-xs select-none">calendar_today</span>
              Posted on {formatDate(posting.createdAt)}
              <span className="mx-2 opacity-30">•</span>
              <span className="material-symbols-outlined text-xs select-none">school</span>
              {posting.department}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {/* APPLICANT COUNT BUTTON: Opens the Review Modal */}
          <button 
            onClick={() => setAppModalOpen(true)}
            className="text-right hover:bg-primary/5 p-3 rounded-xl transition-all group/btn border border-transparent hover:border-primary/10 active:scale-95"
          >
            <div className="flex items-center gap-2 justify-end mb-1">
              {posting.newApplicants && posting.newApplicants > 0 ? (
                <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter">
                  {posting.newApplicants} New
                </span>
              ) : null}
              <span className="text-lg font-headline font-black text-on-surface">{posting.applicantCount || 0}</span>
              <span className="material-symbols-outlined text-primary text-sm opacity-0 group-hover/btn:opacity-100 transition-opacity">visibility</span>
            </div>
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant opacity-60">View Applicants</p>
          </button>

          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined select-none">more_vert</span>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-40 bg-surface shadow-2xl rounded-md border border-outline-variant/20 z-10 overflow-hidden py-1">
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    setEditModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-primary/10 transition-colors flex items-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined text-sm select-none">edit</span>
                  Edit Posting
                </button>
                
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2 font-bold"
                >
                  <span className="material-symbols-outlined text-sm select-none">delete</span>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Delete Confirmation */}
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Posting"
        message={`Are you sure you want to delete "${posting.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* 2. Edit Posting Details */}
      <EditPostingModal 
        isOpen={isEditModalOpen}
        posting={posting}
        onClose={() => setEditModalOpen(false)}
        onUpdated={onDeleted} 
      />

      {/* 3. Review Applications List */}
      <ApplicationReviewModal 
        isOpen={isAppModalOpen}
        onClose={() => setAppModalOpen(false)}
        postingId={posting._id}
        postingTitle={posting.title}
      />
    </>
  );
};