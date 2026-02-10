
import React from 'react';
import InstanceSetup from './components/InstanceSetup';
import InstanceApp from './InstanceApp';
import { InstanceInfo } from './types';

const App: React.FC = () => {
    const path = window.location.pathname;
    const instanceId = path.substring(1);

    const getInstances = (): InstanceInfo[] => {
        const stored = localStorage.getItem('appInstances');
        return stored ? JSON.parse(stored) : [];
    };

    if (path === '/') {
        return <InstanceSetup instances={getInstances()} />;
    }

    const instanceExists = getInstances().some(inst => inst.id === instanceId);
    
    if (instanceExists) {
        return <InstanceApp instanceId={instanceId} />;
    } else {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
                 <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
                     <h1 className="text-2xl font-bold text-red-600 mb-4">Instância não encontrada</h1>
                     <p className="text-gray-600 mb-6">A instância com o ID '{instanceId}' não existe. Verifique a URL ou crie uma nova instância.</p>
                     <a href="/" className="btn bg-blue-500 hover:bg-blue-600 text-white">
                         Voltar para a página inicial
                     </a>
                </div>
            </div>
        );
    }
};

export default App;
