import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// Atualize os imports para incluir os novos DTOs de Admin
import { 
  Usuario, 
  UsuarioCadastroDTO, 
  RedefinirSenhaRequestDTO, 
  DadosPessoaisDTO, 
  UsuarioUpdateRequestDTO, 
  UpdateCredenciaisDTO,
  // Novos DTOs de Admin (Crie as interfaces no model se ainda não existirem)
  UsuarioCreateAdminDTO,
  UsuarioUpdateDadosAdminDTO,
  UsuarioUpdateCredenciaisAdminDTO
} from '../model/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly API_URL = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient) { }

  // =========================================================================
  // MÉTODOS DO USUÁRIO / AUTO-SERVIÇO (Mantidos Originais)
  // =========================================================================

  insert(usuario: UsuarioCadastroDTO): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, usuario);
  }

  // Método usa o DTO RedefinirSenhaRequestDTO (tipagem correta)
  recuperarSenha(dto: RedefinirSenhaRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/recuperar-senha`, dto);
  }

  updateDadosPessoais(id: number, dto: DadosPessoaisDTO): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/dados-pessoais`, dto);
  }

  findById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${id}/procurar-id`);
  }

  findAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL);
  }

  findByUsername(username: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${username}/buscar-username`);
  }

  atualizarCredenciais(dto: UpdateCredenciaisDTO): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/atualizar-credenciais`, dto);
  }

  // =========================================================================
  // MÉTODOS ADMINISTRATIVOS (Novas Implementações)
  // =========================================================================

  /**
   * Admin cria um novo usuário (Cliente).
   * Endpoint: POST /usuarios/admin
   */
  createByAdmin(usuario: UsuarioCreateAdminDTO): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.API_URL}/admin`, usuario);
  }

  /**
   * Admin atualiza dados cadastrais de um usuário específico.
   * Endpoint: PUT /usuarios/admin/{id}/dados
   */
  updateDadosByAdmin(id: number, dto: UsuarioUpdateDadosAdminDTO): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/admin/${id}/dados`, dto);
  }

  /**
   * Admin reseta/altera credenciais (login/senha) de um usuário específico.
   * Endpoint: PATCH /usuarios/admin/{id}/credenciais
   */
  updateCredenciaisByAdmin(id: number, dto: UsuarioUpdateCredenciaisAdminDTO): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/admin/${id}/credenciais`, dto);
  }

  /**
   * Admin deleta um usuário pelo ID.
   * (Reaproveitando o endpoint existente, pois a lógica de permissão está no Back)
   */
  deleteByAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/deletar`);
  }
}