import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
// 1. IMPORTAR O 'map'
import { Observable, map } from 'rxjs';
import { Marca, MarcaRequest } from '../model/marca.model';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

  private baseUrl = 'http://localhost:8080/marcas';

  constructor(private http: HttpClient) { }

  create(request: MarcaRequest): Observable<Marca> {
    return this.http.post<Marca>(this.baseUrl, request);
  }

  update(id: number, request: MarcaRequest): Observable<void> {
    const url = `${this.baseUrl}/${id}/atualizar`;
    return this.http.put<void>(url, request);
  }

  delete(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  getAll(page: number, pageSize: number): Observable<HttpResponse<Marca[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Marca[]>(this.baseUrl, { params, observe: 'response' });
  }

  // 2. MÉTODO ADICIONADO (para o dropdown do Modelo Form)
  // Este método estava faltando no arquivo que você colou.
  getAllForDropdown(): Observable<Marca[]> {
    // Pede página 0 com 1000 itens (workaround)
    return this.getAll(0, 1000).pipe(
      map(response => response.body || []) // Extrai apenas o 'body'
    );
  }

  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<Marca[]>> {
    const url = `${this.baseUrl}/nome/${nome}`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Marca[]>(url, { params, observe: 'response' });
  }

  getById(id: number): Observable<Marca> {
    const url = `${this.baseUrl}/${id}/buscar-marca-por-id`;
    return this.http.get<Marca>(url);
  }
}
  

  /**
   * GET (Modelos)
   */
  /* getModelosByMarcaId(idMarca: number): Observable<Modelo[]> {
    const url = `${this.baseUrl}/${idMarca}/buscar-modelo-por-marca`;
    return this.http.get<Modelo[]>(url);
  } */