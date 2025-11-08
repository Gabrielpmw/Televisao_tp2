import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fornecedor } from '../model/fornecedor.model';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private baseUrl = 'http://localhost:8080/fornecedores';

  constructor(private http: HttpClient) { }

  getFornecedores(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(this.baseUrl);
  }

  getFornecedoresPaginado(page: number, pageSize: number): Observable<HttpResponse<Fornecedor[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<Fornecedor[]>(this.baseUrl, { params, observe: 'response' });
  }

  getFornecedoresPorNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<Fornecedor[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    
    const url = `${this.baseUrl}/nome/${nome}`;
    
    return this.http.get<Fornecedor[]>(url, { params, observe: 'response' });
  }


  getFornecedorById(id: number): Observable<Fornecedor> {
    const url = `${this.baseUrl}/${id}/buscar-fornecedor-por-id`;
    return this.http.get<Fornecedor>(url);
  }

  incluir(fornecedor: Fornecedor): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.baseUrl, fornecedor);
  }

  atualizar(id: number, fornecedor: Fornecedor): Observable<void> {
    const url = `${this.baseUrl}/${id}/atualizar`;
    return this.http.put<void>(url, fornecedor);
  }

  deletar(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  associarMarcas(idFornecedor: number, idMarcas: number[]): Observable<Fornecedor> {
    const url = `${this.baseUrl}/${idFornecedor}/associar-marcas`;
    return this.http.post<Fornecedor>(url, idMarcas);
  }
}