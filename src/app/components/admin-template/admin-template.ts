import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-admin-template',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-template.html',
  styleUrls: ['./admin-template.css']
})
export class AdminTemplate {
  
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Usamos 'usuarioLogado' para receber o objeto do AuthService de forma reativa
  usuarioLogado: any = {}; 

  constructor() {
    // Inscreve no Observable para pegar dados do usuário logado assim que disponíveis
    this.authService.getUsuarioLogado().subscribe(usuario => {
        // O operador 'getUsuarioLogado()' retorna o objeto do usuário (ou null)
        this.usuarioLogado = usuario || {};
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getNomeUsuario(): string {
    // Tenta usar o nome completo ou o username do objeto reativo
    return this.usuarioLogado?.nome || this.usuarioLogado?.username || 'ADM';
  }

  getInicial(): string {
    const nome = this.getNomeUsuario();
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }
}