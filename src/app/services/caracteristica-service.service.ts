import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs'; 
import { CaracteristicasGerais, CaracteristicasGeraisRequest } from '../model/caracteristicas-gerais.model';


@Injectable({
  providedIn: 'root'
})
export class CaracteristicasGeraisService {

  private readonly apiUrl = 'http://localhost:8080/caracteristicas';

  constructor(private http: HttpClient) { }

  getAll(page: number, pageSize: number): Observable<HttpResponse<CaracteristicasGerais[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<CaracteristicasGerais[]>(this.apiUrl, { params: params, observe: 'response' });
  }

 
  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<CaracteristicasGerais[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.apiUrl}/nome/${nome}`;
    return this.http.get<CaracteristicasGerais[]>(url, { params: params, observe: 'response' });
  }

  getAllForDropdown(): Observable<CaracteristicasGerais[]> {
    return this.getAll(0, 1000).pipe(
      map(response => response.body || []) 
    );
  }

  
  getById(id: number): Observable<CaracteristicasGerais> {
    const url = `${this.apiUrl}/${id}/buscar-por-id`;
    return this.http.get<CaracteristicasGerais>(url);
  }


  create(dto: CaracteristicasGeraisRequest): Observable<CaracteristicasGerais> {
    return this.http.post<CaracteristicasGerais>(this.apiUrl, dto);
  }

  
  update(id: number, dto: CaracteristicasGeraisRequest): Observable<void> {
    const url = `${this.apiUrl}/${id}/atualizar`;
    return this.http.put<void>(url, dto);
  }

  
  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }
}