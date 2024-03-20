import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-restuarants',
  templateUrl: './loading-restuarants.component.html',
  styleUrls: ['./loading-restuarants.component.scss'],
})
export class LoadingRestuarantsComponent  implements OnInit {
 
  dummy  = Array(10);
  constructor() { }

  ngOnInit() {}

}
