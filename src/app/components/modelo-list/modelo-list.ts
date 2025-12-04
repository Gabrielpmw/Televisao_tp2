import { Component, OnInit, OnDestroy } from '@angular/core'; // Adicionado OnDestroy
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs'; // Adicionado Subject e Subscription
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; // Adicionado Operadores
import { HttpResponse } from '@angular/common/http';

import { ModeloResponse } from '../../model/modelo.model';
import { ModeloService } from '../../services/modelo-service.service';

@Component({
  selector: 'app-modelo-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DatePipe
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

  modalVisivel: boolean = false;
  modeloParaExcluir: number | null = null;

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private modeloService: ModeloService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.carregarModelos();
    this.configurarBuscaAutomatica(); // Inicia o "ouvinte" da busca
  }

  ngOnDestroy(): void {
    // Cancela a inscrição ao sair da tela para evitar vazamento de memória
    if (this.buscaSubscription) {
      this.buscaSubscription.unsubscribe();
    }
  }

  configurarBuscaAutomatica(): void {
    this.buscaSubscription = this.buscaSubject.pipe(
      debounceTime(500), // Espera 500ms
      distinctUntilChanged() // Só busca se o termo mudou
    ).subscribe((termo: string) => {
      this.termoBusca = termo;
      this.paginaAtual = 1;
      this.carregarModelos();
    });
  }

  // Método chamado pelo HTML a cada letra digitada
  onBuscaInput(termo: string): void {
    this.buscaSubject.next(termo);
  }

  carregarModelos(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<ModeloResponse[]>>;

    if (this.termoBusca && this.termoBusca.trim()) {
      observable = this.modeloService.findByNome(this.termoBusca, page, pageSize);
    } else {
      observable = this.modeloService.getAll(page, pageSize);
    }

    observable.subscribe({
      next: (response: HttpResponse<ModeloResponse[]>) => {
        this.modelos = response.body || [];

        const totalCountHeader = response.headers.get('X-Total-Count');
        this.totalRegistros = totalCountHeader ? +totalCountHeader : 0;

        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
        
        // Se a página atual ficou vazia (ex: deletou último item), volta uma página
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

  // Navegação
  voltar(): void {
    this.location.back();
  }

  // Paginação e Controles
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

  // Ações
  editarModelo(id: number): void {
    this.router.navigate(['/perfil-admin/modelos/edit', id]);
  }

  abrirModalExclusao(id: number): void {
    this.modeloParaExcluir = id;
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.modeloParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (this.modeloParaExcluir) {
      this.modeloService.delete(this.modeloParaExcluir).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarModelos();
        },
        error: (err: any) => {
          console.error('Erro ao excluir modelo:', err);
          this.fecharModal();
        }
      });
    }
  }
}