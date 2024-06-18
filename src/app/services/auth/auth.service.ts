import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'src/app/models/user.model';
import { ApiService } from '../api/api.service';
import { Strings } from 'src/app/enum/strings';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';
import { HttpService } from '../http/http.service';
import { environment } from 'src/environments/environment';

export class AuthUserId{
  constructor(public uid: string){

  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public static UNKNOWN_USER =null;

  private _uid = new BehaviorSubject<AuthUserId>(AuthService.UNKNOWN_USER);

  // get userId(){
  //   return this._uid.asObservable().pipe(map(uid =>{
  //     console.log(uid);
  //     if(uid) return uid;
  //     else return AuthService.UNKNOWN_USER;
  //   }))
  // }

  constructor(
    private storage: StorageService,
    private fireAuth: AngularFireAuth,
    private apiService: ApiService,
    private http :HttpService
  ) {}

  async checkAuth(){
   return await new Promise((resolve,reject)=>{
     this.fireAuth.onAuthStateChanged((user :any) =>{
      resolve(user);
      // if(user){
      //   console.log('resolving the promise :',user);
      //   this.setUserData(user.uid);
      //   resolve(user.uid);
      // }
      // else{
      //   this.logOut();
      //   resolve(false);
      // }
    });

   })    
  }

   async checkUserAuth(){
    try{
     const user:any = await this.checkAuth();
     if(user){
     this.setUserData(user.uid);
     const profile :any = await this.getUserData(user.uid);
     if(profile) return profile.type;
      return false;
     }
     else{
      return false;
     } 
    }
    catch(e){
      await this.logOut();
      throw(e);
    }
  }
  
  async getId() {
    const user = await this._uid.value;
    if(user?.uid){
      return user.uid;
    }
    else{

      return (await this.storage.getStorage(Strings.UID)).value;
    }
  }


  async getUserData(id){
   return (await(this.apiService.collection('user').doc(id).get().toPromise())).data()
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response =await this.fireAuth
        .signInWithEmailAndPassword(email, password);
        if(response.user)
        {
          this.setUserData(response.user.uid);
          const user :any = await this.getUserData(response.user.uid);
          return user.type;
        }
      
    } catch (e) {
      console.log(e);
    }
  }

  async logOut() {
    try {
      await this.fireAuth.signOut();
      this._uid.next(AuthService.UNKNOWN_USER);
      await this.storage.removeStorage('uid');
    } catch (e) {
      console.log(e);
    }
  }

  async register(formValue ,type?) {
    try {
      const register = await this.fireAuth.createUserWithEmailAndPassword(
        formValue.email,
        formValue.password
      );
      const data = new User (
        formValue.email,
        formValue.phone,
        register.user.uid,
        formValue.name,
        type ? type : 'user',
        'active',
      );

      await this.apiService.collection('user').doc(register.user.uid).set(Object.assign({},data));
      if(!type || type !='restaurant'){
        await this.setUserData(register.user.uid);
       }
      const userData ={
        id:register.user.uid,
        type : type ?type :'user'
       };
       return userData;
    } catch (e) {
      console.log('throwing registered email id erro');
      throw e;
    }
  }
  async createUser(formValue , type)  {
    try{
     const response$ = this.http.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebase.apiKey}`, 
      {
        email: formValue.email,
        password: formValue.password
        // returnSecureToken: true
      }
    );
    const response = await lastValueFrom(response$);
    const uid = response.localId;
    const data = new User(
      formValue.email,
      formValue.phone,
      uid,
      formValue.name,
      type,
      'active'
    );
    await this.apiService.setDocument(`users/${uid}`,Object.assign({},data));
    const userData ={
      id:uid,
      type
    };
    return userData;
    }
    catch(e){
      throw(e);
    }
  }

  async resetPassword(email: string) {
    try {
    return await this.fireAuth.sendPasswordResetEmail(email);
    } catch (e) {
      throw e;
    }

  }

  setUserData(userId) {
    this.storage.setStorage('uid', userId);
    this._uid.next(new AuthUserId(userId));
  }

  signUp() {}


  updateEmail(oldEmail,newEmail,password){
    this.fireAuth.signInWithEmailAndPassword(oldEmail ,password)
    .then(result =>{
      result.user.updateEmail(newEmail);
    })
    .catch(e =>{
      throw(e);
    })
  }

 

 
 
  
}
