import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription, retry } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { AddressService } from 'src/app/services/address/address.service';
import { ApiService } from 'src/app/services/api/api.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit,OnDestroy {

  isLoading :boolean;
  addresses :Address[] =[];

  model :any ={
    titile :'No Addresses Yet',
    icon : 'location-outline'
  }

  addressSub :Subscription;
  constructor(private globalService :GlobalService,
    private apiService :ApiService,
    private addressService : AddressService,  
    private router :Router
    ) { }
  ngOnDestroy(): void {
    if(this.addressSub){
      this.addressSub.unsubscribe();
    }
  }

  ngOnInit() {
    this.addressSub = this.addressService.addresses.subscribe(address =>{
    console.log(address);
    this.addresses = address;
    })
    this.getAddress();
  }

  getAddress(){
    this.isLoading = true;
    setTimeout(async () => {
     await this.addressService.getAddresses();
      this.isLoading = false;
      this.globalService.successToast('Address retrived succesfully');
    }, 3000);
    
  }

  getIcon(title){
   return this.globalService.getIcon(title);
  }

  editAddress(address){
  console.log(address);
  const navData :NavigationExtras ={
    queryParams :{
      data :JSON.stringify(address)
    }
  };
  this.router.navigate([this.router.url,'edit-address'],navData);
  }
  deleteAddress(address){
    console.log('addresses' ,address);
    this.globalService.showAlert(
      'Are you sure to delete this address ?',
      'confirm',
      [
        {
          text :'No',
          role :'cancel',
          handler :() =>{
            console.log('cancel');
            return;
          }
        },
        {
          text :'Yes',
          handler : async() =>{
          //  this.globalService.showLoader();
            console.log('address' ,address);
            await this.addressService.deleteAddress(address);
           // this.globalService.hideLoader();
          }
        }
      ]
    )
  }

 
}
