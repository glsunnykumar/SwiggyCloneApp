import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { ProfileService } from '../services/profile/profile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private authService :AuthService,
    private router :Router,
    private profileService :ProfileService
    ){

  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
     //this.authService.checkAuth();
      return this.authService.checkAuth().then(id =>{
      if(id){
        this.profileService.getProfile().then(profile =>{
          if(profile && profile?.type =='user'){
          return true;
          } 
          else if(profile && profile?.type =='admin'){
            this.router.navigateByUrl('/admin');
            return false;
          }    
          else{
            this.authService.logOut();
            this.router.navigateByUrl('/login');
            return false;
          }
        }).catch(e =>{
          console.log(e);
          this.authService.logOut();
          this.router.navigateByUrl('/login');
          return false;
        });
        return true;
      } 
      else {
      this.router.navigateByUrl('/login');
      return false;
      }
    })
    .catch(e=>{
      console.log(e);
      this.router.navigateByUrl('/login');
      return false;
    })
  }
}
