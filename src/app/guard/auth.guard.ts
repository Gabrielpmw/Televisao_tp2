import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
// Importa o AuthService que você acabou de compartilhar
import { AuthService } from '../services/auth-service.service'; // Ajuste o caminho se necessário
/**
 * Função auxiliar para encontrar a última rota filha (a 'folha')
 * na árvore de navegação, onde a configuração 'data' está.
 */
function getLeafRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  let leaf = route;

  while (leaf.firstChild) {
    leaf = leaf.firstChild;
  }

  return leaf;
}

/**
 * O Guard de Autenticação Funcional
 */
export const authGuard: CanActivateFn = (
  route,
  state
): boolean | UrlTree => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const snapshot = route as ActivatedRouteSnapshot;
  // 1. Obtém a rota filha mais profunda (a 'folha')
  const leaf = getLeafRoute(snapshot);

  // 2. Verifica se a rota foi marcada como pública
  const isPublic = leaf.data?.['public'] === true;

  if (isPublic) {
    // Permite acesso imediato para rotas públicas (ex: /login)
    return true;
  }

  // 3. Verifica o estado da autenticação
  const token = authService.getToken();
  // Se não houver token ou se estiver expirado
  const tokenExpired = !token || authService.isTokenExpired();

  if (tokenExpired) {
    // 4. Se falhar, desloga e redireciona para a tela de login
    authService.logout();

    // Redireciona para /login, salvando a URL que o usuário tentou acessar (state.url)
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // 5. Se o token for válido e a rota não for pública, permite acesso
  return true;
};