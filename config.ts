
import * as defaultConstants from './constants';

const SETTINGS_KEY = 'appSettings';

// Define um tipo para o objeto de configurações para uso em toda a aplicação.
export type SettingsType = typeof defaultConstants & { 
    PULSEIRAUTIL: number;
    ZPL_DEBUG_MODE: boolean;
};

// Carrega as configurações para uma instância específica.
export const loadConfig = (instanceId: string): SettingsType => {
    let storedConfig: any = {};
    const instanceSettingsKey = `${instanceId}_${SETTINGS_KEY}`;
    try {
        const stored = localStorage.getItem(instanceSettingsKey);
        if (stored) {
            storedConfig = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
        localStorage.removeItem(instanceSettingsKey);
    }
    
    const config = { 
        ...defaultConstants, 
        ZPL_DEBUG_MODE: false,
        ...storedConfig 
    };

    if (typeof config.PALAVRAS_CHAVE_COMUM === 'string') {
        config.PALAVRAS_CHAVE_COMUM = (config.PALAVRAS_CHAVE_COMUM as string)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean); // Filtra strings vazias
    }

    const PULSEIRAUTIL = (Number(config.TAMPULSEIRA) - Number(config.FECHO)) * Number(config.DOTS);
    
    return { ...config, PULSEIRAUTIL };
};

// Salva as configurações para uma instância específica.
export const saveSettings = (instanceId: string, newSettings: Partial<SettingsType>) => {
    const instanceSettingsKey = `${instanceId}_${SETTINGS_KEY}`;
    localStorage.setItem(instanceSettingsKey, JSON.stringify(newSettings));
};