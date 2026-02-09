
// [GERAL]
export const MAX_BACKUPS = 5;
export const NUM_LINHAS_FORMULARIO_CADASTRO = 5;

// [SEGURANCA]
export const SENHA_ADMIN_REAL = 'mestre123';
export const SENHA_LOGIN = 'admin';

// [IMPRESSORA_ZPL]
export const TAMPULSEIRA = 270; // em mm
export const DOTS = 8; // dots por mm (para 203dpi)
export const FECHO = 35; // em mm
export const FECHOINI = 0; // não usado no código de referência, mas mantido por consistência

// Constante Calculada
export const PULSEIRAUTIL = (TAMPULSEIRA - FECHO) * DOTS;
