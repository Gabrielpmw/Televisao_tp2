export interface Dimensao {
  id: number;
  comprimento: number;
  altura: number;
  polegada: number;
}

export interface TipoResolucao {
  id: number;
  nome: string;
  pixels: string;
}

export interface TipoTela {
  id: number;
  nome: string;
}

export class Televisao {
  idTelevisao !: number;
  marca !: string;
  modelo !: string;
  descricao !: string;
  resolucao !: TipoResolucao;
  tipoTela !: TipoTela;
  dimensao !: Dimensao;
  valor !: number;
  estoque !: number;
  nomeImagem !: string;
  ativo !: boolean;

  idModelo !: number;
  idMarca !: number;
}

export interface TelevisaoRequest {
  idModelo: number;
  idTipoResolucao: number;
  idTipoTela: number;
  valor: number;
  estoque: number;
  descricao: string;
  altura: number;
  largura: number;
  polegada: number;
}