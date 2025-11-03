import { Injectable } from '@angular/core';
// 1. Importe HttpClient, HttpResponse e HttpParams
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fabricante } from '../model/fabricante.model';
// import { Marca } from '../model/marca.model'; // (Descomente se for usar getMarcasByFabricante)

@Injectable({
  providedIn: 'root'
})
export class FabricanteService {
  private baseUrl = 'http://localhost:8080/fabricantes';

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE LISTAGEM PAGINADA (Refatorados) ---

  /**
   * Busca TODOS os fabricantes de forma paginada.
   * Retorna um HttpResponse para podermos ler os HEADERS (X-Total-Count).
   */
  getFabricantes(page: number, pageSize: number): Observable<HttpResponse<Fabricante[]>> {
    
    // Configura os parâmetros de query (ex: ?page=0&pageSize=10)
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // { observe: 'response' } é a chave!
    // Pede ao HttpClient a resposta HTTP completa, não só o body.
    return this.http.get<Fabricante[]>(this.baseUrl, { 
      params: params,
      observe: 'response' 
    });
  }

  /**
   * Busca fabricantes por NOME de forma paginada.
   * Retorna um HttpResponse para podermos ler os HEADERS (X-Total-Count).
   */
  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<Fabricante[]>> {
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // Seu endpoint de busca no backend é: /search/nome/{nome}
    const url = `${this.baseUrl}/search/nome/${nome}`;

    return this.http.get<Fabricante[]>(url, { 
      params: params,
      observe: 'response' 
    });
  }


  // --- MÉTODOS DE CRUD (Seus endpoints corretos) ---

  getFabricanteById(id: number): Observable<Fabricante> {
    const url = `${this.baseUrl}/${id}/buscar-fabricante-por-id`;
    return this.http.get<Fabricante>(url);
  }

  incluir(fabricante: Fabricante): Observable<Fabricante> {
    // O endpoint 'incluir' é o POST na raiz
    return this.http.post<Fabricante>(this.baseUrl, fabricante);
  }

  atualizar(id: number, fabricante: Fabricante): Observable<void> {
    const url = `${this.baseUrl}/${id}/atualizar`;
    return this.http.put<void>(url, fabricante);
  }

  deletar(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  /*
  getMarcasByFabricante(idFabricante: number): Observable<Marca[]> { 
    const url = `${this.baseUrl}/${idFabricante}/buscar-marca-por-fabricante`;
    return this.http.get<Marca[]>(url); // (Lembrar de importar 'Marca')
  }
  */
}