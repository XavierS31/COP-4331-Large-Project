import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Step 1: Define the domain for your production environment
const app_name = 'cop4331-11-domain.xyz';

// Step 2: Add the buildPath function to toggle between localhost and the droplet
function buildPath(route: string): string {
  // Checks if the application is running in Vite's development mode
  if (import.meta.env.MODE !== 'development') {
    return 'http://' + app_name + ':5000/' + route; // Production path
  } else {
    return 'http://localhost:5000/' + route; // Development path
  }
}

interface CreatePostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePostingModal: React.FC<CreatePostingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredMajor, setRequiredMajor] = useState('Computer Science');
  const [capacity, setCapacity] = useState(2);
  const { token, user, refreshToken } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error('Title and description are required');
      return;
    }
    
    try {
      // Step 3: Use buildPath for the API endpoint
      const response = await fetch(buildPath('api/postings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          requiredMajor,
          capacity: Number(capacity),
          department: user?.department || 'Interdisciplinary'
        })
      });
      const data = await response.json();
      
      if (data.token) {
        refreshToken(data.token);
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Posting published');
      setTitle('');
      setDescription('');
      setRequiredMajor('Computer Science');
      setCapacity(2);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to publish posting');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-xl rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-headline font-extrabold tracking-tight text-on-surface">Create New Posting</h2>
            <p className="text-on-surface-variant text-sm mt-1 font-body">Establish a new research mandate for university students.</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined select-none text-2xl">close</span>
          </button>
        </div>
        <div className="p-8 pt-4 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Project Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-surface-container-low border-none focus:ring-0 focus:border-b-2 focus:border-primary-container p-4 text-on-surface font-medium placeholder:opacity-40 transition-all rounded-sm"
              placeholder="e.g. Advanced Synthetic Biology"
              type="text"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-surface-container-low border-none focus:ring-0 focus:border-b-2 focus:border-primary-container p-4 text-on-surface font-medium placeholder:opacity-40 transition-all rounded-sm resize-none"
              placeholder="Outline research objectives and responsibilities..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Required Major</label>
              <select
                value={requiredMajor}
                onChange={e => setRequiredMajor(e.target.value)}
                className="w-full bg-surface-container-low border-none focus:ring-0 focus:border-b-2 focus:border-primary-container p-4 text-on-surface font-medium transition-all rounded-sm appearance-none cursor-pointer"
              >
                <option>Computer Science</option>
                <option>Physics</option>
                <option>Neuroscience</option>
                <option>Biochemistry</option>
                <option>Economics</option>
                <option>Sociology</option>
                <option>Engineering</option>
                <option>Mathematics</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Capacity</label>
              <input
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full bg-surface-container-low border-none focus:ring-0 focus:border-b-2 focus:border-primary-container p-4 text-on-surface font-medium transition-all rounded-sm"
                type="number"
                min="1"
              />
            </div>
          </div>
        </div>
        <div className="p-8 pt-0 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold bg-surface-container-highest text-primary rounded hover:bg-surface-container-high transition-colors"
          >
            Discard Draft
          </button>
          <button
            onClick={handleSubmit}
            className="flex-none px-12 py-4 text-sm font-bold bg-gradient-to-br from-primary to-primary-container text-on-primary rounded shadow-lg transition-transform active:scale-95"
          >
            Publish Posting
          </button>
        </div>
      </div>
    </div>
  );
};