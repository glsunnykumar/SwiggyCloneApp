import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'src/app/models/user.model';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private storage: StorageService,
    private fireAuth: AngularFireAuth,
    private apiService: ApiService
  ) {}

  async login(email: string, password: string): Promise<any> {
    try {
      const response = this.fireAuth
        .signInWithEmailAndPassword(email, password)
        .then((data) => {
          console.log('login response', data);
          if (data.user) {
            this.setUserData(data.user.uid);
          }
        });
    } catch (e) {
      console.log(e);
    }
  }

  async getId() {
    return (await this.storage.getStorage('uid')).value;
  }

  updateEmail(oldEmail,newEmail,password){
    this.fireAuth.signInWithEmailAndPassword(oldEmail ,password)
    .then(result =>{
      result.user.updateEmail(newEmail);
    })
    .catch(e =>{
      throw(e);
    })
  }

  async register(formValue) {
    try {
      const register = await this.fireAuth.createUserWithEmailAndPassword(
        formValue.email,
        formValue.password
      );
      console.log('register user :', register);
      const data:User = {
        uid: register.user.uid,
        email: formValue.email,
        phone: formValue.phone,
        name: formValue.name,
        type: 'user',
        status: 'active',
      };

      await this.apiService.collection('user').doc(register.user.uid).set(Object.assign({},data));
      await this.setUserData(register.user.uid);
      return data;
    } catch (e) {
      throw e;
    }
  }
  setUserData(userId) {
    this.storage.setStorage('uid', userId);
  }

  signUp() {}

  async logOut() {
    try {
      await this.fireAuth.signOut();
      await this.storage.removeStorage('uid');
    } catch (e) {
      console.log(e);
    }
  }

  async resetPassword(email: string) {
    try {
    return await this.fireAuth.sendPasswordResetEmail(email);
    } catch (e) {
      throw e;
    }

  }

  checkAuth(){
   return new Promise((resolve,reject)=>{
    this.fireAuth.onAuthStateChanged(user =>{
      console.log('auth data :',user);
      if(user){
        this.setUserData(user.uid);
        resolve(user.uid);
      }
      else{
        this.logOut();
        resolve(false);
      }
    });

   })

    
  }
}
