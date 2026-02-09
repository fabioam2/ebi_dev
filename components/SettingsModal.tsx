
import React, { useState, useEffect } from 'react';
import { settings, saveSettings } from '../config';

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onClose }) => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [currentSettings, setCurrentSettings] = useState(settings);
    const [activeTab, setActiveTab] = useState('Geral');

    useEffect(() => {
        if (show) {
            // Reset state when modal is opened
            setIsAuthenticated(false);
            setPassword('');
            setError('');
            setCurrentSettings(settings); // Load fresh settings
        }
    }, [show]);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === settings.SENHA_ADMIN_REAL) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Senha administrativa incorreta.');
            setPassword('');
        }
    };
    
    const handleChange = (key: string, value: string | number | string[] | boolean) => {
        setCurrentSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // @google/genai-fix: Cast settingsToSave to `any` to allow changing the type of `PALAVRAS_CHAVE_COMUM` for storage.
        const settingsToSave: any = { ...currentSettings };
        // Convert array to comma-separated string for storage
        if (Array.isArray(settingsToSave.PALAVRAS_CHAVE_COMUM)) {
            settingsToSave.PALAVRAS_CHAVE_COMUM = settingsToSave.PALAVRAS_CHAVE_COMUM.join(', ');
        }
        
        saveSettings(settingsToSave);
        alert('Configurações salvas com sucesso! A aplicação será recarregada para aplicar as alterações.');
        window.location.reload();
    };

    if (!show) return null;

    const renderTabs = () => {
        const tabs = ['Geral', 'Segurança', 'Impressora', 'Estatísticas'];
        return (
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
        );
    };

    const renderContent = () => {
        const calculatedPulseiraUtil = (Number(currentSettings.TAMPULSEIRA) - Number(currentSettings.FECHO)) * Number(currentSettings.DOTS);

        switch(activeTab) {
            case 'Geral':
                return (
                    <>
                        <InputField label="Nº Máximo de Backups" value={currentSettings.MAX_BACKUPS} onChange={val => handleChange('MAX_BACKUPS', val)} type="number" />
                        <InputField label="Linhas no Formulário de Cadastro" value={currentSettings.NUM_LINHAS_FORMULARIO_CADASTRO} onChange={val => handleChange('NUM_LINHAS_FORMULARIO_CADASTRO', val)} type="number" />
                    </>
                );
            case 'Segurança':
                return (
                    <>
                        <InputField label="Senha de Acesso" value={currentSettings.SENHA_LOGIN} onChange={val => handleChange('SENHA_LOGIN', val)} />
                        <InputField label="Senha de Admin Mestre" value={currentSettings.SENHA_ADMIN_REAL} onChange={val => handleChange('SENHA_ADMIN_REAL', val)} />
                    </>
                );
            case 'Impressora':
                 return (
                    <>
                        <InputField label="Tamanho da Pulseira (mm)" value={currentSettings.TAMPULSEIRA} onChange={val => handleChange('TAMPULSEIRA', val)} type="number" />
                        <InputField label="Pontos por mm (DPI)" value={currentSettings.DOTS} onChange={val => handleChange('DOTS', val)} type="number" />
                        <InputField label="Tamanho do Fecho (mm)" value={currentSettings.FECHO} onChange={val => handleChange('FECHO', val)} type="number" />
                        <InputField label="Área Útil da Pulseira (calculado)" value={calculatedPulseiraUtil} readOnly />
                        <div className="mt-4 pt-3 border-t">
                            <ToggleField 
                                label="Ativar Modo de Depuração ZPL" 
                                checked={!!currentSettings.ZPL_DEBUG_MODE} 
                                onChange={val => handleChange('ZPL_DEBUG_MODE', val)} 
                                description="Exibe o código ZPL e o payload em uma janela para análise antes de enviar para a impressora."
                            />
                        </div>
                    </>
                );
            case 'Estatísticas':
                return (
                    <>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Palavras-chave para Comum</label>
                        <textarea
                            value={Array.isArray(currentSettings.PALAVRAS_CHAVE_COMUM) ? currentSettings.PALAVRAS_CHAVE_COMUM.join(', ') : currentSettings.PALAVRAS_CHAVE_COMUM}
                            onChange={e => handleChange('PALAVRAS_CHAVE_COMUM', e.target.value.split(',').map(s => s.trim()))}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows={3}
                            placeholder="bonfim, bofim, bom fim..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Valores separados por vírgula.</p>
                    </>
                );
            default: return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center pb-3">
                    <p className="text-2xl font-bold">{isAuthenticated ? "Configurações do Sistema" : "Acesso Restrito"}</p>
                    <button onClick={onClose} className="cursor-pointer z-50 text-2xl">&times;</button>
                </div>
                
                {!isAuthenticated ? (
                     <form onSubmit={handleAuth}>
                        <p className="text-sm text-gray-600 mb-4">É necessário inserir a senha de administrador mestre para alterar as configurações.</p>
                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Senha de Admin Mestre:</label>
                            <input type="password" value={password} autoFocus onChange={e => setPassword(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={onClose} className="btn bg-gray-300 text-black">Cancelar</button>
                            <button type="submit" className="btn bg-blue-500 text-white">Entrar</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        {renderTabs()}
                        <div className="space-y-4 py-2">
                           {renderContent()}
                        </div>
                        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                            <button type="button" onClick={onClose} className="btn bg-gray-300 text-black">Cancelar</button>
                            <button type="button" onClick={handleSave} className="btn bg-green-500 text-white">Salvar e Recarregar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// FIX: Corrected the default function for the `onChange` prop to accept a value. This resolves multiple type errors
// by ensuring the function signature inferred by TypeScript matches its usage throughout the component.
const InputField = ({ label, value, onChange = (_value: any) => {}, type = 'text', readOnly = false }) => (
    <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            readOnly={readOnly}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${readOnly ? 'bg-gray-100' : ''}`}
        />
    </div>
);

const ToggleField = ({ label, checked, onChange, description }) => (
    <div className="flex items-start">
        <div className="flex items-center h-5">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
        </div>
        <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">{label}</label>
            <p className="text-gray-500">{description}</p>
        </div>
    </div>
);


export default SettingsModal;