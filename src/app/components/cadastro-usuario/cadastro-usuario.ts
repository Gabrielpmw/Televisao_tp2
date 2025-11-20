import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UsuarioService } from '../../services/usuarioservice.service';
import { UsuarioCadastroDTO } from '../../model/usuario.model';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cadastro-usuario.html',
  styleUrls: ['./cadastro-usuario.css']
})
export class CadastroUsuario {
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  isLoading = false;

  cadastroForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
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

  onSubmit() {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const dto: UsuarioCadastroDTO = {
      username: this.cadastroForm.get('username')?.value, 
      cpf: this.cadastroForm.get('cpf')?.value, 
      senha: this.cadastroForm.get('senha')?.value
    };

    this.usuarioService.insert(dto).subscribe({
      next: (usuarioCriado) => {
        this.isLoading = false;
        console.log('Usuário criado com sucesso:', usuarioCriado);
        
        alert('Conta criada com sucesso! Você será redirecionado para o login.');
        
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

        alert(mensagemErro);
      }
    });
  }

  voltar() {
    this.router.navigate(['/login']);
  }
}