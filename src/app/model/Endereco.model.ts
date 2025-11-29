import { MunicipioResponseDTO } from "./municipioEstado.model";// Certifica-te de que o caminho para municipio.model está correto

// Usado para LISTAR os dados (GET)
export interface EnderecoResponseDTO {
    idEndereco: number;
    cep: string;
    bairro: string;
    numero: number;
    complemento: string;
    municipio: MunicipioResponseDTO; // Objeto completo com Estado
    proprietário: string; // Atenção: No teu Java está com acento 'á', o JSON virá assim.
}

// Usado para CRIAR ou ATUALIZAR os dados (POST/PUT)
export interface EnderecoRequestDTO {
    cep: string;
    bairro: string;
    numero: number;
    complemento: string;
    idMunicipio: number; // Aqui enviamos apenas o ID
}