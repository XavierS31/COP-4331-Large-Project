import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface ApplicationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  postingId: string;
  postingTitle: string;
}

const app_name = 'cop4331-11-domain.xyz';
function buildPath(route: string): string {
  return (import.meta.env.MODE !== 'development') 
    ? `http://${app_name}:5000/${route}` 
    : `http://localhost:5000/${route}`;
}

export const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({ isOpen, onClose, postingId, postingTitle }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, refreshToken } = useAuth();

  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildPath(`api/applications/posting/${postingId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.token) refreshToken(data.token);
      setApplications(data.applications || []);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchApps();
    }
  }, [isOpen, postingId]);

  // NEW: Function to handle Accept/Reject
  const handleStatusUpdate = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(buildPath(`api/applications/${applicationId}/status`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          status: newStatus,
          nextSteps: newStatus === 'accepted' ? 'Please check your email for further instructions.' : '' 
        })
      });

      const data = await response.json();
      if (data.token) refreshToken(data.token);

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Application ${newStatus}`);
        // Refresh local state to reflect the change
        setApplications(prev => prev.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-3xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant/20">
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Applications for: {postingTitle}</h2>
            <p className="text-xs text-secondary">{applications.length} total applicants</p>
          </div>
          <button onClick={onClose} className="material-symbols-outlined hover:text-primary transition-colors text-on-surface-variant">close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-container-lowest">
          {loading ? (
            <p className="text-center py-10 text-on-surface-variant">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-center py-10 text-secondary">No applications submitted yet.</p>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="p-5 border border-outline-variant/30 rounded-lg bg-white dark:bg-[#1a1c1b] shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-on-surface">
                      {app.student ? `${app.student.firstName} ${app.student.lastName}` : 'Anonymous Student'}
                    </h3>
                    <p className="text-sm text-primary font-medium">{app.student?.ucfEmail || 'No email provided'}</p>
                    <p className="text-[10px] uppercase font-bold text-secondary mt-1">
                      Major: {app.student?.major || 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-[10px] text-on-surface-variant opacity-60">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-surface-variant/20 p-4 rounded text-sm italic border-l-2 border-primary text-on-surface-variant mb-4">
                  "{app.message || app.statement || 'No statement provided.'}"
                </div>

                {/* NEW: Action Buttons for Faculty */}
                {app.status === 'pending' && (
                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => handleStatusUpdate(app._id, 'rejected')}
                      className="px-4 py-2 text-xs font-bold border border-error text-error rounded hover:bg-error/10 transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(app._id, 'accepted')}
                      className="px-4 py-2 text-xs font-bold bg-primary text-white rounded hover:brightness-110 transition-colors"
                    >
                      Accept Student
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};