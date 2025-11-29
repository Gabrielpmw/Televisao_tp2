import { Telefone } from './telefone.model';

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

  // ATUALIZADO: Agora usa a classe Telefone em vez de string
  telefone?: Telefone; 
}

export class CreateUsuario {
  username!: string;
  senha!: string;
  cpf!: string;
}

export enum Perfil {
  ADMIN = 'adm',
  USER = 'cliente'
}

export class LoginDTO {
  username!: string;
  senha!: string;
}

// Usado no Cadastro inicial (POST)
export interface UsuarioCadastroDTO {
  username: string;
  cpf: string;
  senha: string;
}

// Usado na Recuperação de Senha (PUT)
export interface RedefinirSenhaDTO {
  username: string;
  cpf: string;
  novaSenha: string;
}

// Usado na tela de Dados Pessoais (PATCH)
export interface DadosPessoaisDTO {
  nome: string;
  sobrenome: string;
  email: string;
  dataNascimento: string;
telefoneRequestDTO?: Telefone;
}