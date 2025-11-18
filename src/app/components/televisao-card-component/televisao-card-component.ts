import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Televisao } from '../../model/televisao.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip'; 
// 1. Importe o seu serviço de televisão
import { TelevisaoService } from '../../services/televisao-service'; 

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

  constructor(private televisaoService: TelevisaoService) { }

  getImagemUrl(): string {
    if (this.televisao.nomeImagem) { 
      return this.televisaoService.getUrlImagem(this.televisao.nomeImagem);
    }
    return this.defaultImageUrl; 
  }

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