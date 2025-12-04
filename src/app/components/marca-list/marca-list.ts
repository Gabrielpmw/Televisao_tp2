import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Marca } from '../../model/marca.model';
import { MarcaService } from '../../services/marca-service.service';

@Component({
  selector: 'app-marca-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
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

  modalVisivel: boolean = false;
  marcaParaExcluir: number | null = null; 

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private marcaService: MarcaService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarMarcas();
    this.configurarBuscaAutomatica();
  }

  ngOnDestroy(): void {
    // Importante cancelar a inscrição para não vazar memória
    if (this.buscaSubscription) {
      this.buscaSubscription.unsubscribe();
    }
  }

  configurarBuscaAutomatica(): void {
    this.buscaSubscription = this.buscaSubject.pipe(
      debounceTime(500), // Espera 500ms depois que você para de digitar
      distinctUntilChanged() // Só pesquisa se o texto mudou
    ).subscribe((termo: string) => {
      this.termoBusca = termo;
      this.paginaAtual = 1;
      this.carregarMarcas();
    });
  }

  // Método chamado pelo Input do HTML a cada letra digitada
  onBuscaInput(termo: string): void {
    this.buscaSubject.next(termo);
  }

  carregarMarcas(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Marca[]>>;

    if (this.termoBusca && this.termoBusca.trim()) {
      observable = this.marcaService.findByNome(this.termoBusca, page, pageSize);
    } else {
      observable = this.marcaService.getAll(page, pageSize);
    }

    observable.subscribe({
      next: (response: HttpResponse<Marca[]>) => {
        this.marcas = response.body || []; 

        const totalCountHeader = response.headers.get('X-Total-Count');
        this.totalRegistros = totalCountHeader ? +totalCountHeader : 0;

        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);

        // Se a página ficou vazia e não é a primeira, volta uma
        if (this.marcas.length === 0 && this.paginaAtual > 1) {
          this.paginaAtual--;
          this.carregarMarcas();
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar marcas:', err); 
      }
    });
  }

  // Paginação e Controles
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

  // Ações
  editarMarca(id: number): void {
    this.router.navigate(['/marcas/edit', id]);
  }

  abrirModalExclusao(id: number): void {
    this.marcaParaExcluir = id;
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.marcaParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (this.marcaParaExcluir) {
      this.marcaService.delete(this.marcaParaExcluir).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarMarcas(); 
        },
        error: (err: any) => {
          console.error('Erro ao excluir marca:', err);
          this.fecharModal();
        }
      });
    }
  }
}