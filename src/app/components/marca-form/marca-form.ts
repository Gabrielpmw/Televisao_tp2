import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  styleUrl: './marca-form.css' // (Pode usar o mesmo CSS do fornecedor-form)
})
export class MarcaFormComponent implements OnInit {

  marcaForm: FormGroup;
  formTitle: string = 'Nova Marca';
  isEditMode: boolean = false;
  marcaId: number | null = null;

  // 3. Array para guardar os fabricantes do dropdown
  fabricantes: Fabricante[] = []; 

  constructor(
    private fb: FormBuilder,
    private marcaService: MarcaService,
    private fabricanteService: FabricanteService, // 4. Injete o FabricanteService
    private router: Router,
    private route: ActivatedRoute
  ) {
    // 5. O formulário DEVE espelhar o MarcaRequestDTO
    this.marcaForm = this.fb.group({
      nomeMarca: ['', Validators.required],
      descricao: [''],
      idFabricante: [null, Validators.required] // O dropdown vai controlar este ID
    });
  }

  ngOnInit(): void {
    // 6. Carrega os fabricantes para o dropdown PRIMEIRO
    this.carregarFabricantes();

    // 7. Lógica "Editar" vs "Novo" (idêntica ao seu molde)
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.marcaId = +idParam;
      this.formTitle = 'Editar Marca';

      // Busca a marca e preenche o form
      this.marcaService.getById(this.marcaId).subscribe(marca => {
        this.preencherFormulario(marca);
      });

    } else {
      this.isEditMode = false;
      this.formTitle = 'Nova Marca';
    }
  }

  /**
   * NOVO MÉTODO: Carrega a lista de fabricantes para o select
   */
  carregarFabricantes(): void {
    // 8. Chame o seu novo método de service (que chama o /todos)
    // (Assumindo que você criou 'getAllFabricantes()' no service)
    this.fabricanteService.getAllFabricantes().subscribe(data => {
      this.fabricantes = data;
    });
  }

  /**
   * NOVO MÉTODO: Preenche o formulário com dados da marca (Modo Editar)
   */
  preencherFormulario(marca: Marca): void {
    // 9. Mapeia o DTO de Resposta (Marca) para o formulário (MarcaRequest)
    this.marcaForm.patchValue({
      nomeMarca: marca.marca, // O DTO de resposta envia 'marca'
      descricao: marca.descricao,
      idFabricante: marca.idFabricante // O DTO de resposta envia 'idFabricante'
    });
  }

  /**
   * Salva o formulário (lógica idêntica ao seu molde)
   */
  salvar(): void {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      return;
    }

    // 10. O valor do form JÁ É um MarcaRequest, pronto para enviar
    const request: MarcaRequest = this.marcaForm.value;

    if (this.isEditMode && this.marcaId) {
      this.marcaService.update(this.marcaId, request).subscribe({
        next: () => {
          this.router.navigate(['/marcas']);
        },
        error: (err: any) => {
          console.error('Erro ao ATUALIZAR marca', err);
        }
      });
    } else {
      this.marcaService.create(request).subscribe({
        next: () => {
          this.router.navigate(['/marcas']);
        },
        error: (err: any) => {
          console.error('Erro ao CRIAR marca', err);
        }
      });
    }
  }

  /**
   * Cancela e volta para a lista (lógica idêntica ao seu molde)
   */
  cancelar(): void {
    this.router.navigate(['/marcas']);
  }
}