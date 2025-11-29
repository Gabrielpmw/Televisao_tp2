import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MunicipioResponseDTO } from '../model/municipioEstado.model';


@Injectable({
  providedIn: 'root'
})
export class MunicipioService {
  private http = inject(HttpClient);
  // Ajuste a porta/caminho conforme sua API
  private apiUrl = 'http://localhost:8080/municipio';

  // Esse método vai bater no seu @GET public (que liberamos para 'cliente')
  findAll(): Observable<MunicipioResponseDTO[]> {
    return this.http.get<MunicipioResponseDTO[]>(this.apiUrl);
  }

  // Útil caso precise buscar um específico
  findById(id: number): Observable<MunicipioResponseDTO> {
    return this.http.get<MunicipioResponseDTO>(`${this.apiUrl}/${id}/procurar-id`);
  }

  checkAndCreate(nomeCidade: string, uf: string): Observable<MunicipioResponseDTO> {
    const payload = { nomeCidade: nomeCidade, uf: uf };
    return this.http.post<MunicipioResponseDTO>(`${this.apiUrl}/verificar-ou-cadastrar`, payload);
  }
}