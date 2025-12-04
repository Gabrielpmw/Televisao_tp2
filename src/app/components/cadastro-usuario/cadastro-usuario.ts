import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Importações do Angular Material
import { MatSnackBar } from '@angular/material/snack-bar'; // Importe o MatSnackBar
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { UsuarioService } from '../../services/usuarioservice.service';
import { UsuarioCadastroDTO } from '../../model/usuario.model';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  // Adicione os módulos do Material aqui, se necessário, ou no módulo principal
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule
  ],
  templateUrl: './cadastro-usuario.html',
  styleUrls: ['./cadastro-usuario.css']
})
export class CadastroUsuario {
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar); // 💡 INJEÇÃO DO SNACK BAR

  isLoading = false;

  cadastroForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    // Ajuste o minLength para 11 (sem pontos) ou 14 (com pontos) se não for numérico puro
    cpf: ['', [Validators.required, Validators.minLength(11)]], 
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  isFieldInvalid(field: string): boolean {
    const formControl = this.cadastroForm.get(field);
    return !!(formControl && formControl.invalid && (formControl.dirty || formControl.touched));
  }

  formatarCpf(event: any) {
    let valor = event.target.value.replace(/\D/g, ""); 
    
    if (valor.length > 11) valor = valor.slice(0, 11); 

    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
    this.cadastroForm.get('cpf')?.setValue(valor, { emitEvent: false });
  }

  // 💡 NOVO MÉTODO PARA EXIBIR SNACK BAR
  exibirSnackBar(mensagem: string, classe: string) {
    this.snackBar.open(mensagem, 'FECHAR', {
      duration: 5000, // 5 segundos
      panelClass: [classe],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  onSubmit() {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Remove formatação do CPF para enviar apenas números
    const cpfLimpo = this.cadastroForm.get('cpf')?.value.replace(/\D/g, "") || '';

    const dto: UsuarioCadastroDTO = {
      username: this.cadastroForm.get('username')?.value, 
      cpf: cpfLimpo, 
      senha: this.cadastroForm.get('senha')?.value
    };

    this.usuarioService.insert(dto).subscribe({
      next: (usuarioCriado) => {
        this.isLoading = false;
        console.log('Usuário criado com sucesso:', usuarioCriado);
        
        // 💡 SUCESSO: Usa o Snack Bar verde
        this.exibirSnackBar('Usuário cadastrado com sucesso!', 'snackbar-success');
        
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erro ao cadastrar:', err);
        
        let mensagemErro = 'Erro ao criar conta. Tente novamente.';
        
        if (err.status === 409) { 
          mensagemErro = 'Este CPF ou Username já está em uso.';
        } else if (err.error && err.error.message) {
          mensagemErro = err.error.message; 
        }

        // 💡 ERRO: Usa o Snack Bar vermelho
        this.exibirSnackBar(mensagemErro, 'snackbar-admin-error');
      }
    });
  }

  voltar() {
    this.router.navigate(['/login']);
  }
}