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

  useEffect(() => {
    if (isOpen) {
      const fetchApps = async () => {
        setLoading(true);
        try {
          // FIXED URL: Matches your server.js route "/api/applications/posting/:id"
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
      fetchApps();
    }
  }, [isOpen, postingId]);

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
                    {/* DATA STRUCTURE FIX: Accessing app.student.firstName etc. */}
                    <h3 className="font-bold text-lg text-on-surface">
                      {app.student ? `${app.student.firstName} ${app.student.lastName}` : 'Anonymous Student'}
                    </h3>
                    <p className="text-sm text-primary font-medium">{app.student?.ucfEmail || 'No email provided'}</p>
                    <p className="text-[10px] uppercase font-bold text-secondary mt-1">
                      Major: {app.student?.major || 'N/A'}
                    </p>
                  </div>
                  <span className="text-[10px] text-on-surface-variant opacity-60">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>
                {/* FIELD FIX: Your server uses app.message or app.statement */}
                <div className="bg-surface-variant/20 p-4 rounded text-sm italic border-l-2 border-primary text-on-surface-variant">
                  "{app.message || app.statement || 'No statement provided.'}"
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};