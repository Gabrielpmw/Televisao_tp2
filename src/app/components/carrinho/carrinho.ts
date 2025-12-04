import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Services
import { CarrinhoService } from '../../services/carrinho.service';
import { PedidoService } from '../../services/pedido.service';
import { EnderecoService } from '../../services/endereco.service';
import { TelevisaoService } from '../../services/televisao-service';
// Models
import { ItemCarrinho, CartaoRequestDTO } from '../../model/pedido.model'; // PedidoRequestDTO foi movido para uso implícito (tipo any) para simplificar
import { EnderecoResponseDTO } from '../../model/Endereco.model';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrinho.html',
  styleUrls: ['./carrinho.css']
})
export class Carrinho implements OnInit {

  // ----------------------------
  // INJEÇÕES
  // ----------------------------
  private carrinhoService = inject(CarrinhoService);
  private pedidoService = inject(PedidoService);
  private enderecoService = inject(EnderecoService);
  private router = inject(Router);
  private televisaoService = inject(TelevisaoService);

  // ----------------------------
  // ESTADOS
  // ----------------------------
  itens: ItemCarrinho[] = [];
  enderecos: EnderecoResponseDTO[] = [];

  enderecoSelecionado: number | null = null;
  frete: number = 0;
  prazoEntrega: number = 0;

  formaPagamento: string = 'pix';
  isAddressOpen: boolean = true;

  // ----------------------------
  // MODAIS
  // ----------------------------
  modalPixVisible: boolean = false;
  modalCardVisible: boolean = false;
  modalBoletoVisible: boolean = false;
  modalSuccessVisible: boolean = false;

  idPedidoCriado: number | null = null;
  idPagamentoGerado: number | null = null;

  codigoPix: string = '';
  boletoCodigo: string = '';

  // ----------------------------
  // CARTÃO
  // ----------------------------
  dadosCartao: CartaoRequestDTO = {
    titular: '',
    numero: '',
    cvv: '',
    dataValidade: '',
  };

  mesValidade: string = '';
  anoValidade: string = '';

  // ----------------------------
  // INICIALIZAÇÃO
  // ----------------------------
  ngOnInit(): void {
    this.carrinhoService.carrinho$.subscribe(lista => {
      this.itens = lista;
    });

    this.carregarEnderecos();
  }

  carregarEnderecos() {
    this.enderecoService.getMyEnderecos().subscribe({
      next: (data) => {
        this.enderecos = data;

        if (this.enderecos.length > 0) {
          this.selecionarEndereco(this.enderecos[0].idEndereco);
        }
      },
      error: (err) => console.error('Erro ao carregar endereços', err)
    });
  }

  // ----------------------------
  // CARRINHO
  // ----------------------------
  aumentarQtd(item: ItemCarrinho) {
    if (item.quantidade < 10) {
      this.carrinhoService.atualizarQuantidade(item.id, item.quantidade + 1);
    }
  }

  diminuirQtd(item: ItemCarrinho) {
    if (item.quantidade > 1) {
      this.carrinhoService.atualizarQuantidade(item.id, item.quantidade - 1);
    } else {
      this.carrinhoService.remover(item.id);
    }
  }

  removerItem(id: number) {
    this.carrinhoService.remover(id);
  }

  // ----------------------------
  // ENDEREÇOS
  // ----------------------------
  toggleAddress() {
    this.isAddressOpen = !this.isAddressOpen;
  }

  selecionarEndereco(id: number) {
    this.enderecoSelecionado = id;

    // Frete simulado
    this.frete = Math.floor(Math.random() * (30 - 15 + 1)) + 15;
    this.prazoEntrega = 5;
  }

  // ----------------------------
  // CÁLCULOS
  // ----------------------------
  getSubtotal(): number {
    return this.itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  }

  getTotal(): number {
    return this.getSubtotal() + this.frete;
  }

  // ----------------------------
  // FINALIZAÇÃO DO PEDIDO
  // ----------------------------
  iniciarFinalizacao() {
    if (!this.enderecoSelecionado) {
      alert("Selecione um endereço para continuar.");
      return;
    }

    if (this.itens.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    if (this.formaPagamento === 'card') {
      this.modalCardVisible = true;
      return;
    }

    this.processarPedido();
  }

  validarECriarPedidoCartao() {
    if (!this.dadosCartao.titular ||
      !this.dadosCartao.numero ||
      !this.dadosCartao.cvv ||
      !this.mesValidade ||
      !this.anoValidade) {

      alert("Preencha todos os dados do cartão.");
      return;
    }

    this.processarPedido();
  }

  processarPedido() {
    
    const pedidoDTO: any = { 
      idEndereco: this.enderecoSelecionado!,
      itens: this.itens.map(i => ({
        idTelevisao: i.id,
        quatidade: i.quantidade
      })),
      
      // 💡 CORREÇÃO AQUI: Enviamos os dois campos que o DTO do Java espera (Double)
      valorTotal: this.getTotal(), 
      valorFrete: this.frete 
    };

    this.pedidoService.criarPedido(pedidoDTO).subscribe({
      next: (resp) => {
        this.idPedidoCriado = resp.id;

        // Limpeza do carrinho movida para o fecharSucesso()
        
        switch (this.formaPagamento) {
          case 'pix': this.gerarPix(resp.id); break;
          case 'boleto': this.gerarBoleto(resp.id); break;
          case 'card': this.pagarComCartao(resp.id); break;
        }
      },
      error: () => alert('Erro ao criar pedido.')
    });
  }

  // ----------------------------
  // PIX
  // ----------------------------
  gerarPix(idPedido: number) {
    this.pedidoService.gerarPix(idPedido).subscribe({
      next: (data) => {
        this.idPagamentoGerado = data.id;
        this.codigoPix = data.chaveDestinatario || 'CHAVE-TESTE';
        this.modalPixVisible = true;
      },
      error: () => alert('Erro ao gerar PIX.')
    });
  }

  // ----------------------------
  // BOLETO
  // ----------------------------
  gerarBoleto(idPedido: number) {
    this.pedidoService.gerarBoleto(idPedido).subscribe({
      next: (data) => {
        this.idPagamentoGerado = data.id;
        this.boletoCodigo = data.numeroBoleto || 'LINHA-TESTE';
        this.modalBoletoVisible = true;
      },
      error: () => alert('Erro ao gerar boleto.')
    });
  }

  // ----------------------------
  // CARTÃO
  // ----------------------------
  pagarComCartao(idPedido: number) {
    const mes = this.mesValidade.padStart(2, '0');
    const ano = `20${this.anoValidade}`;

    this.dadosCartao.dataValidade = `${ano}-${mes}-01`;

    this.pedidoService.efetuarPagamentoCartao(idPedido, this.dadosCartao).subscribe({
      next: () => {
        this.modalCardVisible = false;
        this.modalSuccessVisible = true;
      },
      error: () => alert('Erro ao processar cartão.')
    });
  }

  // ----------------------------
  // CONFIRMAÇÕES MOCK
  // ----------------------------
  confirmarPagamentoMock() {
    if (!this.idPagamentoGerado) return;

    if (this.formaPagamento === 'pix') {
      this.pedidoService.efetuarPagamentoPix(this.idPagamentoGerado).subscribe({
        next: () => {
          this.modalPixVisible = false;
          this.modalSuccessVisible = true;
        }
      });
    }

    if (this.formaPagamento === 'boleto') {
      this.pedidoService.efetuarPagamentoBoleto(this.idPagamentoGerado).subscribe({
        next: () => {
          this.modalBoletoVisible = false;
          this.modalSuccessVisible = true;
        }
      });
    }
  }

  // ----------------------------
  // FINALIZAÇÃO
  // ----------------------------
  fecharSucesso() {
    // Limpa o carrinho SÓ AGORA
    this.carrinhoService.limparCarrinho(); 
    
    this.modalSuccessVisible = false;
    this.router.navigate(['/perfil/pedidos']);
  }

  copiarCodigo(texto: string) {
    navigator.clipboard.writeText(texto);
    alert("Código copiado!");
  }

  getImagem(item: ItemCarrinho): string {
    if (item.imagem) {
      return `/Imagens_TV/${item.imagem}`;
    }
    return '/tv.jpg';
  }
}