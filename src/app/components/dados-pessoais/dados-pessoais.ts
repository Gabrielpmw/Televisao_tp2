import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// Ajuste os caminhos dos imports conforme sua estrutura de pastas
import { UsuarioService } from '../../services/usuarioservice.service'; 
import { AuthService } from '../../services/auth-service.service';     
import { DadosPessoaisDTO } from '../../model/usuario.model';
import { Telefone } from '../../model/telefone.model';
@Component({
  selector: 'app-dados-pessoais',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dados-pessoais.html', // Ajustado para o nome do seu arquivo na imagem
  styleUrls: ['./dados-pessoais.css']   // Ajustado para o nome do seu arquivo na imagem
})
export class DadosPessoaisComponent implements OnInit { // <--- AQUI ERA O PROBLEMA

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  // Formulário sem o campo Gênero
  form: FormGroup = this.fb.group({
    nome: ['', [Validators.minLength(2), Validators.maxLength(60)]],
    sobrenome: ['', [Validators.minLength(2), Validators.maxLength(60)]],
    telefone: [''], 
    email: ['', [Validators.email]],
    dataNascimento: [''],
    cpf: [{value: '', disabled: true}]
  });

  usuarioId!: number;

  ngOnInit(): void {
    this.authService.getUsuarioLogado().subscribe(user => {
      if (user && user.id) {
        this.usuarioId = user.id;
        this.carregarDadosDoUsuario(this.usuarioId);
      }
    });
  }

  carregarDadosDoUsuario(id: number) {
    this.usuarioService.findById(id).subscribe({
      next: (dados: any) => {
        let telefoneVisual = '';
        
        if (dados.telefone && dados.telefone.ddd && dados.telefone.numero) {
           const ddd = dados.telefone.ddd;
           const num = dados.telefone.numero;
           telefoneVisual = `(${ddd}) ${num}`;
        }

        this.form.patchValue({
          nome: dados.nome,
          sobrenome: dados.sobrenome,
          telefone: telefoneVisual,
          email: dados.email,
          dataNascimento: dados.dataNascimento, 
          cpf: dados.cpf
        });
      },
      error: (err) => {
        console.error('Erro ao carregar dados', err);
      }
    });
  }

  formatarTelefone(event: any) {
    let valor = event.target.value.replace(/\D/g, ""); 
    
    if (valor.length > 11) valor = valor.slice(0, 11); 

    if (valor.length > 2) {
      valor = `(${valor.slice(0,2)}) ${valor.slice(2)}`;
    }
    if (valor.length > 10) {
       valor = `${valor.slice(0,9)}-${valor.slice(9)}`;
    } else if (valor.length > 6) {
       valor = `${valor.slice(0,8)}-${valor.slice(8)}`;
    }
    
    this.form.get('telefone')?.setValue(valor, { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValues = this.form.getRawValue();
    
    // Lógica de tratamento do telefone (Mantida igual)
    let telefoneObj: Telefone | undefined;
    const telString = formValues.telefone ? formValues.telefone.replace(/\D/g, "") : "";

    if (telString.length >= 10) {
        // DICA: Use sintaxe de objeto literal para evitar erro se Telefone for interface
        telefoneObj = {
            ddd: telString.substring(0, 2),
            numero: telString.substring(2)
        } as Telefone; 
    }

    // --- AQUI É A MUDANÇA PRINCIPAL ---
    const dadosParaEnviar: DadosPessoaisDTO = {
        nome: formValues.nome,
        sobrenome: formValues.sobrenome,
        email: formValues.email,
        dataNascimento: formValues.dataNascimento,
      
        telefoneRequestDTO: telefoneObj 
    };

    this.usuarioService.updateDadosPessoais(this.usuarioId, dadosParaEnviar).subscribe({
      next: () => {
        alert('Dados atualizados com sucesso!');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao atualizar:', err);
        alert('Erro ao atualizar dados. Verifique as informações.');
      }
    });
  }
}