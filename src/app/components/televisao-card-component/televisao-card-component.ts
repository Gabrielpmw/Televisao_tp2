import { Component, Input, Output, EventEmitter } from '@angular/core'; // 1. Importa Output e EventEmitter
import { Televisao } from '../../model/televisao.model';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip'; 

@Component({
  selector: 'app-televisao-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule 
  ],
  templateUrl: './televisao-card-component.html',
  styleUrls: ['./televisao-card-component.css']
})
export class TelevisaoCardComponent {

  @Input() televisao!: Televisao;

  @Output() edit = new EventEmitter<Televisao>();
  @Output() delete = new EventEmitter<Televisao>();

  public defaultImageUrl: string = '.\\tv.jpg';

  constructor() { }

  onAddToCart() {
    console.log(`Produto ID ${this.televisao.idTelevisao} adicionado ao carrinho.`);
  }

  onBuyNow() {
    console.log(`Iniciando compra do produto ID ${this.televisao.idTelevisao}.`);
  }

  onEdit() {
    this.edit.emit(this.televisao);
  }

  onDelete() {
    this.delete.emit(this.televisao);
  }
}