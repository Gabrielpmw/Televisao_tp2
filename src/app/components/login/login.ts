import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // 💡 Importação do MatSnackBar
import { MatButtonModule } from '@angular/material/button'; // Para botões (se for usar Material)
import { MatFormFieldModule } from '@angular/material/form-field'; // Para campos (se for usar Material)
import { MatInputModule } from '@angular/material/input'; // Para input (se for usar Material)


import { AuthService } from '../../services/auth-service.service';
import { LoginDTO } from '../../model/usuario.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    // Adicionando módulos do Material ao standalone component
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    // MatSnackBarModule (geralmente importado no módulo raiz ou compartilhado)
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginDTO: LoginDTO = new LoginDTO();
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar); // 💡 Injeção do MatSnackBar

  // 💡 Novo método para exibir o Snack Bar
  exibirSnackBar(mensagem: string, classe: string) {
    this.snackBar.open(mensagem, 'FECHAR', {
      duration: 5000, // 5 segundos
      panelClass: [classe],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }


  onSubmit(form: NgForm) {
    if (form.invalid) {
      // alert('Por favor, preencha o usuário e a senha.'); // Substituído
      this.exibirSnackBar('Por favor, preencha o usuário e a senha.', 'snackbar-admin-error');
      return;
    }

    console.log('Enviando para o backend:', this.loginDTO);

    this.authService.login(this.loginDTO).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido', response);

        // 💡 Sucesso: Usa o Snack Bar verde
        this.exibirSnackBar('Login realizado com sucesso!', 'snackbar-success');

        // Redireciona para a raiz ("Home")
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no login:', err);

        let mensagemErro = 'Ocorreu um erro inesperado no login. Tente novamente.';

        if (err.status === 403 || err.status === 401) {
          mensagemErro = 'Usuário ou senha inválidos.';
        }

        // 💡 Erro: Usa o Snack Bar vermelho
        this.exibirSnackBar(mensagemErro, 'snackbar-admin-error');
      }
    });
  }
}