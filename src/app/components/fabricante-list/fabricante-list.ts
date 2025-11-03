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

  // Esta lista agora guarda APENAS os 10 (ou 25, 50...) itens da página atual
  fabricantes: Fabricante[] = [];

  // --- Controle da Busca ---
  termoBusca: string = '';

  // --- Controle do Modal ---
  modalVisivel: boolean = false;
  fabricanteParaExcluir: number | null = null;

  // --- Controle de Paginação (Lado Servidor) ---
  paginaAtual: number = 1; // Página que o usuário vê (começa em 1)
  itensPorPagina: number = 5;
  totalRegistros: number = 0; // Total de itens (vem do X-Total-Count)
  totalPaginas: number = 0;   // Calculado
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private fabricanteService: FabricanteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarFabricantes();
  }

  /**
   * Esta é a função principal.
   * Ela é chamada no início, ao mudar de página, ao buscar, ou ao deletar.
   */
  carregarFabricantes(): void {
    // Converte a página do usuário (1-based) para a página do backend (0-based)
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<Fabricante[]>>;

    // Decide qual método do serviço chamar
    if (this.termoBusca.trim()) {
      observable = this.fabricanteService.findByNome(this.termoBusca, page, pageSize);
    } else {
      observable = this.fabricanteService.getFabricantes(page, pageSize);
    }

    observable.subscribe({
      next: (response: HttpResponse<Fabricante[]>) => {
        // 1. Pega o body (a lista de fabricantes da página)
        this.fabricantes = response.body || [];

        // 2. Pega o total de registros do header
        // O '+' converte a string do header para número
        this.totalRegistros = +response.headers.get('X-Total-Count')!;

        // 3. Calcula o total de páginas
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
        
        // (DEBUG: Veja o aviso sobre o bug de 'count(nome)' aqui)
        if (this.termoBusca.trim() && this.totalRegistros === 0) {
          console.warn("A busca retornou X-Total-Count = 0. Se há resultados na tela, o bug no 'count(nome)' do backend está ativo.");
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar fabricantes:', err);
        // Aqui você pode adicionar uma notificação de erro para o usuário
      }
    });
  }

  /**
   * Chamado pelo (keydown.enter) da barra de busca.
   * Reseta a página para 1 e recarrega.
   */
  aplicarBusca(): void {
    this.paginaAtual = 1;
    this.carregarFabricantes();
  }

  /**
   * Limpa a busca e recarrega a lista completa.
   * (Pode ser ligado a um botão 'X' na busca)
   */
  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 1;
    this.carregarFabricantes();
  }

  /**
   * Chamado pelo (change) do <select> de itens por página.
   * Reseta para a página 1 e recarrega.
   */
  onItensPorPaginaChange(): void {
    this.paginaAtual = 1; // Volta para a primeira página
    this.carregarFabricantes();
  }

  // --- Funções de Navegação de Página ---
  // Elas apenas mudam o número da página e chamam o recarregamento.

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

  // --- Funções Helper e Modal (Mudança Mínima) ---

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
        // Recarrega os dados da página atual
        // (Se for o último item da página, idealmente deveria voltar uma página,
        // mas isso é um refinamento. Recarregar a atual é o padrão)
        this.carregarFabricantes(); 
      });
    }
  }
}