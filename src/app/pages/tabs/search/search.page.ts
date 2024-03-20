import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { Restaurant } from 'src/app/models/restaurant.model';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  @ViewChild('searchInput')sInput!: IonInput;
  restuarants:Restaurant[] =[];
  query : any;
  model :any ={
    icon:'search-outline',
    title :'No Restuarants Found'
  }
  isLoading : boolean;
  allRestuarant :Restaurant[] =[];

  

  constructor(private apiService :ApiService) { }

  ngOnInit() {
    this.allRestuarant = this.apiService.allRestaurants;
  }

  ionViewDidEnter() {
    this.sInput.setFocus();
  }

  async onSearchChange(event){
    console.log(event);
    this.query = event.detail.value.toLowerCase();
    if(this.query.length >0){
      this.isLoading =true;
      setTimeout(async () => {
        this.restuarants = await this.allRestuarant.filter((element) =>{
          return   element.short_name.includes(this.query);
        });
     this.isLoading = false;
      }, 4000);


    }
  }

}
