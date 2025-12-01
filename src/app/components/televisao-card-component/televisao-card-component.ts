import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 

// 1. IMPORTAÇÕES DO ANGULAR MATERIAL E AUTH
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth-service.service';

import { Televisao } from '../../model/televisao.model';
import { TelevisaoService } from '../../services/televisao-service'; 
import { CarrinhoService } from '../../services/carrinho.service'; 

@Component({
  selector: 'app-televisao-card',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule // <--- MÓDULO DO SNACK BAR ADICIONADO
  ],
  templateUrl: './televisao-card-component.html',
  styleUrls: ['./televisao-card-component.css']
})
export class TelevisaoCardComponent {

  @Input() televisao!: Televisao;

  public defaultImageUrl: string = '/tv.jpg'; 

  private carrinhoService = inject(CarrinhoService);
  private router = inject(Router);
  
  // 2. NOVAS INJEÇÕES
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  constructor(private televisaoService: TelevisaoService) { } 

  // 3. MÉTODO AUXILIAR PARA O SNACK BAR DE ERRO
  openAdminBlockedSnackBar(message: string): void {
    this.snackBar.open(message, 'FECHAR', {
      duration: 5000, 
      horizontalPosition: 'center', 
      verticalPosition: 'top', // Aparece no topo para chamar atenção
      panelClass: ['snackbar-admin-error'] // Classe CSS personalizada
    });
  }

  getImagemUrl(): string {
    if (this.televisao.nomeImagem) { 
      return this.televisaoService.getUrlImagem(this.televisao.nomeImagem);
    }
    return this.defaultImageUrl; 
  }

  // --- MÉTODOS DE COMPRA (COM BLOQUEIO DE ADMIN) ---

  onAddToCart() {
    // 🔒 VERIFICAÇÃO DE ADMIN
    if (this.authService.hasRole('adm')) {
      this.openAdminBlockedSnackBar('Ação bloqueada: Administradores não podem adicionar itens ao carrinho.');
      return;
    }

    if (this.televisao.estoque <= 0) {
      this.snackBar.open("Produto indisponível no momento.", "OK", { duration: 3000 });
      return;
    }

    this.carrinhoService.adicionar(this.televisao);
    
    // Feedback positivo para o cliente
    this.snackBar.open('Adicionado ao carrinho!', 'VER', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success'] // Opcional, se tiver estilo de sucesso
    }).onAction().subscribe(() => {
        this.router.navigate(['/carrinho']);
    });
  }

  onBuyNow() {
    // 🔒 VERIFICAÇÃO DE ADMIN
    if (this.authService.hasRole('adm')) {
      this.openAdminBlockedSnackBar('Ação bloqueada: Administradores não podem realizar compras.');
      return;
    }

    if (this.televisao.estoque <= 0) {
      this.snackBar.open("Produto indisponível no momento.", "OK", { duration: 3000 });
      return;
    }

    this.carrinhoService.adicionar(this.televisao);
    this.router.navigate(['/carrinho']);
  }
}