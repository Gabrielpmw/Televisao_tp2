import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Modelo, ModeloResponse } from '../model/modelo.model';

@Injectable({
  providedIn: 'root'
})
export class ModeloService {

  private readonly apiUrl = 'http://localhost:8080/modelos';

  constructor(private http: HttpClient) { }

  // --- LISTAGEM PADRÃO (Ativos) ---
  // Conecta com: @GET /modelos (root)
  getAll(page: number, pageSize: number): Observable<HttpResponse<ModeloResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ModeloResponse[]>(this.apiUrl, { params: params, observe: 'response' });
  }

  // --- LISTAGEM DA LIXEIRA (Inativos) ---
  // NOVO: Conecta com: @GET /modelos/inativos
  getInativos(page: number, pageSize: number): Observable<HttpResponse<ModeloResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.apiUrl}/inativos`;
    return this.http.get<ModeloResponse[]>(url, { params: params, observe: 'response' });
  }

  // --- HELPER PARA DROPDOWN ---
  // Traz uma lista grande de ativos para usar em selects
  getAllForDropdown(): Observable<ModeloResponse[]> {
    return this.getAll(0, 1000).pipe(
      map(response => response.body || []) 
    );
  }

  // --- BUSCA POR NOME ---
  // Conecta com: @GET /modelos/nome/{nome}
  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<ModeloResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.apiUrl}/nome/${nome}`;
    return this.http.get<ModeloResponse[]>(url, { params: params, observe: 'response' });
  }

  // --- BUSCA POR ID ---
  // Conecta com: @GET /modelos/{id}/buscar-modelo-por-id
  getById(id: number): Observable<ModeloResponse> {
    const url = `${this.apiUrl}/${id}/buscar-modelo-por-id`;
    return this.http.get<ModeloResponse>(url);
  }

  // --- BUSCA POR MARCA ---
  // Conecta com: @GET /modelos/marca/{idMarca}
  findByMarca(idMarca: number): Observable<ModeloResponse[]> {
    const url = `${this.apiUrl}/marca/${idMarca}`;
    return this.http.get<ModeloResponse[]>(url);
  }

  // --- CREATE ---
  // Conecta com: @POST /modelos
  create(dto: Modelo): Observable<ModeloResponse> {
    return this.http.post<ModeloResponse>(this.apiUrl, dto);
  }

  // --- UPDATE ---
  // Conecta com: @PUT /modelos/{id}/atualizar
  update(id: number, dto: Modelo): Observable<void> {
    const url = `${this.apiUrl}/${id}/atualizar`;
    return this.http.put<void>(url, dto);
  }

  // --- DELETE (Soft Delete) ---
  // Conecta com: @DELETE /modelos/{id}/apagar
  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  // --- RESTAURAR (Ativar) ---
  // NOVO: Conecta com: @PATCH /modelos/{id}/ativar
  ativar(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}/ativar`;
    // PATCH exige corpo, enviamos vazio {}
    return this.http.patch<void>(url, {});
  }
}