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

  // Busca todos os ativos (Paginado)
  // Conecta com: @GET (root)
  getFabricantes(page: number, pageSize: number): Observable<HttpResponse<Fabricante[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Fabricante[]>(this.baseUrl, {
      params,
      observe: 'response'
    });
  }

  // Busca todos os inativos (Paginado)
  // Conecta com: @GET @Path("/inativos")
  getInativos(page: number, pageSize: number): Observable<HttpResponse<Fabricante[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.baseUrl}/inativos`;

    return this.http.get<Fabricante[]>(url, {
      params,
      observe: 'response'
    });
  }

  // Busca por nome (Paginado)
  // Conecta com: @GET @Path("/nome/{nome}")
  findByNome(nome: string, page: number, pageSize: number): Observable<HttpResponse<Fabricante[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.baseUrl}/nome/${nome}`;

    return this.http.get<Fabricante[]>(url, {
      params,
      observe: 'response'
    });
  }

  // Busca por ID
  // Conecta com: @GET @Path("/{id}/buscar-fabricante-por-id")
  getFabricanteById(id: number): Observable<Fabricante> {
    const url = `${this.baseUrl}/${id}/buscar-fabricante-por-id`;
    return this.http.get<Fabricante>(url);
  }

  // Incluir novo
  // Conecta com: @POST (root)
  incluir(fabricante: Fabricante): Observable<Fabricante> {
    return this.http.post<Fabricante>(this.baseUrl, fabricante);
  }

  // Atualizar existente
  // Conecta com: @PUT @Path("/{id}/atualizar")
  atualizar(id: number, fabricante: Fabricante): Observable<void> {
    const url = `${this.baseUrl}/${id}/atualizar`;
    return this.http.put<void>(url, fabricante);
  }

  // Soft Delete (Desativar)
  // Conecta com: @DELETE @Path("/{id}/apagar")
  deletar(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/apagar`;
    return this.http.delete<void>(url);
  }

  // NOVA FUNÇÃO: Restaurar (Ativar novamente)
  // Conecta com: @PATCH @Path("/{id}/ativar")
  ativar(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}/ativar`;
    // PATCH requer um corpo, mesmo que vazio ({})
    return this.http.patch<void>(url, {});
  }

  // Busca marcas de um fabricante
  // Conecta com: @GET @Path("/{id}/buscar-marca-por-fabricante")
  getMarcasByFabricante(idFabricante: number): Observable<any> {
    const url = `${this.baseUrl}/${idFabricante}/buscar-marca-por-fabricante`;
    return this.http.get(url);
  }

  // Busca lista completa sem paginação (Apenas ativos)
  // Conecta com: @GET @Path("/todos")
  getAllFabricantes(): Observable<Fabricante[]> {
    const url = `${this.baseUrl}/todos`;
    return this.http.get<Fabricante[]>(url);
  }
}