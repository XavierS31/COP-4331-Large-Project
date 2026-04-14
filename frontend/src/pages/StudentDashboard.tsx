import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TopNavBar } from '../components/TopNavBar';
import { StudentSidebar } from '../components/StudentSidebar';
import { ResearchCard, type ResearchPosting } from '../components/ResearchCard';
import { ApplyModal } from '../components/ApplyModal';
import { ApplicationCard } from '../components/ApplicationCard'; // Ensure you created this file
import { useAuth } from '../context/AuthContext';

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

export const StudentDashboard: React.FC = () => {
  // --- STATE ---
  const [postings, setPostings] = useState<ResearchPosting[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ major: '', department: '' });
  const [view, setView] = useState<'search' | 'applications'>('search');
  const [selectedPosting, setSelectedPosting] = useState<ResearchPosting | null>(null);
  
  const { token, refreshToken } = useAuth();

  // --- API CALLS ---

  // Fetch Research Postings (Search)
  const fetchSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.major) params.append('major', filters.major);
      if (filters.department) params.append('department', filters.department);
      
      const response = await fetch(buildPath(`api/search?${params.toString()}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.token) refreshToken(data.token);

      if (data.error) {
        toast.error(data.error);
      } else {
        setPostings(data.postings || []);
      }
    } catch (err) {
      toast.error('Failed to load research postings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Logged-in Student's Applications
  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildPath('api/applications/mine'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.token) refreshToken(data.token);

      if (data.error) {
        toast.error(data.error);
      } else {
        setMyApplications(data.applications || []);
      }
    } catch (err) {
      toast.error('Failed to load your applications');
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECTS ---

  // Trigger search on query/filter change (only if in search view)
  useEffect(() => {
    if (view === 'search') {
      const debounceTimer = setTimeout(() => {
        fetchSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, filters, token, view]);

  // --- HANDLERS ---
  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const toggleView = () => {
    const nextView = view === 'search' ? 'applications' : 'search';
    setView(nextView);
    if (nextView === 'applications') {
      fetchMyApplications();
    } else {
      fetchSearch();
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <TopNavBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery} 
      />
      
      <div className="flex pt-16">
        <StudentSidebar onFilterChange={handleFilterChange} />
        
        <main className="flex-1 ml-64 p-12 bg-surface">
          <header className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="font-headline text-5xl font-bold text-on-surface mb-2">
                {view === 'search' ? 'Academic Inquiry' : 'My Applications'}
              </h1>
              <p className="font-body text-secondary max-w-xl italic">
                {view === 'search' 
                  ? 'Curated research opportunities across the biological, social, and physical sciences.'
                  : 'Review the status of your research inquiries and statements.'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <button 
                onClick={toggleView}
                className="bg-primary text-white px-6 py-2.5 rounded-full font-label text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {view === 'search' ? 'View My Applications' : 'Back to Opportunities'}
              </button>
              
              <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">
                {view === 'search' 
                  ? `Showing ${postings.length} results`
                  : `Showing ${myApplications.length} applications`}
              </span>
            </div>
          </header>

          {loading ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-pulse opacity-50">
               <div className="xl:col-span-2 h-96 bg-surface-container-low rounded"></div>
               <div className="bg-surface-container-low rounded h-96"></div>
            </div>
          ) : view === 'search' ? (
            /* --- SEARCH VIEW --- */
            <>
              {postings.length === 0 ? (
                <div className="w-full py-20 text-center border border-dashed border-outline-variant rounded-lg">
                  <p className="text-on-surface-variant font-bold text-lg">No research opportunities found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {postings.map((post, index) => (
                    <ResearchCard 
                      key={post._id} 
                      posting={post} 
                      variant={index === 0 ? 'featured' : 'standard'} 
                      onApply={(p) => setSelectedPosting(p)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* --- APPLICATIONS VIEW --- */
            <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
              {myApplications.length === 0 ? (
                <div className="w-full py-20 text-center border border-dashed border-outline-variant rounded-lg">
                  <p className="text-on-surface-variant font-bold text-lg">You haven't submitted any applications yet.</p>
                  <button onClick={toggleView} className="text-primary font-bold hover:underline mt-2">Browse opportunities</button>
                </div>
              ) : (
                myApplications.map((app) => (
                  <ApplicationCard key={app._id} application={app} />
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {selectedPosting && (
        <ApplyModal 
          isOpen={!!selectedPosting}
          onClose={() => setSelectedPosting(null)}
          postingTitle={selectedPosting.title}
          postingId={selectedPosting._id}
        />
      )}
    </div>
  );
};