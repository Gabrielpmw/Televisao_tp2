import { Fornecedor } from "./fornecedor.model";

export class Marca {
    id?: number | null;
    marca?: string | null;
    descricao?: string | null;
    idFabricante?: number | null;
    fabricante?: string | null;
    fornecedores?: Fornecedor[] | null;
    ativo?: boolean | null;
}

export class MarcaRequest {
    nomeMarca?: string;
    descricao?: string;
    idFabricante?: number;
}
