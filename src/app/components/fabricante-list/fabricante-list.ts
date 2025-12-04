import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Fabricante } from '../../model/fabricante.model';
import { FabricanteService } from '../../services/fabricante-service';

@Component({
  selector: 'app-fabricante-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
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

  modalVisivel: boolean = false;
  fabricanteParaExcluir: number | null = null;

  paginaAtual: number = 1; 
  itensPorPagina: number = 10;
  totalRegistros: number = 0; 
  totalPaginas: number = 0;   
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private fabricanteService: FabricanteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarFabricantes();
    this.configurarBuscaAutomatica();
  }

  ngOnDestroy(): void {
    // É importante cancelar a inscrição para evitar vazamento de memória
    if (this.buscaSubscription) {
      this.buscaSubscription.unsubscribe();
    }
  }

  configurarBuscaAutomatica(): void {
    this.buscaSubscription = this.buscaSubject.pipe(
      debounceTime(500), // Espera 500ms após a última digitação
      distinctUntilChanged() // Só pesquisa se o termo for diferente do anterior
    ).subscribe((termo: string) => {
      this.termoBusca = termo;
      this.paginaAtual = 1;
      this.carregarFabricantes();
    });
  }

  // Este método é chamado a cada letra digitada no input
  onBuscaInput(termo: string): void {
    this.buscaSubject.next(termo);
  }

  carregarFabricantes(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Fabricante[]>>;

    if (this.termoBusca && this.termoBusca.trim()) {
      observable = this.fabricanteService.findByNome(this.termoBusca, page, pageSize);
    } else {
      observable = this.fabricanteService.getFabricantes(page, pageSize);
    }

    observable.subscribe({
      next: (response: HttpResponse<Fabricante[]>) => {
        this.fabricantes = response.body || [];
        this.totalRegistros = +response.headers.get('X-Total-Count')!;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
        
        if (this.termoBusca.trim() && this.totalRegistros === 0) {
           // Debug opcional
           // console.log("Nenhum resultado encontrado.");
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar fabricantes:', err);
      }
    });
  }

  // Mantido para o botão de "limpar" ou busca manual se necessário
  aplicarBusca(): void {
    this.paginaAtual = 1;
    this.carregarFabricantes();
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

  abrirModalExclusao(id: number): void {
    this.fabricanteParaExcluir = id;
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.fabricanteParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (this.fabricanteParaExcluir) {
      this.fabricanteService.deletar(this.fabricanteParaExcluir).subscribe(() => {
        this.fecharModal();
        this.carregarFabricantes(); 
      });
    }
  }
}