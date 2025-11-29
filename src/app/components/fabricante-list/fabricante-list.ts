import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Fabricante } from '../../model/fabricante.model';
import { FabricanteService } from '../../services/fabricante-service';
import { HttpResponse } from '@angular/common/http'; // IMPORTANTE
import { Observable } from 'rxjs';

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
export class FabricanteListComponent implements OnInit {

  fabricantes: Fabricante[] = [];

  termoBusca: string = '';

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
  }

  carregarFabricantes(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Fabricante[]>>;

    if (this.termoBusca.trim()) {
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
          console.warn("A busca retornou X-Total-Count = 0. Se há resultados na tela, o bug no 'count(nome)' do backend está ativo.");
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar fabricantes:', err);
      }
    });
  }

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
    this.router.navigate(['/fabricantes/edit', id]);
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