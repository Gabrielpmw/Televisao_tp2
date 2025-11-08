
export class CaracteristicasGerais {
  constructor(
    public id: number,
    public nome: string,
    public sistemaOperacional: string,
    public quantidadeHDMI: number,
    public quantidadeUSB: number,
    public smartTV: boolean
  ) {}
}

export class CaracteristicasGeraisRequest {
  constructor(
    public nome: string,
    public sistemaOperacional: string,
    public quantidadeHDMI: number,
    public quantidadeUSB: number,
    public smartTV: boolean
  ) {}
}