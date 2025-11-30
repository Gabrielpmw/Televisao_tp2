/**
 * Modelo de Resposta para a lista e busca por ID.
 * Reflete o FuncionarioResponseDTO.java do backend.
 */
export interface FuncionarioResponse {
    id: number;
    username: string;
    nome: string;
    cpf: string;
    sobrenome: string;
    email: string;
}

/**
 * Modelo de Requisição usado SOMENTE para a CRIAÇÃO de um novo funcionário.
 * Requer todos os dados, incluindo a senha inicial (senha).
 * Reflete o FuncionarioRequestDTO.java do backend.
 */
export interface FuncionarioRequest {
    nome: string;
    cpf: string;
    username: string;
    senha: string;
    sobrenome: string;
    email: string;
}

/**
 * Modelo de Requisição usado para ATUALIZAR dados básicos de um funcionário.
 * ESSENCIAL: Inclui a senhaAtualAlvo para validação de segurança no backend.
 * Reflete o FuncionarioUpdateDadosDTO.java do backend.
 */
export interface FuncionarioUpdateDadosDTO {
    idFuncionario: number;
    nome: string;
    cpf: string;
    sobrenome: string;
    email: string;
    senhaAtualAlvo: string; // Senha do funcionário ALVO para validar a alteração
}

export interface FuncionarioDeleteDTO {
  idFuncionario: number;
  senhaAlvo: string;
}
