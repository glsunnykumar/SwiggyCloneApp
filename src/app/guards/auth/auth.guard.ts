import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Strings } from 'src/app/enum/strings';

@Injectable({
  providedIn: 'root'
})
export class  AuthGuard implements CanLoad {

  constructor(
    private alertCtrl :AlertController,
    private authService :AuthService,
    private router :Router
    ){

  }
  async canLoad(
    route: Route,
    segments: UrlSegment[]): Promise<boolean> {
      const roleType = route.data['type'];
      try {
        const type = await this.authService.checkUserAuth();
        if(type) {
          if(type == roleType) return true;
          else {
            let url = Strings.TABS;
            if(type == 'admin') url = Strings.ADMIN;
            this.navigate(url);
            return false;
          }
        } else {
          this.checkForAlert(roleType);
          return false;
        }
      } catch(e) {
        console.log(e);
        this.checkForAlert(roleType);
        return false;
      }
     
}

async checkForAlert(roleType){
  const id = await this.authService.getId();
  if(id){
   //network
   this.showAlert(roleType);

  }else{
    this.authService.logOut();
    this.navigate(Strings.LOGIN);
  }
}
navigate(url){
  this.router.navigateByUrl(url,{replaceUrl : true});
  return false;
}

showAlert(role){
  this.alertCtrl.create({
    header: 'Authentication failed',
    message: 'Please Check your Internet connectivity',
    buttons: [
      {
      text :'LogOut',
      handler :() =>{
        this.authService.logOut();
        this.navigate(Strings.LOGIN)
      }
    },
    {
      text :'Retry',
      handler :() =>{
       let url =Strings.TABS;
       if(role =='admin') url =Strings.ADMIN;
       this.navigate(url);
      }
    }
  ]
  })
  .then(alertEl => alertEl.present());
}
}
