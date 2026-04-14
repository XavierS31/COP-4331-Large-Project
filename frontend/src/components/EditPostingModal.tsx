import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
export interface Posting {
  _id: string;
  title: string;
  createdAt: string;
  department: string;
  applicantCount?: number;
  newApplicants?: number;
}
// Helper to handle API paths [Matches your PostingItem logic]
const app_name = 'cop4331-11-domain.xyz';
function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://' + app_name + ':5000/' + route;
  } else {
    return 'http://localhost:5000/' + route;
  }
}

interface EditPostingModalProps {
  isOpen: boolean;
  posting: Posting | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const EditPostingModal: React.FC<EditPostingModalProps> = ({ isOpen, posting, onClose, onUpdated }) => {
  const { token, refreshToken } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '', // If your Posting interface includes this
    requiredMajor: '',
    capacity: 0
  });

  // Pre-fill form when posting changes
  useEffect(() => {
    if (posting) {
      setFormData({
        title: posting.title || '',
        department: posting.department || '',
        description: (posting as any).description || '',
        requiredMajor: (posting as any).requiredMajor || '',
        capacity: (posting as any).capacity || 0
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
        toast.success('Posting updated successfully');
        onUpdated();
        onClose();
      }
    } catch (err) {
      toast.error('Failed to update posting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-surface-container-low w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/10">
          <h2 className="text-2xl font-headline font-bold text-on-surface">Edit Posting</h2>
          <p className="text-sm text-on-surface-variant">Update the details for your research opportunity.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Title</label>
            <input
              type="text"
              required
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Department</label>
              <input
                type="text"
                required
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Capacity</label>
              <input
                type="number"
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Required Major</label>
            <input
              type="text"
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.requiredMajor}
              onChange={(e) => setFormData({...formData, requiredMajor: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Description</label>
            <textarea
              rows={4}
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-primary text-on-primary rounded-full text-sm font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};