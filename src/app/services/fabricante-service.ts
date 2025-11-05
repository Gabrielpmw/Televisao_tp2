import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fabricante } from '../model/fabricante.model';

@Injectable({
  providedIn: 'root'
})
export class FabricanteService {

  private baseUrl = 'http://localhost:8080/fabricantes';

  constructor(private http: HttpClient) { }

  // 🔹 Buscar todos (paginado)
  getFabricantes(page: number, pageSize: number): Observable<HttpResponse<Fabricante[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Fabricante[]>(this.baseUrl, {
      params,
      observe: 'response'
    });
  }

  // 🔹 Buscar por nome (paginado)
  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<Fabricante[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.baseUrl}/nome/${nome}`; // ✅ Corrigido

    return this.http.get<Fabricante[]>(url, {
      params,
      observe: 'response'
    });
  }

  // 🔹 Buscar por ID
  getFabricanteById(id: number): Observable<Fabricante> {
    const url = `${this.baseUrl}/${id}/buscar-fabricante-por-id`;
    return this.http.get<Fabricante>(url);
  }

  // 🔹 Criar
  incluir(fabricante: Fabricante): Observable<Fabricante> {
    return this.http.post<Fabricante>(this.baseUrl, fabricante);
  }

  // 🔹 Atualizar
  atualizar(id: number, fabricante: Fabricante): Observable<void> {
    const url = `${this.baseUrl}/${id}/atualizar`;
    return this.http.put<void>(url, fabricante);
  }

  // 🔹 Deletar
  deletar(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  // 🔹 Buscar marcas associadas ao fabricante
  getMarcasByFabricante(idFabricante: number): Observable<any> {
    const url = `${this.baseUrl}/${idFabricante}/buscar-marca-por-fabricante`;
    return this.http.get(url);
  }
}
