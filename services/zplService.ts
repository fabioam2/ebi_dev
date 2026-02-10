
import { useInstance } from '../InstanceContext';

const ZEBRA_ENDPOINT = "http://127.0.0.1:9100/write";

const processNameForZPL = (fullName: string, maxLength = 0): string => {
    const trimmedName = fullName.trim();
    if (!trimmedName && maxLength > 0 && maxLength <= 1) return "";

    const words = trimmedName.split(' ');
    const numWords = words.length;
    let processedName = trimmedName;

    if (numWords > 3) {
        processedName = `${words[0]} ${words[1]} ${words[numWords - 1]}`;
    }

    if (maxLength > 0 && processedName.length > maxLength) {
        processedName = processedName.substring(0, maxLength);
    }
    return processedName;
};

const sanitizeZplField = (text: string | number): string => {
    return String(text).replace(/[\^~\\]/g, '');
};

export const generateChildZPL = (
    nomeCrianca: string,
    nomeResponsavel: string,
    idade: string,
    codigo: number,
    telefone: string
): string => {
    const { settings } = useInstance();
    const { TAMPULSEIRA, DOTS, PULSEIRAUTIL } = settings;
    const ini_pos = PULSEIRAUTIL - (70 * DOTS);

    const nomeCriancaProc = processNameForZPL(nomeCrianca, 22).toUpperCase();
    const nomeResponsavelProc = processNameForZPL(nomeResponsavel, 25).toUpperCase();

    const zpl = `
^XA
^CI28
^PW192
^LL${TAMPULSEIRA * DOTS}
^FO80,${ini_pos}^A0R,60,50^FD${sanitizeZplField(nomeCriancaProc)}^FS
^FO50,${ini_pos}^A0R,30,40^FDIdade: ${sanitizeZplField(idade)} anos      Cod.:${sanitizeZplField(codigo)}^FS
^FO10,${ini_pos}^A0R,30,35^FDRsp: ${sanitizeZplField(nomeResponsavelProc)}^FS
^FO140,1^A0R,30,35^FD|^FS
^FO140,${PULSEIRAUTIL - 35}^A0R,30,35^FD|^FS
^PQ1,0,1,Y
^XZ
`;
    return zpl.trim();
};

export const generateGuardianZPL = (
    nomeResponsavel: string,
    nomesCriancasDoGrupo: string[],
    codigo: number
): string => {
    const { settings } = useInstance();
    const { TAMPULSEIRA, DOTS, PULSEIRAUTIL } = settings;
    const ini_pos = PULSEIRAUTIL - (95 * DOTS);
    const id_pos = ini_pos + (55 * DOTS);
    const yPosCriancas = ini_pos;

    const nomeResponsavelProc = processNameForZPL(nomeResponsavel, 22).toUpperCase();
    const nomesCriancasProc = nomesCriancasDoGrupo.map(name =>
        processNameForZPL(name, 25).toUpperCase()
    );

    let zpl = `
^XA
^CI28
^PW192
^LL${TAMPULSEIRA * DOTS}
^FH
^FO70,${id_pos}^A0R,40,45^FDID:${sanitizeZplField(codigo)}^FS
^FO10,${id_pos}^A0R,20,25^FDRsp:${sanitizeZplField(nomeResponsavelProc)}^FS
`;

    const posicoesX = [70, 35, 105, 0, 140];
    for (let k = 0; k < 5; k++) {
        const nomeParaExibir = nomesCriancasProc[k] || "";
        zpl += `^FO${posicoesX[k]},${yPosCriancas}^A0R,30,35^FD${sanitizeZplField(nomeParaExibir)}^FS\n`;
    }

    zpl += `
^FO140,1^A0R,30,35^FD|^FS
^FO140,${PULSEIRAUTIL - 35}^A0R,30,35^FD|^FS
^PQ1,0,1,Y
^XZ
`;
    return zpl.trim();
};

export const constructPayload = (zpl: string) => {
    return {
        device: {
            name: "ZDesigner 105SL", // Placeholder, might need configuration
            uid: "ZDesigner 105SL",
            connection: "driver",
            deviceType: "printer",
            version: 2,
            provider: "com.zebra.ds.webdriver.desktop.provider.DefaultDeviceProvider",
            manufacturer: "Zebra Technologies"
        },
        data: zpl
    };
};

export const printZpl = async (zpl: string): Promise<{ success: boolean; message: string }> => {
    const payload = constructPayload(zpl);

    try {
        const response = await fetch(ZEBRA_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`Falha na impressão: ${response.status} ${responseText}`);
        }
        return { success: true, message: `Impressão enviada. Resposta: ${responseText}` };
    } catch (error: any) {
        console.error('Erro ao enviar para impressora:', error);
        return { success: false, message: error.message || 'Erro de conexão com o serviço de impressão. Verifique se o Zebra Browser Print está em execução.' };
    }
};
