import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FuncionarioResponse, FuncionarioRequest, FuncionarioUpdateDadosDTO, FuncionarioDeleteDTO } from '../model/Funcionario.model';

// Importa os DTOs de credenciais que não são do Funcionário, mas sim do Usuário
import {
  UsuarioUpdateRequestDTO,
  RedefinirSenhaRequestDTO
} from '../model/usuario.model';



@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {

  // URL base ajustada para o resource do Quarkus
  private readonly apiUrl = 'http://localhost:8080/funcionario';

  constructor(private http: HttpClient) { }

  // =========================================================================
  // 1. MÉTODOS DE BUSCA E LISTAGEM
  // =========================================================================

  /**
   * Busca todos os funcionários com paginação (Endpoint: GET /funcionario).
   * O total de registros é lido do cabeçalho 'X-Total-Count'.
   */
  getAll(page: number = 0, pageSize: number = 10): Observable<HttpResponse<FuncionarioResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<FuncionarioResponse[]>(this.apiUrl, {
      params,
      observe: 'response' // Permite ler o cabeçalho X-Total-Count
    });
  }

  /**
   * Busca um funcionário pelo ID (Endpoint: GET /funcionario/{id}/procurar-por-id).
   */
  getById(id: number): Observable<FuncionarioResponse> {
    return this.http.get<FuncionarioResponse>(`${this.apiUrl}/${id}/procurar-por-id`);
  }

  /**
   * Busca funcionários pelo username (Endpoint: GET /funcionario/{username}/procurar-por-username).
   */
  findByUsername(username: string): Observable<HttpResponse<FuncionarioResponse[]>> {
    return this.http.get<FuncionarioResponse[]>(`${this.apiUrl}/${username}/procurar-por-username`, {
      observe: 'response'
    });
  }

  // =========================================================================
  // 2. MÉTODOS DE CRIAÇÃO E ATUALIZAÇÃO DE DADOS
  // =========================================================================

  /**
   * Cria um novo funcionário (Endpoint: POST /funcionario/incluir).
   */
  create(request: FuncionarioRequest): Observable<FuncionarioResponse> {
    return this.http.post<FuncionarioResponse>(`${this.apiUrl}/incluir`, request);
  }

  /**
   * ATUALIZA DADOS BÁSICOS COM VALIDAÇÃO DE SEGURANÇA.
   * Endpoint: PUT /funcionario/atualizar-dados-com-validacao
   * Usa FuncionarioUpdateDadosDTO (dados + senha atual do alvo).
   */
  updateDadosComValidacao(request: FuncionarioUpdateDadosDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/atualizar-dados-com-validacao`, request);
  }

  /**
   * Deleta um funcionário pelo ID (Endpoint: DELETE /funcionario/{id}/deletar).
   */
  deletarFuncionario(dto: FuncionarioDeleteDTO) {
  return this.http.delete<void>(`${this.apiUrl}/deletar`, {
    headers: {
      "X-Password": dto.senhaAlvo
    },
    body: {
      idFuncionario: dto.idFuncionario,
      senhaAlvo: dto.senhaAlvo // <- IGUAL ao backend
    }
  });
}





  // =========================================================================
  // 3. MÉTODOS DE CREDENCIAIS (Para o ADM forçar)
  // =========================================================================

  /**
   * ATUALIZA CREDENCIAIS (username e senha)
   * Endpoint: PUT /funcionario/{id}/atualizar-credenciais
   * NOTA: Este método é usado pelo ADM para forçar a troca de credenciais de um funcionário.
   */
  updateCredenciais(id: number, request: UsuarioUpdateRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/atualizar-credenciais`, request);
  }

  /**
   * REDEFINIÇÃO DE SENHA
   * Endpoint: PUT /funcionario/redefinir-senha
   * NOTA: Usado para redefinição por ADM (ou "Esqueci a Senha").
   */
  redefinirSenha(request: RedefinirSenhaRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/redefinir-senha`, request);
  }
}