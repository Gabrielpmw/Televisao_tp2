import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // NOVO: Importe ActivatedRoute
import { CommonModule } from '@angular/common';

import { Fabricante } from '../../model/fabricante.model';
import { Telefone } from '../../model/telefone.model'; // NOVO: Precisamos do model Telefone
import { FabricanteService } from '../../services/fabricante-service';


@Component({
  selector: 'app-fabricante-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './fabricante-form.html', // (Ajuste o nome se necessário)
  styleUrl: './fabricante-form.css' // (Ajuste o nome se necessário)
})
export class FabricanteForm implements OnInit {

  fabricanteForm: FormGroup;
  novoTelefoneControl = new FormControl('', [Validators.required, Validators.minLength(10)]); 
  
  formTitle: string = 'Novo Fabricante'; // O título agora é dinâmico

  // NOVO: Variáveis para controlar o modo (Criar vs Editar)
  isEditMode: boolean = false;
  fabricanteId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private fabricanteService: FabricanteService,
    private router: Router,
    private route: ActivatedRoute // NOVO: Injete o ActivatedRoute
  ) {
    // A inicialização do formulário permanece a mesma
    this.fabricanteForm = this.fb.group({
      razaoSocial: ['', Validators.required],
      cnpj: ['', Validators.required],
      status: [true, Validators.required],
      // NOVO: Use o nome 'dataAbertura' que já corrigimos
      dataAbertura: ['', Validators.required], 
      paisSede: ['', Validators.required],
      telefones: this.fb.array([]) 
    });
  }

  // NOVO: A lógica principal de inicialização foi movida para ngOnInit
  ngOnInit(): void {
    // Verifique se existe um 'id' na URL
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      // --- MODO DE EDIÇÃO ---
      this.isEditMode = true;
      this.fabricanteId = +idParam; // O '+' converte a string da URL para number
      this.formTitle = 'Editar Fabricante'; // Muda o título

      // Chame o service para buscar o fabricante
      this.fabricanteService.getFabricanteById(this.fabricanteId).subscribe(fabricante => {
        // Preencha o formulário com os dados recebidos
        this.preencherFormulario(fabricante);
      });

    } else {
      // --- MODO DE CRIAÇÃO ---
      this.isEditMode = false;
      this.formTitle = 'Novo Fabricante';
    }
  }

  // NOVO: Método para preencher o formulário com dados existentes
  preencherFormulario(fabricante: Fabricante): void {
    // 1. Preencha os campos simples
    this.fabricanteForm.patchValue({
      razaoSocial: fabricante.razaoSocial,
      cnpj: fabricante.cnpj,
      status: fabricante.status,
      dataAbertura: fabricante.dataAbertura, // Use o nome do seu model/form
      paisSede: fabricante.paisSede
    });

    // 2. Limpe o FormArray (caso tenha algo)
    this.telefones.clear();

    // 3. Preencha a lista de telefones (o FormArray)
    if (fabricante.telefones) {
      fabricante.telefones.forEach(tel => {
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

  // Getter para o FormArray (sem mudanças)
  get telefones(): FormArray {
    return this.fabricanteForm.get('telefones') as FormArray;
  }

  // Método para adicionar telefone (sem mudanças)
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

  // Método para remover telefone (sem mudanças)
  removerTelefone(index: number): void {
    this.telefones.removeAt(index);
  }

  // NOVO: Método 'salvar()' atualizado para decidir entre Criar ou Atualizar
  salvar(): void {
    if (this.fabricanteForm.invalid) {
      this.fabricanteForm.markAllAsTouched();
      return;
    }
    
    if (this.telefones.length === 0) {
      this.novoTelefoneControl.setErrors({ 'required': true });
      return;
    }

    // O objeto de dados é o mesmo
    const fabricanteData: Fabricante = this.fabricanteForm.value;

    if (this.isEditMode && this.fabricanteId) {
      // --- LÓGICA DE ATUALIZAÇÃO ---
      // Use o service 'updateFabricante' que já criamos
      this.fabricanteService.atualizar(this.fabricanteId, fabricanteData).subscribe({
        next: () => {
          this.router.navigate(['/fabricantes']);
        },
        error: (err) => {
          console.error('Erro ao ATUALIZAR fabricante', err);
        }
      });
    } else {
      // --- LÓGICA DE CRIAÇÃO (existente) ---
      this.fabricanteService.incluir(fabricanteData).subscribe({
        next: () => {
          this.router.navigate(['/fabricantes']);
        },
        error: (err) => {
          console.error('Erro ao CRIAR fabricante', err);
        }
      });
    }
  }

  // Método cancelar (sem mudanças)
  cancelar(): void {
    this.router.navigate(['/fabricantes']);
  }
}