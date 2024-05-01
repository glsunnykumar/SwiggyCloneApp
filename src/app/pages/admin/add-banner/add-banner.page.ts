import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-add-banner',
  templateUrl: './add-banner.page.html',
  styleUrls: ['./add-banner.page.scss'],
})
export class AddBannerPage implements OnInit {

  bannerImage :any;
  constructor(
    public fireStorage :AngularFireStorage,
    public apiService :ApiService,
    public global :GlobalService
  ) { }

  ngOnInit() {
  }

   preview(event){
    const files = event.target.files;
    if(files.length == 0) return;
    const mimetype = files[0].type;
    if(mimetype.match(/image\/*/)==null) return;
    const file =files[0];
    const filePath ='banners/' +Date.now()+'_'+file.name;
    const fileRef =this.fireStorage.ref(filePath);
    const task = this.fireStorage.upload(filePath,file);
     task.snapshotChanges()
    .pipe(
      finalize(()=>{
        const downloadUrl = fileRef.getDownloadURL();
        downloadUrl.subscribe(url =>{
          if(url){
            this.bannerImage = url;
          }
        })
      })
      )
    .subscribe(url =>{
     console.log(url);
    })
  }

  async addBanner(){
    try{
      if(this.bannerImage == '' || !this.bannerImage) {
        console.log('returning');
        return;
      }
     this.global.showLoader();
     const data ={
      banner :this.bannerImage,
      status :'active'
     }
     await this.apiService.addBanner(data);
     this.global.hideLoader();
     this.global.successToast('Banner Created');
    }
    catch(e){
      this.global.hideLoader();
    this.global.errorToast();
    }
  }

}
