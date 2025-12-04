import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators, 
  AbstractControl, 
  ValidationErrors, 
  ValidatorFn 
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // 💡 Importação do MatSnackBar


// Ajuste os caminhos dos imports conforme sua estrutura de pastas
import { UsuarioService } from '../../services/usuarioservice.service'; 
import { AuthService } from '../../services/auth-service.service';     
import { DadosPessoaisDTO } from '../../model/usuario.model';
import { Telefone } from '../../model/telefone.model';

@Component({
  selector: 'app-dados-pessoais',
  standalone: true,
  // 💡 Adicionando MatSnackBarModule nas importações
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule], 
  templateUrl: './dados-pessoais.html',
  styleUrls: ['./dados-pessoais.css']
})
export class DadosPessoaisComponent implements OnInit {

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar); // 💡 INJEÇÃO DO SNACK BAR

  // Definição do Formulário com Validações Reforçadas
  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    sobrenome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    
    // Validação Customizada para Telefone (Tamanho e Tipo)
    telefone: ['', [this.telefoneValidator()]], 
    
    email: ['', [Validators.required, Validators.email]],
    
    // Validação Customizada para Data (Não pode ser futuro)
    dataNascimento: ['', [Validators.required, this.dataPassadaValidator()]],
    
    // Validação Customizada para CPF (Exatamente 11 números)
    cpf: ['', [Validators.required, this.cpfValidator()]]
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
      error: (err) => console.error('Erro ao carregar dados', err)
    });
  }

  // 💡 NOVO MÉTODO PARA EXIBIR SNACK BAR (Copiado do Cadastro)
  exibirSnackBar(mensagem: string, classe: string) {
    this.snackBar.open(mensagem, 'FECHAR', {
      duration: 5000, // 5 segundos
      panelClass: [classe],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  // --- MÉTODOS DE FORMATAÇÃO ---

  formatarTelefone(event: any) {
    let valor = event.target.value.replace(/\D/g, ""); 
    if (valor.length > 11) valor = valor.slice(0, 11); 

    if (valor.length > 2) valor = `(${valor.slice(0,2)}) ${valor.slice(2)}`;
    if (valor.length > 10) valor = `${valor.slice(0,9)}-${valor.slice(9)}`;
    else if (valor.length > 6) valor = `${valor.slice(0,8)}-${valor.slice(8)}`;
    
    this.form.get('telefone')?.setValue(valor, { emitEvent: false });
  }

  formatarCpf(event: any) {
    let valor = event.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length > 9) valor = `${valor.slice(0,3)}.${valor.slice(3,6)}.${valor.slice(6,9)}-${valor.slice(9)}`;
    else if (valor.length > 6) valor = `${valor.slice(0,3)}.${valor.slice(3,6)}.${valor.slice(6)}`;
    else if (valor.length > 3) valor = `${valor.slice(0,3)}.${valor.slice(3)}`;

    this.form.get('cpf')?.setValue(valor, { emitEvent: false });
  }

  // --- VALIDADORES PERSONALIZADOS ---

  // Valida se tem 11 dígitos numéricos
  cpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // Deixa o Validators.required lidar com vazio
      
      const numbers = value.replace(/\D/g, ''); // Remove formatação para contar só números
      return numbers.length === 11 ? null : { cpfInvalido: true };
    };
  }

  // Valida se tem 10 ou 11 dígitos numéricos
  telefoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const numbers = value.replace(/\D/g, '');
      // Aceita Fixo (10) ou Celular (11)
      return (numbers.length === 10 || numbers.length === 11) ? null : { telefoneInvalido: true };
    };
  }

  // Valida se a data não é futura
  dataPassadaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Cria datas considerando o timezone local para evitar erros de "ontem"
      const dataInput = new Date(value + 'T00:00:00'); 
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      
      return dataInput > hoje ? { dataFutura: true } : null;
    };
  }

  // --- ENVIO ---

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirSnackBar('Corrija os erros de validação no formulário.', 'snackbar-admin-error');
      return;
    }

    const formValues = this.form.getRawValue();
    
    let telefoneObj: Telefone | undefined;
    const telString = formValues.telefone ? formValues.telefone.replace(/\D/g, "") : "";

    if (telString.length >= 10) {
        telefoneObj = {
            ddd: telString.substring(0, 2),
            numero: telString.substring(2)
        } as Telefone; 
    }

    const dadosParaEnviar: DadosPessoaisDTO = {
        nome: formValues.nome,
        sobrenome: formValues.sobrenome,
        email: formValues.email,
        dataNascimento: formValues.dataNascimento,
        // Remove pontuação do CPF antes de enviar
        cpf: formValues.cpf ? formValues.cpf.replace(/\D/g, "") : "",
        telefoneRequestDTO: telefoneObj 
    } as any;

    this.usuarioService.updateDadosPessoais(this.usuarioId, dadosParaEnviar).subscribe({
      next: () => {
        // 💡 SUCESSO: Usa o Snack Bar verde
        this.exibirSnackBar('Dados atualizados com sucesso!', 'snackbar-success');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao atualizar:', err);
        let mensagemErro = 'Erro ao atualizar dados. Verifique as informações.';
        
        if (err.error && err.error.message) {
             mensagemErro = err.error.message; 
        }

        // 💡 ERRO: Usa o Snack Bar vermelho
        this.exibirSnackBar(mensagemErro, 'snackbar-admin-error');
      }
    });
  }
}