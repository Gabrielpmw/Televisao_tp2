// Este arquivo espelha seus DTOs CaracteristicasRequestDTO e CaracteristicasResponseDTO

// Esta classe é importada pelo seu 'modelo-form.component.ts'
// (através do ModeloResponse)
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

// Esta classe será usada se você fizer um form para Características
export class CaracteristicasGeraisRequest {
  constructor(
    public nome: string,
    public sistemaOperacional: string,
    public quantidadeHDMI: number,
    public quantidadeUSB: number,
    public smartTV: boolean
  ) {}
}