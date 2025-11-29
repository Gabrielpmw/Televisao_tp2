import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common'; // Importar DatePipe
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
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
export class ModeloListComponent implements OnInit {

  modelos: ModeloResponse[] = []; 

  termoBusca: string = '';

  modalVisivel: boolean = false;
  modeloParaExcluir: number | null = null; 

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private modeloService: ModeloService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarModelos(); 
  }

  carregarModelos(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<ModeloResponse[]>>;

    if (this.termoBusca.trim()) {
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
      },
      error: (err: any) => {
        console.error('Erro ao carregar modelos:', err); 
      }
    });
  }

  aplicarBusca(): void {
    this.paginaAtual = 1;
    this.carregarModelos();
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 1;
    this.carregarModelos();
  }

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

  editarModelo(id: number): void {
    this.router.navigate(['/modelos/edit', id]); 
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
          this.carregarModelos(); // Recarrega a lista
        },
        error: (err: any) => {
          console.error('Erro ao excluir modelo:', err);
          this.fecharModal();
        }
      });
    }
  }
}