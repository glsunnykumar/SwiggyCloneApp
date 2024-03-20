import { Component, Input, OnInit } from '@angular/core';
import { IonicSlides } from '@ionic/angular';
import { register } from 'swiper/element/bundle';

register();


@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent  implements OnInit {

  @Input() bannerImages :any[];

  swiperModules = [IonicSlides];
  constructor() { }

  ngOnInit() {
  }

}
