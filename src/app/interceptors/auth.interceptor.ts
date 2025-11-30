import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service.service';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Não enviar token para a requisição de login (que é quem está buscando o token)
  if (req.url.includes('/auth')) {
    return next(req);
  }

  // 2. Não enviar se o token não existe ou está expirado.
  // (A lógica de 'isTokenExpired' é mais segura que apenas verificar a existência)
  if (!token || authService.isTokenExpired()) {
    return next(req);
  }

  // 3. Se passou pelas exclusões, clona e adiciona o cabeçalho
  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(cloned);
};