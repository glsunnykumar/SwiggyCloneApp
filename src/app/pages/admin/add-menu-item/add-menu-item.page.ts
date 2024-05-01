import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Category } from 'src/app/models/category.model';
import { Restaurant } from 'src/app/models/restaurant.model';
import { ApiService } from 'src/app/services/api/api.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-add-menu-item',
  templateUrl: './add-menu-item.page.html',
  styleUrls: ['./add-menu-item.page.scss'],
})
export class AddMenuItemPage implements OnInit {

  @ViewChild('filePicker',{static:false}) filePickerRef : ElementRef;
  restaurants :Restaurant[] = [];
  categories :Category[] =[];
  isLoading = false;
  veg :boolean = true;
  status :boolean = true;
  image :any;
  imageFile :any;
  category :any;
  constructor(public global : GlobalService,
private apiService :ApiService,
public fireStorage :AngularFireStorage,
private router :Router

  ) { }

  ngOnInit() {
    this.getRestuarant();
  }

  changeImage(){
   this.filePickerRef.nativeElement.click();
  }

  onFileChosen(event){
  const file = event.target.files[0];
  if(!file)return;
  this.imageFile = file;
  const reader = new FileReader();
  reader.onload =() =>{
    const dataUrl = reader.result.toString();
    this.image = dataUrl;
  }
  reader.readAsDataURL(file);
  }

  async changeRestaurant(event)
  {
    try{
      this.global.showLoader();
      console.log(event);
      this.categories = await this.apiService.getRestaurantCategories(event.detail.value);
      this.category='';
      this.global.hideLoader();
     }
     catch(e){
      this.global.hideLoader();
      this.global.errorToast();
     }
  }

  async getRestuarant(){
   try{
    this.global.showLoader();
    this.restaurants = await this.apiService.getRestaurants();
    console.log('restaurants' , this.restaurants);
    this.global.hideLoader();
   }
   catch(e){
    this.global.hideLoader();
    this.global.errorToast();
   }

  }

async getCategories(){
  try{
   
  }
  catch(e){
    this.global.hideLoader();
    this.global.errorToast();
  }
}

  async onSubmit(form :NgForm){
  if(!form.valid || !this.image) return;
  try{
    this.isLoading = true;
    const url = await this.uploadImageFile(this.imageFile);
    console.log(url);
    if(!url){
      this.isLoading = false;
      this.global.errorToast('Image not uploaded ,Please try again');
      return;
    }
    const data ={
      cover :url,
      veg:this.veg,
      status : this.status,
      ...form.value
    };

    console.log('data' , data);
    await this.apiService.addMenuItem(data);
    this.isLoading = false;
    this.global.successToast('Menu Item added Succesfully');
    form.reset();
    this.router.navigateByUrl('/admin');
    this.imageFile ='';
  }
  catch(e){
    console.log(e);
    this.isLoading = false;
    this.global.errorToast();
  }
  }

  addRestuarantItem(form){

  }

  
  uploadImageFile(imageFile){

    return new Promise((resolve,reject)=>{
      const mimetype = imageFile.type;
      if(mimetype.match(/image\/*/)==null) return;
      const file =imageFile;
      const filePath ='menu/' +Date.now()+'_'+file.name;
      const fileRef =this.fireStorage.ref(filePath);
      const task = this.fireStorage.upload(filePath,file);
       task.snapshotChanges()
      .pipe(
        finalize(()=>{
          const downloadUrl = fileRef.getDownloadURL();
          downloadUrl.subscribe(url =>{
            if(url){
              resolve(url);
            }
          })
        })
        ).subscribe(url => {
          console.log(url);
        });
    })
   
  }

}
