
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { SENHA_LOGIN } from './constants';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loggedInStatus = sessionStorage.getItem('isLoggedIn');
        if (loggedInStatus === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = (password: string): boolean => {
        if (password === SENHA_LOGIN) {
            sessionStorage.setItem('isLoggedIn', 'true');
            setIsLoggedIn(true);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return <Dashboard onLogout={handleLogout} />;
};

export default App;
