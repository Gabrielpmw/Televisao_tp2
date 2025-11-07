import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Televisao } from '../../model/televisao.model'; // Ajuste o caminho
import { TelevisaoService, TelevisaoPaginada } from '../../services/televisao-service';
import { PageEvent } from '@angular/material/paginator';

// Imports necessários
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, | async
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TelevisaoCardComponent } from '../televisao-card-component/televisao-card-component';
@Component({
  selector: 'app-televisao-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TelevisaoCardComponent // <-- Declare o Card "filho" aqui
  ],
  // ==================================================================
  // AQUI ESTÁ A CORREÇÃO
  // O nome do arquivo estava errado, faltava o '-component'
  templateUrl: './televisao-list-component.html', 
  // ==================================================================
  styleUrls: ['./televisao-list-component.css']
})
export class TelevisaoListComponent implements OnInit {

  // Armazena o Observable da resposta paginada
  public listaPaginada$!: Observable<TelevisaoPaginada>;

  // Variáveis de controle da paginação
  totalRegistros: number = 0;
  pageSize: number = 10; // Deve ser o mesmo do seu @DefaultValue("10")
  pageIndex: number = 0; // Página inicial

  constructor(private televisaoService: TelevisaoService) { }

  ngOnInit(): void {
    this.carregarTelevisoes();
  }

  // Função para carregar os dados
  carregarTelevisoes(): void {
    this.listaPaginada$ = this.televisaoService.findAll(this.pageIndex, this.pageSize).pipe(
      tap(paginacao => {
        // Atualiza o total de registros para o paginador
        this.totalRegistros = paginacao.totalCount;
      })
    );
  }

  // Função chamada quando o usuário muda de página
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarTelevisoes();
  }
}