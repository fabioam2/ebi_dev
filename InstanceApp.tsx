
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { loadConfig } from './config';
import { InstanceContext } from './InstanceContext';
import { SettingsType } from './config';

interface InstanceAppProps {
    instanceId: string;
}

const InstanceApp: React.FC<InstanceAppProps> = ({ instanceId }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [settings, setSettings] = useState<SettingsType | null>(null);

    useEffect(() => {
        const loadedSettings = loadConfig(instanceId);
        setSettings(loadedSettings);
        
        const loggedInStatus = sessionStorage.getItem(`isLoggedIn_${instanceId}`);
        if (loggedInStatus === 'true') {
            setIsLoggedIn(true);
        }
    }, [instanceId]);

    const handleLogin = (password: string): boolean => {
        if (settings && password === settings.SENHA_LOGIN) {
            sessionStorage.setItem(`isLoggedIn_${instanceId}`, 'true');
            setIsLoggedIn(true);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        sessionStorage.removeItem(`isLoggedIn_${instanceId}`);
        setIsLoggedIn(false);
    };

    if (!settings) {
        return <div>Carregando instância...</div>;
    }

    return (
        <InstanceContext.Provider value={{ instanceId, settings }}>
            {!isLoggedIn ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <Dashboard onLogout={handleLogout} />
            )}
        </InstanceContext.Provider>
    );
};

export default InstanceApp;
