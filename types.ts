
export interface ChildRecord {
    id: number;
    nomeCrianca: string;
    nomeResponsavel: string;
    telefone: string;
    idade: string;
    comum: string;
    statusImpresso: 'S' | 'N';
    portaria: string;
    cod_resp: number;
}

export interface InstanceInfo {
    id: string;
    name: string;
    createdAt: string;
}
