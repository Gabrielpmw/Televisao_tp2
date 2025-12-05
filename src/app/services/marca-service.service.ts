import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Marca, MarcaRequest } from '../model/marca.model';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

  private baseUrl = 'http://localhost:8080/marcas';

  constructor(private http: HttpClient) { }

  // --- CREATE ---
  create(request: MarcaRequest): Observable<Marca> {
    return this.http.post<Marca>(this.baseUrl, request);
  }

  // --- UPDATE ---
  update(id: number, request: MarcaRequest): Observable<void> {
    const url = `${this.baseUrl}/${id}/atualizar`;
    return this.http.put<void>(url, request);
  }

  // --- DELETE (Soft Delete / Desativar) ---
  delete(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  // --- ATIVAR (Restaurar) ---
  // NOVO: Conecta com @PATCH /marcas/{id}/ativar
  ativar(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/ativar`;
    // PATCH requer um corpo, enviamos um objeto vazio {}
    return this.http.patch<void>(url, {});
  }

  // --- LISTAR ATIVOS (Paginado) ---
  getAll(page: number, pageSize: number): Observable<HttpResponse<Marca[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Marca[]>(this.baseUrl, { params, observe: 'response' });
  }

  // --- LISTAR INATIVOS (Lixeira - Paginado) ---
  // NOVO: Conecta com @GET /marcas/inativos
  getInativos(page: number, pageSize: number): Observable<HttpResponse<Marca[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.baseUrl}/inativos`;

    return this.http.get<Marca[]>(url, { params, observe: 'response' });
  }

  // --- BUSCAR POR NOME ---
  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<Marca[]>> {
    const url = `${this.baseUrl}/nome/${nome}`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Marca[]>(url, { params, observe: 'response' });
  }

  // --- BUSCAR POR ID ---
  getById(id: number): Observable<Marca> {
    const url = `${this.baseUrl}/${id}/buscar-marca-por-id`;
    return this.http.get<Marca>(url);
  }

  // --- HELPER PARA DROPDOWNS ---
  // Busca uma lista grande apenas de ativos para usar em selects de formulários
  getAllForDropdown(): Observable<Marca[]> {
    return this.getAll(0, 1000).pipe(
      map(response => response.body || []) 
    );
  }
}