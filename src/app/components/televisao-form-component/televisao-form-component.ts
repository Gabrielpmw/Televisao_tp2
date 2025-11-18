import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

// A importação do modelo Televisao é necessária para pegar o ID de retorno
import { Televisao, TelevisaoRequest } from '../../model/televisao.model';
import { Marca } from '../../model/marca.model';
import { ModeloResponse } from '../../model/modelo.model';

import { TelevisaoService } from '../../services/televisao-service';
import { MarcaService } from '../../services/marca-service.service';
import { ModeloService } from '../../services/modelo-service.service';

interface EnumOption {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-televisao-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './televisao-form-component.html',
  styleUrl: './televisao-form-component.css'
})
export class TelevisaoFormComponent implements OnInit {

  televisaoForm: FormGroup;
  formTitle: string = 'Nova Televisão';
  isEditMode: boolean = false;
  televisaoId: number | null = null;

  marcas: Marca[] = [];
  modelosFiltrados: ModeloResponse[] = []; 
  tiposResolucao: EnumOption[] = [];
  tiposTela: EnumOption[] = [];

  // ===================================
  // NOVAS VARIÁVEIS PARA IMAGEM
  // ===================================
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  // ===================================

  constructor(
    private fb: FormBuilder,
    private televisaoService: TelevisaoService,
    private marcaService: MarcaService,
    private modeloService: ModeloService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.televisaoForm = this.fb.group({
      idMarca: [null, Validators.required],
      idModelo: [null, Validators.required],
      idTipoResolucao: [null, Validators.required], 
      idTipoTela: [null, Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      estoque: [null, [Validators.required, Validators.min(0)]],
      descricao: ['', Validators.required],
      altura: [null, [Validators.required, Validators.min(1)]],
      largura: [null, [Validators.required, Validators.min(1)]],
      polegada: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.carregarEnums();
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;

    if (this.isEditMode) {
      this.televisaoId = +idParam!;
      this.formTitle = 'Editar Televisão';
      this.carregarDadosParaEdicao();
    } else {
      this.formTitle = 'Nova Televisão';
      this.carregarDropdowns();
    }
    this.setupCascadingDropdown();
  }

  carregarEnums(): void {
    this.tiposResolucao = [
      { id: 1, nome: 'HD (1280 x 720)' },
      { id: 2, nome: 'Full HD (1920 x 1080)' },
      { id: 3, nome: '4K (3840 x 2160)' },
      { id: 4, nome: '8K (7680 x 4320)' }
    ];
    this.tiposTela = [
      { id: 1, nome: 'Led' },
      { id: 2, nome: 'Oled' },
      { id: 3, nome: 'Qled' },
      { id: 4, nome: 'LCD' },
      { id: 5, nome: 'Plasma' }
    ];
  }

  carregarDropdowns(callback?: () => void): void {
    this.marcaService.getAllForDropdown().subscribe(marcas => {
      this.marcas = marcas;
      console.log('Marcas carregadas:', this.marcas);
      if (callback) {
        callback();
      }
    });
  }

  carregarDadosParaEdicao(): void {
    this.televisaoService.findById(this.televisaoId!).subscribe(televisao => {
      console.log('TV para editar:', televisao);

      // ===================================
      // CARREGA O PREVIEW DA IMAGEM ATUAL
      // ===================================
      if (televisao.nomeImagem) {
        this.imagePreview = this.televisaoService.getUrlImagem(televisao.nomeImagem);
      }
      // ===================================

      this.carregarDropdowns(() => {
        console.log('Buscando modelos para a marca da TV (ID):', televisao.idMarca);

        this.modeloService.findByMarca(televisao.idMarca).subscribe(modelos => {
          this.modelosFiltrados = modelos;
          console.log('Modelos pré-carregados para edição:', modelos.length);

          this.televisaoForm.patchValue({
            idMarca: televisao.idMarca,
            idModelo: televisao.idModelo,
            idTipoResolucao: televisao.resolucao.id,
            idTipoTela: televisao.tipoTela.id,
            valor: televisao.valor,
            estoque: televisao.estoque,
            descricao: televisao.descricao,
            altura: televisao.dimensao.altura,
            largura: televisao.dimensao.comprimento, 
            polegada: televisao.dimensao.polegada
          });

          this.televisaoForm.get('idModelo')?.enable();
        });
      });
    });
  }

  setupCascadingDropdown(): void {
    const marcaControl = this.televisaoForm.get('idMarca');
    const modeloControl = this.televisaoForm.get('idModelo');

    if (!this.isEditMode) {
      modeloControl?.disable();
    }

    marcaControl?.valueChanges.subscribe((idMarcaSelecionada: any) => {
      modeloControl?.reset();
      const idNum = Number(idMarcaSelecionada);

      if (idNum) {
        console.log('Buscando modelos para a marca ID:', idNum);
        modeloControl?.enable(); 

        this.modeloService.findByMarca(idNum).subscribe(modelos => {
          this.modelosFiltrados = modelos;
          console.log('Modelos encontrados:', this.modelosFiltrados.length);
        });

      } else {
        modeloControl?.disable();
        this.modelosFiltrados = [];
      }
    });
  }

  // ===================================
  // MÉTODO PARA CAPTURAR O ARQUIVO
  // ===================================
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Gerar preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  // ===================================

  // ===================================
  // MÉTODO SALVAR (MODIFICADO)
  // ===================================
  salvar(): void {
    if (this.televisaoForm.invalid) {
      this.televisaoForm.markAllAsTouched();
      return;
    }

    const formValue = this.televisaoForm.value;

    const request: TelevisaoRequest = {
      idModelo: formValue.idModelo,
      idTipoResolucao: formValue.idTipoResolucao,
      idTipoTela: formValue.idTipoTela,
      valor: formValue.valor,
      estoque: formValue.estoque,
      descricao: formValue.descricao,
      altura: formValue.altura,
      largura: formValue.largura, 
      polegada: formValue.polegada
    };

    if (this.isEditMode && this.televisaoId) {
      // MODO EDIÇÃO
      this.televisaoService.update(this.televisaoId, request).subscribe({
        next: () => {
          // Se salvou os dados, verifica se tem imagem para enviar
          if (this.selectedFile) {
            this.uploadImagem(this.televisaoId!);
          } else {
            this.router.navigate(['/']); // Navega se não houver imagem
          }
        },
        error: (err: any) => {
          console.error('Erro ao ATUALIZAR televisão', err);
        }
      });
    } else {
      // MODO CRIAÇÃO
      // (Observe que agora capturamos 'novaTv' no next)
      this.televisaoService.create(request).subscribe({
        next: (novaTv: Televisao) => { // Captura a TV criada
          // Se criou a TV, verifica se tem imagem para enviar
          if (this.selectedFile) {
            this.uploadImagem(novaTv.idTelevisao); // Usa o ID da TV recém-criada
          } else {
            this.router.navigate(['/']); // Navega se não houver imagem
          }
        },
        error: (err: any) => {
          console.error('Erro ao CRIAR televisão', err);
        }
      });
    }
  }
  // ===================================

  // ===================================
  // MÉTODO AUXILIAR PARA UPLOAD
  // ===================================
  private uploadImagem(id: number): void {
    if (!this.selectedFile) {
      return; // Segurança, embora 'salvar' já verifique
    }

    this.televisaoService.uploadImagem(id, this.selectedFile).subscribe({
      next: () => {
        console.log('Imagem enviada com sucesso!');
        this.router.navigate(['/']); // Navega APÓS enviar a imagem
      },
      error: (err) => {
        console.error('Erro ao enviar imagem (dados da TV foram salvos):', err);
        // Mesmo se a imagem falhar, os dados foram salvos.
        this.router.navigate(['/']);
      }
    });
  }
  // ===================================

  cancelar(): void {
    this.router.navigate(['/']); 
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.televisaoForm.get(fieldName);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
}