import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common'; // Inclui Location
import { Observable } from 'rxjs';

// Importe seus Modelos e Serviços
import { Marca, MarcaRequest } from '../../model/marca.model';
import { ModeloResponse, Modelo } from '../../model/modelo.model'; 
import { ModeloService } from '../../services/modelo-service.service';
import { CaracteristicasGerais } from '../../model/caracteristicas-gerais.model';
import { CaracteristicasGeraisService } from '../../services/caracteristica-service.service'; 
import { MarcaService } from '../../services/marca-service.service';

@Component({
  selector: 'app-modelo-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './modelo-form.html', 
  styleUrls: ['./modelo-form.css'] 
})
export class ModeloFormComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location); // Injeta o serviço Location
  private modeloService = inject(ModeloService);
  private marcaService = inject(MarcaService);
  private caracteristicasGeraisService = inject(CaracteristicasGeraisService);

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
      // Mantendo o padrão de data do seu HTML (YYYY-MM-DD)
      anoLancamento: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]], 
      idMarca: [null, Validators.required],
      idCaracteristicas: [null, Validators.required],
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

    // A conversão deve ser para o ModeloRequest se o DTO for diferente do Modelo (request)
    const request: Modelo = this.modeloForm.value;

    if (this.isEditMode && this.modeloId) {
      this.modeloService.update(this.modeloId, request).subscribe({
        next: () => {
          console.log('Modelo atualizado com sucesso!');
          // CORREÇÃO 1: Após salvar, navega para a rota ADM da lista
          this.router.navigate(['/perfil-admin/modelos']);
        },
        error: (err: any) => {
          console.error('Erro ao ATUALIZAR modelo', err);
        }
      });
    } else {
      this.modeloService.create(request).subscribe({
        next: () => {
          console.log('Modelo criado com sucesso!');
          // CORREÇÃO 1: Após criar, navega para a rota ADM da lista
          this.router.navigate(['/perfil-admin/modelos']);
        },
        error: (err: any) => {
          console.error('Erro ao CRIAR modelo', err);
        }
      });
    }
  }

  // --- CORREÇÃO 2: MÉTODO CANCELAR USA LOCATION.BACK() ---
  cancelar(): void {
    // Volta para a página anterior no histórico, que deve ser a lista de Modelos.
    this.location.back(); 
  }
}