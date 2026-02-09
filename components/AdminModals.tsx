
import React, { useState, useEffect } from 'react';
import * as dataService from '../services/dataService';

interface AdminModalsProps {
    show: 'reset' | 'backup' | null;
    onClose: () => void;
    onReset: (password: string) => boolean;
    onRestore: (password: string, backupKey: string) => boolean;
}

const Modal: React.FC<{ title: string, show: boolean, onClose: () => void, children: React.ReactNode }> = ({ title, show, onClose, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center pb-3">
                    <p className="text-2xl font-bold">{title}</p>
                    <button onClick={onClose} className="cursor-pointer z-50 text-2xl">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

const AdminModals: React.FC<AdminModalsProps> = ({ show, onClose, onReset, onRestore }) => {
    const [password, setPassword] = useState('');
    const [selectedBackup, setSelectedBackup] = useState('');
    const [backupPreview, setBackupPreview] = useState('');
    const backups = dataService.listBackups();

    useEffect(() => {
        if (show) {
            setPassword('');
            setSelectedBackup(backups.length > 0 ? backups[0].key : '');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    useEffect(() => {
        if (selectedBackup) {
            setBackupPreview(dataService.getBackupContent(selectedBackup));
        } else {
            setBackupPreview('');
        }
    }, [selectedBackup]);

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        onReset(password);
    };

    const handleRestore = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBackup) {
            onRestore(password, selectedBackup);
        }
    };

    return (
        <>
            <Modal title="Confirmar Zerar Arquivo" show={show === 'reset'} onClose={onClose}>
                <form onSubmit={handleReset}>
                    <p className="text-sm text-gray-600 mb-4"><strong>ATENÇÃO:</strong> Esta ação apagará todos os cadastros. O estado atual será salvo como backup (.bkp.1).</p>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Senha Administrativa:</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn bg-gray-300 text-black">Cancelar</button>
                        <button type="submit" className="btn bg-red-500 text-white">Confirmar Zerar</button>
                    </div>
                </form>
            </Modal>
            
            <Modal title="Recuperar Backup" show={show === 'backup'} onClose={onClose}>
                <form onSubmit={handleRestore}>
                    <p className="text-sm text-gray-600 mb-4">Selecione o backup para restaurar. O estado atual será salvo como um novo backup antes da restauração.</p>
                    {backups.length > 0 ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Arquivo de Backup:</label>
                                <select value={selectedBackup} onChange={e => setSelectedBackup(e.target.value)} className="shadow border rounded w-full py-2 px-3">
                                    {backups.map(b => <option key={b.key} value={b.key}>{`${b.key} (.1 é o mais recente)`}</option>)}
                                </select>
                            </div>
                            {backupPreview && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Preview (últimas 3 linhas):</label>
                                    <pre className="text-xs bg-gray-100 p-2 rounded border max-h-24 overflow-y-auto">{backupPreview}</pre>
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Senha Administrativa:</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3" />
                            </div>
                        </>
                    ) : <p className="text-gray-500">Nenhum backup encontrado.</p>}

                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="btn bg-gray-300 text-black">Cancelar</button>
                        {backups.length > 0 && <button type="submit" className="btn bg-blue-500 text-white">Restaurar</button>}
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default AdminModals;
