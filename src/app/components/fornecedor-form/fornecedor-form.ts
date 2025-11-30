import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common'; // <-- Incluindo Location

import { Fornecedor } from '../../model/fornecedor.model';
import { Telefone } from '../../model/telefone.model';
import { FornecedorService } from '../../services/fornecedor-service.service';

@Component({
  selector: 'app-fornecedor-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './fornecedor-form.html',
  styleUrl: './fornecedor-form.css'
})
export class FornecedorFormComponent implements OnInit {

  fornecedorForm: FormGroup;
  novoTelefoneControl = new FormControl('', [Validators.required, Validators.minLength(10)]);

  formTitle: string = 'Novo Fornecedor';

  isEditMode: boolean = false;
  fornecedorId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location // <-- Injetando Location
  ) {
    this.fornecedorForm = this.fb.group({
      razaoSocial: ['', Validators.required],
      cnpj: ['', Validators.required],
      status: [true, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefones: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.fornecedorId = +idParam;
      this.formTitle = 'Editar Fornecedor';

      this.fornecedorService.getFornecedorById(this.fornecedorId).subscribe(fornecedor => {
        this.preencherFormulario(fornecedor);
      });

    } else {
      this.isEditMode = false;
      this.formTitle = 'Novo Fornecedor';
    }
  }

  preencherFormulario(fornecedor: Fornecedor): void {
    this.fornecedorForm.patchValue({
      razaoSocial: fornecedor.razaoSocial,
      cnpj: fornecedor.cnpj,
      status: fornecedor.status,
      email: fornecedor.email
    });

    this.telefones.clear();

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

  get telefones(): FormArray {
    return this.fornecedorForm.get('telefones') as FormArray;
  }

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

  removerTelefone(index: number): void {
    this.telefones.removeAt(index);
  }

  salvar(): void {
    if (this.fornecedorForm.invalid) {
      this.fornecedorForm.markAllAsTouched();
      return;
    }

    if (this.telefones.length === 0) {
      this.novoTelefoneControl.setErrors({ 'required': true });
      return;
    }

    const fornecedorData: Fornecedor = this.fornecedorForm.value;

    if (this.isEditMode && this.fornecedorId) {
      this.fornecedorService.atualizar(this.fornecedorId, fornecedorData).subscribe({
        next: () => {
          // CORREÇÃO 1: Após salvar, navega para a rota ADM da lista
          this.router.navigate(['/perfil-admin/fornecedores']);
        },
        error: (err: any) => {
          console.error('Erro ao ATUALIZAR fornecedor', err);
        }
      });
    } else {
      this.fornecedorService.incluir(fornecedorData).subscribe({
        next: () => {
          // CORREÇÃO 1: Após criar, navega para a rota ADM da lista
          this.router.navigate(['/perfil-admin/fornecedores']);
        },
        error: (err: any) => {
          console.error('Erro ao CRIAR fornecedor', err);
        }
      });
    }
  }

  // CORREÇÃO 2: Usa Location.back() para o botão Voltar/Cancelar
  cancelar(): void {
    this.location.back();
  }
}