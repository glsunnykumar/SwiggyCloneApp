import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { AddressService } from 'src/app/services/address/address.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { GoogleMapsService } from 'src/app/services/google-maps/google-maps.service';
import { LocationService } from 'src/app/services/location/location.service';

@Component({
  selector: 'app-search-location',
  templateUrl: './search-location.component.html',
  styleUrls: ['./search-location.component.scss'],
})
export class SearchLocationComponent  implements OnInit ,OnDestroy {
   
  query :any;
  places:any[] =[];
  placesSub :Subscription;
  addressSub : Subscription;

  savedPlaces :Address[] =[];
  @Input() from;
  constructor(
    private global :GlobalService,
    private map :GoogleMapsService,
    private location :LocationService,
    private addressService :AddressService
  ) { }

  ngOnInit() {
    this.placesSub = this.map.places.subscribe({next :(place)=>{
      this.places =place
    }})

    if(this.from){
      this.getSavedPlaces();
    }
  }


  async getSavedPlaces(){
    this.global.showLoader();
    this.addressSub = this.addressService.addresses.subscribe(address =>{
      this.savedPlaces = address;
    });
    if(this.from ==='home') await  this.addressService.getAddresses(2);
    else  this.addressService.getAddresses();
    this.global.hideLoader();
  }

  AddNewAddress(){
  //this.rout
  }

  selectSavedPlace(place){
   console.log('saved place',place);
   this.dismiss(place);
  }

  ngOnDestroy() {
      if(this.placesSub) this.placesSub.unsubscribe();
      if(this.addressSub) this.addressSub.unsubscribe();
  }

  async onSearchChange(event){
    
      console.log(event);
      this.global.showLoader();
      this.query = event.detail.value;
      if(this.query.length >0){
        await this.map.getPlaces(this.query);
      }
      this.global.hideLoader();
  }

  chosePlace(place){
    this.global.showLoader();
    console.log(place);
    if(this.from){
      const savedPlace =this.savedPlaces.find(x => x.lat == place.lat && x.lng == place.lng);
      if(savedPlace?.lat) place= savedPlace;
    }
    this.global.hideLoader();
    this.dismiss(place);
  }

  dismiss(val?){
    this.global.modalDismiss(val);
  }
  
  
  async getCurrentLocation(){
    try{
    this.global.showLoader();
    const loc = await this.location.getCurrentLocation();
    const {latitude ,longitude} = loc.coords;
    const result = await this.map.getAddress(latitude,longitude)
    const place ={
      title : result.address_components[0].short_name,
      address :result.formatted_address,
      lat :latitude,
      lng :longitude
    };
    this.global.hideLoader();
    this.dismiss(place);
    }
    catch(e){
      console.log(e);
      this.global.hideLoader();
      this.global.errorToast('Check whether GPS is enabled & the App has its permission',5000);
    }
  }

}
