import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importação do MatSnackBar

// Services
import { PedidoService } from '../../services/pedido.service';
import { EnderecoService } from '../../services/endereco.service';

// Models
import { 
  PedidoResponseDTO, 
  PedidoUpdateRequestDTO, 
  StatusPedido 
} from '../../model/pedido.model';
import { EnderecoResponseDTO } from '../../model/Endereco.model';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  // 💡 Adicionando MatSnackBarModule nas importações
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './pedido-list.html',
  styleUrls: ['./pedido-list.css']
})
export class PedidoList implements OnInit {
  
  // Injeções
  private pedidoService = inject(PedidoService);
  private enderecoService = inject(EnderecoService);
  private snackBar = inject(MatSnackBar); // 💡 INJEÇÃO DO SNACK BAR

  // Estados
  pedidos: PedidoResponseDTO[] = [];
  meusEnderecos: EnderecoResponseDTO[] = [];
  
  // Controle de Modais
  modalCancelarAberto = false;
  modalEnderecoAberto = false;
  
  // Dados para edição
  idPedidoSelecionado: number | null = null;
  idNovoEndereco: number | null = null; // Para o ngModel do select de endereços

  ngOnInit(): void {
    this.carregarPedidos();
  }

  // 💡 NOVO MÉTODO PARA EXIBIR SNACK BAR
  exibirSnackBar(mensagem: string, classe: string) {
    this.snackBar.open(mensagem, 'FECHAR', {
      duration: 5000, // 5 segundos
      panelClass: [classe],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  carregarPedidos() {
    this.pedidoService.findMeusPedidos().subscribe({
      next: (dados) => {
        this.pedidos = dados;
        // Opcional: Ordenar do mais recente para o mais antigo
        this.pedidos.sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime());
      },
      error: (err) => {
        console.error('Erro ao buscar pedidos', err);
        this.exibirSnackBar('Erro ao carregar seus pedidos.', 'snackbar-admin-error');
      }
    });
  }

  // --- LÓGICA DE VISUALIZAÇÃO (Status por ID) ---

  // Retorna a classe CSS baseada no ID do Status
  getStatusClass(statusObj: StatusPedido): string {
    // 1: Em Processo, 2: Saiu p/ Entrega, 3: Entregue, 4: Cancelado
    switch (statusObj.id) {
      case 1: return 'status-processo';
      case 2: return 'status-entrega';
      case 3: return 'status-entregue';
      case 4: return 'status-cancelado';
      default: return '';
    }
  }

  getStatusLabel(statusObj: StatusPedido): string {
    switch (statusObj.id) {
      case 1: return '⏳ Em Processo';
      case 2: return '🚚 Saiu para Entrega';
      case 3: return '✅ Entregue';
      case 4: return '❌ Cancelado';
      default: return statusObj.status; // Retorna o texto original caso não mapeado
    }
  }

  // Verifica visualmente se pode editar (Regra de 24h + Status ID 1)
  podeEditar(pedido: PedidoResponseDTO): boolean {
    // Só permite editar se o status for 1 (EM PROCESSO)
    if (pedido.statusPedido.id !== 1) return false;
    
    const dataPedido = new Date(pedido.dataPedido);
    const agora = new Date();
    // Diferença em horas
    const diferencaHoras = Math.abs(agora.getTime() - dataPedido.getTime()) / 36e5;
    
    return diferencaHoras < 24;
  }

  // --- ALTERAR ENDEREÇO ---

  abrirModalEndereco(idPedido: number) {
    this.idPedidoSelecionado = idPedido;
    this.idNovoEndereco = null; // Reseta a seleção anterior
    
    // Busca os endereços cadastrados do usuário para preencher o <select>
    this.enderecoService.getMyEnderecos().subscribe({
      next: (enderecos) => {
        this.meusEnderecos = enderecos;
        this.modalEnderecoAberto = true;
      },
      error: () => this.exibirSnackBar('Erro ao carregar seus endereços. Tente novamente.', 'snackbar-admin-error')
    });
  }

  confirmarTrocaEndereco() {
    if (!this.idPedidoSelecionado || !this.idNovoEndereco) {
      this.exibirSnackBar("Por favor, selecione um endereço da lista.", 'snackbar-admin-error');
      return;
    }

    const dto: PedidoUpdateRequestDTO = {
      idEndereco: this.idNovoEndereco,
      status: null // null porque não estamos alterando o status, apenas o endereço
    };

    this.pedidoService.atualizarPedido(this.idPedidoSelecionado, dto).subscribe({
      next: () => {
        this.exibirSnackBar('Endereço de entrega atualizado com sucesso!', 'snackbar-success');
        this.fecharModais();
        this.carregarPedidos(); // Recarrega a lista para mostrar o novo endereço snapshot
      },
      error: (err: HttpErrorResponse) => {
        // Exibe a mensagem de erro vinda do backend (ex: prazo expirado)
        const mensagem = err.error?.message || 'Erro ao atualizar endereço.';
        this.exibirSnackBar(mensagem, 'snackbar-admin-error');
      }
    });
  }

  // --- CANCELAR PEDIDO ---

  abrirModalCancelar(idPedido: number) {
    this.idPedidoSelecionado = idPedido;
    this.modalCancelarAberto = true;
  }

  confirmarCancelamento() {
    if (!this.idPedidoSelecionado) return;

    // Para cancelar, enviamos idEndereco 0 (ignorado no back) e status "sim"
    const dto: PedidoUpdateRequestDTO = {
      idEndereco: 0, 
      status: 'sim' 
    };

    this.pedidoService.atualizarPedido(this.idPedidoSelecionado, dto).subscribe({
      next: () => {
        this.exibirSnackBar('Pedido cancelado com sucesso.', 'snackbar-success');
        this.fecharModais();
        this.carregarPedidos();
      },
      error: (err: HttpErrorResponse) => {
        const mensagem = err.error?.message || 'Erro ao cancelar pedido.';
        this.exibirSnackBar(mensagem, 'snackbar-admin-error');
      }
    });
  }

  fecharModais() {
    this.modalCancelarAberto = false;
    this.modalEnderecoAberto = false;
    this.idPedidoSelecionado = null;
    this.idNovoEndereco = null;
  }
}