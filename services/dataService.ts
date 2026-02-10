
import { ChildRecord } from '../types';
import { loadConfig } from '../config';

const DATA_KEY_BASE = 'childRecords';

const getRecords = (instanceId: string): ChildRecord[] => {
    try {
        const recordsJson = localStorage.getItem(`${instanceId}_${DATA_KEY_BASE}`);
        if (!recordsJson) return [];
        const records = JSON.parse(recordsJson) as ChildRecord[];
        return Array.isArray(records) ? records : [];
    } catch (error) {
        console.error("Failed to parse records from localStorage", error);
        return [];
    }
};

const saveRecords = (instanceId: string, records: ChildRecord[]): void => {
    localStorage.setItem(`${instanceId}_${DATA_KEY_BASE}`, JSON.stringify(records));
};

const createBackup = (instanceId: string): void => {
    const settings = loadConfig(instanceId);
    const dataKey = `${instanceId}_${DATA_KEY_BASE}`;
    const currentData = localStorage.getItem(dataKey);
    if (!currentData || JSON.parse(currentData).length === 0) return;
    
    const MAX_BACKUPS = Number(settings.MAX_BACKUPS);

    for (let i = MAX_BACKUPS; i >= 1; i--) {
        const currentBackupKey = `${instanceId}_backup_${i}`;
        const nextBackupKey = `${instanceId}_backup_${i + 1}`;
        const backupData = localStorage.getItem(currentBackupKey);

        if (backupData) {
            if (i === MAX_BACKUPS) {
                localStorage.removeItem(currentBackupKey);
            } else {
                localStorage.setItem(nextBackupKey, backupData);
            }
        }
    }
    localStorage.setItem(`${instanceId}_backup_1`, currentData);
};

export const listBackups = (instanceId: string): { key: string; date: Date | null }[] => {
    const settings = loadConfig(instanceId);
    const backups = [];
    const MAX_BACKUPS = Number(settings.MAX_BACKUPS);
    for (let i = 1; i <= MAX_BACKUPS; i++) {
        const key = `backup_${i}`;
        const fullKey = `${instanceId}_${key}`;
        const data = localStorage.getItem(fullKey);
        if (data) {
             try {
                backups.push({ key, date: new Date() }); // Placeholder
            } catch (e) {
                 backups.push({ key, date: null });
            }
        }
    }
    return backups;
};


export const restoreBackup = (instanceId: string, backupKey: string): boolean => {
    const fullBackupKey = `${instanceId}_${backupKey}`;
    const dataKey = `${instanceId}_${DATA_KEY_BASE}`;
    const backupData = localStorage.getItem(fullBackupKey);
    if (!backupData) return false;
    createBackup(instanceId); // Backup current state before overwriting
    localStorage.setItem(dataKey, backupData);
    return true;
};

export const getBackupContent = (instanceId: string, backupKey: string): string => {
    const fullBackupKey = `${instanceId}_${backupKey}`;
    const backupData = localStorage.getItem(fullBackupKey);
    if (!backupData) return "Backup não encontrado.";
    try {
        const records = JSON.parse(backupData) as ChildRecord[];
        return records.slice(-3).map(r => 
            `${r.id}|${r.nomeCrianca}|${r.nomeResponsavel}|${r.telefone}|${r.idade}|${r.comum}|${r.statusImpresso}|${r.portaria}|${r.cod_resp}`
        ).join('\n');
    } catch {
        return "Erro ao ler o conteúdo do backup.";
    }
};


export const fetchAllRecords = (instanceId: string): ChildRecord[] => {
    return getRecords(instanceId);
};

export const addMultipleRecords = (instanceId: string, newRecords: Omit<ChildRecord, 'id' | 'cod_resp' | 'statusImpresso'>[]): ChildRecord[] => {
    createBackup(instanceId);
    const allRecords = getRecords(instanceId);
    let nextId = allRecords.length > 0 ? Math.max(...allRecords.map(r => r.id)) + 1 : 1;
    let nextCodResp = allRecords.length > 0 ? Math.max(...allRecords.map(r => r.cod_resp)) + 1 : 1;
    
    const recordsToAdd = newRecords.map(record => ({
        ...record,
        id: nextId++,
        cod_resp: nextCodResp,
        statusImpresso: 'N' as 'N',
    }));

    const updatedRecords = [...allRecords, ...recordsToAdd];
    saveRecords(instanceId, updatedRecords);
    return updatedRecords;
};

export const deleteRecordById = (instanceId: string, id: number): ChildRecord[] => {
    createBackup(instanceId);
    let allRecords = getRecords(instanceId);
    const updatedRecords = allRecords.filter(record => record.id !== id);
    saveRecords(instanceId, updatedRecords);
    return updatedRecords;
};

export const updateRecordStatus = (instanceId: string, ids: number[]): ChildRecord[] => {
    createBackup(instanceId);
    let allRecords = getRecords(instanceId);
    const updatedRecords = allRecords.map(record => {
        if (ids.includes(record.id)) {
            return { ...record, statusImpresso: 'S' as 'S' };
        }
        return record;
    });
    saveRecords(instanceId, updatedRecords);
    return updatedRecords;
};

export const resetAllData = (instanceId: string): ChildRecord[] => {
    const settings = loadConfig(instanceId);
    createBackup(instanceId);
    saveRecords(instanceId, []);
    const MAX_BACKUPS = Number(settings.MAX_BACKUPS);
    for (let i = 2; i <= MAX_BACKUPS; i++) {
        localStorage.removeItem(`${instanceId}_backup_${i}`);
    }
    return [];
};
