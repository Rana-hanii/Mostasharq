import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { RouterLink } from '@angular/router';

// declare var VANTA: any;

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {
  isHeroVisible = true;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const heroSection =
        this.elementRef.nativeElement.querySelector('#vanta-bg');

      const observer = new IntersectionObserver(
        ([entry]) => {
          this.isHeroVisible = entry.isIntersecting;
        },
        { threshold: 0.1 }
      );

      if (heroSection) {
        observer.observe(heroSection);
      }
    }
  }
}
