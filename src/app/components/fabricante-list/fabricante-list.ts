import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { Fabricante } from '../../model/fabricante.model';
import { FabricanteService } from '../../services/fabricante-service';

@Component({
  selector: 'app-fabricante-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './fabricante-list.html',
  styleUrl: './fabricante-list.css'
})
export class FabricanteListComponent implements OnInit {

  // 2. Variáveis para guardar os dados da tabela e controlar o modal
  fabricantes: Fabricante[] = [];
  modalVisivel: boolean = false;
  fabricanteParaExcluir: number | null = null;

  // 3. Injete o Service e o Router no construtor
  constructor(
    private fabricanteService: FabricanteService,
    private router: Router
  ) {}

  // 4. ngOnInit é chamado quando o componente carrega
  ngOnInit(): void {
    this.carregarFabricantes();
  }

  // 5. Método que busca os dados no service
  carregarFabricantes(): void {
    this.fabricanteService.getFabricantes().subscribe(data => {
      this.fabricantes = data;
    });
  }

  // 6. Função helper para tratar o telefone (conforme nossa análise)
  getPrimeiroTelefone(fabricante: Fabricante): string {
    if (fabricante.telefones && fabricante.telefones.length > 0) {
      // Formata como (DDD) NUMERO
      return `(${fabricante.telefones[0].ddd}) ${fabricante.telefones[0].numero}`;
    }
    return 'N/A'; 
  }

  // 7. Método para o botão "Editar"
  editarFabricante(id: number): void {
    // Navega para a rota /fabricantes/edit/1 (ou qualquer ID)
    this.router.navigate(['/fabricantes/edit', id]);
  }

  // 8. Métodos para controlar o Modal de Exclusão
  abrirModalExclusao(id: number): void {
    this.fabricanteParaExcluir = id;
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
    this.fabricanteParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (this.fabricanteParaExcluir) {
      this.fabricanteService.deletar(this.fabricanteParaExcluir).subscribe(() => {
        // Após excluir, recarrega a lista
        this.carregarFabricantes();
        // E fecha o modal
        this.fecharModal();
      });
    }
  }
}