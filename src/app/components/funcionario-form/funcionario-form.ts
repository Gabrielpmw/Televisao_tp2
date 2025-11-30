import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FuncionarioService } from '../../services/funcionario.service';
import { FuncionarioRequest, FuncionarioUpdateDadosDTO } from '../../model/Funcionario.model';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth-service.service';
import { Usuario } from '../../model/usuario.model';

@Component({
  selector: 'app-funcionario-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './funcionario-form.html',
  styleUrls: ['./funcionario-form.css']
})
export class FuncionarioForm implements OnInit {

  funcionarioForm!: FormGroup;
  isLoading = false;

  id!: number;
  modoEdicao = false;

  isSelf = false;
  usuarioLogado?: Usuario | null;

  constructor(
    public router: Router,
    private funcionarioService: FuncionarioService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.modoEdicao = !!this.id;

    this.authService.getUsuarioLogado().subscribe(u => this.usuarioLogado = u);

    this.initForm();

    if (this.modoEdicao) {
      this.carregarFuncionario();
    }
  }

  // =================================================================
  // 1. Inicialização do Formulário
  // =================================================================
  initForm() {

    this.funcionarioForm = new FormGroup({
      nome: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      cpf: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{11}$/)
      ]),
      sobrenome: new FormControl('', Validators.maxLength(100)),
      email: new FormControl('', [Validators.required, Validators.email]) // AGORA SEMPRE EXISTE
    });

    // -----------------------
    // CAMPOS EXCLUSIVOS NA CRIAÇÃO
    // -----------------------
    if (!this.modoEdicao) {

      this.funcionarioForm.addControl(
        'username',
        new FormControl('', [Validators.required, Validators.minLength(4)])
      );

      this.funcionarioForm.addControl(
        'senha',
        new FormControl('', [Validators.required, Validators.minLength(6)])
      );
    }

    // -----------------------
    // CAMPOS EXCLUSIVOS NA EDIÇÃO
    // -----------------------
    if (this.modoEdicao) {
      this.funcionarioForm.addControl(
        'senhaAtualAlvo',
        new FormControl('', Validators.required)
      );
    }
  }

  // =================================================================
  // 2. Carregar dados para edição
  // =================================================================
  carregarFuncionario() {
    this.funcionarioService.getById(this.id).subscribe({
      next: (func) => {

        this.funcionarioForm.patchValue({
          nome: func.nome,
          cpf: func.cpf,
          sobrenome: func.sobrenome,
          email: func.email   // <<=== PRINCIPAL MUDANÇA
        });

        // VERIFICA SE O FUNCIONÁRIO EDITADO É O USUÁRIO LOGADO
        const usernameFuncionario =
          (func as any).username ??
          (func as any).usuario?.username ??
          null;

        const usernameLogado = this.usuarioLogado?.username;

        if (!usernameLogado) {
          const token = this.authService.getToken();
          if (token) {
            try {
              const decoded: any = (window as any).jwtDecode?.(token);
              const possible = decoded?.sub ?? decoded?.upn ?? decoded?.preferred_username;
              if (possible) this.isSelf = (usernameFuncionario === possible);
            } catch { }
          }
        } else {
          this.isSelf = (usernameFuncionario === usernameLogado);
        }
      },

      error: (err) => {
        console.error('Erro ao carregar funcionário', err);
      }
    });
  }

  // =================================================================
  // 3. Submissão
  // =================================================================
  onSubmit() {
    this.funcionarioForm.markAllAsTouched();

    if (!this.funcionarioForm.valid) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    this.isLoading = true;

    if (this.modoEdicao) {
      this.atualizarFuncionario();
    } else {
      this.cadastrarFuncionario();
    }
  }

  // =================================================================
  // 4. Criar funcionário
  // =================================================================
  cadastrarFuncionario() {
    const dto: FuncionarioRequest = this.funcionarioForm.value;

    this.funcionarioService.create(dto).subscribe({
      next: () => {
        alert('Funcionário cadastrado com sucesso!');
        this.router.navigate(['/perfil-admin/funcionarios']);
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao cadastrar funcionário.');
      },
      complete: () => this.isLoading = false
    });
  }

  // =================================================================
  // 5. Atualizar funcionário
  // =================================================================
  atualizarFuncionario() {

    const dto: FuncionarioUpdateDadosDTO = {
      idFuncionario: this.id,
      nome: this.funcionarioForm.value.nome,
      cpf: this.funcionarioForm.value.cpf,
      sobrenome: this.funcionarioForm.value.sobrenome,
      email: this.funcionarioForm.value.email,
      senhaAtualAlvo: this.funcionarioForm.value.senhaAtualAlvo
    };

    this.funcionarioService.updateDadosComValidacao(dto).subscribe({
      next: () => {
        alert('Dados atualizados com sucesso!');
        this.router.navigate(['/perfil-admin/funcionarios']);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erro ao atualizar os dados.');
      },
      complete: () => this.isLoading = false
    });
  }

  get f() {
    return this.funcionarioForm.controls;
  }
}
