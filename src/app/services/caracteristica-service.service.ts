import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs'; // Importar 'map'
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
    // Pede página 0 com 1000 itens (workaround para endpoint paginado)
    return this.getAll(0, 1000).pipe(
      map(response => response.body || []) // Extrai apenas o 'body' da resposta
    );
  }

  
  getById(id: number): Observable<CaracteristicasGerais> {
    const url = `${this.apiUrl}/${id}/buscar-por-id`;
    return this.http.get<CaracteristicasGerais>(url);
  }

  /**
   * Cria uma nova característica.
   * Corresponde ao: POST /caracteristicas [cite: CaracteristicaResource.java]
   */
  create(dto: CaracteristicasGeraisRequest): Observable<CaracteristicasGerais> {
    return this.http.post<CaracteristicasGerais>(this.apiUrl, dto);
  }

  /**
   * Atualiza uma característica existente.
   * Corresponde ao: PUT /caracteristicas/{id}/atualizar [cite: CaracteristicaResource.java]
   */
  update(id: number, dto: CaracteristicasGeraisRequest): Observable<void> {
    const url = `${this.apiUrl}/${id}/atualizar`;
    return this.http.put<void>(url, dto);
  }

  /**
   * Exclui uma característica.
   * Corresponde ao: DELETE /caracteristicas/{id}/apagar [cite: CaracteristicaResource.java]
   */
  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }
}