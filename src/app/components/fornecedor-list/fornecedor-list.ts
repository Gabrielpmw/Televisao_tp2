import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Fornecedor } from '../../model/fornecedor.model';
import { FornecedorService } from '../../services/fornecedor-service.service';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Telefone } from '../../model/telefone.model';

@Component({
  selector: 'app-fornecedor-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './fornecedor-list.html',
  styleUrl: './fornecedor-list.css'
})
export class FornecedorListComponent implements OnInit {

  fornecedores: Fornecedor[] = [];

  termoBusca: string = '';

  modalVisivel: boolean = false;
  fornecedorParaExcluir: number | null = null;

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private fornecedorService: FornecedorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarFornecedores();
  }

  carregarFornecedores(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Fornecedor[]>>;

    if (this.termoBusca.trim()) {
      observable = this.fornecedorService.getFornecedoresPorNome(this.termoBusca, page, pageSize);
    } else {
      observable = this.fornecedorService.getFornecedoresPaginado(page, pageSize);
    }

    observable.subscribe({
      next: (response: HttpResponse<Fornecedor[]>) => {
        this.fornecedores = response.body || [];

        const totalCountHeader = response.headers.get('X-Total-Count');
        this.totalRegistros = totalCountHeader ? +totalCountHeader : 0;

        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);

        if (this.termoBusca.trim() && this.totalRegistros === 0) {
          console.warn("A busca retornou X-Total-Count = 0. Se há resultados, pode ser um bug no count() do backend.");
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar fornecedores:', err);
      }
    });
  }


  aplicarBusca(): void {
    this.paginaAtual = 1;
    this.carregarFornecedores();
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 1;
    this.carregarFornecedores();
  }

  onItensPorPaginaChange(): void {
    this.paginaAtual = 1;
    this.carregarFornecedores();
  }


  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.carregarFornecedores();
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }


  getPrimeiroTelefone(fornecedor: Fornecedor): string {
    if (fornecedor.telefones && fornecedor.telefones.length > 0) {
      const tel = fornecedor.telefones[0];
      if (tel && tel.ddd && tel.numero) {
        return `(${tel.ddd}) ${tel.numero}`;
      }
    }
    return 'N/A';
  }

  editarFornecedor(id: number): void {
    this.router.navigate(['/fornecedores/edit', id]);
  }

  abrirModalExclusao(id: number): void {
    this.fornecedorParaExcluir = id;
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.fornecedorParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (this.fornecedorParaExcluir) {
      this.fornecedorService.deletar(this.fornecedorParaExcluir).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarFornecedores();
        },
        error: (err: any) => {
          console.error('Erro ao excluir fornecedor:', err);
          this.fecharModal();
        }
      });
    }
  }
}