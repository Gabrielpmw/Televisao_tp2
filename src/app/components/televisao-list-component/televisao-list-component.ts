import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Televisao } from '../../model/televisao.model';
import { TelevisaoService, TelevisaoPaginada } from '../../services/televisao-service';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { TelevisaoCardComponent } from '../televisao-card-component/televisao-card-component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-televisao-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TelevisaoCardComponent,
    FormsModule,
    RouterModule
  ],
  templateUrl: './televisao-list-component.html',
  styleUrls: ['./televisao-list-component.css']
})
export class TelevisaoListComponent implements OnInit {

  public listaPaginada$!: Observable<TelevisaoPaginada>;

  totalRegistros: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  termoBusca: string = '';

  showDeleteModal: boolean = false;
  tvToDelete: Televisao | null = null;

  constructor(
    private televisaoService: TelevisaoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarTelevisoes();
  }

  carregarTelevisoes(): void {
    const page = this.pageIndex;
    const pageSize = this.pageSize;
    let observable: Observable<TelevisaoPaginada>;

    if (this.termoBusca.trim()) {
      observable = this.televisaoService.findByModelo(this.termoBusca, page, pageSize);
    } else {
      observable = this.televisaoService.findAll(page, pageSize);
    }

    this.listaPaginada$ = observable.pipe(
      tap(paginacao => {
        this.totalRegistros = paginacao.totalCount;
      })
    );
  }

  aplicarBusca(): void {
    this.pageIndex = 0;
    this.carregarTelevisoes();
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.pageIndex = 0;
    this.carregarTelevisoes();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarTelevisoes();
  }


  handleEdit(tv: Televisao): void {
    console.log('Editando TV:', tv.idTelevisao);
    this.router.navigate(['/televisoes/edit', tv.idTelevisao]);
  }


  handleDelete(tv: Televisao): void {
    console.log('Abrindo modal para deletar TV:', tv.idTelevisao);
    this.tvToDelete = tv;
    this.showDeleteModal = true;
  }


  cancelDelete(): void {
    console.log('Delete cancelado.');
    this.tvToDelete = null;
    this.showDeleteModal = false;
  }


  confirmDelete(): void {
    if (!this.tvToDelete) return;

    console.log('Deletando TV:', this.tvToDelete.idTelevisao);
    this.televisaoService.delete(this.tvToDelete.idTelevisao).subscribe({
      next: () => {
        console.log('TV deletada com sucesso.');
        this.tvToDelete = null;
        this.showDeleteModal = false;
        this.carregarTelevisoes();
      },
      error: (err) => {
        console.error('Erro ao deletar TV:', err);
        this.tvToDelete = null;
        this.showDeleteModal = false;
      }
    });
  }
}