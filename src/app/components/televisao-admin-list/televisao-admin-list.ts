import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Adicionando CurrencyPipe
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Importações dos serviços e modelos atualizados
import { Televisao, TelevisaoRequest } from '../../model/televisao.model'; 
import { TelevisaoService, TelevisaoPaginada, FiltrosTelevisao } from '../../services/televisao-service'; 

@Component({
  selector: 'app-televisao-admin-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyPipe // Adiciona CurrencyPipe para o HTML
  ],
  templateUrl: './televisao-admin-list.html',
  styleUrls: ['./televisao-admin-list.css']
})
export class TelevisaoAdminList implements OnInit {

  televisoes: Televisao[] = [];
  termoBusca: string = ''; // Usaremos isso no filtro por modelo

  modalVisivel: boolean = false;
  televisaoParaExcluir: number | null = null;

  paginaAtual: number = 1; 
  itensPorPagina: number = 10;
  totalRegistros: number = 0; 
  totalPaginas: number = 0;   
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private televisaoService: TelevisaoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarTelevisoes();
  }

  carregarTelevisoes(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<TelevisaoPaginada>;

    // Lógica de busca por modelo ou busca geral
    if (this.termoBusca.trim()) {
        observable = this.televisaoService.findByModelo(this.termoBusca, page, pageSize);
    } else {
        observable = this.televisaoService.findAll(page, pageSize);
    }

    observable.subscribe({
      next: (response: TelevisaoPaginada) => {
        // Mapeia a resposta paginada do serviço
        this.televisoes = response.televisoes || [];
        this.totalRegistros = response.totalCount;

        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
      },
      error: (err: any) => {
        console.error('Erro ao carregar televisões:', err);
      }
    });
  }

  // --- MÉTODOS DE PAGINAÇÃO E BUSCA ---
  aplicarBusca(): void {
    this.paginaAtual = 1;
    this.carregarTelevisoes();
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 1;
    this.carregarTelevisoes();
  }

  onItensPorPaginaChange(): void {
    this.paginaAtual = 1; 
    this.carregarTelevisoes();
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.carregarTelevisoes();
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  // --- AÇÕES DE CRUD ---
  editarTelevisao(id: number): void {
    // Rota correta para o ADM (aninhada em /perfil-admin)
    this.router.navigate(['/perfil-admin/televisoes/edit', id]); 
  }

  abrirModalExclusao(id: number): void {
    this.televisaoParaExcluir = id;
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.televisaoParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (this.televisaoParaExcluir) {
      this.televisaoService.delete(this.televisaoParaExcluir).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarTelevisoes(); 
        },
        error: (err) => {
             console.error('Erro ao excluir televisão:', err);
             this.fecharModal();
        }
      });
    }
  }
}