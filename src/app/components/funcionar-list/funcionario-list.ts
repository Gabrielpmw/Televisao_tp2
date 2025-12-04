import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth-service.service';
import { FuncionarioResponse } from '../../model/Funcionario.model';
import { FuncionarioService } from '../../services/funcionario.service';

@Component({
  selector: 'app-funcionario-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './funcionario-list.html',
  styleUrls: ['./funcionario-list.css']
})
export class FuncionarioList implements OnInit, OnDestroy {

  private funcionarioService = inject(FuncionarioService);
  private router = inject(Router);
  private authService = inject(AuthService);

  funcionarios: FuncionarioResponse[] = [];
  termoBusca: string = '';

  // Controle da Busca Automática (RxJS)
  private buscaSubject = new Subject<string>();
  private buscaSubscription!: Subscription;

  modalVisivel: boolean = false;
  funcionarioParaExcluir: number | null = null;

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;

  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  ngOnInit(): void {
    this.carregarFuncionarios();
    this.configurarBuscaAutomatica();
  }

  ngOnDestroy(): void {
    if (this.buscaSubscription) {
      this.buscaSubscription.unsubscribe();
    }
  }

  configurarBuscaAutomatica(): void {
    this.buscaSubscription = this.buscaSubject.pipe(
      debounceTime(500), // Espera 500ms
      distinctUntilChanged()
    ).subscribe((termo: string) => {
      this.termoBusca = termo;
      this.paginaAtual = 1;
      this.carregarFuncionarios();
    });
  }

  // Chamado pelo (ngModelChange) do HTML
  onBuscaInput(termo: string): void {
    this.buscaSubject.next(termo);
  }

  carregarFuncionarios(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<FuncionarioResponse[]>>;

    if (this.termoBusca && this.termoBusca.trim()) {
      // Agora passamos a paginação também para a busca!
      // Usando findByNome conforme solicitado anteriormente.
      // Se quiser buscar por username, troque para this.funcionarioService.findByUsername(...)
      observable = this.funcionarioService.findByNome(this.termoBusca, page, pageSize);
    } else {
      observable = this.funcionarioService.findAll(page, pageSize);
    }

    observable.subscribe({
      next: (response: HttpResponse<FuncionarioResponse[]>) => {
        this.funcionarios = response.body || [];

        // Lê o total do Header X-Total-Count
        const totalCountHeader = response.headers.get('X-Total-Count');
        this.totalRegistros = totalCountHeader ? +totalCountHeader : 0;

        // Recalcula o total de páginas
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);

        // Se a página atual ficou vazia (ex: deletou o último item), volta uma página
        if (this.funcionarios.length === 0 && this.paginaAtual > 1) {
          this.paginaAtual--;
          this.carregarFuncionarios();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar funcionários:', err);
      }
    });
  }

  // Métodos de Paginação
  onItensPorPaginaChange(): void {
    this.paginaAtual = 1;
    this.carregarFuncionarios();
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.carregarFuncionarios();
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  // Ações da Tabela
  editarFuncionario(id: number): void {
    this.router.navigate(['/perfil-admin/funcionarios/edit', id]);
  }

  abrirModalExclusao(id: number): void {
    this.funcionarioParaExcluir = id;
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.funcionarioParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (!this.funcionarioParaExcluir) return;

    // TODO: Idealmente, usar um modal próprio para pedir a senha, e não o prompt nativo
    const senha = prompt("Digite a senha do funcionário (ADMIN) para confirmar a exclusão:");

    if (!senha) {
      alert("A exclusão foi cancelada (senha não informada).");
      return;
    }

    const dto = {
      idFuncionario: this.funcionarioParaExcluir,
      senhaAlvo: senha
    };

    this.funcionarioService.deletarFuncionario(dto).subscribe({
      next: () => {
        // Verifica se deletou o próprio usuário logado
        const usuarioLogado = this.authService.getUsuarioLogadoSync();
        
        if (usuarioLogado && usuarioLogado.id === dto.idFuncionario) {
          this.authService.logout();
          alert("Sua conta foi excluída. Você será desconectado.");
          this.router.navigate(['/login']);
          return;
        }

        this.fecharModal();
        this.carregarFuncionarios();
      },
      error: (err) => {
        console.error("Erro ao excluir funcionário:", err);
        // Tenta pegar a mensagem de erro do backend (ex: "Senha incorreta")
        const msg = err.error?.message || err.error?.error || "Erro desconhecido";
        alert("Erro ao excluir: " + msg);
        this.fecharModal(); // Opcional: manter aberto se quiser que tente de novo
      }
    });
  }
}