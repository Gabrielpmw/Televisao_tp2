import { Televisao } from "./televisao.model";

// --- DTOs AUXILIARES ---

export interface ItemPedidoRequestDTO {
  idTelevisao: number;
  // Mantendo a compatibilidade com o backend (se lá estiver 'quatidade', aqui também deve estar)
  quatidade: number;
}

export interface StatusPedido {
  id: number;
  status: string;
}

export interface CartaoRequestDTO {
  titular: string;
  numero: string;
  cvv: string;
  // Tipo: String no formato ISO-8601: "YYYY-MM-DD" para ser lido como LocalDate pelo Java
  dataValidade: string;
}

// --- DTOs DE REQUEST (ENVIO) ---

export interface PedidoRequestDTO {
  idEndereco: number;
  itens: ItemPedidoRequestDTO[];
}

// Mapeando PedidoupdateRequestDTO do Java
export interface PedidoUpdateRequestDTO {
  idEndereco: number;
  status?: string;
}

// --- DTOs DE RESPONSE (RECEBIMENTO) ---

export interface ItemPedidoResponseDTO {
  id: number;
  televisao: Televisao;
  quantidadeTelevisao: number;
  total: number;
}

export interface PedidoResponseDTO {
  id: number;
  dataPedido: string; // Vem como string do Java (LocalDateTime)
  valorTotal: number;
  statusPedido: StatusPedido;
  enderecoEntrega: any; // Tipar com EnderecoResponseDTO se tiver
  itens: ItemPedidoResponseDTO[];
  comprador: string; // username
}

export interface ItemCarrinho {
  id: number;          // O ID da TV
  nome: string;        // Ex: "Samsung Crystal 4K"
  preco: number;       // Para calcular o subtotal na tela
  quantidade: number;
  imagem: string;      // Para mostrar a foto no carrinho
}