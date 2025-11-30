import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service.service';
// Garante que o interceptor seja exportado para ser importado no app.config.ts
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized / 403 Forbidden: Problemas de autenticação/autorização
      if (error.status === 401 || error.status === 403) {
        console.warn('Erro de Autorização (401/403). Limpando sessão e redirecionando.');
        
        // limpa sessão
        authService.logout();

        const currentUrl = router.url;

        // Evita redirecionar em loop se já estiver em /login
        if (!currentUrl.startsWith('/login')) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: currentUrl },
          });
        }
      }
      // 5xx - erro de servidor
      else if (error.status >= 500) {
        console.error('Erro no servidor (5xx):', error);
        // Aqui você poderia exibir uma notificação de erro genérica de servidor
      }
      // 0 - erro de rede / CORS / servidor fora
      else if (error.status === 0) {
        console.error('Erro de rede ou servidor indisponível:', error);
        // Aqui você poderia exibir uma mensagem informando que o backend está fora
      }
      // 4xx genéricos (400, 404, 422, etc.)
      else if (error.status >= 400) {
        console.warn('Erro de requisição (4xx):', error);
        // Apenas registra, deixando o componente tratar o erro específico
      }

      // Repropaga o erro para o método (service/componente) que fez a chamada HTTP
      return throwError(() => error);
    })
  );
};