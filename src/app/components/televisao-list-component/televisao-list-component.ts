import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Televisao } from '../../model/televisao.model'; // Ajuste o caminho
// IMPORTS NECESSÁRIOS
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, | async
import { TelevisaoCardComponent } from '../televisao-card-component/televisao-card-component'; // <-- IMPORTE O CARD
import { TelevisaoService } from '../../services/televisao-service';

@Component({
  selector: 'app-televisao-list',
  standalone: true,
  // ADICIONE ESTA LINHA 'imports'
  imports: [
    CommonModule,
    TelevisaoCardComponent // <-- DECLARE O CARD AQUI
  ],
  templateUrl: './televisao-list-component.html',
  styleUrls: ['./televisao-list-component.css']
})
export class TelevisaoListComponent implements OnInit {

  public listaDeTelevisoes$!: Observable<Televisao[]>;

  constructor(private televisaoService: TelevisaoService) { }

  ngOnInit(): void {
    this.listaDeTelevisoes$ = this.televisaoService.buscarTodos();
  }
}