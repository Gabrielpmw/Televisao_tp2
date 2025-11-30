import { Telefone } from './telefone.model'; // Assumindo que Telefone está em arquivo separado

export class Usuario {
  id!: number;
  username!: string;
  perfil!: Perfil;
  cpf!: string;

  // Campos opcionais de perfil
  nome?: string;
  sobrenome?: string;
  email?: string;
  dataNascimento?: string;

  // ATUALIZADO: Agora usa a classe Telefone
  telefone?: Telefone;
}

export enum Perfil {
  ADMIN = 'adm',
  USER = 'cliente'
}

// =========================================================
// INTERFACES ADICIONADAS/ATUALIZADAS PARA O FUNCIONARIOSERVICE
// =========================================================

/**
 * Usado pelo ADM para forçar a troca de username e senha de um funcionário.
 * Reflete o UsuarioUpdateRequestDTO.java do backend.
 */
export interface UsuarioUpdateRequestDTO {
  usernameAntigo: string;
  senhaAntiga: string; // Senha antiga é exigida pelo backend (pode ser dummy para ADM)
  novoUsername: string;
  novaSenha: string;
}

/**
 * Usado para redefinição de senha (ADM ou Esquecimento).
 * Reflete o RedefinirSenhaRequestDTO.java do backend.
 */
export interface RedefinirSenhaRequestDTO {
  username: string;
  cpf: string;
  novaSenha: string;
}

// =========================================================
// MANTENDO AS SUAS INTERFACES EXISTENTES
// =========================================================

export class CreateUsuario {
  username!: string;
  senha!: string;
  cpf!: string;
}

export interface UsuarioCadastroDTO {
  username: string;
  cpf: string;
  senha: string;
}

export class LoginDTO {
  username!: string;
  senha!: string;
}

export interface DadosPessoaisDTO {
  nome: string;
  sobrenome: string;
  email: string;
  dataNascimento: string;
  telefoneRequestDTO?: Telefone;
}

export interface UpdateCredenciaisDTO {
  usernameAntigo: string;
  senhaAntiga: string;
  novoUsername: string;
  novaSenha: string;
}