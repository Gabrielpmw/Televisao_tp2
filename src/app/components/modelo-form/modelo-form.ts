import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common'; 

// Ajuste os caminhos dos imports conforme sua estrutura
import { Modelo, ModeloResponse } from '../../model/modelo.model';
import { ModeloService } from '../../services/modelo-service.service';
import { Marca } from '../../model/marca.model';
import { MarcaService } from '../../services/marca-service.service';
import { CaracteristicasGerais } from '../../model/caracteristicas-gerais.model';
import { CaracteristicasGeraisService } from '../../services/caracteristica-service.service';

@Component({
  selector: 'app-modelo-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './modelo-form.html',
  styleUrl: './modelo-form.css' // Corrigido para styleUrls (plural) ou styleUrl (singular no Angular 17+)
})
export class ModeloFormComponent implements OnInit {
  
  // Injeção de dependências (estilo moderno do Angular)
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  
  private modeloService = inject(ModeloService);
  private marcaService = inject(MarcaService);
  private caracteristicasService = inject(CaracteristicasGeraisService);

  modeloForm: FormGroup;
  formTitle: string = 'Novo Modelo';
  isEditMode: boolean = false;
  modeloId: number | null = null;

  marcas: Marca[] = []; 
  caracteristicas: CaracteristicasGerais[] = []; 

  constructor() {
    this.modeloForm = this.fb.group({
      modelo: ['', Validators.required],
      mesesGarantia: [null, [Validators.required, Validators.min(0)]],
      // Validação básica para garantir que venha algo. O type="date" no HTML cuida do formato.
      anoLancamento: ['', [Validators.required]], 
      idMarca: [null, Validators.required],
      idCaracteristicas: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    // Carrega as listas para os Selects
    this.carregarMarcas();
    this.carregarCaracteristicas();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.modeloId = +idParam;
      this.formTitle = 'Editar Modelo';

      this.modeloService.getById(this.modeloId).subscribe({
        next: (modelo) => this.preencherFormulario(modelo),
        error: (err) => console.error('Erro ao carregar modelo para edição', err)
      });
    } else {
      this.isEditMode = false;
      this.formTitle = 'Novo Modelo';
    }
  }

  carregarMarcas(): void {
    this.marcaService.getAllForDropdown().subscribe({
      next: (data) => this.marcas = data,
      error: (err) => console.error('Erro ao carregar marcas', err)
    });
  }

  carregarCaracteristicas(): void {
    this.caracteristicasService.getAllForDropdown().subscribe({
      next: (data) => this.caracteristicas = data,
      error: (err) => console.error('Erro ao carregar características', err)
    });
  }

  preencherFormulario(modelo: ModeloResponse): void {
    // LÓGICA IMPORTANTE: 
    // O backend pode retornar o objeto completo (ex: marca: {id: 1, nome: 'LG'})
    // Mas o formulário espera apenas o ID (idMarca: 1).
    
    this.modeloForm.patchValue({
      modelo: modelo.modelo,
      mesesGarantia: modelo.mesesGarantia,
      anoLancamento: modelo.anoLancamento,
      
      // Tenta pegar o ID do objeto aninhado. Se não existir, tenta pegar o campo direto.
      idMarca: modelo.marca?.id || modelo.idMarca, 
      idCaracteristicas: modelo.caracteristicasResponseDTO?.id
    });
  }

  salvar(): void {
    if (this.modeloForm.invalid) {
      this.modeloForm.markAllAsTouched();
      return;
    }

    const request: Modelo = this.modeloForm.value;

    if (this.isEditMode && this.modeloId) {
      this.modeloService.update(this.modeloId, request).subscribe({
        next: () => {
          // Navega de volta para a lista ADMIN
          this.router.navigate(['/perfil-admin/modelos']);
        },
        error: (err) => console.error('Erro ao ATUALIZAR modelo', err)
      });
    } else {
      this.modeloService.create(request).subscribe({
        next: () => {
          // Navega de volta para a lista ADMIN
          this.router.navigate(['/perfil-admin/modelos']);
        },
        error: (err) => console.error('Erro ao CRIAR modelo', err)
      });
    }
  }

  cancelar(): void {
    this.location.back(); 
  }
}