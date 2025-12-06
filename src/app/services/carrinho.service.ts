// carrinho.service.ts

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

  private usuarioIdPrefix: string = 'visitante';

  constructor() {
    this.carregarDoLocalStorage();
  }

  // ==========================================
  //  GESTÃO DE USUÁRIO (Novo)
  // ==========================================
  identificarUsuario(idUsuario: number) {
    this.usuarioIdPrefix = `usuario_${idUsuario}`;
    this.carregarDoLocalStorage();
  }

  limparSessao() {
    this.usuarioIdPrefix = 'visitante';
    this.carrinhoSubject.next([]);
  }

  // ==========================================
  //  MÉTODOS DE AÇÃO
  // ==========================================

  adicionar(tv: Televisao) {
    const itensAtuais = this.carrinhoSubject.value;

    const itemExistente = itensAtuais.find(item => item.id === tv.idTelevisao);

    if (itemExistente) {
      // Se já existir, a validação de estoque ocorrerá no componente Carrinho
      itemExistente.quantidade++;
    } else {

      const novoItem: ItemCarrinho = {
        id: tv.idTelevisao,
        nome: `${tv.marca} ${tv.modelo}`,
        preco: tv.valor,
        imagem: tv.nomeImagem,
        quantidade: 1,
        estoque: tv.estoque // 🎯 CORREÇÃO: Salva o estoque da TV no item do carrinho
      };

      itensAtuais.push(novoItem);
    }

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
  //  PERSISTÊNCIA DINÂMICA
  // ==========================================

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
      this.carrinhoSubject.next([]);
    }
  }
}