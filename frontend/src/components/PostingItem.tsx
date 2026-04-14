import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ApplicationReviewModal } from './ApplicationReviewModal';
// Line 5: This should now work because FullPosting is exported in the file above
import { EditPostingModal, type FullPosting } from './EditPostingModal';

const app_name = 'cop4331-11-domain.xyz';
function buildPath(route: string): string {
  return (import.meta.env.MODE !== 'development') 
    ? `http://${app_name}:5000/${route}` 
    : `http://localhost:5000/${route}`;
}

export interface Posting {
  _id: string;
  title: string;
  createdAt: string;
  department: string;
  applicantCount?: number;
}

export const PostingItem: React.FC<{ posting: Posting; onDeleted: () => void }> = ({ posting, onDeleted }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAppModalOpen, setAppModalOpen] = useState(false);
  
  const { token, refreshToken } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch(buildPath(`api/postings/${posting._id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.token) refreshToken(data.token);
      toast.success('Deleted');
      onDeleted();
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <>
      <div className="bg-surface-container-lowest p-6 rounded-lg flex items-center justify-between shadow-sm">
        <div className="flex gap-4 items-center">
          <span className="material-symbols-outlined text-3xl text-primary">layers</span>
          <div>
            <h3 className="text-lg font-bold">{posting.title}</h3>
            <p className="text-xs text-secondary">{posting.department}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setAppModalOpen(true)} className="text-right p-2 hover:bg-primary/5 rounded">
            <span className="text-lg font-black">{posting.applicantCount || 0}</span>
            <p className="text-[10px] uppercase font-bold text-secondary">Applicants</p>
          </button>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2 hover:bg-surface-variant rounded-full">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-10 w-40 bg-white shadow-xl border rounded z-10 overflow-hidden">
                <button 
                  onClick={() => { setEditModalOpen(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">edit</span> Edit
                </button>
                <button 
                  onClick={() => { setDeleteModalOpen(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-error/10 text-error flex items-center gap-2 font-bold"
                >
                  <span className="material-symbols-outlined text-sm">delete</span> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal isOpen={isDeleteModalOpen} title="Delete Posting" message="Are you sure?" onConfirm={handleDelete} onCancel={() => setDeleteModalOpen(false)} />
      
      {/* Passing data with a cast to tell TypeScript it has the full fields */}
      <EditPostingModal 
        isOpen={isEditModalOpen} 
        posting={posting as unknown as FullPosting} 
        onClose={() => setEditModalOpen(false)} 
        onUpdated={onDeleted} 
      />

      <ApplicationReviewModal isOpen={isAppModalOpen} onClose={() => setAppModalOpen(false)} postingId={posting._id} postingTitle={posting.title} />
    </>
  );
};