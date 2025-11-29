import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface CategoriaTV {
  nome: string;
  imagem: string;
  imagemInfo: string;
  descricao: string;
  detalhes: string;
  features: string[]; // <--- O ERRO ESTAVA AQUI (Faltava essa linha)
  expandido: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  
  categorias: CategoriaTV[] = [
    { 
      nome: 'Plasma', 
      imagem: 'PLASMA', 
      imagemInfo: 'info_PLASMA.png',
      descricao: 'Cores profundas e alto contraste.',
      detalhes: 'As TVs de Plasma oferecem níveis de preto profundos e excelentes ângulos de visão, ideais para ambientes com iluminação controlada. Uma tecnologia clássica para amantes de cinema.',
      features: ['Contraste Natural', 'Ângulo de visão amplo', 'Movimentos fluidos'],
      expandido: false
    },
    { 
      nome: 'LED', 
      imagem: 'LED', 
      imagemInfo: 'info_LED.png',
      descricao: 'Eficiência e brilho intenso.',
      detalhes: 'A tecnologia LED utiliza diodos emissores de luz para iluminar a tela, garantindo cores vivas, maior durabilidade e um design mais fino e eficiente energeticamente.',
      features: ['Alto brilho', 'Baixo consumo', 'Variedade de tamanhos'],
      expandido: false
    },
    { 
      nome: 'LCD', 
      imagem: 'LCD', 
      imagemInfo: 'Info_LCD.png',
      descricao: 'A escolha versátil para o dia a dia.',
      detalhes: 'Displays de Cristal Líquido (LCD) oferecem imagens nítidas e naturais. É uma tecnologia madura, confiável e com excelente custo-benefício para todos os tipos de uso.',
      features: ['Custo-benefício', 'Alta durabilidade', 'Sem risco de burn-in'],
      expandido: false
    },
    { 
      nome: 'QLED', 
      imagem: 'QLED', 
      imagemInfo: 'info_QLED.png',
      descricao: 'Pontos quânticos para cores perfeitas.',
      detalhes: 'QLED usa pontos quânticos para entregar 100% do volume de cor. Brilho superior e cores que não desbotam com o tempo, perfeito para salas bem iluminadas.',
      features: ['100% Volume de cor', 'Brilho HDR intenso', 'Garantia contra burn-in'],
      expandido: false
    },
    { 
      nome: 'OLED', 
      imagem: 'OLED', 
      imagemInfo: 'info_OLED.png',
      descricao: 'Pretos infinitos e contraste único.',
      detalhes: 'No OLED, cada pixel se autoilumina, permitindo que se apaguem completamente para criar o preto perfeito. O contraste é infinito e as cores saltam da tela.',
      features: ['Preto Absoluto', 'Pixel Autoiluminado', 'Design Ultra Fino'],
      expandido: false
    }
  ];

  toggleDetalhes(categoria: CategoriaTV) {
    categoria.expandido = !categoria.expandido;
  }
}