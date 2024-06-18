import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit,OnDestroy {

  constructor(
    private navCtrl :NavController,
    private global : GlobalService,
    private profileService :ProfileService,
    private authService :AuthService
  ) { }

  ngOnInit() {
    this.global.customStatusbar(true);
  }

  logout(){
    this.global.showLoader();
    this.authService.logOut().then(()=>{
      this.navCtrl.navigateRoot('/login');
      this.global.hideLoader();
    })
    .catch(e=>{
      console.log(e);
      this.global.hideLoader();
      this.global.errorToast('Logout failed ? Check your internet connection');
    })
    ;
  }

  ngOnDestroy(): void {
    this.global.customStatusbar(false);
  }

}
