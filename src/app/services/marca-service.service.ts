import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Marca } from '../model/marca.model';
import { MarcaRequest } from '../model/marca-request.model';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

  private baseUrl = 'http://localhost:8080/marcas';

  constructor(private http: HttpClient) { }

  /**
   * POST /marcas
   * (Envia um 'MarcaRequest')
   * (Recebe um 'Marca' como resposta do back-end)
   */
  create(request: MarcaRequest): Observable<Marca> {
    return this.http.post<Marca>(this.baseUrl, request);
  }

  /**
   * PUT /marcas/{id}/atualizar
   * (Envia um 'MarcaRequest')
   */
  update(id: number, request: MarcaRequest): Observable<void> {
    const url = `${this.baseUrl}/${id}/atualizar`;
    return this.http.put<void>(url, request);
  }

  /**
   * DELETE /marcas/{id}/apagar
   */
  delete(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  /**
   * GET (Todos)
   * (Recebe um array de 'Marca')
   */
  getAll(page: number, pageSize: number): Observable<HttpResponse<Marca[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Marca[]>(this.baseUrl, { params, observe: 'response' });
  }

  /**
   * GET (Por Nome)
   * (Recebe um array de 'Marca')
   */
  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<Marca[]>> {
    const url = `${this.baseUrl}/nome/${nome}`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Marca[]>(url, { params, observe: 'response' });
  }

  /**
   * GET (Por ID)
   * (Recebe um 'Marca')
   */
  getById(id: number): Observable<Marca> {
    const url = `${this.baseUrl}/${id}/buscar-marca-por-id`;
    return this.http.get<Marca>(url);
  }
  

  /**
   * GET (Modelos)
   */
  /* getModelosByMarcaId(idMarca: number): Observable<Modelo[]> {
    const url = `${this.baseUrl}/${idMarca}/buscar-modelo-por-marca`;
    return this.http.get<Modelo[]>(url);
  } */
}