import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  isLoading = false;
  constructor(private authService :AuthService,
    private router :Router,
    private global : GlobalService
    ) { }

  ngOnInit() {
  }


  navigate(url){
    this.router.navigateByUrl(url);
  }
  onSubmit(form :NgForm){
   if(!form.valid)return;
   this.register(form);
  }

  register(form){
    this.isLoading = true;
    this.authService.register(form.value).then((data :any)=>{
      let url ='/tabs';
      if(data?.type =='admin') url='/admin';
      this.navigate(url);
     
      this.isLoading = false;
      form.reset();
    }).catch(e =>{
      console.log(e);
      this.isLoading = false;
      let msg :string = 'Could not sign you up, please try again';
      if(e.code ==='auth/email-already-in-use'){
        msg = e.message;
      }
      this.global.showAlert(msg);
    });
  }

}
