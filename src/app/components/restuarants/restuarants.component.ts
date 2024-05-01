import { Component, Input, OnInit } from '@angular/core';
import { Restaurant } from 'src/app/models/restaurant.model';

@Component({
  selector: 'app-restuarants',
  templateUrl: './restuarants.component.html',
  styleUrls: ['./restuarants.component.scss'],
})
export class RestuarantsComponent  implements OnInit {

  @Input() restuarants : Restaurant;
  fallbackImage ='assests/img/1.jpg';
  constructor() { }

  ngOnInit() {  
  }

  getCuisine(cuisine){
    return cuisine.join(', ');
  }

  onImgError(event){
    event.target.src = this.fallbackImage;
  }

}
