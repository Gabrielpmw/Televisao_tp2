import { Component, inject } from '@angular/core'; // Adicione inject se preferir ou use construtor
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Importe Router

interface CategoriaTV {
  nome: string;
  imagem: string;
  imagemInfo: string;
  descricao: string;
  detalhes: string;
  features: string[];
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
  
  // Injeta o Router para poder navegar via código
  private router = inject(Router); 

  categorias: CategoriaTV[] = [
    // ... seus dados (Plasma, LED, etc) continuam iguais ...
    { 
      nome: 'Plasma', 
      imagem: 'PLASMA', 
      imagemInfo: 'info_PLASMA.png',
      descricao: 'Cores profundas e alto contraste.',
      detalhes: 'As TVs de Plasma oferecem níveis de preto profundos e excelentes ângulos de visão...',
      features: ['Contraste Natural', 'Ângulo de visão amplo', 'Movimentos fluidos'],
      expandido: false
    },
    { 
      nome: 'LED', 
      imagem: 'LED', 
      imagemInfo: 'info_LED.png',
      descricao: 'Eficiência e brilho intenso.',
      detalhes: 'A tecnologia LED utiliza diodos emissores de luz...',
      features: ['Alto brilho', 'Baixo consumo', 'Variedade de tamanhos'],
      expandido: false
    },
    { 
      nome: 'LCD', 
      imagem: 'LCD', 
      imagemInfo: 'Info_LCD.png',
      descricao: 'A escolha versátil para o dia a dia.',
      detalhes: 'Displays de Cristal Líquido (LCD) oferecem imagens nítidas...',
      features: ['Custo-benefício', 'Alta durabilidade', 'Sem risco de burn-in'],
      expandido: false
    },
    { 
      nome: 'QLED', 
      imagem: 'QLED', 
      imagemInfo: 'info_QLED.png',
      descricao: 'Pontos quânticos para cores perfeitas.',
      detalhes: 'QLED usa pontos quânticos para entregar 100% do volume de cor...',
      features: ['100% Volume de cor', 'Brilho HDR intenso', 'Garantia contra burn-in'],
      expandido: false
    },
    { 
      nome: 'OLED', 
      imagem: 'OLED', 
      imagemInfo: 'info_OLED.png',
      descricao: 'Pretos infinitos e contraste único.',
      detalhes: 'No OLED, cada pixel se autoilumina...',
      features: ['Preto Absoluto', 'Pixel Autoiluminado', 'Design Ultra Fino'],
      expandido: false
    }
  ];

  toggleDetalhes(categoria: CategoriaTV) {
    categoria.expandido = !categoria.expandido;
  }

  // --- NOVO MÉTODO ---
  navegarParaFiltro(tipo: string) {
    // CORREÇÃO: Converter para maiúsculo antes de enviar
    // Assim 'Plasma' vira 'PLASMA', que é o que o Backend espera
    const tipoFormatado = tipo.toUpperCase();

    this.router.navigate(['/televisoes'], { 
      queryParams: { tipoTela: tipoFormatado } 
    });
  }
}