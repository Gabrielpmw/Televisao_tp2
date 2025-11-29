import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LocalStorageServiceService } from './local-storage-service.service';
import { Usuario, LoginDTO } from '../model/usuario.model';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseURL: string = 'http://localhost:8080/auth';
  private tokenKey = 'jwt_token';
  private usuarioLogadoKey = 'usuario_logado';

  private usuarioLogadoSubject = new BehaviorSubject<Usuario | null>(null);

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageServiceService,
    private jwtHelper: JwtHelperService
  ) {
    this.initUsuarioLogado();
  }

  private initUsuarioLogado() {
    const usuario = this.localStorageService.getItem(this.usuarioLogadoKey);
    if (usuario) {
      this.usuarioLogadoSubject.next(usuario as Usuario);
    }
  }

  login(dto: LoginDTO): Observable<HttpResponse<Usuario>> {

    const params = {
      username: dto.username,
      senha: dto.senha
    };

    return this.http.post<Usuario>(`${this.baseURL}`, params, { observe: 'response' }).pipe(
      tap((res: HttpResponse<Usuario>) => {
        const authToken = res.headers.get('Authorization') ?? '';
        if (authToken) {
          this.setToken(authToken);
        }

        const usuarioLogado = res.body;
        if (usuarioLogado) {
          this.setUsuarioLogado(usuarioLogado);
          this.usuarioLogadoSubject.next(usuarioLogado);
        }
      })
    );
  }

  setUsuarioLogado(usuario: Usuario): void {
    this.localStorageService.setItem(this.usuarioLogadoKey, usuario);
  }

  setToken(token: string): void {
    this.localStorageService.setItem(this.tokenKey, token);
  }

  getUsuarioLogado(): Observable<Usuario | null> {
    return this.usuarioLogadoSubject.asObservable();
  }

  getToken(): string | null {
    return this.localStorageService.getItem(this.tokenKey);
  }

  logout(): void {
    this.localStorageService.removeItem(this.tokenKey);
    this.localStorageService.removeItem(this.usuarioLogadoKey);
    this.usuarioLogadoSubject.next(null);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error("Token inválido", error);
      return true;
    }
  }
}