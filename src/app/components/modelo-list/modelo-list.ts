import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog'; // Import do Dialog

import { ModeloResponse } from '../../model/modelo.model';
import { ModeloService } from '../../services/modelo-service.service';
import { CaixaDialogo, DialogData } from '../caixa-dialogo/caixa-dialogo';
@Component({
  selector: 'app-modelo-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DatePipe,
    CaixaDialogo // Importante para o standalone
  ],
  templateUrl: './modelo-list.html',
  styleUrl: './modelo-list.css'
})
export class ModeloListComponent implements OnInit, OnDestroy {

  modelos: ModeloResponse[] = [];
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
    private modeloService: ModeloService,
    private router: Router,
    private location: Location,
    private dialog: MatDialog // Injeção do MatDialog
  ) { }

  ngOnInit(): void {
    this.carregarModelos();
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
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((termo: string) => {
      this.termoBusca = termo;
      this.paginaAtual = 1;
      this.carregarModelos();
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
      this.termoBusca = ''; // Limpa a busca ao trocar de aba
      this.carregarModelos();
    }
  }

  // --- Carregamento de Dados ---
  carregarModelos(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<ModeloResponse[]>>;

    // Se tiver busca, usa o endpoint de busca (apenas ativos)
    if (this.termoBusca && this.termoBusca.trim()) {
      observable = this.modeloService.findByNome(this.termoBusca, page, pageSize);
    } else {
      // Se não, decide qual lista carregar baseada no filtro
      if (this.filtroStatus === 'ativos') {
        observable = this.modeloService.getAll(page, pageSize);
      } else {
        observable = this.modeloService.getInativos(page, pageSize);
      }
    }

    observable.subscribe({
      next: (response: HttpResponse<ModeloResponse[]>) => {
        this.modelos = response.body || [];
        this.totalRegistros = +(response.headers.get('X-Total-Count') || 0);
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);

        // Se deletou o último item da página e ela ficou vazia, volta uma
        if (this.modelos.length === 0 && this.paginaAtual > 1) {
          this.paginaAtual--;
          this.carregarModelos();
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar modelos:', err);
      }
    });
  }

  // --- Navegação ---
  voltar(): void {
    this.location.back();
  }

  editarModelo(id: number): void {
    this.router.navigate(['/perfil-admin/modelos/edit', id]);
  }

  // --- Paginação ---
  onItensPorPaginaChange(): void {
    this.paginaAtual = 1;
    this.carregarModelos();
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.carregarModelos();
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  // --- Lógica do Modal com MatDialog ---
  
  abrirModalConfirmacao(id: number, acao: 'desativar' | 'ativar'): void {
    const dadosDialogo: DialogData = {
      titulo: acao === 'desativar' ? 'Confirmar Exclusão' : 'Confirmar Reativação',
      mensagem: acao === 'desativar' 
        ? 'Tem certeza que deseja mover este modelo para a lixeira?' 
        : 'Tem certeza que deseja reativar este modelo?',
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
      observable = this.modeloService.delete(id);
    } else {
      observable = this.modeloService.ativar(id);
    }

    observable.subscribe({
      next: () => {
        this.carregarModelos();
      },
      error: (err) => {
        console.error(`Erro ao ${acao} modelo:`, err);
      }
    });
  }
}