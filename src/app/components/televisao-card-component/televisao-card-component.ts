import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { Televisao } from '../../model/televisao.model';
import { TelevisaoService } from '../../services/televisao-service'; 
import { CarrinhoService } from '../../services/carrinho.service'; 

@Component({
  selector: 'app-televisao-card',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './televisao-card-component.html',
  styleUrls: ['./televisao-card-component.css']
})
export class TelevisaoCardComponent {

  @Input() televisao!: Televisao;

  public defaultImageUrl: string = '/tv.jpg'; 

  private carrinhoService = inject(CarrinhoService);
  private router = inject(Router);

  constructor(private televisaoService: TelevisaoService) { } 

  getImagemUrl(): string {
    if (this.televisao.nomeImagem) { 
      return this.televisaoService.getUrlImagem(this.televisao.nomeImagem);
    }
    return this.defaultImageUrl; 
  }

  // --- MÉTODOS DE COMPRA ---

  // Adiciona ao carrinho e permanece na página (SEM FEEDBACK VISÍVEL)
  onAddToCart() {
    if (this.televisao.estoque <= 0) {
      alert("Produto indisponível no momento."); // Mantemos o alerta de ERRO
      return;
    }
    this.carrinhoService.adicionar(this.televisao);
    // REMOVIDO: alert(`Produto adicionado ao carrinho!`); 
    // O item será adicionado silenciosamente ao carrinho
  }

  // Adiciona e vai direto para o checkout
  onBuyNow() {
    if (this.televisao.estoque <= 0) {
      alert("Produto indisponível no momento.");
      return;
    }
    this.carrinhoService.adicionar(this.televisao);
    this.router.navigate(['/carrinho']);
  }
}