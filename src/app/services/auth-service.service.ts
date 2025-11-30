import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LocalStorageServiceService } from './local-storage-service.service';
import { Usuario, LoginDTO } from '../model/usuario.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { jwtDecode } from 'jwt-decode';
import { CarrinhoService } from './carrinho.service'; // <--- 1. IMPORTAÇÃO NOVA

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
    private jwtHelper: JwtHelperService,
    private carrinhoService: CarrinhoService // <--- 2. INJEÇÃO DO CARRINHO
  ) {
    this.initUsuarioLogado();
  }

  private initUsuarioLogado() {
    const usuario = this.localStorageService.getItem(this.usuarioLogadoKey);
    if (usuario) {
      this.usuarioLogadoSubject.next(usuario as Usuario);
      
      // <--- 3. RECUPERA CARRINHO AO DAR F5 (ATUALIZAR PÁGINA) ---
      const usuarioObj = usuario as Usuario;
      if (usuarioObj.id) {
        this.carrinhoService.identificarUsuario(usuarioObj.id);
      }
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

          // <--- 4. CARREGA O CARRINHO ESPECÍFICO DESTE USUÁRIO ---
          if (usuarioLogado.id) {
            this.carrinhoService.identificarUsuario(usuarioLogado.id);
          }
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
    // <--- 5. LIMPA O CARRINHO DA MEMÓRIA AO SAIR ---
    // Isso impede que outro usuário veja os itens deste usuário no mesmo PC
    this.carrinhoService.limparSessao();

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

  /**
   * Verifica se o token decodificado contém o role requerido no campo 'groups'.
   */
  hasRole(requiredRole: 'adm' | 'cliente'): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const userRoles: string[] = decoded['groups'] || [];
      return userRoles.includes(requiredRole);

    } catch (error) {
      console.error("Erro ao decodificar token para verificar role:", error);
      return false;
    }
  }

  getUsuarioLogadoSync(): Usuario | null {
    return this.usuarioLogadoSubject.value;
  }
}