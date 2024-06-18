import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { GlobalService } from './services/global/global.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform :Platform,
  private global :GlobalService

  ) {
    this.initialzeApp();
  }

  initialzeApp(){
    this.platform.ready().then(()=>{
      this.global.customStatusbar();
    })
  }
}
