import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common'; // <-- Incluindo Location

import { Marca, MarcaRequest } from '../../model/marca.model';
import { MarcaService } from '../../services/marca-service.service';
import { Fabricante } from '../../model/fabricante.model';
import { FabricanteService } from '../../services/fabricante-service';

@Component({
  selector: 'app-marca-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './marca-form.html',
  styleUrl: './marca-form.css'
})
export class MarcaFormComponent implements OnInit {

  marcaForm: FormGroup;
  formTitle: string = 'Nova Marca';
  isEditMode: boolean = false;
  marcaId: number | null = null;

  fabricantes: Fabricante[] = [];

  constructor(
    private fb: FormBuilder,
    private marcaService: MarcaService,
    private fabricanteService: FabricanteService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location // <-- Injetando Location
  ) {
    this.marcaForm = this.fb.group({
      nomeMarca: ['', Validators.required],
      descricao: [''],
      idFabricante: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarFabricantes();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.marcaId = +idParam;
      this.formTitle = 'Editar Marca';

      this.marcaService.getById(this.marcaId).subscribe(marca => {
        this.preencherFormulario(marca);
      });

    } else {
      this.isEditMode = false;
      this.formTitle = 'Nova Marca';
    }
  }

  carregarFabricantes(): void {

    this.fabricanteService.getAllFabricantes().subscribe(data => {
      this.fabricantes = data;
    });
  }


  preencherFormulario(marca: Marca): void {
    this.marcaForm.patchValue({
      nomeMarca: marca.marca,
      descricao: marca.descricao,
      idFabricante: marca.idFabricante
    });
  }

  salvar(): void {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      return;
    }

    const request: MarcaRequest = this.marcaForm.value;

    if (this.isEditMode && this.marcaId) {
      this.marcaService.update(this.marcaId, request).subscribe({
        next: () => {
          // CORREÇÃO 1: Navega para a rota ADM da lista
          this.router.navigate(['/perfil-admin/marcas']);
        },
        error: (err: any) => {
          console.error('Erro ao ATUALIZAR marca', err);
        }
      });
    } else {
      this.marcaService.create(request).subscribe({
        next: () => {
          // CORREÇÃO 1: Navega para a rota ADM da lista
          this.router.navigate(['/perfil-admin/marcas']);
        },
        error: (err: any) => {
          console.error('Erro ao CRIAR marca', err);
        }
      });
    }
  }

  // CORREÇÃO 2: Usa Location.back() para o botão Voltar/Cancelar
  cancelar(): void {
    this.location.back();
  }
}