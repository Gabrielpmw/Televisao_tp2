import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemCarrinho } from '../model/pedido.model';
import { Televisao } from '../model/televisao.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {

  private carrinhoSubject = new BehaviorSubject<ItemCarrinho[]>([]);
  carrinho$ = this.carrinhoSubject.asObservable();

  // --- CONTROLE DE SESSÃO ---
  // Define o prefixo da chave. Começa como 'visitante', muda para 'usuario_ID' ao logar.
  private usuarioIdPrefix: string = 'visitante';

  constructor() {
    this.carregarDoLocalStorage();
  }

  // ==========================================
  //  GESTÃO DE USUÁRIO (Novo)
  // ==========================================

  // Chamado pelo AuthService no Login
  identificarUsuario(idUsuario: number) {
    this.usuarioIdPrefix = `usuario_${idUsuario}`;
    this.carregarDoLocalStorage(); // Carrega o carrinho salvo deste usuário específico
  }

  // Chamado pelo AuthService no Logout
  limparSessao() {
    this.usuarioIdPrefix = 'visitante';
    // Opção A: Zera o carrinho visualmente
    this.carrinhoSubject.next([]); 
    // Opção B: Se quiser carregar o carrinho de visitante, use: this.carregarDoLocalStorage();
  }

  // ==========================================
  //  MÉTODOS DE AÇÃO
  // ==========================================

 adicionar(tv: Televisao) {
  const itensAtuais = this.carrinhoSubject.value;

  // Verifica se o item já está no carrinho
  const itemExistente = itensAtuais.find(item => item.id === tv.idTelevisao);

  if (itemExistente) {
    // Se já existir, apenas aumenta a quantidade
    itemExistente.quantidade++;
  } else {

    // Cria novo item no carrinho
    const novoItem: ItemCarrinho = {
      id: tv.idTelevisao,
      nome: `${tv.marca} ${tv.modelo}`,

      // IMPORTANTE: mapeamento correto da classe Televisao
      preco: tv.valor,
      imagem: tv.nomeImagem, // 🔥 ESSENCIAL para aparecer imagem no carrinho

      quantidade: 1
    };

    itensAtuais.push(novoItem);
  }

  // Atualiza o estado global do carrinho
  this.atualizarEstado(itensAtuais);
}

  remover(idItem: number) {
    let itens = this.carrinhoSubject.value;
    itens = itens.filter(item => item.id !== idItem);
    this.atualizarEstado(itens);
  }

  atualizarQuantidade(idItem: number, novaQuantidade: number) {
    if (novaQuantidade <= 0) {
      this.remover(idItem);
      return;
    }

    const itens = this.carrinhoSubject.value;
    const item = itens.find(i => i.id === idItem);

    if (item) {
      item.quantidade = novaQuantidade;
      this.atualizarEstado([...itens]);
    }
  }

  limparCarrinho() {
    this.atualizarEstado([]);
  }

  obterItens(): ItemCarrinho[] {
    return this.carrinhoSubject.value;
  }

  obterTotal(): number {
    return this.carrinhoSubject.value.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }

  // ==========================================
  //  PERSISTÊNCIA DINÂMICA
  // ==========================================

  // Gera uma chave única: "carrinho_teletela_visitante" ou "carrinho_teletela_usuario_10"
  private getStorageKey(): string {
    return `carrinho_teletela_${this.usuarioIdPrefix}`;
  }

  private atualizarEstado(itens: ItemCarrinho[]) {
    this.carrinhoSubject.next(itens);
    this.salvarNoLocalStorage();
  }

  private salvarNoLocalStorage() {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(this.carrinhoSubject.value));
  }

  private carregarDoLocalStorage() {
    const key = this.getStorageKey();
    const dados = localStorage.getItem(key);
    
    if (dados) {
      try {
        this.carrinhoSubject.next(JSON.parse(dados));
      } catch (e) {
        console.error('Erro ao ler carrinho', e);
        this.carrinhoSubject.next([]);
      }
    } else {
      // Se não tem nada salvo para este usuário, começa vazio
      this.carrinhoSubject.next([]);
    }
  }
}