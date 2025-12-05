import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

import { Fabricante } from '../../model/fabricante.model';
import { FabricanteService } from '../../services/fabricante-service';

@Component({
  selector: 'app-fabricante-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './fabricante-form.html',
  styleUrl: './fabricante-form.css'
})
export class FabricanteForm implements OnInit {

  fabricanteForm: FormGroup;
  // Controle isolado para o input de adicionar telefone (não faz parte do grupo principal até ser adicionado)
  novoTelefoneControl = new FormControl('', [Validators.required, Validators.minLength(10)]);

  formTitle: string = 'Novo Fabricante';
  isEditMode: boolean = false;
  fabricanteId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private fabricanteService: FabricanteService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.fabricanteForm = this.fb.group({
      razaoSocial: ['', Validators.required],
      cnpj: ['', Validators.required],
      // Status removido propositalmente
      dataAbertura: ['', Validators.required],
      paisSede: ['', Validators.required],
      telefones: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.fabricanteId = +idParam;
      this.formTitle = 'Editar Fabricante';

      this.fabricanteService.getFabricanteById(this.fabricanteId).subscribe({
        next: (fabricante) => this.preencherFormulario(fabricante),
        error: (err) => console.error('Erro ao carregar fabricante', err)
      });
    } else {
      this.isEditMode = false;
      this.formTitle = 'Novo Fabricante';
    }
  }

  preencherFormulario(fabricante: Fabricante): void {
    this.fabricanteForm.patchValue({
      razaoSocial: fabricante.razaoSocial,
      cnpj: fabricante.cnpj,
      dataAbertura: fabricante.dataAbertura,
      paisSede: fabricante.paisSede
    });

    this.telefones.clear();

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

  // Getter para facilitar o acesso no HTML
  get telefones(): FormArray {
    return this.fabricanteForm.get('telefones') as FormArray;
  }

  adicionarTelefone(): void {
    if (this.novoTelefoneControl.invalid) {
      this.novoTelefoneControl.markAsTouched();
      return;
    }

    const telString = this.novoTelefoneControl.value!.replace(/\D/g, '');
    
    // Validação extra de segurança
    if (telString.length < 10) return;

    const ddd = telString.substring(0, 2);
    const numero = telString.substring(2);

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
    if (this.fabricanteForm.invalid) {
      this.fabricanteForm.markAllAsTouched();
      return;
    }

    // Validação customizada: Exigir pelo menos 1 telefone
    if (this.telefones.length === 0) {
      alert("É necessário cadastrar pelo menos um telefone.");
      return;
    }

    const fabricanteData: Fabricante = this.fabricanteForm.value;

    // Se estiver editando, mantemos o ID original e o Status original (se o backend precisar)
    // Se for novo, o backend define o Status padrão (Ativo)
    
    if (this.isEditMode && this.fabricanteId) {
      this.fabricanteService.atualizar(this.fabricanteId, fabricanteData).subscribe({
        next: () => this.router.navigate(['/perfil-admin/fabricantes']),
        error: () => alert('Erro ao atualizar fabricante.')
      });
    } else {
      this.fabricanteService.incluir(fabricanteData).subscribe({
        next: () => this.router.navigate(['/perfil-admin/fabricantes']),
        error: () => alert('Erro ao criar fabricante.')
      });
    }
  }

  cancelar(): void {
    this.location.back();
  }
}