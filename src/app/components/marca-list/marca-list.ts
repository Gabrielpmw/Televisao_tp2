import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog'; // Import do Dialog
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Marca } from '../../model/marca.model';
import { MarcaService } from '../../services/marca-service.service';
import { CaixaDialogo, DialogData } from '../caixa-dialogo/caixa-dialogo';

@Component({
  selector: 'app-marca-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CaixaDialogo // Importante para o standalone, embora o Dialog abra dinamicamente
  ],
  templateUrl: './marca-list.html',
  styleUrl: './marca-list.css'
})
export class MarcaListComponent implements OnInit, OnDestroy {

  marcas: Marca[] = [];
  termoBusca: string = '';

  // Controle da Busca Automática (RxJS)
  private buscaSubject = new Subject<string>();
  private buscaSubscription!: Subscription;

  // Controle de Filtros (Ativos vs Lixeira)
  filtroStatus: 'ativos' | 'inativos' = 'ativos';

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private marcaService: MarcaService,
    private router: Router,
    private dialog: MatDialog // Injeção do MatDialog
  ) { }

  ngOnInit(): void {
    this.carregarMarcas();
    this.configurarBuscaAutomatica();
  }

  ngOnDestroy(): void {
    if (this.buscaSubscription) {
      this.buscaSubscription.unsubscribe();
    }
  }

  // --- Lógica de Busca Reativa ---
  configurarBuscaAutomatica(): void {
    this.buscaSubscription = this.buscaSubject.pipe(
      debounceTime(500), // Espera 500ms parando de digitar
      distinctUntilChanged() // Só busca se o texto mudou
    ).subscribe((termo: string) => {
      this.termoBusca = termo;
      this.paginaAtual = 1;
      this.carregarMarcas();
    });
  }

  onBuscaInput(termo: string): void {
    this.buscaSubject.next(termo);
  }

  // --- Lógica de Alternância (Ativos/Lixeira) ---
  alternarStatusVisualizacao(status: 'ativos' | 'inativos'): void {
    if (this.filtroStatus !== status) {
      this.filtroStatus = status;
      this.paginaAtual = 1;
      this.termoBusca = ''; // Limpa a busca ao trocar de contexto
      this.carregarMarcas();
    }
  }

  // --- Carregamento de Dados ---
  carregarMarcas(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Marca[]>>;

    // Se tiver busca, usa o endpoint de busca (Geralmente busca em ativos)
    if (this.termoBusca && this.termoBusca.trim()) {
      observable = this.marcaService.findByNome(this.termoBusca, page, pageSize);
    } else {
      // Se não, decide qual lista carregar baseada no filtro
      if (this.filtroStatus === 'ativos') {
        observable = this.marcaService.getAll(page, pageSize);
      } else {
        observable = this.marcaService.getInativos(page, pageSize);
      }
    }

    observable.subscribe({
      next: (response: HttpResponse<Marca[]>) => {
        this.marcas = response.body || [];
        this.totalRegistros = +(response.headers.get('X-Total-Count') || 0);
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
      },
      error: (err: any) => {
        console.error('Erro ao carregar marcas:', err);
      }
    });
  }

  // --- Paginação ---
  onItensPorPaginaChange(): void {
    this.paginaAtual = 1;
    this.carregarMarcas();
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.carregarMarcas();
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  // --- Navegação ---
  editarMarca(id: number): void {
    this.router.navigate(['/perfil-admin/marcas/edit', id]); // Verifique se a rota é essa
  }

  // --- Lógica do Modal com MatDialog ---

  /**
   * Abre o modal de confirmação.
   * @param id ID da marca
   * @param acao 'desativar' (lixeira) ou 'ativar' (restaurar)
   */
  abrirModalConfirmacao(id: number, acao: 'desativar' | 'ativar'): void {
    const dadosDialogo: DialogData = {
      titulo: acao === 'desativar' ? 'Confirmar Exclusão' : 'Confirmar Reativação',
      mensagem: acao === 'desativar' 
        ? 'Tem certeza que deseja mover esta marca para a lixeira?' 
        : 'Tem certeza que deseja reativar esta marca?',
      textoBotaoConfirmar: 'Sim',
      textoBotaoCancelar: 'Cancelar',
      corBotaoConfirmar: acao === 'desativar' ? 'warn' : 'primary'
    };

    const dialogRef = this.dialog.open(CaixaDialogo, {
      width: '400px',
      data: dadosDialogo
    });

    dialogRef.afterClosed().subscribe((resultado: boolean) => {
      if (resultado === true) {
        this.executarAcao(id, acao);
      }
    });
  }

  private executarAcao(id: number, acao: 'desativar' | 'ativar'): void {
    let observable: Observable<void>;

    if (acao === 'desativar') {
      observable = this.marcaService.delete(id);
    } else {
      observable = this.marcaService.ativar(id);
    }

    observable.subscribe({
      next: () => {
        this.carregarMarcas(); // Recarrega a lista
      },
      error: (err) => {
        console.error(`Erro ao ${acao} marca:`, err);
      }
    });
  }
}