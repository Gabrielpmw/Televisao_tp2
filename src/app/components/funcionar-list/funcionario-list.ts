import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
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
export class FuncionarioList implements OnInit {

  private funcionarioService = inject(FuncionarioService);
  private router = inject(Router);
  private authService = inject(AuthService); // Correção: Serviço injetado aqui

  funcionarios: FuncionarioResponse[] = [];
  termoBusca: string = '';

  modalVisivel: boolean = false;
  funcionarioParaExcluir: number | null = null;

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;

  opcoesItensPorPagina: number[] = [10, 25, 50, 100];

  ngOnInit(): void {
    this.carregarFuncionarios();
  }

  carregarFuncionarios(): void {
    const page = this.paginaAtual - 1;
    const pageSize = this.itensPorPagina;

    let observable: Observable<HttpResponse<FuncionarioResponse[]>>;

    // Se tiver termo de busca → ignora paginação
    if (this.termoBusca.trim()) {
      observable = this.funcionarioService.findByUsername(this.termoBusca);
    } else {
      observable = this.funcionarioService.getAll(page, pageSize);
    }

    observable.subscribe({
      next: (response: HttpResponse<FuncionarioResponse[]>) => {
        this.funcionarios = response.body || [];

        const totalCountHeader = response.headers.get('X-Total-Count');
        this.totalRegistros = totalCountHeader ? +totalCountHeader : this.funcionarios.length;

        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);

        // Se excluiu algo e a página ficou vazia, volta uma página
        if (this.funcionarios.length === 0 && this.paginaAtual > 1 && !this.termoBusca.trim()) {
          this.paginaAtual--;
          this.carregarFuncionarios();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar funcionários:', err);
      }
    });
  }

  aplicarBusca(): void {
    this.paginaAtual = 1;
    this.carregarFuncionarios();
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.paginaAtual = 1;
    this.carregarFuncionarios();
  }

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

    const senha = prompt("Digite a senha do funcionário para confirmar:");

    if (!senha) {
      alert("A exclusão foi cancelada.");
      return;
    }

    const dto = {
      idFuncionario: this.funcionarioParaExcluir,
      senhaAlvo: senha
    };

    this.funcionarioService.deletarFuncionario(dto).subscribe({
      next: () => {

        // Obtém usuário logado do AuthService
        const usuarioLogado = this.authService.getUsuarioLogadoSync();

        // Caso 1 — deletou a própria conta
        if (usuarioLogado && usuarioLogado.id === dto.idFuncionario) {
          this.authService.logout();      // limpa token + usuário
          alert("Sua conta foi excluída. Você será desconectado.");
          this.router.navigate(['/login']);
          return;
        }

        // Caso 2 — ADM deletou outro funcionário
        this.fecharModal();
        this.carregarFuncionarios();
      },

      error: (err) => {
        console.error("Erro ao excluir funcionário:", err);
        alert("Erro ao excluir funcionário: " + (err.error?.message || ""));
        this.fecharModal();
      }
    });
  }
}