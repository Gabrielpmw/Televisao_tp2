import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Televisao, TelevisaoRequest } from '../model/televisao.model';

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


@Injectable({
  providedIn: 'root'
})
export class TelevisaoService {

  private readonly apiUrl = 'http://localhost:8080/televisoes';

  constructor(private http: HttpClient) { }

  findAll(page: number = 0, pageSize: number = 10): Observable<TelevisaoPaginada> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Televisao[]>(this.apiUrl, { params, observe: 'response' }).pipe(
      map(response => {
        const totalCount = Number(response.headers.get('X-Total-Count') || '0');
        return { televisoes: response.body || [], totalCount };
      })
    );
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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/apagar`);
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