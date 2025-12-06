// especificacao-televisao.ts

import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Televisao } from '../../model/televisao.model';
import { TelevisaoService } from '../../services/televisao-service';

@Component({
  selector: 'app-especificacao-televisao',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    CurrencyPipe
  ],
  templateUrl: './especificacao-televisao.html',
  styleUrl: './especificacao-televisao.css'
})
export class EspecificacaoTelevisao implements OnInit {

  // ----------------------------
  // ESTADOS E PROPRIEDADES
  // ----------------------------
  public tv!: Televisao;
  public nomeFabricante: string = 'N/A';
  public defaultImageUrl: string = '/tv.jpg';

  // ----------------------------
  // INJEÇÕES
  // ----------------------------
  private televisaoService = inject(TelevisaoService);

  constructor(
    public dialogRef: MatDialogRef<EspecificacaoTelevisao>,
    @Inject(MAT_DIALOG_DATA) public data: Televisao
  ) {
    this.tv = data;
  }

  // ----------------------------
  // CICLO DE VIDA
  // ----------------------------
  ngOnInit(): void {
    this.carregarNomeFabricante();
  }

  // ----------------------------
  // MÉTODOS
  // ----------------------------

  carregarNomeFabricante() {

    // 1️⃣ SE JÁ VEIO A MARCA NO OBJETO TV, USE ELA
    if (this.tv.marca) {
      this.nomeFabricante = this.tv.marca;
    }

    // 2️⃣ SE O SERVIÇO RETORNAR A MARCA DO MODELO, SUBSTITUI
    this.televisaoService.findModeloByTelevisaoId(this.tv.idTelevisao).subscribe({
      next: (response: any) => {

        // Ajustado para aceitar qualquer estrutura retornada
        const marca =
          response?.marca?.nomeMarca ??
          response?.marca?.marca ??
          this.tv.marca ??
          'N/A';

        this.nomeFabricante = marca;
      },
      error: () => {
        // Fallback caso a API dê erro
        this.nomeFabricante = this.tv.marca ?? 'N/A';
      }
    });
  }

  getImagemUrl(): string {
    return this.tv.nomeImagem
      ? this.televisaoService.getUrlImagem(this.tv.nomeImagem)
      : this.defaultImageUrl;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
