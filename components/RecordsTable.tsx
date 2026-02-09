
import React, { useState, useMemo, useEffect } from 'react';
import { ChildRecord } from '../types';
import { CheckCircleFillIcon, PrinterIcon, TrashIcon } from './Icons';

interface RecordsTableProps {
    records: ChildRecord[];
    onPrint: (selectedIds: number[]) => void;
    onDelete: (id: number, name:string) => void;
}

const RecordsTable: React.FC<RecordsTableProps> = ({ records, onPrint, onDelete }) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filterPortaria, setFilterPortaria] = useState<string>('');

    const portariaOptions = useMemo(() => {
        const portarias = new Set(records.map(r => r.portaria).filter(Boolean));
        return Array.from(portarias).sort();
    }, [records]);
    
    useEffect(() => {
      // when filter changes, unselect hidden rows
      const visibleRecordIds = new Set(filteredRecords.map(r => r.id));
      setSelectedIds(prev => prev.filter(id => visibleRecordIds.has(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterPortaria, records]);

    const filteredRecords = useMemo(() => {
        if (!filterPortaria) {
            return records;
        }
        return records.filter(r => r.portaria === filterPortaria);
    }, [records, filterPortaria]);
    
    const sortedRecords = useMemo(() => {
      return [...filteredRecords].sort((a,b) => b.id - a.id);
    }, [filteredRecords]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(sortedRecords.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePrintList = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Lista de Crianças</title>');
            printWindow.document.write('<style>body { font-family: Arial, sans-serif; font-size: 10pt; margin: 20px;} table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ccc; padding: 4px; text-align: left; } th { background-color: #f0f0f0; }</style>');
            printWindow.document.write('</head><body><h2>Lista de Crianças Cadastradas</h2>');
            const tableHtml = document.getElementById('records-table-printable')?.outerHTML;
            if(tableHtml) printWindow.document.write(tableHtml);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="mt-4">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-3">
                <button onClick={() => onPrint(selectedIds)} className="btn bg-green-500 hover:bg-green-600 text-white" disabled={selectedIds.length === 0}>
                    <PrinterIcon /> <span className="ml-2">Imprimir ({selectedIds.length})</span>
                </button>
                <div className="flex items-center space-x-2">
                    <label htmlFor="filtroPortaria" className="text-sm font-medium text-gray-700">Filtrar Portaria:</label>
                    <select
                        id="filtroPortaria"
                        value={filterPortaria}
                        onChange={e => setFilterPortaria(e.target.value)}
                        className="form-select block w-48 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">Todas</option>
                        {portariaOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button onClick={() => setFilterPortaria('')} className="btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800">Limpar</button>
                    <button onClick={handlePrintList} className="btn-sm bg-blue-500 hover:bg-blue-600 text-white">
                        <PrinterIcon /> <span className="ml-2">Imprimir Lista</span>
                    </button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-blue-500 text-white sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-center"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === sortedRecords.length} /></th>
                            <th className="px-4 py-2 text-center">Impresso</th>
                            <th className="px-4 py-2 text-center">Portaria</th>
                            <th className="px-4 py-2 text-center">Código</th>
                            <th className="px-4 py-2 text-center">Cód. Lote</th>
                            <th className="px-4 py-2 text-left">Nome da Criança</th>
                            <th className="px-4 py-2 text-left">Nome do Responsável</th>
                            <th className="px-4 py-2 text-center">Telefone</th>
                            <th className="px-4 py-2 text-center">Idade</th>
                            <th className="px-4 py-2 text-left">Comum</th>
                            <th className="px-4 py-2 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedRecords.length > 0 ? sortedRecords.map(record => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-center"><input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => handleSelectRow(record.id)} /></td>
                                <td className="px-4 py-2 text-center">{record.statusImpresso === 'S' && <CheckCircleFillIcon />}</td>
                                <td className="px-4 py-2 text-center font-semibold">{record.portaria}</td>
                                <td className="px-4 py-2 text-center">{record.id}</td>
                                <td className="px-4 py-2 text-center">{record.cod_resp}</td>
                                <td className="px-4 py-2">{record.nomeCrianca}</td>
                                <td className="px-4 py-2">{record.nomeResponsavel}</td>
                                <td className="px-4 py-2 text-center">{record.telefone}</td>
                                <td className="px-4 py-2 text-center">{record.idade}</td>
                                <td className="px-4 py-2">{record.comum}</td>
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => onDelete(record.id, record.nomeCrianca)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><TrashIcon /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={11} className="text-center py-10 text-gray-500">Nenhuma criança cadastrada ainda ou correspondente ao filtro.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Hidden table for printing */}
            <div className="hidden">
                 <table id="records-table-printable" className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-center">Impresso</th>
                            <th className="px-4 py-2 text-center">Portaria</th>
                            <th className="px-4 py-2 text-center">Código</th>
                            <th className="px-4 py-2 text-center">Cód. Lote</th>
                            <th className="px-4 py-2 text-left">Nome da Criança</th>
                            <th className="px-4 py-2 text-left">Nome do Responsável</th>
                            <th className="px-4 py-2 text-center">Telefone</th>
                            <th className="px-4 py-2 text-center">Idade</th>
                            <th className="px-4 py-2 text-left">Comum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRecords.map(record => (
                            <tr key={record.id}>
                                <td className="px-4 py-2 text-center">{record.statusImpresso === 'S' ? 'Sim' : 'Não'}</td>
                                <td className="px-4 py-2 text-center">{record.portaria}</td>
                                <td className="px-4 py-2 text-center">{record.id}</td>
                                <td className="px-4 py-2 text-center">{record.cod_resp}</td>
                                <td className="px-4 py-2">{record.nomeCrianca}</td>
                                <td className="px-4 py-2">{record.nomeResponsavel}</td>
                                <td className="px-4 py-2 text-center">{record.telefone}</td>
                                <td className="px-4 py-2 text-center">{record.idade}</td>
                                <td className="px-4 py-2">{record.comum}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <style>{`
                .btn-sm {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.3rem 0.8rem;
                    border-radius: 0.375rem;
                    font-weight: 500;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .btn {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
            `}</style>
        </div>
    );
};

export default RecordsTable;
