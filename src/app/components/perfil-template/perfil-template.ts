import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService

 } from '../../services/auth-service.service';
@Component({
  selector: 'app-perfil-template',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil-template.html',
  styleUrls: ['./perfil-template.css']
})
export class PerfilTemplate {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getNomeUsuario(): string {
    const usuario = localStorage.getItem('usuario_logado');
    if (usuario) {
      const userObj = JSON.parse(usuario);
      return userObj.username || userObj.nome || 'Cliente'; 
    }
    return 'Visitante';
  }

  getInicial(): string {
    const nome = this.getNomeUsuario();
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }
}