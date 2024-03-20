import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GlobalService } from 'src/app/services/global/global.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent  implements OnInit {

  @Input() profile;
  @ViewChild('phoneInput') phoneInput;
  isSubmitted = false;
  constructor(
    private profileService :ProfileService,
    private global :GlobalService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.phoneInput.setFocus();
    }, 500);
  }

  async onSubmit(form :NgForm){
    try{
        if(!form.valid){
          return;
        }
        this.isSubmitted = true;
        if(this.profile.email != form.value.emai){
          this.presentPasswordPrompt(form.value);
        }
        else{
          await this.profileService.updateProfile(this.profile,form.value)
          this.global.modalDismiss();
          
        }
        this.isSubmitted = false;
    }
    catch(e){
      console.log(e);
      this.global.errorToast();
    }
  }

  presentPasswordPrompt(data){
    this.global.showAlert('Enter your password to change your email address',
    'Verify',
    [
      {
        text :'Cancel',
        role :'cancel',
        handler :() =>{
          console.log('Confirm Cancel');
        }
      },{
        text :'Verify',
        handler : (inputData) =>{
          if(inputData.password.trim() !='' && inputData.password.length>=8){
            this.updateEmail(data,inputData.password);

          }
        }
      }],
      [{
        name :'password',
        type :'password',
        placeholder :'Enter Password',
        attributes :{
          minlength :8,
          inputmode :'text'
        }
      }]

      );
  }

  async updateEmail(data,password){
   
    try{
       await this.profileService.updateProfileWithEmail(this.profile,data,password);
      this.global.modalDismiss();
      this.isSubmitted = false;
    }
    catch(e){
      console.log(e);
      let msg : string ='No internet connection';
      if(e.code == 'auth/email-already-in-use'){
        msg = e.message;
      }
      else if(e.code ='auth/wrong-password'){
        msg =e.message;
      }
      this.global.errorToast(msg);
    }

  }

}
