import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necessário para [(ngModel)]
import { UsuarioService } from '../../services/usuarioservice.service';
import { Usuario, Perfil, UsuarioUpdateCredenciaisAdminDTO } from '../../model/usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  // Removido NgxMaskPipe e providers
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css'
})
export class UsuarioList implements OnInit {

  // --- 1. DADOS ---
  usuariosTodas: Usuario[] = [];     // Lista completa (cache)
  usuariosFiltrados: Usuario[] = []; // Lista após filtro de busca
  usuariosPaginados: Usuario[] = []; // Lista exibida na página atual

  // --- 2. CONTROLES DE PAGINAÇÃO ---
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  totalRegistros: number = 0;
  totalPaginas: number = 0;

  // --- 3. CONTROLES DE BUSCA ---
  termoBusca: string = '';

  // --- 4. CONTROLES DOS MODAIS ---
  
  // Modal de Exclusão
  modalVisivel: boolean = false;
  usuarioSelecionado: Usuario | null = null;

  // Modal de Credenciais (Login/Senha)
  modalCredenciaisVisivel: boolean = false;
  credenciaisData = { username: '', novaSenha: '' };

  // --- 5. FEEDBACK ---
  mensagemErro: string = '';
  mensagemSucesso: string = '';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  // --- LÓGICA DE CARREGAMENTO ---
  carregarUsuarios(): void {
    this.usuarioService.findAll().subscribe({
      next: (dados) => {
        // Filtra apenas Clientes e Normaliza o objeto Perfil
        this.usuariosTodas = dados
          .filter(u => {
            const p = u.perfil as any;
            if (!p) return false;
            
            // Verifica se é string ou objeto e se é cliente (ID 2)
            const isStringClient = (typeof p === 'string' && p.toLowerCase() === 'cliente');
            const isObjectClient = (p.id === 2 || p.ID === 2 || p.nome === 'cliente' || p.NOME === 'cliente');
            
            return isStringClient || isObjectClient;
          })
          .map(u => ({ ...u, perfil: Perfil.USER })); // Garante tipagem correta

        // Inicializa a tabela
        this.aplicarBusca();
      },
      error: (erro) => {
        console.error('Erro ao buscar usuários:', erro);
        this.mensagemErro = 'Não foi possível carregar a lista de clientes.';
      }
    });
  }

  // --- LÓGICA DE BUSCA ---
  aplicarBusca(): void {
    this.mensagemErro = ''; 
    this.mensagemSucesso = '';

    if (!this.termoBusca) {
      this.usuariosFiltrados = [...this.usuariosTodas];
    } else {
      const termo = this.termoBusca.toLowerCase();
      
      this.usuariosFiltrados = this.usuariosTodas.filter(u => 
        u.nome?.toLowerCase().includes(termo) || 
        u.sobrenome?.toLowerCase().includes(termo) || 
        u.username.toLowerCase().includes(termo) ||
        (u.email && u.email.toLowerCase().includes(termo)) ||
        (u.cpf && u.cpf.includes(termo)) // Busca por CPF
      );
    }
    
    // Reseta paginação
    this.totalRegistros = this.usuariosFiltrados.length;
    this.paginaAtual = 1; 
    this.atualizarPaginacao();
  }

  // --- LÓGICA DE PAGINAÇÃO ---
  atualizarPaginacao(): void {
    this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina);
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    
    this.usuariosPaginados = this.usuariosFiltrados.slice(inicio, fim);
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.atualizarPaginacao();
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.atualizarPaginacao();
    }
  }

  onItensPorPaginaChange(): void {
    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  // --- MODAL DE EXCLUSÃO ---
  abrirModalExclusao(id: number): void {
    this.usuarioSelecionado = this.usuariosTodas.find(u => u.id === id) || null;
    this.modalVisivel = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.usuarioSelecionado = null;
  }

  confirmarExclusao(): void {
    if (this.usuarioSelecionado) {
      this.usuarioService.deleteByAdmin(this.usuarioSelecionado.id).subscribe({
        next: () => {
          // Remove da memória para não precisar recarregar do servidor
          this.usuariosTodas = this.usuariosTodas.filter(u => u.id !== this.usuarioSelecionado!.id);
          this.aplicarBusca();
          
          this.mensagemSucesso = 'Cliente excluído com sucesso.';
          this.fecharModal();
        },
        error: (erro) => {
          console.error(erro);
          this.mensagemErro = 'Erro ao tentar excluir o cliente.';
          this.fecharModal();
        }
      });
    }
  }

  // --- MODAL DE CREDENCIAIS (LOGIN/SENHA) ---
  abrirModalCredenciais(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    // Preenche com username atual para facilitar edição
    this.credenciaisData = { 
      username: usuario.username, 
      novaSenha: '' 
    };
    this.modalCredenciaisVisivel = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }

  fecharModalCredenciais(): void {
    this.modalCredenciaisVisivel = false;
    this.usuarioSelecionado = null;
    this.credenciaisData = { username: '', novaSenha: '' };
  }

  salvarCredenciais(): void {
    if (!this.usuarioSelecionado || !this.credenciaisData.username || !this.credenciaisData.novaSenha) return;

    // Prepara o DTO correto
    const dto: UsuarioUpdateCredenciaisAdminDTO = {
      username: this.credenciaisData.username,
      novaSenha: this.credenciaisData.novaSenha
    };

    this.usuarioService.updateCredenciaisByAdmin(this.usuarioSelecionado.id, dto).subscribe({
      next: () => {
        // Atualiza o username na lista local (feedback instantâneo)
        if (this.usuarioSelecionado) {
           this.usuarioSelecionado.username = dto.username;
           
           // Atualiza na lista "mestra" também
           const index = this.usuariosTodas.findIndex(u => u.id === this.usuarioSelecionado?.id);
           if (index !== -1) this.usuariosTodas[index].username = dto.username;
        }

        this.mensagemSucesso = 'Credenciais atualizadas com sucesso!';
        this.fecharModalCredenciais();
      },
      error: (err) => {
        console.error(err);
        this.mensagemErro = 'Erro ao atualizar. O Username pode já estar em uso.';
      }
    });
  }
}