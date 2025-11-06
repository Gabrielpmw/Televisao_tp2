import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Modelo, ModeloResponse } from '../../model/modelo.model';
import { ModeloService } from '../../services/modelo-service.service';
import { Marca } from '../../model/marca.model';
import { MarcaService } from '../../services/marca-service.service';
import { CaracteristicasGerais } from '../../model/caracteristicas-gerais.model';
import { CaracteristicasGeraisService } from '../../services/caracteristica-service.service';
/* 
import { Modelo, ModeloResponse } from '../../models/modelo.model';
import { ModeloService } from '../../services/modelo.service';

import { Marca } from '../../models/marca.model';
import { MarcaService } from '../../services/marca.service';
import { CaracteristicasGerais } from '../../models/caracteristicas-gerais.model';
import { CaracteristicasGeraisService } from '../../services/caracteristicas-gerais.service'; */

@Component({
  selector: 'app-modelo-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './modelo-form.html',
  styleUrl: './modelo-form.css'
})
export class ModeloFormComponent implements OnInit {

  modeloForm: FormGroup;
  formTitle: string = 'Novo Modelo';
  isEditMode: boolean = false;
  modeloId: number | null = null;

  // Arrays para os dropdowns (Tipos Corretos)
  marcas: Marca[] = [];
  caracteristicas: CaracteristicasGerais[] = [];

  constructor(
    private fb: FormBuilder,
    private modeloService: ModeloService,
    private marcaService: MarcaService,
    private caracteristicasGeraisService: CaracteristicasGeraisService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // O formulário DEVE espelhar o Modelo (Request)
    this.modeloForm = this.fb.group({
      modelo: ['', Validators.required],
      mesesGarantia: [null, [Validators.required, Validators.min(0)]],
      anoLancamento: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      idMarca: [null, Validators.required],
      idCaracteristicas: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarMarcas();
    this.carregarCaracteristicas();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.modeloId = +idParam;
      this.formTitle = 'Editar Modelo';

      this.modeloService.getById(this.modeloId).subscribe(modelo => {
        this.preencherFormulario(modelo);
      });

    } else {
      this.isEditMode = false;
      this.formTitle = 'Novo Modelo';
    }
  }

  carregarMarcas(): void {
    this.marcaService.getAllForDropdown().subscribe(data => {
      this.marcas = data;
    });
  }

  carregarCaracteristicas(): void {
    this.caracteristicasGeraisService.getAllForDropdown().subscribe(data => {
      this.caracteristicas = data;
    });
  }

  preencherFormulario(modelo: ModeloResponse): void {
    // Esta função já estava correta
    this.modeloForm.patchValue({
      modelo: modelo.modelo,
      mesesGarantia: modelo.mesesGarantia,
      anoLancamento: modelo.anoLancamento,
      idCaracteristicas: modelo.caracteristicasResponseDTO?.id || null,
      idMarca: modelo.idMarca || null
    });
  }

  salvar(): void {
    if (this.modeloForm.invalid) {
      this.modeloForm.markAllAsTouched();
      return;
    }

    // 3. --- CORREÇÃO AQUI ---
    // O valor do formulário é do tipo 'Modelo' (o Request)
    // e não 'ModeloRequest' (que não existe mais nos imports).
    const request: Modelo = this.modeloForm.value;

    if (this.isEditMode && this.modeloId) {
      // O 'modeloService.update' espera 'Modelo' (Request)
      this.modeloService.update(this.modeloId, request).subscribe({
        next: () => {
          this.router.navigate(['/modelos']);
        },
        error: (err: any) => {
          console.error('Erro ao ATUALIZAR modelo', err);
        }
      });
    } else {
      // O 'modeloService.create' espera 'Modelo' (Request)
      this.modeloService.create(request).subscribe({
        next: () => {
          this.router.navigate(['/modelos']);
        },
        error: (err: any) => {
          console.error('Erro ao CRIAR modelo', err);
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/modelos']);
  }
}