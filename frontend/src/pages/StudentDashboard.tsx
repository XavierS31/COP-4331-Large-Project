import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TopNavBar } from '../components/TopNavBar';
import { StudentSidebar } from '../components/StudentSidebar';
import { ResearchCard, type ResearchPosting } from '../components/ResearchCard';
import { useAuth } from '../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const [postings, setPostings] = useState<ResearchPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ major: '', department: '' });
  
  const { token, refreshToken } = useAuth();

  useEffect(() => {
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (filters.major) params.append('major', filters.major);
        if (filters.department) params.append('department', filters.department);
        
        const response = await fetch(`http://localhost:5000/api/search?${params.toString()}`, {
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
        } else {
          setPostings(data.postings || []);
        }
      } catch (err) {
        toast.error('Failed to load research postings');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, token, refreshToken]);

  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
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
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="font-headline text-5xl font-bold text-on-surface mb-2">Academic Inquiry</h1>
              <p className="font-body text-secondary max-w-xl italic">
                Curated research opportunities across the biological, social, and physical sciences.
              </p>
            </div>
            <div className="flex gap-4">
              <span className="font-label text-xs uppercase tracking-tighter text-on-surface-variant self-end mb-1">
                Showing {postings.length} {postings.length === 1 ? 'Opportunity' : 'Opportunities'}
              </span>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-pulse opacity-50">
               <div className="xl:col-span-2 h-96 bg-surface-container-low rounded"></div>
               <div className="bg-surface-container-low rounded h-96"></div>
            </div>
          ) : postings.length === 0 ? (
            <div className="w-full py-20 text-center border border-dashed border-outline-variant rounded-lg">
              <p className="text-on-surface-variant font-bold text-lg">No research opportunities found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {postings.map((post, index) => (
                <ResearchCard 
                  key={post._id} 
                  posting={post} 
                  variant={index === 0 ? 'featured' : 'standard'} 
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
