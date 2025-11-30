import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  PedidoRequestDTO, 
  PedidoResponseDTO, 
  PedidoUpdateRequestDTO, 
  CartaoRequestDTO 
} from '../model/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  // Ajuste a porta se necessário
  private readonly API_URL = 'http://localhost:8080/pedidos';

  constructor(private http: HttpClient) { }

  // ==========================================
  //  CLIENTE - CRIAÇÃO E ATUALIZAÇÃO
  // ==========================================

  // POST /pedidos/criar-pedido
  criarPedido(dto: PedidoRequestDTO): Observable<PedidoResponseDTO> {
    return this.http.post<PedidoResponseDTO>(`${this.API_URL}/criar-pedido`, dto);
  }

  // PATCH /pedidos/{id}/atualizar-pedido
  atualizarPedido(id: number, dto: PedidoUpdateRequestDTO): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/atualizar-pedido`, dto);
  }

  // ==========================================
  //  CLIENTE - PAGAMENTOS
  // ==========================================

  // POST /pedidos/{id}/gerar-pix
  gerarPix(idPedido: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${idPedido}/gerar-pix`, {});
  }

  // POST /pedidos/{id}/gerar-boleto
  gerarBoleto(idPedido: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${idPedido}/gerar-boleto`, {});
  }

  // PATCH /pedidos/{id}/efetuar-pagamento-pix
  efetuarPagamentoPix(idPix: number): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/${idPix}/efetuar-pagamento-pix`, {});
  }

  // PATCH /pedidos/{id}/efetuar-pagamento-boleto
  efetuarPagamentoBoleto(idBoleto: number): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/${idBoleto}/efetuar-pagamento-boleto`, {});
  }

  // POST /pedidos/{id}/efetuar-pagamento-cartao
  efetuarPagamentoCartao(idPedido: number, dto: CartaoRequestDTO): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${idPedido}/efetuar-pagamento-cartao`, dto);
  }

  // ==========================================
  //  CONSULTAS (GET)
  // ==========================================

  // GET /pedidos/meus-pedidos (Cliente)
  findMeusPedidos(): Observable<PedidoResponseDTO[]> {
    return this.http.get<PedidoResponseDTO[]>(`${this.API_URL}/meus-pedidos`);
  }

  // GET /pedidos/{username}/procurar-pedido-username (Admin/Cliente)
  findByUsername(username: string): Observable<PedidoResponseDTO[]> {
    return this.http.get<PedidoResponseDTO[]>(`${this.API_URL}/${username}/procurar-pedido-username`);
  }

  // GET /pedidos/{id}/procurar-id (Admin)
  findById(id: number): Observable<PedidoResponseDTO> {
    return this.http.get<PedidoResponseDTO>(`${this.API_URL}/${id}/procurar-id`);
  }

  // GET /pedidos (Admin - Listar todos)
  findAll(): Observable<PedidoResponseDTO[]> {
    return this.http.get<PedidoResponseDTO[]>(this.API_URL);
  }

  // ==========================================
  //  ADMIN - GESTÃO AVANÇADA
  // ==========================================

  // PUT /pedidos/{id}/atualizar-pedido-adm
  updateAdmin(id: number, dto: PedidoRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/atualizar-pedido-adm`, dto);
  }

  // PATCH /pedidos/{id}/atualizar-status
  // O Java recebe "int status". Enviamos apenas o número no corpo.
  updateStatus(id: number, status: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/atualizar-status`, status);
  }

  // DELETE /pedidos/{id}/deletar
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/deletar`);
  }
}