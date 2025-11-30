import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RedefinirSenhaRequestDTO } from '../../model/usuario.model';
import { UsuarioService } from '../../services/usuarioservice.service';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-senha.html',
  styleUrls: ['./recuperar-senha.css']
})
export class RecuperarSenhaComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  isLoading = false;

  recuperarForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    // Adicionamos a nova senha aqui para enviar ao backend
    novaSenha: ['', [Validators.required, Validators.minLength(6)]]
  });

  isFieldInvalid(field: string): boolean {
    const formControl = this.recuperarForm.get(field);
    return !!(formControl && formControl.invalid && (formControl.dirty || formControl.touched));
  }

  // Mesma lógica de máscara do cadastro
  formatarCpf(event: any) {
    let valor = event.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);

    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
    this.recuperarForm.get('cpf')?.setValue(valor, { emitEvent: false });
  }

  onSubmit() {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const dto: RedefinirSenhaRequestDTO = {
      username: this.recuperarForm.get('username')?.value,
      cpf: this.recuperarForm.get('cpf')?.value, // Se o backend esperar limpo, use .replace(/\D/g, "")
      novaSenha: this.recuperarForm.get('novaSenha')?.value
    };

    this.usuarioService.recuperarSenha(dto).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Senha redefinida com sucesso! Agora você pode fazer login.');
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erro ao recuperar senha:', err);
        
        let msg = 'Não foi possível redefinir a senha. Verifique os dados.';
        // Backend retornando 404 (Not Found) ou 400 (Bad Request)
        if (err.status === 404 || err.status === 400) {
          msg = 'Usuário não encontrado ou CPF incorreto.';
        }
        
        alert(msg);
      }
    });
  }

  voltar() {
    this.router.navigate(['/login']);
  }
}