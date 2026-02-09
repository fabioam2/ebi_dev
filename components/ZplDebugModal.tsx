
import React, { useState, useEffect } from 'react';
import { constructPayload } from '../services/zplService';

interface ZplDebugModalProps {
    show: boolean;
    onClose: () => void;
    zpl: string;
    onSend: (editedZpl: string) => void;
}

const ZplDebugModal: React.FC<ZplDebugModalProps> = ({ show, onClose, zpl, onSend }) => {
    const [editableZpl, setEditableZpl] = useState(zpl);
    const [payloadPreview, setPayloadPreview] = useState('');

    useEffect(() => {
        if (show) {
            setEditableZpl(zpl);
        }
    }, [show, zpl]);
    
    useEffect(() => {
        try {
            const payload = constructPayload(editableZpl);
            setPayloadPreview(JSON.stringify(payload, null, 2));
        } catch (e) {
            setPayloadPreview("Erro ao gerar preview do payload.");
        }
    }, [editableZpl]);

    if (!show) return null;

    const handleSend = () => {
        onSend(editableZpl);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center pb-3 border-b">
                    <p className="text-2xl font-bold">Depuração de Impressão ZPL</p>
                    <button onClick={onClose} className="cursor-pointer z-50 text-2xl">&times;</button>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh]">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Comando ZPL (Editável)</label>
                        <textarea
                            value={editableZpl}
                            onChange={e => setEditableZpl(e.target.value)}
                            className="font-mono text-xs shadow appearance-none border rounded w-full h-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Preview do Payload (Read-Only)</label>
                         <pre className="font-mono text-xs bg-gray-100 p-2 rounded border w-full h-full overflow-auto">
                            {payloadPreview}
                        </pre>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <button type="button" onClick={onClose} className="btn bg-gray-300 text-black">Cancelar</button>
                    <button type="button" onClick={handleSend} className="btn bg-green-500 text-white">Enviar Comando</button>
                </div>
            </div>
        </div>
    );
};

export default ZplDebugModal;
