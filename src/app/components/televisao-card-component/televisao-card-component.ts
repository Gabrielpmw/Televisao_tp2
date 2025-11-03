import { Component, Input } from '@angular/core';
import { Televisao } from '../../model/televisao.model'; // Ajuste o caminho se necessário

// IMPORTS NECESSÁRIOS
import { CommonModule } from '@angular/common'; // Para *ngIf, | currency
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-televisao-card', // <-- Verifique se este é o seletor correto
  standalone: true,
  // ADICIONE ESTA LINHA 'imports'
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './televisao-card-component.html',
  styleUrls: ['./televisao-card-component.css']
})
export class TelevisaoCardComponent { // O nome da sua classe deve ser este

  @Input() televisao!: Televisao;

  public defaultImageUrl: string = './lula.jpg';

  constructor() { }

  // ADICIONE AS FUNÇÕES QUE FALTAVAM (o HTML estava chamando elas)
  onAddToCart() {
    console.log(`Produto ID ${this.televisao.id} adicionado ao carrinho.`);
  }

  onBuyNow() {
    console.log(`Iniciando compra do produto ID ${this.televisao.id}.`);
  }
}