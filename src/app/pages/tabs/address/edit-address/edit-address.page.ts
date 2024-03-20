import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';
import { AddressService } from 'src/app/services/address/address.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { GoogleMapsService } from 'src/app/services/google-maps/google-maps.service';

@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.page.html',
  styleUrls: ['./edit-address.page.scss'],
})
export class EditAddressPage implements OnInit {

  form :FormGroup;
 // location_name:string ='locating.....';
  location :any ={};
  isSubmitted = false;
  id :any;
  center :any ={};
  isLocationFetched : boolean;
  update :boolean;
  isLoading:boolean = false;
  from :string;
  check :boolean = false;

  constructor(
    private navCntrl :NavController,
    private addressService :AddressService,
    private global : GlobalService,
    private route :ActivatedRoute,
    private map :GoogleMapsService
    ) { }

  ngOnInit() {
    this.checkForUpdate();
  }

  checkForUpdate(){
    this.isLoading = true;
    this.location.loction_name ='Locating....';
    this.isLocationFetched =false;
    this.route.queryParams.subscribe(async(data)=>{
      if(data['data']){
      console.log('data found',data);
      const address =JSON.parse(data['data']);
      if(address?.lat){
        this.center ={
          lat :address.lat,
          lng:address.lng
        };
        this.update = true;
        this.location.lat = this.center.lat;
        this.location.lng = this.center.lng;
        this.location.address = address.address;
        this.location.title= address.title;
        if(!address?.from) this.id = address.id;
      }
      console.log('adress form' , address);
      if(address.from) this.from = address.from;   
      
        await this.initForm(address);
        this.toggleLocation();
      
     
      }
      else{
        this.update = false;
        this.initForm();
      }
     
    })
    
  }

  initForm(address?){
  let data ={
    title :null,
    house:null,
    landmark:null
  }
  if(address){
   data ={ 
    title :address.title,
    house:address.house,
    landmark:address.landmark
   }
  }
   this.formData(data);
  }

  formData(data?){
    this.form = new FormGroup({
      title : new FormControl(data.title,[Validators.required]),
      landmark : new FormControl(data.landmark,[Validators.required]),
      house : new FormControl(data.house,[Validators.required])
     });
     this.isLoading = false;
  }

  toggleLocation(){
    this.isLocationFetched =!this.isLocationFetched;
  }

  toggleSubmit(){
    this.isSubmitted =!this.isSubmitted;
  }

  async onSubmit(){
    this.toggleSubmit();
    try{
      if(!this.form.valid && !this.isLocationFetched){
        this.toggleSubmit();
        return;
      }
      const data ={
        title :this.form.value.title,
        landmark :this.form.value.landmark,
        house :this.form.value.house,
        address : this.location.address,
        lat: this.location.lat,
        lng : this.location.lng
      }
      console.log('data :' + data);
      if(!this.id) await this.addressService.addAddress(data);
      else await this.addressService.updateAddress(this.id,data);
      this.check = true;
      this.navCntrl.back();
      this.toggleSubmit();
    }
    catch(e){
      console.log(e);
      this.global.errorToast();
    }
   
  }

  async changeLocation(){
    try{
    const options ={
      component : SearchLocationComponent,
      cssClass :'address-model'
    }
    const location = await this.global.createModal(options);
    console.log('location' + location);
    if(location){
      this.location = location;
      const loc ={
        lat :location.lat,
        lng :location.lng
      };
      //udate marker
      this.update = true;
      this.map.changeMarkerInMap(loc);
    }
    }
    catch(e){
      console.log(e);
    }
  }

  fetchLocation(event){
   this.location = event;
   this.toggleLocation();
  }

  ionViewDidLeave(){
    console.log('from', this.from);
    if(this.from =='home' && !this.check){
      console.log('changeAddress on the way');
      this.addressService.changeAdress({});
    }
    console.log('ionViewDidLeave');
  }

}
