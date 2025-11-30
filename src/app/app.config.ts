import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { FormsModule } from '@angular/forms';

// Importe seus interceptors
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // --- CONFIGURAÇÃO CORRETA DO HTTP ---
    // Apenas UMA chamada para provideHttpClient, incluindo AMBOS os interceptors
    provideHttpClient(
      withInterceptors([
        authInterceptor, // Ordem 1: Anexa o token na requisição de SAÍDA
        errorInterceptor // Ordem 2: Trata erros 401/403 na resposta de ENTRADA
      ])
    ),
    // ------------------------------------

    // Provedores necessários para o JWT
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: {} },
    
    // Importa o FormsModule
    importProvidersFrom(FormsModule),
  ],
};