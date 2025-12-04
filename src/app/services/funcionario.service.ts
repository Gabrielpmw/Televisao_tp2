import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { 
//   FuncionarioResponse, 
//   FuncionarioRequest, 
//   FuncionarioUpdateDadosDTO, 
//   FuncionarioDeleteDTO 
// } from Funcionari; // Ajuste o caminho conforme sua estrutura

import { FuncionarioResponse, FuncionarioRequest, FuncionarioUpdateDadosDTO, FuncionarioDeleteDTO } from '../model/Funcionario.model';

// Importa os DTOs de credenciais (do Usuário)
import {
  UsuarioUpdateRequestDTO,
  RedefinirSenhaRequestDTO
} from '../model/usuario.model'; // Ajuste o caminho conforme sua estrutura

@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {

  // URL base ajustada para o resource do Quarkus
  private readonly apiUrl = 'http://localhost:8080/funcionario';

  constructor(private http: HttpClient) { }

  // =========================================================================
  // 1. MÉTODOS DE BUSCA E LISTAGEM (PAGINADOS)
  // =========================================================================

  /**
   * Busca todos os funcionários com paginação.
   * Endpoint: GET /funcionario?page=0&pageSize=10
   */
  findAll(page: number = 0, pageSize: number = 10): Observable<HttpResponse<FuncionarioResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<FuncionarioResponse[]>(this.apiUrl, {
      params,
      observe: 'response' // Importante para ler X-Total-Count
    });
  }

  /**
   * Busca funcionários por NOME (parcial/começa com) com paginação.
   * Endpoint: GET /funcionario/{nome}/procurar-por-nome?page=0&pageSize=10
   */
  findByNome(nome: string, page: number = 0, pageSize: number = 10): Observable<HttpResponse<FuncionarioResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<FuncionarioResponse[]>(`${this.apiUrl}/${nome}/procurar-por-nome`, {
      params,
      observe: 'response'
    });
  }

  /**
   * Busca funcionários por USERNAME (parcial) com paginação.
   * Endpoint: GET /funcionario/{username}/procurar-por-username?page=0&pageSize=10
   */
  findByUsername(username: string, page: number = 0, pageSize: number = 10): Observable<HttpResponse<FuncionarioResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<FuncionarioResponse[]>(`${this.apiUrl}/${username}/procurar-por-username`, {
      params,
      observe: 'response'
    });
  }

  /**
   * Busca um funcionário pelo ID.
   * Endpoint: GET /funcionario/{id}/procurar-por-id
   */
  findById(id: number): Observable<FuncionarioResponse> {
    return this.http.get<FuncionarioResponse>(`${this.apiUrl}/${id}/procurar-por-id`);
  }

  // =========================================================================
  // 2. MÉTODOS DE CRIAÇÃO E ATUALIZAÇÃO DE DADOS
  // =========================================================================

  /**
   * Cria um novo funcionário.
   * Endpoint: POST /funcionario/incluir
   */
  create(request: FuncionarioRequest): Observable<FuncionarioResponse> {
    return this.http.post<FuncionarioResponse>(`${this.apiUrl}/incluir`, request);
  }

  /**
   * Atualiza dados básicos com validação de segurança (Exige senha atual).
   * Endpoint: PUT /funcionario/atualizar-dados-com-validacao
   */
  updateDadosComValidacao(request: FuncionarioUpdateDadosDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/atualizar-dados-com-validacao`, request);
  }

  /**
   * Deleta um funcionário pelo ID.
   * Endpoint: DELETE /funcionario/deletar
   * Headers: X-Password (senha de quem está deletando)
   */
  deletarFuncionario(dto: FuncionarioDeleteDTO): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deletar`, {
      headers: {
        "X-Password": dto.senhaAlvo // O backend espera a senha neste header
      },
      body: {
        idFuncionario: dto.idFuncionario,
        senhaAlvo: dto.senhaAlvo // O DTO também vai no corpo
      }
    });
  }

  // =========================================================================
  // 3. MÉTODOS DE CREDENCIAIS (ADMINISTRATIVO)
  // =========================================================================

  /**
   * Atualiza credenciais (username e senha) de OUTRO usuário.
   * Endpoint: PUT /funcionario/{id}/atualizar-credenciais
   */
  updateCredenciais(id: number, request: UsuarioUpdateRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/atualizar-credenciais`, request);
  }

  /**
   * Redefinição de senha (Esqueci a senha / Admin reset).
   * Endpoint: PUT /funcionario/redefinir-senha
   */
  redefinirSenha(request: RedefinirSenhaRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/redefinir-senha`, request);
  }
}