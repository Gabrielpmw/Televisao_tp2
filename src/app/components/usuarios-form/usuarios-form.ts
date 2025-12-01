import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuarioservice.service';
import { 
  Usuario, 
  UsuarioCreateAdminDTO, 
  UsuarioUpdateDadosAdminDTO 
} from '../../model/usuario.model';
import { Telefone } from '../../model/telefone.model'; 

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './usuarios-form.html',
  styleUrl: './usuarios-form.css'
})
export class UsuarioForm implements OnInit {
  
  form: FormGroup;
  isEdicao: boolean = false;
  idUsuario: number | null = null;
  titulo: string = 'Novo Cliente';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      // Dados Pessoais
      nome: ['', [Validators.required, Validators.minLength(2)]],
      sobrenome: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
      email: ['', [Validators.email]], 
      dataNascimento: [''],
      
      // Telefone
      ddd: ['', [Validators.pattern(/^\d{2}$/)]],
      numero: ['', [Validators.pattern(/^\d{8,9}$/)]],

      // Credenciais (Apenas Criação)
      username: [''], 
      senha: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // --- MODO EDIÇÃO ---
      this.isEdicao = true;
      this.idUsuario = +id;
      this.titulo = 'Editar Cliente';
      this.carregarDados(this.idUsuario);
      
      // Remove validação de credenciais, pois edição de dados não mexe nisso
      this.form.get('username')?.clearValidators();
      this.form.get('username')?.updateValueAndValidity(); // Importante atualizar após limpar
      
      this.form.get('senha')?.clearValidators();
      this.form.get('senha')?.updateValueAndValidity(); // Importante atualizar após limpar
    } else {
      // --- MODO CRIAÇÃO ---
      this.titulo = 'Novo Cliente';
      this.form.get('username')?.setValidators([Validators.required]);
      this.form.get('senha')?.setValidators([Validators.required, Validators.minLength(4)]);
      // Não precisa updateValueAndValidity aqui pois é a inicialização
    }
  }

  carregarDados(id: number): void {
    this.usuarioService.findById(id).subscribe({
      next: (usuario: Usuario) => {
        this.form.patchValue({
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          cpf: usuario.cpf,
          email: usuario.email,
          dataNascimento: usuario.dataNascimento,
          // Verifica se o objeto telefone existe antes de tentar acessar propriedades
          ddd: usuario.telefone?.ddd || '',
          numero: usuario.telefone?.numero || ''
        });
      },
      error: (err) => {
        console.error('Erro ao carregar usuário', err);
        // Aqui você pode adicionar um Toast/Alert se desejar
        this.router.navigate(['/perfil-admin/usuarios']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const f = this.form.value;

    // Montagem do objeto Telefone
    // AJUSTE: Usamos objeto literal para evitar erro caso Telefone seja Interface
    let telefoneObj: Telefone | undefined = undefined;
    
    if (f.ddd && f.numero) {
      telefoneObj = {
        ddd: f.ddd,
        numero: f.numero
        // Se a interface Telefone tiver ID, ele é opcional na criação/update
      } as Telefone;
    }

    if (this.isEdicao && this.idUsuario) {
      
      // --- UPDATE (UsuarioUpdateDadosAdminDTO) ---
      const dto: UsuarioUpdateDadosAdminDTO = {
        nome: f.nome,
        sobrenome: f.sobrenome,
        cpf: f.cpf,
        email: f.email,
        dataNascimento: f.dataNascimento,
        telefone: telefoneObj
      };

      this.usuarioService.updateDadosByAdmin(this.idUsuario, dto).subscribe({
        next: () => {
          this.router.navigate(['/perfil-admin/usuarios']);
        },
        error: (err) => {
          console.error('Erro ao atualizar', err);
          alert('Erro ao atualizar usuário.'); 
        }
      });

    } else {
      
      // --- CREATE (UsuarioCreateAdminDTO) ---
      const dto: UsuarioCreateAdminDTO = {
        username: f.username,
        senha: f.senha,
        cpf: f.cpf,
        nome: f.nome,
        sobrenome: f.sobrenome,
        email: f.email,
        dataNascimento: f.dataNascimento,
        telefone: telefoneObj
      };

      this.usuarioService.createByAdmin(dto).subscribe({
        next: () => {
          this.router.navigate(['/perfil-admin/usuarios']);
        },
        error: (err) => {
          console.error('Erro ao criar', err);
          // Tratamento de erro simples
          if (err.status === 409 || err.error?.message?.includes('username')) {
             alert('Erro: Este Username ou CPF já está em uso.');
          } else {
             alert('Erro ao criar usuário.');
          }
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/perfil-admin/usuarios']);
  }
}