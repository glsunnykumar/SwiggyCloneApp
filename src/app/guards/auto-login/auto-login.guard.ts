import { Injectable } from '@angular/core';
import {  CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Strings } from 'src/app/enum/strings';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements  CanLoad {

  constructor(
    private authService :AuthService,
    private router :Router,
    private global : GlobalService
    ){

  }

 
  async canLoad(
    route: Route,
    segments: UrlSegment[]):  Promise<boolean> {
      try{
        const val= await this.authService.getId();
        console.log('islogged in' , val);
        if(val){
          this.router.navigateByUrl(Strings.TABS,{replaceUrl:true});
          return false;
        } 
        else{
          return true;
        }
        }
        catch(e){
          console.log(e);
          this.global.hideLoader();
          return true
        }
  }

}
