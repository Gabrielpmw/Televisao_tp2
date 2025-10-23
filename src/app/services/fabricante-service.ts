import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fabricante } from '../model/fabricante.model';

@Injectable({
  providedIn: 'root'
})
export class FabricanteService {
  private baseUrl = 'http://localhost:8080/fabricantes';

  constructor(private http: HttpClient) { }

  incluir(fabricante: Fabricante): Observable<Fabricante> {
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

  getFabricantes(): Observable<Fabricante[]> {
    return this.http.get<Fabricante[]>(this.baseUrl);
  }

  getFabricanteById(id: number): Observable<Fabricante> {
    const url = `${this.baseUrl}/${id}/buscar-fabricante-por-id`;
    return this.http.get<Fabricante>(url);
  }

  /*
  getMarcasByFabricante(idFabricante: number): Observable<Marca[]> { 
    const url = `${this.baseUrl}/${idFabricante}/buscar-marca-por-fabricante`;
    return this.http.get<Marca[]>(url);
  }
  */

  getFabricanteByNome(nome: string): Observable<Fabricante[]> {
    const url = `${this.baseUrl}/${nome}/buscar-fabricante-por-nome`;
    return this.http.get<Fabricante[]>(url);
  }
}
