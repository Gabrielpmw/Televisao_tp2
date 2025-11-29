import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Cabecalho } from './components/Templates/cabecalho/cabecalho';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, Cabecalho],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('televisao_tp2');
}
