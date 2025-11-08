import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
// 1. Verifique se 'map' está importado de 'rxjs'
import { Observable, map } from 'rxjs';
import { Modelo, ModeloResponse } from '../model/modelo.model';

@Injectable({
  providedIn: 'root'
})
export class ModeloService {

  private readonly apiUrl = 'http://localhost:8080/modelos';

  constructor(private http: HttpClient) { }

  getAll(page: number, pageSize: number): Observable<HttpResponse<ModeloResponse[]>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ModeloResponse[]>(this.apiUrl, { params: params, observe: 'response' });
  }

 
  getAllForDropdown(): Observable<ModeloResponse[]> {
    return this.getAll(0, 1000).pipe(
      map(response => response.body || []) 
    );
  }

  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<ModeloResponse[]>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.apiUrl}/nome/${nome}`;
    return this.http.get<ModeloResponse[]>(url, { params: params, observe: 'response' });
  }

  getById(id: number): Observable<ModeloResponse> {
    const url = `${this.apiUrl}/${id}/buscar-modelo-por-id`;
    return this.http.get<ModeloResponse>(url);

  }

  findByMarca(idMarca: number): Observable<ModeloResponse[]> {
    const url = `${this.apiUrl}/marca/${idMarca}`;
    return this.http.get<ModeloResponse[]>(url);
  }

  create(dto: Modelo): Observable<ModeloResponse> {
    return this.http.post<ModeloResponse>(this.apiUrl, dto);
  }

  update(id: number, dto: Modelo): Observable<void> {
    const url = `${this.apiUrl}/${id}/atualizar`;
    return this.http.put<void>(url, dto);
  }

  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }
}