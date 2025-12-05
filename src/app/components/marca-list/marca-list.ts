import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Marca } from '../../model/marca.model'; // 1. Model correto
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
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
export class MarcaListComponent implements OnInit {

  marcas: Marca[] = []; 

  termoBusca: string = '';

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
  }

  carregarMarcas(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Marca[]>>;

    if (this.termoBusca.trim()) {
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

        if (this.termoBusca.trim() && this.totalRegistros === 0) {
          console.warn("A busca retornou X-Total-Count = 0.");
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar marcas:', err); 
      }
    });
  }



  aplicarBusca(): void {
    this.paginaAtual = 1;
    this.carregarMarcas();
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 1;
    this.carregarMarcas();
  }

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