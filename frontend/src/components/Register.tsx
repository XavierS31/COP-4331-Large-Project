import React, { useState } from 'react';

function Register() {
    const [isOpen, setIsOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const doRegister = async (event: any): Promise<void> => {
        event.preventDefault();

        const obj = { firstName, lastName, login, password };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch('http://localhost:5000/api/signup',
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

            const res = JSON.parse(await response.text());

            if (res.error && res.error.length > 0) {
                setMessage(res.error);
            } else {
                setMessage('Registration successful! You can now log in.');
                setTimeout(() => setIsOpen(false), 2000); // Close popup after success
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    };

    const toggleModal = () => setIsOpen(!isOpen);

    return (
        <div>
            <button type="button" onClick={toggleModal}>Sign Up</button>

            {isOpen && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000, color: 'black'
                }}>
                    <span id="inner-title">CREATE AN ACCOUNT</span><br />
                    <input type="text" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} /><br />
                    <input type="text" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} /><br />
                    <input type="text" placeholder="Username" onChange={(e) => setLogin(e.target.value)} /><br />
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br />
                    <input type="submit" value="Register" onClick={doRegister} />
                    <button type="button" onClick={toggleModal}>Cancel</button>
                    <span id="registerResult">{message}</span>
                </div>
            )}
        </div>
    );
}

export default Register;