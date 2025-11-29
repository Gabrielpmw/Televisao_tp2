export interface EstadoDTO {
  idEstado: number;
  nome: string;
  sigla: string;
  regiao: string;
}

export interface MunicipioResponseDTO {
  idMunicipio: number;
  municipio: string; // <--- No Java está 'municipio', não 'nome'
  estado: EstadoDTO;
}