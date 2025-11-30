import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';
import { UsuarioService } from '../../services/usuarioservice.service';
import { UpdateCredenciaisDTO } from '../../model/usuario.model';

@Component({
  selector: 'app-gerenciar-credenciais',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-credenciais.html',
  styleUrls: ['./gerenciar-credenciais.css']
})
export class GerenciarCredenciaisComponent implements OnInit {

  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  // Variáveis do formulário
  usernameAntigo: string = ''; 
  senhaAntiga: string = '';
  
  novoUsername: string = '';
  novaSenha: string = '';
  confirmacaoNovaSenha: string = '';

  mensagemErro: string = '';
  processando: boolean = false;

  ngOnInit(): void {
    const usuarioLogado = this.authService.getUsuarioLogadoSync();
    
    if (usuarioLogado) {
      this.usernameAntigo = usuarioLogado.username;
      // Inicia o "novo" igual ao atual para facilitar caso ele mude só a senha
      this.novoUsername = usuarioLogado.username; 
    }
  }

  salvarAlteracoes(): void {
    this.mensagemErro = '';

    // 1. Validações de Front-end
    if (!this.senhaAntiga || !this.novaSenha) {
      this.mensagemErro = 'Preencha as senhas obrigatórias.';
      return;
    }

    if (this.novaSenha !== this.confirmacaoNovaSenha) {
      this.mensagemErro = 'A confirmação da nova senha não confere.';
      return;
    }

    if (this.senhaAntiga === this.novaSenha) {
      this.mensagemErro = 'A nova senha deve ser diferente da atual.';
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
        alert('Credenciais atualizadas com sucesso! Por segurança, faça login novamente.');
        
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.processando = false;
        // Tenta pegar a mensagem amigável do backend
        this.mensagemErro = err.error?.message || 'Erro ao atualizar credenciais.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/']); // Ou para /perfil, dependendo da sua rota anterior
  }
}