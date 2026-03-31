import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const RegisterForm: React.FC = () => {
  const [userRole, setUserRole] = useState<'Student' | 'Faculty'>('Student');
  
  // Shared
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Contact
  const [email, setEmail] = useState('');
  
  // Student specific
  const [major, setMajor] = useState('');
  const [college, setCollege] = useState('');

  // Faculty specific
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !username || !password || !email) {
      toast.error('Please fill in all core fields');
      return;
    }

    const isStudent = userRole === 'Student';
    const endpoint = isStudent ? '/api/signup/student' : '/api/signup/faculty';
    
    let body: any = {};
    if (isStudent) {
      body = { firstName, lastName, login: username, password, ucfEmail: email, major, college };
    } else {
      body = { firstName, lastName, login: username, password, email: email, role, department };
    }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      toast.success('Check your email to verify your account.');
      navigate('/');
      
    } catch (err) {
      toast.error('Connection error. Please try again.');
    }
  };

  return (
    <section className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-24 bg-surface">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <span className="font-label text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2 block">Institutional Access</span>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Create your account</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">First Name</label>
              <input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="Julian" type="text" />
            </div>
            <div className="space-y-1">
              <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Last Name</label>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="Thorne" type="text" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="jthorne84" type="text" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">University Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="email@university.edu" type="email" />
            </div>
            <div className="space-y-1">
              <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Account Type</label>
              <select value={userRole} onChange={e=>setUserRole(e.target.value as any)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all appearance-none cursor-pointer">
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>
            </div>
          </div>

          {userRole === 'Student' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Major</label>
                <input value={major} onChange={e=>setMajor(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="Computer Science" type="text" />
              </div>
              <div className="space-y-1">
                <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">College</label>
                <input value={college} onChange={e=>setCollege(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="Engineering" type="text" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Academic Role</label>
                <input value={role} onChange={e=>setRole(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="Professor" type="text" />
              </div>
              <div className="space-y-1">
                <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Department</label>
                <input value={department} onChange={e=>setDepartment(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="Computer Science" type="text" />
              </div>
            </div>
          )}

          <div className="space-y-1 relative">
            <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-surface-container-low border-none focus:ring-0 rounded-sm text-on-surface py-4 px-4 placeholder:opacity-30 focus:border-b-2 focus:border-primary-container transition-all" placeholder="••••••••" type="password" />
            <span className="material-symbols-outlined absolute right-4 top-10 text-on-surface-variant opacity-50 cursor-pointer text-sm">visibility</span>
          </div>

          <div className="pt-4">
            <button className="w-full gold-gradient-btn py-4 text-on-primary font-headline font-bold rounded-lg shadow-xl shadow-primary/10 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2" type="submit">
              <span>Register Credentials</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-outline-variant/15 flex flex-col items-center gap-4">
          <p className="text-sm text-on-surface-variant">Already have a research profile?</p>
          <Link to="/" className="text-primary font-bold text-sm underline decoration-primary-container underline-offset-4 hover:text-on-surface transition-colors">
            Sign in to your dashboard
          </Link>
        </div>
      </div>
    </section>
  );
};
