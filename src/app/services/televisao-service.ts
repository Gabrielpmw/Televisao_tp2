import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Televisao, TelevisaoRequest } from '../model/televisao.model';

// Interface que casa com o DTO do Backend (TelevisaoPaginadaResponseDTO)
export interface TelevisaoPaginada {
  televisoes: Televisao[];
  totalCount: number;
}

export interface ModeloResponse {
  id: number;
  modelo: string;
  marca: {
    id: number;
    nomeMarca: string;
  };
}

// Interface auxiliar para tipar os filtros no componente
export interface FiltrosTelevisao {
  sort?: string;        // Coloquei como opcional (?)
  marcas?: string[];
  maxPolegada?: number; // Removido minPolegada
  tipos?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TelevisaoService {

  private readonly apiUrl = 'http://localhost:8080/televisoes';

  constructor(private http: HttpClient) { }

  // ==========================================================
  // BUSCA PRINCIPAL (COM FILTROS, SORT E PAGINAÇÃO) - Traz apenas ATIVOS
  // ==========================================================
  findAll(page: number = 0, pageSize: number = 10, filtros?: FiltrosTelevisao): Observable<TelevisaoPaginada> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // Adiciona os filtros na URL se eles existirem
    if (filtros) {
      // 1. Marcas
      if (filtros.marcas && filtros.marcas.length > 0) {
        filtros.marcas.forEach(marca => {
          params = params.append('marcas', marca);
        });
      }

      // 2. Polegadas (Mantivemos apenas o MAX conforme combinado)
      if (filtros.maxPolegada) {
        params = params.set('maxPolegada', filtros.maxPolegada.toString());
      }

      // 3. Tipos
      if (filtros.tipos && filtros.tipos.length > 0) {
        filtros.tipos.forEach(tipo => {
          params = params.append('tipos', tipo);
        });
      }

      // 4. Ordenação
      if (filtros.sort) {
        params = params.set('sort', filtros.sort);
      }
    }

    // Chama GET /televisoes (que lista os ativos)
    return this.http.get<TelevisaoPaginada>(this.apiUrl, { params });
  }

  // ==========================================================
  // MÉTODOS DE SOFT DELETE E RESTAURAÇÃO
  // ==========================================================

  // Soft Delete: Chama DELETE /televisoes/{id}/desativar
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/desativar`);
  }

  // Restaura: Chama PATCH /televisoes/{id}/restaurar
  restore(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  // Lixeira: Chama GET /televisoes/inativas
  findAllInativas(page: number = 0, pageSize: number = 10): Observable<TelevisaoPaginada> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<TelevisaoPaginada>(`${this.apiUrl}/inativas`, { params });
  }

  // ==========================================================
  // OUTROS MÉTODOS EXISTENTES
  // ==========================================================

  findAllMarcas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/marcas`);
  }

  findById(id: number): Observable<Televisao> {
    return this.http.get<Televisao>(`${this.apiUrl}/${id}/buscar-por-id`);
  }

  findByModelo(nomeModelo: string, page: number = 0, pageSize: number = 10): Observable<TelevisaoPaginada> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Televisao[]>(`${this.apiUrl}/modelo/${nomeModelo}`, { params, observe: 'response' }).pipe(
      map(response => {
        const totalCount = Number(response.headers.get('X-Total-Count') || '0');
        return { televisoes: response.body || [], totalCount };
      })
    );
  }

  create(dto: TelevisaoRequest): Observable<Televisao> {
    return this.http.post<Televisao>(this.apiUrl, dto);
  }

  update(id: number, dto: TelevisaoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/atualizar`, dto);
  }

  findModeloByTelevisaoId(idTelevisao: number): Observable<ModeloResponse> {
    return this.http.get<ModeloResponse>(`${this.apiUrl}/${idTelevisao}/modelo`);
  }

  uploadImagem(id: number, imagem: File): Observable<any> {
    const formData = new FormData();
    formData.append('idTelevisao', id.toString());
    formData.append('file', imagem);

    return this.http.patch(`${this.apiUrl}/imagem/upload`, formData, {
      responseType: 'text'
    });
  }

  getUrlImagem(nomeImagem: string): string {
    return `${this.apiUrl}/imagem/download/${nomeImagem}`;
  }
}