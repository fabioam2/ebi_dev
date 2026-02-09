
import { ChildRecord } from '../types';
import { MAX_BACKUPS } from '../constants';

const DATA_KEY = 'childRecords';

const getRecords = (): ChildRecord[] => {
    try {
        const recordsJson = localStorage.getItem(DATA_KEY);
        if (!recordsJson) return [];
        const records = JSON.parse(recordsJson) as ChildRecord[];
        return Array.isArray(records) ? records : [];
    } catch (error) {
        console.error("Failed to parse records from localStorage", error);
        return [];
    }
};

const saveRecords = (records: ChildRecord[]): void => {
    localStorage.setItem(DATA_KEY, JSON.stringify(records));
};

const createBackup = (): void => {
    const currentData = localStorage.getItem(DATA_KEY);
    if (!currentData || JSON.parse(currentData).length === 0) return;

    for (let i = MAX_BACKUPS; i >= 1; i--) {
        const currentBackupKey = `backup_${i}`;
        const nextBackupKey = `backup_${i + 1}`;
        const backupData = localStorage.getItem(currentBackupKey);

        if (backupData) {
            if (i === MAX_BACKUPS) {
                localStorage.removeItem(currentBackupKey);
            } else {
                localStorage.setItem(nextBackupKey, backupData);
            }
        }
    }
    localStorage.setItem('backup_1', currentData);
};

export const listBackups = (): { key: string; date: Date | null }[] => {
    const backups = [];
    for (let i = 1; i <= MAX_BACKUPS; i++) {
        const key = `backup_${i}`;
        const data = localStorage.getItem(key);
        if (data) {
             try {
                // Attempt to get a date from the first record for sorting/display
                const records = JSON.parse(data) as ChildRecord[];
                // This assumes a date field might exist, but since it doesn't, we can't reliably get a date.
                // For simplicity, we'll just use the backup number for identity.
                // In a real app, we'd store metadata with the backup.
                backups.push({ key, date: new Date() }); // Placeholder date
            } catch (e) {
                 backups.push({ key, date: null });
            }
        }
    }
    return backups;
};


export const restoreBackup = (backupKey: string): boolean => {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) return false;
    createBackup(); // Backup current state before overwriting
    localStorage.setItem(DATA_KEY, backupData);
    return true;
};

export const getBackupContent = (backupKey: string): string => {
    const backupData = localStorage.getItem(backupKey);
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


export const fetchAllRecords = (): ChildRecord[] => {
    return getRecords();
};

export const addMultipleRecords = (newRecords: Omit<ChildRecord, 'id' | 'cod_resp' | 'statusImpresso'>[]): ChildRecord[] => {
    createBackup();
    const allRecords = getRecords();
    let nextId = allRecords.length > 0 ? Math.max(...allRecords.map(r => r.id)) + 1 : 1;
    let nextCodResp = allRecords.length > 0 ? Math.max(...allRecords.map(r => r.cod_resp)) + 1 : 1;
    
    const recordsToAdd = newRecords.map(record => ({
        ...record,
        id: nextId++,
        cod_resp: nextCodResp,
        statusImpresso: 'N' as 'N',
    }));

    const updatedRecords = [...allRecords, ...recordsToAdd];
    saveRecords(updatedRecords);
    return updatedRecords;
};

export const deleteRecordById = (id: number): ChildRecord[] => {
    createBackup();
    let allRecords = getRecords();
    const updatedRecords = allRecords.filter(record => record.id !== id);
    saveRecords(updatedRecords);
    return updatedRecords;
};

export const updateRecordStatus = (ids: number[]): ChildRecord[] => {
    createBackup();
    let allRecords = getRecords();
    const updatedRecords = allRecords.map(record => {
        if (ids.includes(record.id)) {
            return { ...record, statusImpresso: 'S' as 'S' };
        }
        return record;
    });
    saveRecords(updatedRecords);
    return updatedRecords;
};

export const resetAllData = (): ChildRecord[] => {
    createBackup();
    saveRecords([]);
    // Per PHP logic, clear older backups but keep .bkp.1
    for (let i = 2; i <= MAX_BACKUPS; i++) {
        localStorage.removeItem(`backup_${i}`);
    }
    return [];
};
