
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChildRecord } from '../types';
import * as dataService from '../services/dataService';
import * as zplService from '../services/zplService';
import { settings } from '../config';
import RegistrationForm from './RegistrationForm';
import RecordsTable from './RecordsTable';
import HeaderStats from './HeaderStats';
import AdminModals from './AdminModals';
import SettingsModal from './SettingsModal';
import ZplDebugModal from './ZplDebugModal';
import { GearIcon, LogoutIcon } from './Icons';

interface DashboardProps {
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [records, setRecords] = useState<ChildRecord[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdminModals, setShowAdminModals] = useState<'reset' | 'backup' | null>(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [zplDebugInfo, setZplDebugInfo] = useState<{ zpl: string, ids: number[] } | null>(null);
    
    useEffect(() => {
        setRecords(dataService.fetchAllRecords());
        setIsLoading(false);
    }, []);
    
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 7000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const executePrint = useCallback(async (zpl: string, ids: number[]) => {
        const result = await zplService.printZpl(zpl);
        if (result.success) {
            const updatedRecords = dataService.updateRecordStatus(ids);
            setRecords(updatedRecords);
            setMessage({ type: 'success', text: 'Comando de impressão enviado com sucesso.' });
        } else {
            setMessage({ type: 'error', text: `Falha na impressão: ${result.message}` });
        }
    }, []);
    
    const handleAddRecords = useCallback((newRecords: Omit<ChildRecord, 'id' | 'cod_resp' | 'statusImpresso'>[]) => {
        if (newRecords.length === 0) {
            setMessage({ type: 'error', text: 'Nenhum dado válido para cadastrar.' });
            return;
        }
        try {
            const updatedRecords = dataService.addMultipleRecords(newRecords);
            setRecords(updatedRecords);
            setMessage({ type: 'success', text: `${newRecords.length} cadastro(s) realizado(s)!` });
            return true;
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Erro ao salvar cadastros.' });
            return false;
        }
    }, []);

    const handleDeleteRecord = useCallback((id: number, name: string) => {
        if (window.confirm(`Tem certeza que deseja apagar o cadastro de '${name}' (ID: ${id})?\nEsta ação não pode ser desfeita. Um backup do arquivo atual será criado.`)) {
            const updatedRecords = dataService.deleteRecordById(id);
            setRecords(updatedRecords);
            setMessage({ type: 'success', text: `Cadastro de '${name}' (ID: ${id}) apagado.` });
        }
    }, []);
    
    const handlePrint = useCallback(async (selectedIds: number[]) => {
        if (selectedIds.length === 0) {
            setMessage({ type: 'error', text: 'Nenhuma criança selecionada para impressão!' });
            return;
        }

        const selectedRecords = records.filter(r => selectedIds.includes(r.id));
        const guardiansToPrint = new Map<number, { nomeResponsavel: string, criancas: string[] }>();
        
        let allZplCommands = '';

        for (const record of selectedRecords) {
            allZplCommands += zplService.generateChildZPL(record.nomeCrianca, record.nomeResponsavel, record.idade, record.id, record.telefone) + '\n\n';
            
            if (record.cod_resp) {
                if (!guardiansToPrint.has(record.cod_resp)) {
                    guardiansToPrint.set(record.cod_resp, { nomeResponsavel: record.nomeResponsavel, criancas: [] });
                }
                guardiansToPrint.get(record.cod_resp)!.criancas.push(record.nomeCrianca);
            }
        }

        for (const [cod_resp, data] of guardiansToPrint.entries()) {
            allZplCommands += zplService.generateGuardianZPL(data.nomeResponsavel, data.criancas, cod_resp) + '\n\n';
        }
        
        allZplCommands = allZplCommands.trim();
        if (!allZplCommands) return;

        if (settings.ZPL_DEBUG_MODE) {
            setZplDebugInfo({ zpl: allZplCommands, ids: selectedIds });
        } else {
            executePrint(allZplCommands, selectedIds);
        }
    }, [records, executePrint]);

    const handleResetData = useCallback((password: string): boolean => {
        if (password === settings.SENHA_ADMIN_REAL) {
            const updatedRecords = dataService.resetAllData();
            setRecords(updatedRecords);
            setMessage({ type: 'success', text: 'Arquivo de cadastros zerado com sucesso! Backup criado.' });
            setShowAdminModals(null);
            return true;
        }
        setMessage({type: 'error', text: 'Senha administrativa incorreta.'});
        return false;
    }, []);

    const handleRestoreBackup = useCallback((password: string, backupKey: string): boolean => {
        if (password === settings.SENHA_ADMIN_REAL) {
            const success = dataService.restoreBackup(backupKey);
            if (success) {
                setRecords(dataService.fetchAllRecords());
                setMessage({ type: 'success', text: `Backup '${backupKey}' restaurado com sucesso!` });
                setShowAdminModals(null);
                return true;
            } else {
                setMessage({ type: 'error', text: 'Falha ao restaurar backup.' });
                return false;
            }
        }
        setMessage({type: 'error', text: 'Senha administrativa incorreta.'});
        return false;
    }, []);

    const stats = useMemo(() => {
        const total = records.length;
        const total3Anos = records.filter(r => r.idade.trim() === '3').length;
        const totalComumMatch = records.filter(r => {
            const comumLower = r.comum.toLowerCase();
            return settings.PALAVRAS_CHAVE_COMUM.some(keyword => comumLower.includes(keyword));
        }).length;
        return { total, total3Anos, totalComumMatch };
    }, [records]);

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="container mx-auto mt-5 mb-5 p-5 bg-white rounded-xl shadow-2xl max-w-7xl">
            <header className="text-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                    <img src="https://placehold.co/60x60/007bff/white?text=Kids" alt="Ícone de Criança" className="align-middle rounded-full mr-4 border-2 border-blue-500" />
                    Cadastro de Crianças
                </h1>
            </header>

            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="alert">
                    <span className="font-medium">{message.type === 'success' ? 'Sucesso!' : 'Erro!'}</span> {message.text}
                    <button type="button" className="float-right font-bold" onClick={() => setMessage(null)}>&times;</button>
                </div>
            )}

            <RegistrationForm onAddRecords={handleAddRecords} />
            <hr className="my-4"/>
            
            <div className="flex justify-between items-center mb-4">
                <HeaderStats stats={stats} />
                <div className="flex items-center space-x-2">
                    <div className="relative inline-block text-left group">
                        <button type="button" className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                            <GearIcon />
                            <span className="ml-2">Ações Admin</span>
                        </button>
                        <div className="origin-top-right absolute right-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block z-10">
                            <div className="py-1" role="none">
                                <button onClick={() => setShowSettingsModal(true)} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Definir Constantes</button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button onClick={() => setShowAdminModals('reset')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Zerar Arquivo</button>
                                <button onClick={() => setShowAdminModals('backup')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Recuperar Backup</button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button onClick={onLogout} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center">
                                    <LogoutIcon /> <span className="ml-2">Sair do Sistema</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RecordsTable 
                records={records} 
                onPrint={handlePrint}
                onDelete={handleDeleteRecord}
            />

            <AdminModals 
                show={showAdminModals} 
                onClose={() => setShowAdminModals(null)}
                onReset={handleResetData}
                onRestore={handleRestoreBackup}
            />

            <SettingsModal 
                show={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
            
            <ZplDebugModal
                show={zplDebugInfo !== null}
                onClose={() => setZplDebugInfo(null)}
                zpl={zplDebugInfo?.zpl ?? ''}
                onSend={(editedZpl) => {
                    if (zplDebugInfo) {
                        executePrint(editedZpl, zplDebugInfo.ids);
                        setZplDebugInfo(null);
                    }
                }}
            />
        </div>
    );
};

export default Dashboard;
