import { Fornecedor } from "./fornecedor.model";

export class Marca {
    id?: number | null;
    marca?: string | null;       // <-- Espelha a string 'marca' do seu DTO
    descricao?: string | null;
    idFabricante?: number | null; // <-- ADICIONE ESTA LINHA
    fabricante?: string | null; // <-- Espelha a string 'fabricante' do seu DTO
    fornecedores?: Fornecedor[] | null;
}

export class MarcaRequest {
    nomeMarca?: string;
    descricao?: string;
    idFabricante?: number;
}
