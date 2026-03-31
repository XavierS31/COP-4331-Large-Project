import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/Login.tsx';
import Register from '../components/Register.tsx'; // Import the new component

const LoginPage = () => {
    return (
        <div>
            <PageTitle />
            <Login />
            <Register /> 
        </div>
    );
};

export default LoginPage;