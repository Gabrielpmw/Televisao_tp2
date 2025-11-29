// services/endereco.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnderecoRequestDTO, EnderecoResponseDTO } from '../model/Endereco.model';


@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/endereco'; // Ajuste sua URL base

  // Busca apenas os endereços do usuário logado (Token JWT define quem é)
  getMyEnderecos(): Observable<EnderecoResponseDTO[]> {
    return this.http.get<EnderecoResponseDTO[]>(`${this.apiUrl}/buscar-endereco-user`);
  }

  create(dto: EnderecoRequestDTO): Observable<EnderecoResponseDTO> {
    return this.http.post<EnderecoResponseDTO>(this.apiUrl, dto);
  }

  update(id: number, dto: EnderecoRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/atualizar`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/deletar`);
  }
}