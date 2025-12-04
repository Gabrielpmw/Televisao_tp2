import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// 💡 Importações do Angular Material Snack Bar
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AuthService } from '../../services/auth-service.service';
import { UsuarioService } from '../../services/usuarioservice.service';
import { UpdateCredenciaisDTO } from '../../model/usuario.model';

@Component({
  selector: 'app-gerenciar-credenciais',
  standalone: true,
  // 💡 Adicionando MatSnackBarModule nas importações
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatSnackBarModule,
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule
  ],
  templateUrl: './gerenciar-credenciais.html',
  styleUrls: ['./gerenciar-credenciais.css']
})
export class GerenciarCredenciaisComponent implements OnInit {

  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar); // 💡 INJEÇÃO DO SNACK BAR

  // Variáveis do formulário
  usernameAntigo: string = ''; 
  senhaAntiga: string = '';
  
  novoUsername: string = '';
  novaSenha: string = '';
  confirmacaoNovaSenha: string = '';

  processando: boolean = false;

  ngOnInit(): void {
    const usuarioLogado = this.authService.getUsuarioLogadoSync();
    
    if (usuarioLogado) {
      this.usernameAntigo = usuarioLogado.username;
      // Inicia o "novo" igual ao atual para facilitar caso ele mude só a senha
      this.novoUsername = usuarioLogado.username; 
    }
  }

  // 💡 MÉTODO PARA EXIBIR SNACK BAR
  exibirSnackBar(mensagem: string, classe: string) {
    this.snackBar.open(mensagem, 'FECHAR', {
      duration: 5000, // 5 segundos
      panelClass: [classe],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  salvarAlteracoes(): void {

    // 1. Validações de Front-end
    if (!this.senhaAntiga || !this.novaSenha) {
      this.exibirSnackBar('Preencha as senhas obrigatórias.', 'snackbar-admin-error');
      return;
    }

    if (this.novaSenha !== this.confirmacaoNovaSenha) {
      this.exibirSnackBar('A confirmação da nova senha não confere.', 'snackbar-admin-error');
      return;
    }

    if (this.senhaAntiga === this.novaSenha) {
      this.exibirSnackBar('A nova senha deve ser diferente da atual.', 'snackbar-admin-error');
      return;
    }

    // 2. Monta o DTO
    const dto: UpdateCredenciaisDTO = {
      usernameAntigo: this.usernameAntigo,
      senhaAntiga: this.senhaAntiga,
      novoUsername: this.novoUsername,
      novaSenha: this.novaSenha
    };

    this.processando = true;

    // 3. Envia para o Service
    this.usuarioService.atualizarCredenciais(dto).subscribe({
      next: () => {
        // 💡 SUCESSO: Usa o Snack Bar verde
        this.exibirSnackBar('Credenciais atualizadas com sucesso! Por segurança, faça login novamente.', 'snackbar-success');
        
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.processando = false;
        
        // Tenta pegar a mensagem amigável do backend
        const backendMessage = err.error?.message || 'Erro ao atualizar credenciais.';
        
        // 💡 Erro: Usa o Snack Bar vermelho
        this.exibirSnackBar(backendMessage, 'snackbar-admin-error');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/']); // Ou para /perfil, dependendo da sua rota anterior
  }
}