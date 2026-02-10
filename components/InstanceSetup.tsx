
import React, { useState } from 'react';
import { InstanceInfo } from '../types';
import * as defaultConstants from '../constants';

interface InstanceSetupProps {
    instances: InstanceInfo[];
}

const InstanceSetup: React.FC<InstanceSetupProps> = ({ instances }) => {
    const [isMasterAuthenticated, setIsMasterAuthenticated] = useState(false);
    const [masterPassword, setMasterPassword] = useState('');
    const [masterError, setMasterError] = useState('');

    const [instanceName, setInstanceName] = useState('');
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [commonKeywords, setCommonKeywords] = useState('');
    const [error, setError] = useState('');

    const handleMasterLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (masterPassword === defaultConstants.SENHA_ADMIN_REAL) {
            setIsMasterAuthenticated(true);
        } else {
            setMasterError('Senha Mestre incorreta.');
            setMasterPassword('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!instanceName || !loginPassword || !adminPassword) {
            setError('Nome da instância, senha de login e senha de admin são obrigatórios.');
            return;
        }

        const newInstanceId = `inst-${Date.now()}`;
        const newInstance: InstanceInfo = {
            id: newInstanceId,
            name: instanceName,
            createdAt: new Date().toISOString(),
        };

        const userDetails = { name: userName, phone: userPhone, email: userEmail };
        const initialSettings = {
            SENHA_LOGIN: loginPassword,
            SENHA_ADMIN_REAL: adminPassword,
            PALAVRAS_CHAVE_COMUM: commonKeywords,
        };

        const currentInstances = instances || [];
        localStorage.setItem('appInstances', JSON.stringify([...currentInstances, newInstance]));
        localStorage.setItem(`${newInstanceId}_userDetails`, JSON.stringify(userDetails));
        localStorage.setItem(`${newInstanceId}_appSettings`, JSON.stringify(initialSettings));

        window.location.assign(`/#/${newInstanceId}`);
    };

    if (!isMasterAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">Acesso à Configuração</h2>
                    {masterError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{masterError}</div>}
                    <form onSubmit={handleMasterLogin}>
                        <div className="mb-6">
                            <label htmlFor="master_password" className="block text-gray-600 text-sm font-medium mb-2">Senha Mestre:</label>
                            <input
                                type="password"
                                id="master_password"
                                value={masterPassword}
                                onChange={(e) => setMasterPassword(e.target.value)}
                                required
                                autoFocus
                                className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300">
                            Liberar Acesso
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Gestão de Pulseiras</h1>
                <p className="text-gray-600 mb-6">Crie ou acesse uma instância para gerenciar os cadastros de um evento.</p>
                
                {instances.length > 0 && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-3">Acessar Instância Existente</h2>
                        <div className="flex flex-wrap gap-2">
                           {instances.map(inst => (
                               <a key={inst.id} href={`/#/${inst.id}`} className="btn bg-blue-500 hover:bg-blue-600 text-white">
                                   {inst.name}
                               </a>
                           ))}
                        </div>
                    </div>
                )}
                
                <h2 className="text-lg font-semibold mb-4 border-t pt-6">Criar Nova Instância</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Nome da Instância/Evento" value={instanceName} onChange={setInstanceName} required placeholder="Ex: EBI 2024 Sede" />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField label="Senha de Login" value={loginPassword} onChange={setLoginPassword} type="password" required />
                        <InputField label="Senha de Admin" value={adminPassword} onChange={setAdminPassword} type="password" required />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Palavras-chave da Comum (separadas por vírgula)</label>
                        <textarea 
                            value={commonKeywords} 
                            onChange={e => setCommonKeywords(e.target.value)} 
                            className="form-input" 
                            rows={2}
                            placeholder={`Ex: ${defaultConstants.PALAVRAS_CHAVE_COMUM.join(', ')}`}
                        />
                    </div>

                    <details className="p-3 bg-gray-50 rounded-lg border cursor-pointer">
                        <summary className="font-semibold text-gray-700">Informações de Contato (Opcional)</summary>
                        <div className="mt-4 space-y-4">
                             <div className="grid md:grid-cols-2 gap-4">
                                <InputField label="Seu Nome" value={userName} onChange={setUserName} placeholder="Nome do responsável pela instância" />
                                <InputField label="Seu Telefone" value={userPhone} onChange={setUserPhone} />
                             </div>
                            <InputField label="Seu Email" value={userEmail} onChange={setUserEmail} type="email" />
                        </div>
                    </details>
                    
                    <button type="submit" className="w-full btn bg-green-500 hover:bg-green-600 text-white text-lg">
                        Criar e Acessar Instância
                    </button>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, type = 'text', required = false, placeholder = '' }) => (
    <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            placeholder={placeholder}
            className="form-input"
        />
        <style>{`.form-input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #d1d5db; }`}</style>
    </div>
);

export default InstanceSetup;