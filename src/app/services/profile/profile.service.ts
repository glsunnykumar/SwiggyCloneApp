import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private _profile = new BehaviorSubject<User>(null);

  get profile(){
    return this._profile.asObservable();
  }

  constructor(private authService : AuthService,
    private apiService : ApiService
    ) { }

 async getProfile(){
  try{
    const uid = await this.authService.getId();
    //let profile: any = await (await (this.apiService.collection('users').doc(uid).get().toPromise())).data();
    let profile: any = await (await (this.apiService.collection('user').doc(uid).get().toPromise())).data();
    console.log('profile data' , profile);
    const data = new User(
      profile.email,
      profile.phone,
      uid,
      profile.name,
      profile.type,
      profile.status
    )
    this._profile.next(data);
    return data;
  }
  catch(e){
    throw e;
  }

 
}

 async updateProfile(profile,param){
    try{
    const uid = await this.authService.getId();
    const result = await this.apiService.collection('user').doc(uid).update(param);
   
    const data = new User(
      param.phone,
      param.email,
      profile.uid,
      profile.name,
      profile.type,
      profile.status
    );
  
    this._profile.next(data);
    }
    catch(e){
      throw e;
    }
  }

 async updateProfileWithEmail(profile,param,password){

   try{
     await this.authService.updateEmail(profile.email,param.email,password);
     await this.updateProfile(profile,param);
  }
  catch(e){
    throw e;
  }
   
  }
}
