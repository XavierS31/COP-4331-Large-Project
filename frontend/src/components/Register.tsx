import React, { useState } from 'react';

const app_name = 'cop4331-11-domain.xyz';

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://' + app_name + ':5000/' + route; // [cite: 18-19]
  } else {
    return 'http://localhost:5000/' + route; // [cite: 20-23]
  }
}

function Register() {
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState<'student' | 'faculty'>('student');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    
    // Faculty/Professor specific fields
    const [role, setRole] = useState('');
    const [department, setDepartment] = useState('');
    
    const [message, setMessage] = useState('');

    const doRegister = async (event: any): Promise<void> => {
        event.preventDefault();

        // Dynamically choose the endpoint based on the role
        const endpoint = userRole === 'student' ? 'api/signup/student' : 'api/signup/faculty';
        
        // Construct the object based on what your backend expects
        let obj: any = { firstName, lastName, login, password };
        
        if (userRole === 'faculty') {
            obj.email = email;
            obj.role = role; // e.g., "Professor" or "Associate Researcher"
            obj.department = department;
        } else {
            obj.ucfEmail = email;
            // Add major/college here if your student signup requires them
        }

        try {
            const response = await fetch(buildPath(endpoint), { 
                method: 'POST', 
                body: JSON.stringify(obj), 
                headers: { 'Content-Type': 'application/json' } 
            });

            const res = await response.json();

            if (res.error && res.error.length > 0) {
                setMessage(res.error);
            } else {
                setMessage('Registration successful! Please check your email for verification.');
                setTimeout(() => setIsOpen(false), 3000);
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    };

    return (
        <div>
            <button type="button" onClick={() => setIsOpen(!isOpen)}>Sign Up</button>

            {isOpen && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000, color: 'black'
                }}>
                    <span id="inner-title">CREATE AN ACCOUNT</span><br />
                    
                    <label>I am a: </label>
                    <select onChange={(e) => setUserRole(e.target.value as any)}>
                        <option value="student">Student</option>
                        <option value="faculty">Professor / Faculty</option>
                    </select><br />

                    <input type="text" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} /><br />
                    <input type="text" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} /><br />
                    <input type="text" placeholder="Username" onChange={(e) => setLogin(e.target.value)} /><br />
                    <input type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} /><br />
                    
                    {userRole === 'faculty' && (
                        <>
                            <input type="text" placeholder="Academic Role (e.g. Professor)" onChange={(e) => setRole(e.target.value)} /><br />
                            <input type="text" placeholder="Department" onChange={(e) => setDepartment(e.target.value)} /><br />
                        </>
                    )}

                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br />
                    
                    <input type="submit" value="Register" onClick={doRegister} />
                    <button type="button" onClick={() => setIsOpen(false)}>Cancel</button>
                    <span id="registerResult">{message}</span>
                </div>
            )}
        </div>
    );
}

export default Register;