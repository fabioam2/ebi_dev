
import React, { useState, FormEvent, useEffect } from 'react';

interface LoginScreenProps {
    onLogin: (password: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const logoutMsg = sessionStorage.getItem('logoutMessage');
        if (logoutMsg) {
            setSuccessMessage(logoutMsg);
            sessionStorage.removeItem('logoutMessage');
        }
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const success = onLogin(password);
        if (!success) {
            setError('Senha incorreta.');
            setPassword('');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-center mb-6">
                    <img src="https://placehold.co/40x40/007bff/white?text=Kids" alt="Ícone" className="rounded-full border-2 border-blue-500" />
                    <h2 className="ml-3 text-2xl font-bold text-gray-700">Acesso ao Sistema</h2>
                </div>
                
                {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{successMessage}</div>}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="senha_login" className="block text-gray-600 text-sm font-medium mb-2">Senha de Acesso:</label>
                        <input
                            type="password"
                            id="senha_login"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
