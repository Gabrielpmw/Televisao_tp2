import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Fornecedor } from '../../model/fornecedor.model';
// O import do serviço (caminho e nome do arquivo) segue o padrão do seu Fabricante
import { FornecedorService } from '../../services/fornecedor-service.service';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Telefone } from '../../model/telefone.model'; // Importei o Telefone para o helper

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

  // --- Controle do Modal ---
  modalVisivel: boolean = false;
  fornecedorParaExcluir: number | null = null;

  // --- Controle de Paginação (Lado Servidor) ---
  paginaAtual: number = 1;
  itensPorPagina: number = 5; // Mesmo padrão do exemplo
  totalRegistros: number = 0;
  totalPaginas: number = 0;
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private fornecedorService: FornecedorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarFornecedores();
  }

  /**
   * Função principal para carregar dados (com paginação e busca).
   */
  carregarFornecedores(): void {
    const page = this.paginaAtual - 1; // Backend (0-based)
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Fornecedor[]>>;

    if (this.termoBusca.trim()) {
      // Usando o 'getFornecedoresPorNome' que você criou no service
      observable = this.fornecedorService.getFornecedoresPorNome(this.termoBusca, page, pageSize);
    } else {
      // Assumindo que você criará este método 'getFornecedoresPaginado' no service
      observable = this.fornecedorService.getFornecedoresPaginado(page, pageSize);
    }

    // Bloco subscribe corrigido (baseado no fabricante-list)
    observable.subscribe({
      next: (response: HttpResponse<Fornecedor[]>) => {
        // 1. Pega o body
        this.fornecedores = response.body || [];

        // 2. Pega o total de registros do header
        const totalCountHeader = response.headers.get('X-Total-Count');
        this.totalRegistros = totalCountHeader ? +totalCountHeader : 0;

        // 3. Calcula o total de páginas
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
        
        if (this.termoBusca.trim() && this.totalRegistros === 0) {
          console.warn("A busca retornou X-Total-Count = 0. Se há resultados, pode ser um bug no count() do backend.");
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar fornecedores:', err);
        // Implementar notificação de erro ao usuário (ex: Toast)
      }
    });
  }

  /**
   * Chamado pelo (keydown.enter) da barra de busca.
   */
  aplicarBusca(): void {
    this.paginaAtual = 1;
    this.carregarFornecedores();
  }

  /**
   * Limpa a busca e recarrega a lista completa.
   */
  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 1;
    this.carregarFornecedores();
  }

  /**
   * Chamado pelo (change) do <select> de itens por página.
   */
  onItensPorPaginaChange(): void {
    this.paginaAtual = 1; // Volta para a primeira página
    this.carregarFornecedores();
  }

  // --- Funções de Navegação de Página ---

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

  // --- Funções Helper e Modal ---

  /**
   * Helper para exibir o primeiro telefone (igual ao de fabricante).
   */
  getPrimeiroTelefone(fornecedor: Fornecedor): string {
    if (fornecedor.telefones && fornecedor.telefones.length > 0) {
      const tel = fornecedor.telefones[0];
      // Checagem de segurança para ddd e numero
      if (tel && tel.ddd && tel.numero) {
        return `(${tel.ddd}) ${tel.numero}`;
      }
    }
    return 'N/A';
  }

  /**
   * Navega para a rota de edição.
   */
  editarFornecedor(id: number): void {
    // Ajuste a rota se for diferente
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
      // O método deletar(id) já existia no seu service
      this.fornecedorService.deletar(this.fornecedorParaExcluir).subscribe({
        next: () => {
          this.fecharModal();
          // Recarrega os dados da página atual
          this.carregarFornecedores(); 
        },
        error: (err: any) => {
          console.error('Erro ao excluir fornecedor:', err);
          this.fecharModal();
          // Idealmente, mostrar um toast de erro para o usuário
        }
      });
    }
  }
}