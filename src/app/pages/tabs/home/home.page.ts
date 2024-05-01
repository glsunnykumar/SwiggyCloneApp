import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';
import { Address } from 'src/app/models/address.model';
import { Restaurant } from 'src/app/models/restaurant.model';
import { AddressService } from 'src/app/services/address/address.service';
import { ApiService } from 'src/app/services/api/api.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { GoogleMapsService } from 'src/app/services/google-maps/google-maps.service';
import { LocationService } from 'src/app/services/location/location.service';
// import { register } from 'swiper/element/bundle';

// register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  banners: any[];
  restaurants: Restaurant[] = [];
  isLoading: boolean = false;
  location = {} as Address;
  addressSub: Subscription;

  constructor(
    private apiService: ApiService,
    private addService: AddressService,
    private global: GlobalService,
    private locationService: LocationService,
    private route: Router,
    private mapService: GoogleMapsService
  ) {}
  ngOnDestroy() {
    if (this.addressSub) this.addressSub.unsubscribe();
  }

  ngOnInit() {
    this.addressSub = this.addService.changeAddress.subscribe(
      (address) => {
        if (address && address?.lat) {
          if (!this.isLoading) this.isLoading = true;
          this.location = address;
          this.nearByApi();
        } else {
          if (address && (!this.location || !this.location?.lat)) {
            this.searchLocation('home', 'home-modal');
          }
        }
      },
      (e) => {
        console.log(e);
        this.isLoading = false;
        this.global.errorToast();
      }
    );
    this.isLoading = true;
    this.getBanner();
    if (!this.location?.lat) {
      this.getNearbyResutrant();
    }
  }

  getBanner() {
    // this.banners = this.apiService.banners;

    this.apiService
      .getBanner()
      .then((data) => {
        this.banners = data;
      })
      .catch((e) => {
        console.log(e);
      });
  }

  async getNearbyResutrant() {
    try {
      const position = await this.locationService.getCurrentLocation();
      const { latitude, longitude } = position.coords;
      const address = await this.mapService.getAddress(latitude, longitude);
      if (address) {
        const loc = {
          title: address.address_components[0].short_name,
          address: address.formatted_address,
          lat: latitude,
          lng: longitude,
        };

        this.location = new Address(
          '',
          '',
          address.address_components[0].short_name,
          address.formatted_address,
          '',
          latitude,
          longitude
        );
        await this.getData();
      }
      this.isLoading = false;
    } catch (e) {
      console.log(e);
      this.isLoading = false;
      this.searchLocation('home', 'home-modal');
    }
  }

  async getData() {
    try {
      this.restaurants = [];
       await this.addService.checkAddressExit(this.location);
    } catch (e) {
      console.log(e);
      this.global.errorToast();
    }
  }

  async nearByApi() {
    try {
      this.isLoading = false;
      this.restaurants =await this.apiService.getNearByRestuarant(this.location.lat,this.location.lng);
     
    } catch (e) {
      console.log(e);
      this.global.errorToast();
    }
  }

  async searchLocation(prop, classname?) {
    try {
      const options = {
        component: SearchLocationComponent,
        cssClass: classname ? classname : '',
        backdropDismiss: prop == 'select-place' ? true : false,
        componentProps: {
          from: prop,
        },
      };
      const model = await this.global.createModal(options);
      if (model) {
        if (model == 'add') {
          this.addAddress(this.location);
        } else if (model == 'select') {
          this.searchLocation('select-place');
        } else {
          this.location = model;
          await this.getData();
        }
      }
      else{
        if(!this.location || !this.location?.lat)
        this.searchLocation('Home','home-modal');
      }
    } catch (e) {}
  }

  addAddress(val?) {
    let navdata: NavigationExtras;
    if (val) {
      val.from = 'home';
    } else {
      val = {
        from: 'home',
      };
    }
    navdata = {
      queryParams: {
        data: JSON.stringify(val),
      },
    };
    this.route.navigate(['/', 'tabs', 'address', 'edit-address'], navdata);
  }
}
