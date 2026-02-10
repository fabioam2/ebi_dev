
import { createContext, useContext } from 'react';
import { SettingsType } from './config';

interface InstanceContextType {
    instanceId: string | null;
    settings: SettingsType | null;
}

// O valor padrão não será usado, pois o Provider sempre fornecerá um valor real.
export const InstanceContext = createContext<InstanceContextType>({
    instanceId: null,
    settings: null,
});

export const useInstance = (): { instanceId: string; settings: SettingsType } => {
    const context = useContext(InstanceContext);
    if (!context || !context.instanceId || !context.settings) {
        throw new Error('useInstance deve ser usado dentro de um InstanceProvider');
    }
    return { instanceId: context.instanceId, settings: context.settings };
};
