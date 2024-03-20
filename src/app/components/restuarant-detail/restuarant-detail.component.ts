import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-restuarant-detail',
  templateUrl: './restuarant-detail.component.html',
  styleUrls: ['./restuarant-detail.component.scss'],
})
export class RestuarantDetailComponent  implements OnInit {
  @Input() data:any;
  @Input() isLoading;
  constructor() { }

  ngOnInit() {}

  
  getCuisine(cuisine){
    return cuisine.join(', ');
  }

}
