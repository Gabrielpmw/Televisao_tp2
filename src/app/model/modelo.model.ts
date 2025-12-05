
export interface Modelo {
  modelo: string;
  mesesGarantia: number;
  anoLancamento: string;
  idMarca: number;
  idCaracteristicas: number;
}


export interface ModeloResponse {
  id: number;
  modelo: string;
  mesesGarantia: number;
  anoLancamento: string;
  ativo?: boolean | null;


  marca: {
    id: number;
    nomeMarca: string;
  };

  caracteristicasResponseDTO: {
    id: number;
    nome: string;
  };

  idMarca: number;
}