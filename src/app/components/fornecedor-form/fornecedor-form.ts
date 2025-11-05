import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Fornecedor } from '../../model/fornecedor.model';
import { Telefone } from '../../model/telefone.model';
import { FornecedorService } from '../../services/fornecedor-service.service';

@Component({
  selector: 'app-fornecedor-form', // MUDANÇA
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './fornecedor-form.html', // (Você precisará criar este HTML)
  styleUrl: './fornecedor-form.css' // (Você pode reusar o CSS do fabricante)
})
export class FornecedorFormComponent implements OnInit { // MUDANÇA: Nome da classe

  fornecedorForm: FormGroup; // MUDANÇA
  novoTelefoneControl = new FormControl('', [Validators.required, Validators.minLength(10)]); 
  
  formTitle: string = 'Novo Fornecedor'; // MUDANÇA

  isEditMode: boolean = false;
  fornecedorId: number | null = null; // MUDANÇA

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService, // MUDANÇA
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.fornecedorForm = this.fb.group({ // MUDANÇA
      razaoSocial: ['', Validators.required],
      cnpj: ['', Validators.required],
      status: [true, Validators.required],
      // 2. MUDANÇA: Campos específicos do Fornecedor
      email: ['', [Validators.required, Validators.email]], 
      telefones: this.fb.array([]) 
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      // --- MODO DE EDIÇÃO ---
      this.isEditMode = true;
      this.fornecedorId = +idParam; // MUDANÇA
      this.formTitle = 'Editar Fornecedor'; // MUDANÇA

      // MUDANÇA: Chamar o service de fornecedor
      this.fornecedorService.getFornecedorById(this.fornecedorId).subscribe(fornecedor => {
        this.preencherFormulario(fornecedor); // MUDANÇA
      });

    } else {
      // --- MODO DE CRIAÇÃO ---
      this.isEditMode = false;
      this.formTitle = 'Novo Fornecedor'; // MUDANÇA
    }
  }

  // 3. MUDANÇA: Método adaptado para o model Fornecedor
  preencherFormulario(fornecedor: Fornecedor): void {
    // 1. Preencha os campos simples
    this.fornecedorForm.patchValue({ // MUDANÇA
      razaoSocial: fornecedor.razaoSocial,
      cnpj: fornecedor.cnpj,
      status: fornecedor.status,
      email: fornecedor.email // Campo específico
    });

    // 2. Limpe o FormArray
    this.telefones.clear();

    // 3. Preencha a lista de telefones
    if (fornecedor.telefones) {
      fornecedor.telefones.forEach(tel => {
        this.telefones.push(
          this.fb.group({
            id: [tel.id],
            ddd: [tel.ddd, Validators.required],
            numero: [tel.numero, Validators.required]
          })
        );
      });
    }
  }

  // Getter para o FormArray
  get telefones(): FormArray {
    return this.fornecedorForm.get('telefones') as FormArray; // MUDANÇA
  }

  // Método para adicionar telefone (Idêntico)
  adicionarTelefone(): void {
    if (this.novoTelefoneControl.invalid) {
      this.novoTelefoneControl.markAsTouched();
      return;
    }

    const telString = this.novoTelefoneControl.value!.replace(/\D/g, '');
    const ddd = telString.substring(0, 2);
    const numero = telString.substring(2);

    if (numero.length < 8) {
      this.novoTelefoneControl.setErrors({ 'minLength': true });
      return;
    }

    this.telefones.push(
      this.fb.group({
        id: [null], 
        ddd: [ddd, Validators.required],
        numero: [numero, Validators.required]
      })
    );

    this.novoTelefoneControl.reset();
  }

  // Método para remover telefone (Idêntico)
  removerTelefone(index: number): void {
    this.telefones.removeAt(index);
  }

  // 4. MUDANÇA: Método 'salvar()' adaptado
  salvar(): void {
    if (this.fornecedorForm.invalid) { // MUDANÇA
      this.fornecedorForm.markAllAsTouched(); // MUDANÇA
      return;
    }
    
    if (this.telefones.length === 0) {
      this.novoTelefoneControl.setErrors({ 'required': true });
      return;
    }

    const fornecedorData: Fornecedor = this.fornecedorForm.value; // MUDANÇA

    if (this.isEditMode && this.fornecedorId) {
      // --- LÓGICA DE ATUALIZAÇÃO ---
      this.fornecedorService.atualizar(this.fornecedorId, fornecedorData).subscribe({ // MUDANÇA
        next: () => {
          this.router.navigate(['/fornecedores']); // MUDANÇA
        },
        error: (err: any) => {
          console.error('Erro ao ATUALIZAR fornecedor', err); // MUDANÇA
        }
      });
    } else {
      // --- LÓGICA DE CRIAÇÃO ---
      this.fornecedorService.incluir(fornecedorData).subscribe({ // MUDANÇA
        next: () => {
          this.router.navigate(['/fornecedores']); // MUDANÇA
        },
        error: (err: any) => {
          console.error('Erro ao CRIAR fornecedor', err); // MUDANÇA
        }
      });
    }
  }

  // 5. MUDANÇA: Método cancelar
  cancelar(): void {
    this.router.navigate(['/fornecedores']); // MUDANÇA
  }
}