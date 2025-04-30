

import { Component, CUSTOM_ELEMENTS_SCHEMA , ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

// declare var VANTA: any;

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})


export class HomeComponent{

  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    this.isScrolled = scrollY > 50;
    console.log('SCROLLED:', this.isScrolled);
  }
 

  // ngAfterViewInit(): void {
  //   this.vantaEffect = VANTA.WAVES({
  //     el: this.vantaRef.nativeElement,
  //     mouseControls: true,
  //     touchControls: true,
  //     gyroControls: false,
  //     minHeight: 200.00,
  //     minWidth: 200.00,
  //     scale: 1.00,
  //     scaleMobile: 1.00,
  //     color: 0x480808,
  //     waveSpeed: 0.70
  //   });
  // }

  // ngOnDestroy(): void {
  //   if (this.vantaEffect) {
  //     this.vantaEffect.destroy();
  //   }
  // }


}




