import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';

// Interface para tipar os dados que o diálogo espera receber
export interface DialogData {
  titulo: string;
  mensagem: string;
  textoBotaoConfirmar?: string; // Opcional (padrão: 'Sim')
  textoBotaoCancelar?: string;  // Opcional (padrão: 'Não')
  corBotaoConfirmar?: 'primary' | 'warn' | 'accent'; // Opcional (padrão: 'primary')
}

@Component({
  selector: 'app-caixa-dialogo',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatDialogModule
  ],
  templateUrl: './caixa-dialogo.html',
  styleUrl: './caixa-dialogo.css'
})
export class CaixaDialogo {
  
  constructor(
    public dialogRef: MatDialogRef<CaixaDialogo>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNaoClick(): void {
    this.dialogRef.close(false);
  }
}