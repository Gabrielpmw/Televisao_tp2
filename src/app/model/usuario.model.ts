import { Telefone } from './telefone.model'; 

// =========================================================
// ENTIDADE E ENUMS
// =========================================================

export class Usuario {
  id!: number;
  username!: string;
  perfil!: Perfil;
  cpf!: string;

  // Campos opcionais de perfil
  nome?: string;
  sobrenome?: string;
  email?: string;
  dataNascimento?: string; // Formato 'yyyy-MM-dd'

  // Relacionamento
  telefone?: Telefone;
}

export enum Perfil {
  ADMIN = 'adm',
  USER = 'cliente'
}

// =========================================================
// DTOs: AUTENTICAÇÃO E CRIAÇÃO (Público)
// =========================================================

export class LoginDTO {
  username!: string;
  senha!: string;
}

export interface UsuarioCadastroDTO {
  username: string;
  cpf: string;
  senha: string;
}

// Model simples alternativo para criação
export class CreateUsuario {
  username!: string;
  senha!: string;
  cpf!: string;
}

// =========================================================
// DTOs: AUTO-SERVIÇO (O próprio usuário altera)
// =========================================================

/**
 * Usado pelo usuário para alterar seus dados cadastrais.
 * No backend: DadosPessoaisRequestDTO
 * Nota: O campo no JSON esperado é "telefoneRequestDTO"
 */
export interface DadosPessoaisDTO {
  nome: string;
  sobrenome: string;
  email: string;
  dataNascimento: string;
  telefoneRequestDTO?: Telefone; 
}

/**
 * Usado pelo usuário para atualizar suas próprias credenciais.
 * Exige a senha antiga para validação.
 * No backend: UpdateCredenciaisDTO
 */
export interface UpdateCredenciaisDTO {
  usernameAntigo: string;
  senhaAntiga: string;
  novoUsername: string;
  novaSenha: string;
}

/**
 * Usado para redefinição de senha (Esqueci a senha).
 * No backend: RedefinirSenhaRequestDTO
 */
export interface RedefinirSenhaRequestDTO {
  username: string;
  cpf: string;
  novaSenha: string;
}

/**
 * DTO antigo de atualização completa (Legado/Auto-serviço).
 * No backend: UsuarioUpdateRequestDTO
 */
export interface UsuarioUpdateRequestDTO {
  usernameAntigo: string;
  senhaAntiga: string;
  novoUsername: string;
  novaSenha: string;
}

// =========================================================
// DTOs: ADMINISTRATIVO (Gestão de Usuários)
// =========================================================

/**
 * DTO para o ADMIN criar um usuário completo (Cliente).
 * Não exige senha antiga nem idPerfil (padrão Cliente).
 * No backend: UsuarioCreateAdminDTO
 */
export interface UsuarioCreateAdminDTO {
  username: string;
  senha: string;
  cpf: string;
  nome: string;
  sobrenome: string;
  email: string;
  dataNascimento: string;
  telefone?: Telefone; // No create admin, o campo JSON é "telefone"
}

/**
 * DTO para o ADMIN atualizar dados cadastrais de um usuário.
 * Não toca em senhas ou username.
 * No backend: UsuarioUpdateDadosAdminDTO
 */
export interface UsuarioUpdateDadosAdminDTO {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  telefone?: Telefone; // No update admin, o campo JSON é "telefone"
}

/**
 * DTO para o ADMIN alterar login e senha de um usuário (Reset forçado).
 * Não exige senha antiga.
 * No backend: UsuarioUpdateCredenciaisAdminDTO
 */
export interface UsuarioUpdateCredenciaisAdminDTO {
  username: string; // Admin pode corrigir o username
  novaSenha: string; // Admin define a nova senha
}