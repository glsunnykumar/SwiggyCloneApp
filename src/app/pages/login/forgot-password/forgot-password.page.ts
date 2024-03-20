import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  isLoading = false;
  constructor(private authService :AuthService,
    private global :GlobalService,
    private navCtrl :NavController
    ) { }

  ngOnInit() {
  }

  onSubmit(form :NgForm){
    console.log(form.value);
    if(!form.valid)return;
    this.isLoading = true;
    this.authService.resetPassword(form.value.emial).then(()=>{
      this.global.successToast('reset password link sent to your email');
      this.isLoading = false;
      this.navCtrl.back();
    })
    .catch(e=>{
      console.log(e);
      let msg : string ='Something went wrong';
      if(e.code === 'auth/missing-email'){
        msg ='email is not valid';
      }
      this.global.showAlert(msg);
      this.isLoading = false;
    })

  }

}
