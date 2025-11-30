import { Component, OnInit, HostListener, inject } from '@angular/core'; // Adicionei inject (opcional, pode usar construtor)
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Televisao } from '../../model/televisao.model';
import { TelevisaoService, TelevisaoPaginada, FiltrosTelevisao } from '../../services/televisao-service';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // <--- IMPORTANTE: ActivatedRoute
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

  filtros: FiltrosTelevisao = {
    marcas: [],
    tipos: [],
    maxPolegada: undefined,
    sort: ''
  };

  selectedTipos: string[] = [];
  selectedTamanhos: number[] = []; 
  tempSelectedMarcas: string[] = []; 

  // UI Controls
  activeDropdown: string | null = null;
  showMarcaModal: boolean = false;
  opcoesTamanho = ['32"', '43"', '50"', '55"', '65"', '75"', '85"'];
  opcoesTipo = ['LED', 'QLED', 'OLED', 'LCD', 'PLASMA'];
  
  // Modal Delete
  showDeleteModal: boolean = false;
  tvToDelete: Televisao | null = null;

  constructor(
    private televisaoService: TelevisaoService,
    private router: Router,
    private route: ActivatedRoute // <--- INJEÇÃO NECESSÁRIA
  ) { }

  ngOnInit(): void {
    this.marcasDisponiveis$ = this.televisaoService.findAllMarcas();

    // --- LÓGICA DE FILTRO VIA URL ---
    // Inscreve-se nos parâmetros da rota (ex: ?tipoTela=OLED)
    this.route.queryParams.subscribe(params => {
      const tipoUrl = params['tipoTela'];

      if (tipoUrl) {
        // Se veio algo na URL, marcamos como selecionado
        // O array é reiniciado para garantir que filtra apenas o que veio da home
        this.selectedTipos = [tipoUrl];
        
        // Atualiza o objeto de filtros
        this.filtros.tipos = this.selectedTipos;
      }

      // Chama o carregamento APÓS configurar os filtros
      this.carregarTelevisoes();
    });
  }

  carregarTelevisoes(): void {
    if (this.selectedTamanhos.length > 0) {
      this.filtros.maxPolegada = Math.max(...this.selectedTamanhos);
    } else {
      this.filtros.maxPolegada = undefined;
    }

    // Garante que os tipos selecionados (seja via clique ou URL) vão para o filtro
    this.filtros.tipos = this.selectedTipos;

    this.listaPaginada$ = this.televisaoService.findAll(this.pageIndex, this.pageSize, this.filtros).pipe(
      tap(paginacao => {
        this.totalRegistros = paginacao.totalCount;
      })
    );
  }

  // ... (RESTO DO CÓDIGO IGUAL: onPageChange, ordenarProdutos, toggles, etc.) ...
  
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarTelevisoes();
  }

  ordenarProdutos(criterio: string): void {
    this.filtros.sort = criterio;
    this.pageIndex = 0;
    this.carregarTelevisoes();
  }

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

  // Método auxiliar para o HTML saber se o checkbox deve estar marcado
  isTipoSelecionado(tipo: string): boolean {
    return this.selectedTipos.includes(tipo);
  }

  isTamanhoSelecionado(tam: string): boolean {
    const valor = parseInt(tam.replace('"', '').trim());
    return this.selectedTamanhos.includes(valor);
  }

  // ... Métodos de Marca, Modal, Dropdown, etc ...
  
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