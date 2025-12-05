import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
    CurrencyPipe
  ],
  templateUrl: './televisao-admin-list.html',
  styleUrls: ['./televisao-admin-list.css']
})
export class TelevisaoAdminList implements OnInit {

  televisoes: Televisao[] = [];
  termoBusca: string = '';

  modalVisivel: boolean = false;
  televisaoParaExcluir: number | null = null;

  // NOVO: Controle de Filtros (Ativos vs Lixeira)
  filtroStatus: 'ativos' | 'inativos' = 'ativos';

  // NOVO: Para indicar se é uma exclusão lógica (desativação) ou ativação
  acaoModal: 'desativar' | 'ativar' = 'desativar';

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;
  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  constructor(
    private televisaoService: TelevisaoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarTelevisoes();
  }

  // --- Lógica de Alternância (Ativos/Lixeira) ---
  // Adaptação do seu modelo-list.ts
  alternarStatusVisualizacao(status: 'ativos' | 'inativos'): void {
    if (this.filtroStatus !== status) {
      this.filtroStatus = status;
      this.paginaAtual = 1;
      this.termoBusca = ''; // Limpa a busca ao trocar de aba
      this.carregarTelevisoes();
    }
  }

  carregarTelevisoes(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<TelevisaoPaginada>;

    // 1. Busca por Modelo (A busca por modelo só deve ocorrer na lista ATIVA)
    if (this.termoBusca.trim() && this.filtroStatus === 'ativos') {
      observable = this.televisaoService.findByModelo(this.termoBusca, page, pageSize);
    }
    // 2. Carrega Lixeira (Inativas)
    else if (this.filtroStatus === 'inativos') {
      observable = this.televisaoService.findAllInativas(page, pageSize);
    }
    // 3. Carrega Lista Ativa (Padrão)
    else {
      observable = this.televisaoService.findAll(page, pageSize);
    }

    observable.subscribe({
      next: (response: TelevisaoPaginada) => {
        this.televisoes = response.televisoes || [];
        this.totalRegistros = response.totalCount;

        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);

        // Se deletou o último item da página e ela ficou vazia, volta uma
        if (this.televisoes.length === 0 && this.paginaAtual > 1) {
          this.paginaAtual--;
          this.carregarTelevisoes();
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar televisões:', err);
      }
    });
  }

  // --- MÉTODOS DE PAGINAÇÃO E BUSCA (SEM ALTERAÇÃO) ---
  aplicarBusca(): void {
    this.paginaAtual = 1;
    // Garante que a busca só funciona na aba "ativos"
    if (this.filtroStatus === 'ativos') {
      this.carregarTelevisoes();
    }
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

  // --- AÇÕES DE SOFT DELETE / RESTAURAÇÃO ---

  // MÉTODO UNIFICADO PARA ABRIR O MODAL
  abrirModalConfirmacao(id: number, acao: 'desativar' | 'ativar'): void {
    this.televisaoParaExcluir = id;
    this.acaoModal = acao; // Define a ação (desativar ou ativar/restaurar)
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.televisaoParaExcluir = null;
  }

  // MÉTODO UNIFICADO PARA CONFIRMAR AÇÃO
  confirmarExclusao(): void {
    if (this.televisaoParaExcluir) {

      let observable: Observable<void>;

      // Decide qual método chamar (delete = desativar, restore = ativar)
      if (this.acaoModal === 'desativar') {
        observable = this.televisaoService.delete(this.televisaoParaExcluir); // Rota /desativar
      } else { // acaoModal === 'ativar' (Restaurar)
        observable = this.televisaoService.restore(this.televisaoParaExcluir); // Rota /restaurar
      }

      observable.subscribe({
        next: () => {
          console.log(`Televisão ID ${this.televisaoParaExcluir} ${this.acaoModal}da com sucesso.`);
          this.fecharModal();
          // Recarrega a lista atual (ativos ou inativos)
          this.carregarTelevisoes();
        },
        error: (err) => {
          console.error(`Erro ao ${this.acaoModal} televisão:`, err);
          this.fecharModal();
        }
      });
    }
  }

  // --- OUTRAS AÇÕES DE CRUD ---
  editarTelevisao(id: number): void {
    this.router.navigate(['/perfil-admin/televisoes/edit', id]);
  }
}