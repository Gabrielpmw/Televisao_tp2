import { Component, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cabecalho.html',
  styleUrls: ['./cabecalho.css']
})
export class Cabecalho {
  // Controle do estado do Dropdown
  isProfileOpen = signal(false);

  // Referência ao elemento do menu para detectar cliques fora
  @ViewChild('menuContainer') menuContainer!: ElementRef;

  toggleProfile() {
    this.isProfileOpen.update(v => !v);
  }

  // Fecha o menu se clicar fora dele
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isProfileOpen() && this.menuContainer) {
      if (!this.menuContainer.nativeElement.contains(event.target)) {
        this.isProfileOpen.set(false);
      }
    }
  }
}