import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { finalize } from 'rxjs/operators';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';


import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Restaurant } from 'src/app/models/restaurant.model';

@Component({
  selector: 'app-add-restuarant',
  templateUrl: './add-restuarant.page.html',
  styleUrls: ['./add-restuarant.page.scss'],
})
export class AddRestuarantPage implements OnInit {


  isLoading = false;
  cities :any[] =[];
  location :any ={};
  coverImage :any ;
  category :string;
  isCuisine : boolean =false;
  categories:any[]=[];
  cuisines :any[]=[];

  constructor(private authService :AuthService,
    private router :Router,
    private global : GlobalService,
    private api : ApiService,
    public fireStorage :AngularFireStorage,
    ) { }

  ngOnInit() {
    this.getCities();
  }

  async getCities(){
   try{
    this.cities = await this.api.getCities();
   }
   catch(e){
    console.log(e);
    this.global.errorToast();
   }
  }



  onSubmit(form :NgForm){
   if(!form.valid)return;
   if(!this.coverImage || this.coverImage ==''){
    this.global.errorToast('Please select a cover image');
   }
   if(this.location && this.location?.lat){
    this.addRestaurant(form);
   }
   else{
    this.global.errorToast('please select location for the restaurant');
   }
  }

  async addRestaurant(form :NgForm){
   try{
   this.isLoading = true;
  //  const data = await this.authService.register(form.value,'restaurant');
  const data = await this.authService.createUser(form.value, 'restaurant');
   if(data?.id){
   const position = new firebase.firestore.GeoPoint(this.location.lat,this.location.lng);
   const restaurant = new Restaurant(
    data.id,
    this.coverImage ? this.coverImage : '',
    form.value.res_name,
    (form.value.res_name).toLowerCase(),
    this.cuisines,
    0,
    form.value.delivery_time,
    form.value.price,
    form.value.phone,
    form.value.email,
    false,
    form.value.description,
    form.value.openTime,
    form.value.closeTime,
   form.value.city,
    this.location.address,
    'active',
    0,
    position
   );
   const result = await this.api.addRestaurant(restaurant,data.id);
   await this.api.addCategories(this.categories,data.id);
   this.global.successToast('restaurant added succesfully');
   }
   else{
    this.global.showAlert('Restaurant registration failed');
   }
   this.isLoading = false;
   this.router.navigateByUrl('admin');
   }
   catch(e){
    console.log(e);
    this.isLoading = false;
    let msg : string ='Could not register the restuarant , Please try again';
    if(e.code ==='auth/email-already-in-use'){
      msg = e.message;
    }
    this.global.showAlert(msg);
   }

  
  }


  async searchLocation(){
   try{
     const options ={
      component : SearchLocationComponent
     };
     const modal = await this.global.createModal(options);
     if(modal){
      this.location = modal;
     }
   }
   catch(e){
    console.log(e);
   }
  }

  preview(event){
    const files = event.target.files;
    if(files.length == 0) return;
    const mimetype = files[0].type;
    if(mimetype.match(/image\/*/)==null) return;
    const file =files[0];
    const filePath ='restaurants/' +Date.now()+'_'+file.name;
    const fileRef =this.fireStorage.ref(filePath);
    const task = this.fireStorage.upload(filePath,file);
     task.snapshotChanges()
    .pipe(
      finalize(()=>{
        const downloadUrl = fileRef.getDownloadURL();
        downloadUrl.subscribe(url =>{
          if(url){
            this.coverImage = url;
          }
        })
      })
      )
    .subscribe(url =>{
     console.log(url);
    })
  }

  addCategory(){
  console.log(this.category);
  if(this.category.trim() =='')return;
  console.log(this.isCuisine);
  const checkString = this.categories.find(x => x == this.category);
  if(checkString){
    this.global.errorToast('Category already added');
    return;
  }
  this.categories.push(this.category);
  if(this.isCuisine) this.cuisines.push(this.category);
  }

  clearCategory(){
   this.categories =[];
   this.cuisines =[];
  }

  getArrayAsString(array){
     return array.join(',');
  }

}
