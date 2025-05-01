import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
  OnDestroy,
  NgZone,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  isHeroVisible = true;
  vantaEffect: any = null;
  private scriptsLoaded = {
    three: false,
    vanta: false
  };
  private maxRetries = 5;
  private retryCount = 0;
  private retryDelay = 300;
  private readonly isBrowser: boolean;

  @ViewChild('vantaContainer', { static: false }) vantaContainer?: ElementRef;

  constructor(
    private elementRef: ElementRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Start loading scripts as early as possible
      this.preloadScripts();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Intersection Observer for hero visibility
    if ('IntersectionObserver' in window) {
      const heroSection = this.getVantaElement();

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

    // Try to initialize Vanta after DOM is fully loaded
    // Use requestAnimationFrame to ensure we're in a render cycle
    window.requestAnimationFrame(() => {
      this.loadScripts();
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.destroyVanta();
  }

  private preloadScripts(): void {
    // Create link elements with preload hint for scripts
    const preloadThree = document.createElement('link');
    preloadThree.rel = 'preload';
    preloadThree.as = 'script';
    preloadThree.href = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';

    const preloadVanta = document.createElement('link');
    preloadVanta.rel = 'preload';
    preloadVanta.as = 'script';
    preloadVanta.href = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js';

    document.head.appendChild(preloadThree);
    document.head.appendChild(preloadVanta);
  }

  private destroyVanta(): void {
    if (this.vantaEffect) {
      try {
        this.vantaEffect.destroy();
      } catch (error) {
        console.error('Error destroying VANTA effect:', error);
      }
      this.vantaEffect = null;
    }
  }

  private getVantaElement(): HTMLElement | null {
    // Try both the ViewChild reference and querySelector
    return (this.vantaContainer?.nativeElement ||
           this.elementRef.nativeElement.querySelector('#vanta-bg'));
  }

  private loadScripts(): void {
    if (!this.isBrowser) return;

    // Reset state in case this is called multiple times
    this.scriptsLoaded = { three: false, vanta: false };

    // Check if scripts are already loaded by looking at global objects
    this.scriptsLoaded.three = !!window.THREE;
    this.scriptsLoaded.vanta = !!window.VANTA;

    if (this.scriptsLoaded.three && this.scriptsLoaded.vanta) {
      // Both scripts already available, initialize immediately
      this.initVantaWhenReady();
      return;
    }

    // Load THREE.js if needed
    if (!this.scriptsLoaded.three) {
      this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
        .then(() => {
          this.scriptsLoaded.three = true;
          // Load VANTA after THREE is loaded
          if (!this.scriptsLoaded.vanta) {
            return this.loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js');
          }
          return Promise.resolve();
        })
        .then(() => {
          this.scriptsLoaded.vanta = true;
          this.initVantaWhenReady();
        })
        .catch(error => {
          console.error('Error loading scripts:', error);
          this.retryLoadingIfNeeded();
        });
    } else if (!this.scriptsLoaded.vanta) {
      // THREE is loaded, but VANTA is not
      this.loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js')
        .then(() => {
          this.scriptsLoaded.vanta = true;
          this.initVantaWhenReady();
        })
        .catch(error => {
          console.error('Error loading VANTA script:', error);
          this.retryLoadingIfNeeded();
        });
    }
  }

  private retryLoadingIfNeeded(): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying script load attempt ${this.retryCount}/${this.maxRetries}...`);

      setTimeout(() => {
        this.loadScripts();
      }, this.retryDelay * this.retryCount);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Check if script already exists to avoid duplicates
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = (error) => reject(error);

      document.head.appendChild(script);
    });
  }

  private initVantaWhenReady(): void {
    // Check for readiness immediately since preloading might have happened
    if (window.VANTA) {
      this.ngZone.runOutsideAngular(() => {
        this.initVanta();
      });
      return;
    }

    // Use setTimeout with requestAnimationFrame for better timing
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        if (window.VANTA) {
          // Run outside Angular zone for better performance
          this.ngZone.runOutsideAngular(() => {
            this.initVanta();
          });
        } else if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Waiting for VANTA to be available... Retry ${this.retryCount}/${this.maxRetries}`);
          setTimeout(() => this.initVantaWhenReady(), 200);
        }
      }, 100);
    });
  }

  private initVanta(): void {
    try {
      // Destroy any existing effect first
      this.destroyVanta();

      const bgElement = this.getVantaElement();

      if (!bgElement) {
        console.error('Could not find VANTA container element');
        return;
      }

      if (!window.VANTA) {
        console.error('VANTA not available');
        return;
      }

      // Create new effect
      this.vantaEffect = window.VANTA.WAVES({
        el: bgElement,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x480808,
        waveSpeed: 0.7,
        waveHeight: 20,
        shininess: 30,
        zoom: 0.75
      });

      console.log('VANTA effect initialized successfully');
    } catch (error) {
      console.error('Error initializing VANTA effect:', error);

      // If initialization fails, retry with delay
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.initVanta(), 500);
      }
    }
  }
}
