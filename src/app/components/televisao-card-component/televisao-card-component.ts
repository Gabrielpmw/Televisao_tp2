import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Televisao } from '../../model/televisao.model';
import { TelevisaoService } from '../../services/televisao-service'; 

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

  // Estado local para o coração
  isFavorito: boolean = false;

  public defaultImageUrl: string = '/tv.jpg'; 

  constructor(private televisaoService: TelevisaoService) { }

  getImagemUrl(): string {
    if (this.televisao.nomeImagem) { 
      return this.televisaoService.getUrlImagem(this.televisao.nomeImagem);
    }
    return this.defaultImageUrl; 
  }

  // Função para alternar a cor do coração
  toggleFavorito() {
    this.isFavorito = !this.isFavorito;
  }

  onAddToCart() {
    console.log(`Adicionando ao carrinho: ${this.televisao.modelo}`);
  }

  onBuyNow() {
    console.log(`Comprar agora: ${this.televisao.modelo}`);
  }
}