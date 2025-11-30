import { Component, signal, HostListener, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { AuthService } from '../../../services/auth-service.service';
import { CarrinhoService } from '../../../services/carrinho.service';

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

  // === NOVO ===
  private carrinhoService = inject(CarrinhoService);
  quantidadeCarrinho = signal(0);

  isProfileOpen = signal(false);
  usuarioLogado: any = null;

  @ViewChild('menuContainer') menuContainer!: ElementRef;

  ngOnInit(): void {
    // Carrega usuário logado
    this.authService.getUsuarioLogado().subscribe(user => {
      console.log('Cabecalho - Usuário carregado:', user);
      this.usuarioLogado = user;
    });

    // === NOVO: Atualiza quantidade do carrinho ===
    this.carrinhoService.carrinho$.subscribe(itens => {
      const total = itens.reduce((acc, item) => acc + item.quantidade, 0);
      this.quantidadeCarrinho.set(total);
    });
  }

  toggleProfile() {
    this.isProfileOpen.update(v => !v);
  }

  navegarParaPerfil() {
    this.isProfileOpen.set(false);

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    let perfilNome = '';

    if (this.usuarioLogado.perfil && typeof this.usuarioLogado.perfil === 'object') {
      perfilNome = this.usuarioLogado.perfil.nome || this.usuarioLogado.perfil.NOME || '';
    } 
    else if (typeof this.usuarioLogado.perfil === 'string') {
      perfilNome = this.usuarioLogado.perfil;
    }

    perfilNome = perfilNome.trim().toLowerCase();
    console.log('Perfil detectado (String):', perfilNome);

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

  irParaCarrinho() {
    this.router.navigate(['/carrinho']);
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
