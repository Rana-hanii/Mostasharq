import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FixflowbiteService {

  constructor() { }

  fixToggle(element: HTMLElement) {
    element.classList.toggle('hidden');
  }
}
