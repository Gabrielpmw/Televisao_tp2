import { Component, signal, HostListener, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { AuthService } from '../../../services/auth-service.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cabecalho.html',
  styleUrls: ['./cabecalho.css']
})
export class Cabecalho implements OnInit {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  isProfileOpen = signal(false);
  usuarioLogado: any = null;

  @ViewChild('menuContainer') menuContainer!: ElementRef;

  ngOnInit(): void {
    this.authService.getUsuarioLogado().subscribe(user => {
      // LOG DE DEBUG: Veja no console do navegador o que aparece aqui ao carregar a página
      console.log('Cabecalho - Usuário carregado:', user);
      this.usuarioLogado = user;
    });
  }

  toggleProfile() {
    this.isProfileOpen.update(v => !v);
  }

  // --- ALTERADO: Função de ação (Click) ao invés de apenas retornar string ---
  navegarParaPerfil() {
    this.isProfileOpen.set(false);

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    // 1. Tenta extrair o texto do perfil
    let perfilNome = '';

    // Verifica se é objeto (devido ao @JsonFormat) e pega a propriedade 'nome' ou 'NOME'
    if (this.usuarioLogado.perfil && typeof this.usuarioLogado.perfil === 'object') {
      // O Java geralmente serializa getNOME() como "nome" (minúsculo) ou "NOME"
      perfilNome = this.usuarioLogado.perfil.nome || this.usuarioLogado.perfil.NOME || '';
    } 
    // Caso o Java mude e mande string direta no futuro
    else if (typeof this.usuarioLogado.perfil === 'string') {
      perfilNome = this.usuarioLogado.perfil;
    }

    // 2. Normaliza (remove espaços e põe em minúsculo)
    perfilNome = perfilNome.trim().toLowerCase();

    console.log('Perfil detectado (String):', perfilNome);

    // 3. Verificação
    if (perfilNome === 'adm') {
      this.router.navigate(['/perfil-admin']);
    } else {
      this.router.navigate(['/perfil']);
    }
  }

  logout() {
    this.authService.logout();
    this.isProfileOpen.set(false);
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isProfileOpen() && this.menuContainer) {
      if (!this.menuContainer.nativeElement.contains(event.target)) {
        this.isProfileOpen.set(false);
      }
    }
  }
}