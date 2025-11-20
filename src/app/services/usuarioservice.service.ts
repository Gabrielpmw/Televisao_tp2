import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCadastroDTO, RedefinirSenhaDTO, DadosPessoaisDTO } from '../model/usuario.model';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly API_URL = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient) { }

  insert(usuario: UsuarioCadastroDTO): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, usuario);
  }

  recuperarSenha(dto: RedefinirSenhaDTO): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/recuperar-senha`, dto);
  }

  updateDadosPessoais(id: number, dto: DadosPessoaisDTO): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/dados-pessoais`, dto);
  }

  findById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${id}/procurar-id`);
  }

  findAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL);
  }

  findByUsername(username: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${username}/buscar-username`);
  }
}