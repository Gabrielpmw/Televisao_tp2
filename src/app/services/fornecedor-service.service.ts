import { Injectable } from '@angular/core';
// 1. ADICIONE HttpResponse AQUI
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fornecedor } from '../model/fornecedor.model';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private baseUrl = 'http://localhost:8080/fornecedores';

  constructor(private http: HttpClient) { }

  /**
   * Este método fica como está (sem paginação).
   * O componente de lista NÃO deve usar este.
   */
  getFornecedores(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(this.baseUrl);
  }

  // --- MÉTODOS DE PAGINAÇÃO (USADOS PELO LIST COMPONENT) ---

  /**
   * 2. NOVO MÉTODO: Busca fornecedores com paginação.
   * Usado quando a barra de busca está VAZIA.
   */
  getFornecedoresPaginado(page: number, pageSize: number): Observable<HttpResponse<Fornecedor[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    // Adicionado { params, observe: 'response' }
    return this.http.get<Fornecedor[]>(this.baseUrl, { params, observe: 'response' });
  }

  /**
   * 3. MÉTODO ATUALIZADO: Busca por nome com paginação.
   * Usado quando a barra de busca está PREENCHIDA.
   */
  getFornecedoresPorNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<Fornecedor[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    
    // O endpoint pode variar, mas assumindo /nome/
    const url = `${this.baseUrl}/nome/${nome}`;
    
    // ATUALIZADO: Retorno para HttpResponse e adicionado observe: 'response'
    return this.http.get<Fornecedor[]>(url, { params, observe: 'response' });
  }

  // --- OUTROS MÉTODOS (permanecem iguais) ---

  getFornecedorById(id: number): Observable<Fornecedor> {
    const url = `${this.baseUrl}/${id}/buscar-fornecedor-por-id`;
    return this.http.get<Fornecedor>(url);
  }

  incluir(fornecedor: Fornecedor): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.baseUrl, fornecedor);
  }

  atualizar(id: number, fornecedor: Fornecedor): Observable<void> {
    const url = `${this.baseUrl}/${id}/atualizar`;
    return this.http.put<void>(url, fornecedor);
  }

  deletar(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  associarMarcas(idFornecedor: number, idMarcas: number[]): Observable<Fornecedor> {
    const url = `${this.baseUrl}/${idFornecedor}/associar-marcas`;
    return this.http.post<Fornecedor>(url, idMarcas);
  }
}