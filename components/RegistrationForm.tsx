
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { settings } from '../config';
import { ChildRecord } from '../types';
import { CopyIcon, EraserIcon, UserPlusIcon } from './Icons';

type FormData = Omit<ChildRecord, 'id' | 'cod_resp' | 'statusImpresso' | 'portaria'>;

interface RegistrationFormProps {
    onAddRecords: (records: FormData[]) => boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onAddRecords }) => {
    const NUM_LINHAS_FORMULARIO_CADASTRO = Number(settings.NUM_LINHAS_FORMULARIO_CADASTRO);
    const initialFormState: FormData[] = Array(NUM_LINHAS_FORMULARIO_CADASTRO).fill({
        nomeCrianca: '',
        nomeResponsavel: '',
        idade: '',
        telefone: '',
        comum: ''
    });

    const [formData, setFormData] = useState<FormData[]>(initialFormState);
    const [portaria, setPortaria] = useState('');
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedPortaria = localStorage.getItem('ultimaPortariaCadastro');
        if (storedPortaria) {
            setPortaria(storedPortaria);
        }
        firstInputRef.current?.focus();
    }, []);

    const handlePortariaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().slice(0, 1);
        setPortaria(value);
        if (value.match(/^[A-Z]$/)) {
            localStorage.setItem('ultimaPortariaCadastro', value);
        } else if (value === '') {
            localStorage.removeItem('ultimaPortariaCadastro');
        }
    };
    
    const handleChange = (index: number, field: keyof FormData, value: string) => {
        const newFormData = [...formData];
        newFormData[index] = { ...newFormData[index], [field]: value };
        setFormData(newFormData);
    };

    const handleCopyToNextRows = (targetLine: number) => {
        const source = formData[0];
        const newFormData = [...formData];
        newFormData[targetLine] = {
            ...newFormData[targetLine],
            nomeResponsavel: source.nomeResponsavel,
            telefone: source.telefone,
            comum: source.comum
        };
        setFormData(newFormData);
    };

    const handleClearLine = (index: number) => {
        const newFormData = [...formData];
        newFormData[index] = { nomeCrianca: '', nomeResponsavel: '', idade: '', telefone: '', comum: '' };
        setFormData(newFormData);
    };

    const handleClearForm = () => {
        setFormData(initialFormState);
        firstInputRef.current?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const recordsToSubmit = formData.filter(
            r => r.nomeCrianca || r.nomeResponsavel || r.idade || r.telefone || r.comum
        ).map(r => ({...r, portaria}));

        // Basic validation: if a line is started, all fields must be filled
        for(const record of recordsToSubmit) {
            if (!record.nomeCrianca || !record.nomeResponsavel || !record.idade || !record.telefone || !record.comum || !portaria) {
                alert('Por favor, preencha todos os campos das linhas iniciadas, incluindo a Portaria.');
                return;
            }
        }
        
        if (onAddRecords(recordsToSubmit)) {
            handleClearForm();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const formElements = Array.from(e.currentTarget.form!.elements) as HTMLInputElement[];
            const currentIndex = formElements.indexOf(e.currentTarget);
            const nextElement = formElements[currentIndex + 1];
            if (nextElement) {
                nextElement.focus();
            } else {
                 (formElements.find(el => el.name === 'cadastrar') as HTMLButtonElement)?.focus();
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-3 p-4 border rounded-lg bg-slate-50 shadow-sm">
             <div className="grid grid-cols-[23fr_23fr_9fr_18fr_18fr_9fr] gap-x-2 mb-2 font-bold text-sm text-gray-600 px-1 hidden md:grid">
                <div>Nome Criança</div>
                <div>Responsável</div>
                <div className="text-center">Idade</div>
                <div>Telefone</div>
                <div>Comum</div>
                <div className="text-center">Ação</div>
            </div>

            {formData.map((row, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[23fr_23fr_9fr_18fr_18fr_9fr] gap-x-2 items-center mb-1.5">
                    <input type="text" value={row.nomeCrianca} onChange={(e) => handleChange(index, 'nomeCrianca', e.target.value)} onKeyDown={handleKeyDown} ref={index === 0 ? firstInputRef : null} placeholder="Nome da Criança" className="form-input" />
                    <input type="text" value={row.nomeResponsavel} onChange={(e) => handleChange(index, 'nomeResponsavel', e.target.value)} onKeyDown={handleKeyDown} placeholder="Nome do Responsável" className="form-input" />
                    <input type="number" value={row.idade} onChange={(e) => handleChange(index, 'idade', e.target.value)} onKeyDown={handleKeyDown} placeholder="Idade" className="form-input text-center" />
                    <input type="text" value={row.telefone} onChange={(e) => handleChange(index, 'telefone', e.target.value)} onKeyDown={handleKeyDown} placeholder="(00) 00000-0000" className="form-input" />
                    <input type="text" value={row.comum} onChange={(e) => handleChange(index, 'comum', e.target.value)} onKeyDown={handleKeyDown} placeholder="Comum" className="form-input" />
                    <div className="flex items-center justify-center space-x-2 mt-2 md:mt-0">
                        {index > 0 && (
                            <>
                                <button type="button" onClick={() => handleCopyToNextRows(index)} className="btn-icon bg-blue-500 hover:bg-blue-600" title="Copiar Responsável, Telefone e Comum da Linha 1">
                                    <CopyIcon />
                                </button>
                                <button type="button" onClick={() => handleClearLine(index)} className="btn-icon bg-yellow-500 hover:bg-yellow-600" title="Limpar esta linha">
                                    <EraserIcon />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}

            <div className="flex justify-between items-end mt-4">
                <div className="flex items-center bg-cyan-500 text-white rounded-md px-3 py-1.5 shadow">
                    <label htmlFor="portaria_cadastro" className="font-medium mr-2">Portaria:</label>
                    <input type="text" id="portaria_cadastro" value={portaria} onChange={handlePortariaChange} onKeyDown={handleKeyDown} placeholder="A" maxLength={1} className="w-10 bg-transparent text-white font-bold text-center placeholder-cyan-200 focus:outline-none" />
                </div>

                <div className="flex items-center space-x-2">
                    <button type="button" onClick={handleClearForm} className="btn bg-yellow-500 hover:bg-yellow-600 text-white">
                        <EraserIcon />
                        <span className="ml-2">Limpar</span>
                    </button>
                    <button type="submit" name="cadastrar" className="btn bg-blue-500 hover:bg-blue-600 text-white">
                        <UserPlusIcon />
                        <span className="ml-2">Cadastrar</span>
                    </button>
                </div>
            </div>
            <style>{`
                .form-input { 
                    width: 100%; 
                    padding: 0.3rem 0.6rem; 
                    font-size: 0.9rem;
                    border-radius: 0.375rem; 
                    border: 1px solid #d1d5db; 
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
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
                .btn-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    border-radius: 0.375rem;
                    color: white;
                    transition: all 0.2s;
                }
            `}</style>
        </form>
    );
};

export default RegistrationForm;
