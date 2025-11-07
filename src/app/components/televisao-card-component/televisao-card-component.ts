import { Component, Input } from '@angular/core';
import { Televisao } from '../../model/televisao.model'; // Ajuste o caminho se necessário

// IMPORTS NECESSÁRIOS
import { CommonModule } from '@angular/common'; // Para *ngIf, | currency
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
// O MatIconModule foi REMOVIDO

@Component({
  selector: 'app-televisao-card', // <-- Verifique se este é o seletor correto
  standalone: true,
  // MatIconModule FOI REMOVIDO DAQUI
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './televisao-card-component.html',
  styleUrls: ['./televisao-card-component.css']
})
export class TelevisaoCardComponent { 

  @Input() televisao!: Televisao;

  public defaultImageUrl: string = './lula.jpg';

  constructor() { }

  onAddToCart() {
    // Corrigido para usar o 'idTelevisao' que definimos no modelo
    console.log(`Produto ID ${this.televisao.idTelevisao} adicionado ao carrinho.`);
  }

  onBuyNow() {
    // Corrigido para usar o 'idTelevisao' que definimos no modelo
    console.log(`Iniciando compra do produto ID ${this.televisao.idTelevisao}.`);
  }
}