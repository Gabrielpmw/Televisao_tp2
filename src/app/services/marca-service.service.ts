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

  getAllForDropdown(): Observable<Marca[]> {
    return this.getAll(0, 1000).pipe(
      map(response => response.body || []) 
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
  

 