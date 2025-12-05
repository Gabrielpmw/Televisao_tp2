import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog'; // Importar MatDialog

import { Fabricante } from '../../model/fabricante.model';
import { FabricanteService } from '../../services/fabricante-service';
import { CaixaDialogo, DialogData } from '../caixa-dialogo/caixa-dialogo';
@Component({
  selector: 'app-fabricante-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CaixaDialogo // Adicionado aos imports (embora o MatDialog carregue dinamicamente, é boa prática)
  ],
  templateUrl: './fabricante-list.html',
  styleUrl: './fabricante-list.css'
})
export class FabricanteListComponent implements OnInit, OnDestroy {

  fabricantes: Fabricante[] = [];
  termoBusca: string = '';
  
  // Controle da Busca Automática (RxJS)
  private buscaSubject = new Subject<string>();
  private buscaSubscription!: Subscription;

  // Controle de Paginação e Filtros
  filtroStatus: 'ativos' | 'inativos' = 'ativos';
  paginaAtual: number = 1; 
  itensPorPagina: number = 10;
  totalRegistros: number = 0; 
  totalPaginas: number = 0;   
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private fabricanteService: FabricanteService,
    private router: Router,
    private dialog: MatDialog // Injetando o serviço de diálogo
  ) {}

  ngOnInit(): void {
    this.carregarFabricantes();
    this.configurarBuscaAutomatica();
  }

  ngOnDestroy(): void {
    if (this.buscaSubscription) {
      this.buscaSubscription.unsubscribe();
    }
  }

  configurarBuscaAutomatica(): void {
    this.buscaSubscription = this.buscaSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((termo: string) => {
      this.termoBusca = termo;
      this.paginaAtual = 1;
      this.carregarFabricantes();
    });
  }

  onBuscaInput(termo: string): void {
    this.buscaSubject.next(termo);
  }

  alternarStatusVisualizacao(status: 'ativos' | 'inativos'): void {
    if (this.filtroStatus !== status) {
      this.filtroStatus = status;
      this.paginaAtual = 1;
      this.termoBusca = ''; 
      this.carregarFabricantes();
    }
  }

  carregarFabricantes(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Fabricante[]>>;

    if (this.termoBusca && this.termoBusca.trim()) {
      observable = this.fabricanteService.findByNome(this.termoBusca, page, pageSize);
    } else {
      if (this.filtroStatus === 'ativos') {
        observable = this.fabricanteService.getFabricantes(page, pageSize);
      } else {
        observable = this.fabricanteService.getInativos(page, pageSize);
      }
    }

    observable.subscribe({
      next: (response: HttpResponse<Fabricante[]>) => {
        this.fabricantes = response.body || [];
        this.totalRegistros = +(response.headers.get('X-Total-Count') || 0);
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
      },
      error: (err: any) => {
        console.error('Erro ao carregar fabricantes:', err);
      }
    });
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 1;
    this.carregarFabricantes();
  }

  onItensPorPaginaChange(): void {
    this.paginaAtual = 1; 
    this.carregarFabricantes();
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.carregarFabricantes();
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  getPrimeiroTelefone(fabricante: Fabricante): string {
    if (fabricante.telefones && fabricante.telefones.length > 0) {
      return `(${fabricante.telefones[0].ddd}) ${fabricante.telefones[0].numero}`;
    }
    return 'N/A';
  }

  editarFabricante(id: number): void {
    this.router.navigate(['/perfil-admin/fabricantes/edit', id]);
  }

  // --- NOVA Lógica do Modal com MatDialog ---

  /**
   * Abre o modal de confirmação usando CaixaDialogo.
   * @param id ID do fabricante
   * @param acao 'desativar' para soft delete, 'ativar' para restaurar
   */
  abrirModalConfirmacao(id: number, acao: 'desativar' | 'ativar'): void {
    // Configura os dados baseados na ação
    const dadosDialogo: DialogData = {
      titulo: acao === 'desativar' ? 'Confirmar Desativação' : 'Confirmar Reativação',
      mensagem: acao === 'desativar' 
        ? 'Tem certeza que deseja desativar este fabricante?' 
        : 'Tem certeza que deseja reativar este fabricante?',
      textoBotaoConfirmar: 'Sim',
      textoBotaoCancelar: 'Cancelar',
      corBotaoConfirmar: acao === 'desativar' ? 'warn' : 'primary' // Vermelho para desativar, Azul para ativar
    };

    // Abre o diálogo
    const dialogRef = this.dialog.open(CaixaDialogo, {
      width: '400px',
      data: dadosDialogo
    });

    // Escuta o fechamento
    dialogRef.afterClosed().subscribe((resultado: boolean) => {
      // Se o resultado for true, o usuário clicou em "Sim"
      if (resultado === true) {
        this.executarAcao(id, acao);
      }
    });
  }

  // Método auxiliar para chamar o serviço (separado do modal)
  private executarAcao(id: number, acao: 'desativar' | 'ativar'): void {
    let observable: Observable<void>;

    if (acao === 'desativar') {
      observable = this.fabricanteService.deletar(id);
    } else {
      observable = this.fabricanteService.ativar(id);
    }

    observable.subscribe({
      next: () => {
        // Recarrega a lista para mostrar o item movido/removido
        this.carregarFabricantes(); 
      },
      error: (err) => {
        console.error(`Erro ao ${acao} fabricante:`, err);
        // Aqui você poderia abrir outro Dialog de erro ou um Toast
      }
    });
  }
}