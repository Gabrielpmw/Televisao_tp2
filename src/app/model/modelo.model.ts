import { CaracteristicasGerais } from './caracteristicas-gerais.model';

// 1. Esta é a classe Request, que bate com o seu ModeloRequestDTO.java
// O seu service 'modelo.service.ts' usa 'Modelo' como o nome para a request.
// (Esta classe se chamava 'ModeloRequest' no meu arquivo anterior, mas seu service usa 'Modelo', então vamos usar 'Modelo')
export class Modelo {
  constructor(
    public modelo: string,
    public mesesGarantia: number,
    public anoLancamento: string, // String para o <input type="date">
    public idMarca: number,
    public idCaracteristicas: number
  ) {}
}

// 2. Esta é a classe Response, que bate 100% com o seu ModeloResponseDTO.java
// ELA AGORA TEM O 'idMarca'
export class ModeloResponse {
  constructor(
    public id: number,
    public modelo: string,
    public idMarca: number,  // <-- A propriedade que faltava e causava o erro
    public marca: string,  // (Seu DTO chama isso de 'marca', não 'nomeMarca')
    public mesesGarantia: number,
    public anoLancamento: string,
    public caracteristicasResponseDTO: CaracteristicasGerais
  ) {}
}