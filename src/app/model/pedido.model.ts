import { Televisao } from "./televisao.model";

// --- DTOs AUXILIARES ---

export interface ItemPedidoRequestDTO {
  idTelevisao: number;
  // Mantendo a compatibilidade com o backend (se lá estiver 'quatidade', aqui também deve estar)
  quatidade: number;
}

// Correto, pois seu Java usa @JsonFormat(shape = OBJECT)
export interface StatusPedido {
  id: number;
  // Atenção: O Java retorna o nome do getter. Se for getStatus(), vem "status".
  // O valor virá como "pedido em processo", "pedido entregue", etc.
  status: string; 
}

export interface CartaoRequestDTO {
  titular: string;
  numero: string;
  cvv: string;
  // Tipo: String no formato ISO-8601: "YYYY-MM-DD" para ser lido como LocalDate pelo Java
  dataValidade: string;
}

// ✅ NOVA INTERFACE CRIADA (Necessária para o Snapshot funcionar no front)
export interface EnderecoEntregaResponseDTO {
  id: number;
  cep: string;
  bairro: string;
  complemento: string;
  numero: number;
  municipio: string; // No Java alteramos para retornar o NOME da cidade (String)
  username: string;
}

// --- DTOs DE REQUEST (ENVIO) ---

export interface PedidoRequestDTO {
  idEndereco: number;
  itens: ItemPedidoRequestDTO[];
}

// Mapeando PedidoupdateRequestDTO do Java
export interface PedidoUpdateRequestDTO {
  idEndereco: number;
  status?: string | null; // Adicionei null para garantir compatibilidade
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
  statusPedido: StatusPedido; // Objeto {id, status}
  
  // 🔄 ALTERADO: De 'any' para a nova interface, para o HTML reconhecer '.municipio'
  enderecoEntrega: EnderecoEntregaResponseDTO; 
  
  itens: ItemPedidoResponseDTO[];
  comprador: string; // username
}

export interface ItemCarrinho {
  id: number;          // O ID da TV
  nome: string;        // Ex: "Samsung Crystal 4K"
  preco: number;       // Para calcular o subtotal na tela
  quantidade: number;
  imagem: string;      // Para mostrar a foto no carrinho
}