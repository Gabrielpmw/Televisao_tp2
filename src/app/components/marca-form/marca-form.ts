import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

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
    private location: Location
  ) {
    // Mantemos 'nome' aqui para ficar bonito no HTML e no Angular
    this.marcaForm = this.fb.group({
      nome: ['', Validators.required], 
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

      this.marcaService.getById(this.marcaId).subscribe({
        next: (marca) => this.preencherFormulario(marca),
        error: (err) => console.error('Erro ao carregar marca', err)
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
    const fab = marca.fabricante as any;
    const idFab = (fab && fab.id) ? fab.id : fab; 

    this.marcaForm.patchValue({
      // Mapeamos 'marca' (do banco) para 'nome' (do formulário)
      nome: marca.marca, 
      descricao: marca.descricao,
      idFabricante: idFab
    });
  }

  salvar(): void {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      return;
    }

    // --- CORREÇÃO AQUI ---
    // Criamos o objeto manualmente para garantir que a chave enviada seja 'marca'
    // e não 'nome', pois o Java DTO espera 'marca'.
    const formValue = this.marcaForm.value;
    
    const request: MarcaRequest = {
      nomeMarca: formValue.nome, // <--- O segredo: pega do form 'nome' e joga em 'marca'
      descricao: formValue.descricao,
      idFabricante: formValue.idFabricante
    };

    if (this.isEditMode && this.marcaId) {
      this.marcaService.update(this.marcaId, request).subscribe({
        next: () => {
          this.router.navigate(['/perfil-admin/marcas']);
        },
        error: (err: any) => {
          console.error('Erro ao ATUALIZAR marca', err);
        }
      });
    } else {
      this.marcaService.create(request).subscribe({
        next: () => {
          this.router.navigate(['/perfil-admin/marcas']);
        },
        error: (err: any) => {
          console.error('Erro ao CRIAR marca', err);
        }
      });
    }
  }

  cancelar(): void {
    this.location.back();
  }
}