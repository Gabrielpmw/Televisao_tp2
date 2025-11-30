import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
/**
 * Guard de Autorização para verificar se o usuário tem um ou mais roles específicos.
 *
 * Ele é aplicado nas rotas DEPOIS do authGuard para garantir que o token é válido
 * antes de verificar as permissões.
 *
 * Uso nas rotas:
 * { path: 'adm', canActivate: [authGuard, roleGuard(['adm'])] }
 */
export const roleGuard = (requiredRoles: ('adm' | 'cliente')[]): CanActivateFn => {
  
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // O authGuard (que verifica login/expiração) deve vir ANTES nas rotas,
    // então aqui podemos assumir que o token existe.

    // 1. Verifica se o usuário possui pelo menos UM dos roles requeridos
    const isAuthorized = requiredRoles.some(role => authService.hasRole(role));

    if (isAuthorized) {
      return true; // Acesso permitido
    } else {
      // 2. Se não for autorizado (ex: cliente tentando acessar adm), 
      // redireciona para uma área neutra (o root, que vai para /planos).
      console.warn(`Acesso negado. Usuário logado não possui o role necessário: ${requiredRoles.join(', ')}`);
      
      // Redireciona para a rota raiz
      return router.createUrlTree(['/']); 
    }
  };
};