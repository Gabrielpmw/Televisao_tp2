import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Televisao } from '../../model/televisao.model';
import { TelevisaoService, TelevisaoPaginada, FiltrosTelevisao } from '../../services/televisao-service';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TelevisaoCardComponent } from '../televisao-card-component/televisao-card-component';

@Component({
  selector: 'app-televisao-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TelevisaoCardComponent,
    RouterModule
  ],
  templateUrl: './televisao-list-component.html',
  styleUrls: ['./televisao-list-component.css']
})
export class TelevisaoListComponent implements OnInit {

  public listaPaginada$!: Observable<TelevisaoPaginada>;
  public marcasDisponiveis$!: Observable<string[]>;

  totalRegistros: number = 0;
  pageSize: number = 8;
  pageIndex: number = 0;

  // --- Estado dos Filtros Selecionados ---
  filtros: FiltrosTelevisao = {
    marcas: [],
    tipos: [],
    // REMOVIDO: minPolegada
    maxPolegada: undefined, // Agora usamos só o max
    sort: '' // ADICIONADO: Campo para ordenação
  };

  selectedTipos: string[] = [];
  selectedTamanhos: number[] = []; 
  
  tempSelectedMarcas: string[] = []; 

  // --- Controle de UI ---
  activeDropdown: string | null = null;
  showMarcaModal: boolean = false;

  opcoesTamanho = ['32"', '43"', '50"', '55"', '65"', '75"', '85"'];
  opcoesTipo = ['LED', 'QLED', 'OLED', 'LCD', 'PLASMA'];
  
  // Modal Delete
  showDeleteModal: boolean = false;
  tvToDelete: Televisao | null = null;

  constructor(
    private televisaoService: TelevisaoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.marcasDisponiveis$ = this.televisaoService.findAllMarcas();
    this.carregarTelevisoes();
  }

  carregarTelevisoes(): void {
    
    // --- LÓGICA ATUALIZADA DE POLEGADAS ---
    // Regra: "A partir de um número, pegar todas as polegadas abaixo dele"
    // Se o usuário selecionar 50" e 65", consideramos o 65" como teto.
    if (this.selectedTamanhos.length > 0) {
      // Pega o MAIOR valor selecionado e define como limite máximo
      this.filtros.maxPolegada = Math.max(...this.selectedTamanhos);
    } else {
      this.filtros.maxPolegada = undefined;
    }
    // Obs: minPolegada foi removido

    this.filtros.tipos = this.selectedTipos;

    this.listaPaginada$ = this.televisaoService.findAll(this.pageIndex, this.pageSize, this.filtros).pipe(
      tap(paginacao => {
        this.totalRegistros = paginacao.totalCount;
      })
    );
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarTelevisoes();
  }

  // ==========================================
  // LÓGICA DE ORDENAÇÃO (NOVO)
  // ==========================================
  ordenarProdutos(criterio: string): void {
    this.filtros.sort = criterio;
    this.pageIndex = 0; // Volta para a primeira página ao reordenar
    this.carregarTelevisoes();
  }

  // ==========================================
  // LÓGICA DE FILTROS (CHECKBOXES)
  // ==========================================

  toggleTipo(tipo: string, event: any): void {
    if (event.target.checked) {
      this.selectedTipos.push(tipo);
    } else {
      this.selectedTipos = this.selectedTipos.filter(t => t !== tipo);
    }
    this.pageIndex = 0;
    this.carregarTelevisoes();
  }

  toggleTamanho(tamanhoStr: string, event: any): void {
    const valor = parseInt(tamanhoStr.replace('"', '').trim());

    if (event.target.checked) {
      this.selectedTamanhos.push(valor);
    } else {
      this.selectedTamanhos = this.selectedTamanhos.filter(t => t !== valor);
    }
    this.pageIndex = 0;
    this.carregarTelevisoes();
  }

  isTamanhoSelecionado(tam: string): boolean {
    const valor = parseInt(tam.replace('"', '').trim());
    return this.selectedTamanhos.includes(valor);
  }

  openMarcaModal(): void {
    this.tempSelectedMarcas = [...this.filtros.marcas || []]; 
    this.showMarcaModal = true;
    this.activeDropdown = null;
  }

  toggleMarcaTemp(marca: string, event: any): void {
    if (event.target.checked) {
      this.tempSelectedMarcas.push(marca);
    } else {
      this.tempSelectedMarcas = this.tempSelectedMarcas.filter(m => m !== marca);
    }
  }

  aplicarFiltroMarca(): void {
    this.filtros.marcas = [...this.tempSelectedMarcas];
    this.pageIndex = 0;
    this.carregarTelevisoes();
    this.closeMarcaModal();
  }

  limparFiltroMarca(): void {
    this.tempSelectedMarcas = [];
    this.filtros.marcas = [];
    this.pageIndex = 0;
    this.carregarTelevisoes();
    this.closeMarcaModal();
  }

  closeMarcaModal(): void {
    this.showMarcaModal = false;
  }

  // UI Helpers
  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown')) {
      this.activeDropdown = null;
    }
  }

  handleEdit(tv: Televisao): void {
    this.router.navigate(['/televisoes/edit', tv.idTelevisao]);
  }

  handleDelete(tv: Televisao): void {
    this.tvToDelete = tv;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.tvToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.tvToDelete) return;
    this.televisaoService.delete(this.tvToDelete.idTelevisao).subscribe({
      next: () => {
        this.tvToDelete = null;
        this.showDeleteModal = false;
        this.carregarTelevisoes();
      },
      error: (err: any) => console.error(err)
    });
  }
}