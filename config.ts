
import * as defaultConstants from './constants';

const SETTINGS_KEY = 'appSettings';

// Carrega as configurações, mesclando os padrões com o que estiver salvo
const loadConfig = () => {
    let storedConfig = {};
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            storedConfig = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
        localStorage.removeItem(SETTINGS_KEY);
    }
    
    const config = { ...defaultConstants, ...storedConfig };

    // Garante que o array de palavras-chave seja sempre um array
    if (typeof config.PALAVRAS_CHAVE_COMUM === 'string') {
        config.PALAVRAS_CHAVE_COMUM = (config.PALAVRAS_CHAVE_COMUM as string).split(',').map(s => s.trim());
    }

    // Recalcula valores derivados
    const PULSEIRAUTIL = (Number(config.TAMPULSEIRA) - Number(config.FECHO)) * Number(config.DOTS);
    
    return { ...config, PULSEIRAUTIL };
};

export let settings = loadConfig();

export const saveSettings = (newSettings: Partial<typeof settings>) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    settings = loadConfig();
};
