    import { Telefone } from "./telefone.model";

    export class Fabricante {
        id ?: number|null;
        razaoSocial ?: string|null;
        cnpj ?: string|null;
        dataAbertura ?: string|null;
        paisSede ?: string|null;
        ativo ?: boolean|null;
        telefones ?: Telefone[]|null;

    }
