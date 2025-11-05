import { Telefone } from "./telefone.model";

export class Fornecedor {
    id?: number | null;
    razaoSocial?: string | null;
    cnpj?: string | null;
    status?: boolean | null;
    email?: string | null;
    telefones?: Telefone[] | null;
}
