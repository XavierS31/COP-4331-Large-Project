import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Step 1: Export this specific name so PostingItem can find it
export interface FullPosting {
  _id: string;
  title: string;
  description: string;
  requiredMajor: string;
  department: string;
  capacity: number;
}

interface EditPostingModalProps {
  isOpen: boolean;
  posting: FullPosting | null;
  onClose: () => void;
  onUpdated: () => void;
}

const app_name = 'cop4331-11-domain.xyz';
function buildPath(route: string): string {
  return (import.meta.env.MODE !== 'development') 
    ? `http://${app_name}:5000/${route}` 
    : `http://localhost:5000/${route}`;
}

export const EditPostingModal: React.FC<EditPostingModalProps> = ({ isOpen, posting, onClose, onUpdated }) => {
  const { token, refreshToken } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requiredMajor: '',
    capacity: 0
  });

  // Load the data into the form when the modal opens
  useEffect(() => {
    if (posting && isOpen) {
      setFormData({
        title: posting.title || '',
        department: posting.department || '',
        description: posting.description || '',
        requiredMajor: posting.requiredMajor || '',
        capacity: posting.capacity || 0
      });
    }
  }, [posting, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posting) return;

    setLoading(true);
    try {
      const response = await fetch(buildPath(`api/postings/${posting._id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.token) refreshToken(data.token);

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Update successful');
        onUpdated();
        onClose();
      }
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1c1b] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-outline-variant/20">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Research Posting</h2>
          <button onClick={onClose} className="material-symbols-outlined">close</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            className="w-full p-3 rounded bg-surface-variant/20 border border-outline-variant/30"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              className="p-3 rounded bg-surface-variant/20 border border-outline-variant/30"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
            <input
              type="number"
              className="p-3 rounded bg-surface-variant/20 border border-outline-variant/30"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
            />
          </div>
          <input
            className="w-full p-3 rounded bg-surface-variant/20 border border-outline-variant/30"
            placeholder="Required Major"
            value={formData.requiredMajor}
            onChange={(e) => setFormData({...formData, requiredMajor: e.target.value})}
          />
          <textarea
            rows={4}
            className="w-full p-3 rounded bg-surface-variant/20 border border-outline-variant/30 resize-none"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-outline-variant rounded font-bold">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded font-bold">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};