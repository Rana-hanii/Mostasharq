import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlowbiteService } from './core/services/flowbite.service';
import { initFlowbite } from 'flowbite';
import { NgxSpinnerService , NgxSpinnerModule } from "ngx-spinner";



@Component({
  selector: 'app-root',
  imports: [RouterOutlet ,NgxSpinnerModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'mostasharq';
  constructor(private flowbiteService: FlowbiteService) {}
  // NgxSpinnerService=inject(NgxSpinnerService)

  ngOnInit(): void {
    // this.NgxSpinnerService.show();
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }


}
