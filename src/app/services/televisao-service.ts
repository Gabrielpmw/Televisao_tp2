import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Televisao } from '../model/televisao.model';

@Injectable({
  providedIn: 'root'
})
export class TelevisaoService {
  private baseUrl = 'http://localhost:8080/televisao';

  constructor(private http: HttpClient) { }

  buscarTodos(): Observable<Televisao[]> {
    return this.http.get<Televisao[]>(this.baseUrl);
  }

  buscarTelevisaoPorModelo(idModelo: number): Observable<Televisao[]> {
    return this.http.get<Televisao[]>(`${this.baseUrl}/${idModelo}/buscar-televisao-por-modelo`);
  }
}
