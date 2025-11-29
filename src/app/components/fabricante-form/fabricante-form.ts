import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { CommonModule } from '@angular/common';

import { Fabricante } from '../../model/fabricante.model';
import { Telefone } from '../../model/telefone.model'; 
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
  novoTelefoneControl = new FormControl('', [Validators.required, Validators.minLength(10)]); 
  
  formTitle: string = 'Novo Fabricante'; 

  isEditMode: boolean = false;
  fabricanteId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private fabricanteService: FabricanteService,
    private router: Router,
    private route: ActivatedRoute 
  ) {
    this.fabricanteForm = this.fb.group({
      razaoSocial: ['', Validators.required],
      cnpj: ['', Validators.required],
      status: [true, Validators.required],
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

      this.fabricanteService.getFabricanteById(this.fabricanteId).subscribe(fabricante => {
        this.preencherFormulario(fabricante);
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
      status: fabricante.status,
      dataAbertura: fabricante.dataAbertura, // Use o nome do seu model/form
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

  // Getter para o FormArray (sem mudanças)
  get telefones(): FormArray {
    return this.fabricanteForm.get('telefones') as FormArray;
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
    if (this.fabricanteForm.invalid) {
      this.fabricanteForm.markAllAsTouched();
      return;
    }
    
    if (this.telefones.length === 0) {
      this.novoTelefoneControl.setErrors({ 'required': true });
      return;
    }

    const fabricanteData: Fabricante = this.fabricanteForm.value;

    if (this.isEditMode && this.fabricanteId) {
      this.fabricanteService.atualizar(this.fabricanteId, fabricanteData).subscribe({
        next: () => {
          this.router.navigate(['/fabricantes']);
        },
        error: (err) => {
          console.error('Erro ao ATUALIZAR fabricante', err);
        }
      });
    } else {
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

  cancelar(): void {
    this.router.navigate(['/fabricantes']);
  }
}