import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule, NgForm } from '@angular/forms'; 
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service.service'; // Confirme se o caminho está certo
import { LoginDTO } from '../../model/usuario.model'; // Confirme se o caminho está certo

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginDTO: LoginDTO = new LoginDTO();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      alert('Por favor, preencha o usuário e a senha.');
      return;
    }

    console.log('Enviando para o backend:', this.loginDTO);

    this.authService.login(this.loginDTO).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido', response);
        alert('Login realizado com sucesso!');
        
        // --- CORREÇÃO AQUI ---
        // Redireciona para a raiz ("Home")
        this.router.navigate(['/']); 
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro no login:', err);
        
        if (err.status === 403 || err.status === 401) { 
          alert('Usuário ou senha inválidos.');
        } else {
          alert('Ocorreu um erro inesperado no login. Tente novamente.');
        }
      }
    });
  }
}