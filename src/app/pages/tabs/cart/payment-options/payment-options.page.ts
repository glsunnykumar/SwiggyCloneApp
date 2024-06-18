import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Order } from 'src/app/models/order.model';
import { User } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api/api.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { OrderService } from 'src/app/services/orders/orders.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { RazorpayService } from 'src/app/services/razorpay/razorpay.service';
import { StripeService } from 'src/app/services/stripe/stripe.service';

@Component({
  selector: 'app-payment-options',
  templateUrl: './payment-options.page.html',
  styleUrls: ['./payment-options.page.scss'],
})
export class PaymentOptionsPage implements OnInit,OnDestroy {

  url :any;
  urlCheck :any;
  profile ={} as User;
  order ={} as Order;
  profileSub :Subscription;
  constructor(  
    private router :Router, 
     private apiService: ApiService,
    private cartService: CartService,
    private global :GlobalService,
    private profileService : ProfileService,
    private razorpay :RazorpayService,
    private stripe :StripeService,
    private orderService :OrderService
  ) { }
  async ngOnDestroy(){
    await this.cartService.clearCartOrder();
    this.profileSub.unsubscribe();
  }

 async ngOnInit() {
    await this.getData();
    this.profileSub = this.profileService.profile.subscribe(profile =>{
      this.profile =profile;
    })
  }

  checkUrl(){

    let url:any = (this.router.url).split('/');
    const spliced = url.splice(url.length-2 ,2);
    
    this.urlCheck = spliced[0];
    url.push(this.urlCheck);
    this.url = url;
  }

  getPreviousUrl(){
    return this.url.join('/');
  }
  async getData(){
    try{
    await this.checkUrl();
    const profile = await this.profileService.getProfile();
    const order = await this.cartService.getCartOrder();
    console.log(order);
    this.order = JSON.parse(order?.value);

    }
    catch(e){
      console.log(e);
      this.global.errorToast();
    }
  }

  async paywithRazorPay(){
  try{
    // this.global.showLoader();
    // const razorpay_data ={
    //   amount : this.order.grandTotal *100,
    //   currency :'INR'
    // }

    const params ={
      email :this.profile.email,
      phone :this.profile.phone,
      amount : this.order.grandTotal *100
      
    }
   // const data = await this.razorpay.payWithRazorpay(params);
    //console.log(data);
  }
  catch(e){
   

  }

  
  }

  async paywithStripe(){
    try{
    this.global.showLoader();
    const profile = await this.profileService.getProfile();
    const stripe_data ={
      name :profile?.name,
      email :profile?.email,
      amount :this.order?.grandTotal *100,
      currency :'inr'
    };
    const payment_description = await this.stripe.paymentFlow(stripe_data);
    //console.log(payment_description.split('_').slice(0,2).join('_'));
    const payment_desc =payment_description.split('_').slice(0,2).join('_');
    const order_param ={
      paid :'Stripe',
      payment_id:payment_desc
    }
    this.global.hideLoader();
    await this.placeOrder(order_param);
   
    }
    catch(e){
      console.log(e);
        this.global.hideLoader();
        this.global.errorToast(e.message);
      throw e;
    }
  }
  
  async placeOrder(param?){
    try{
       this.global.showLoader();
       const order ={
        ...this.order,
        ...param
       }
       await this.orderService.placeOrder(order);
       //clear cart
       await this.orderService.clearCart(); 
    }
    catch(e){
      console.log(e);
      this.global.hideLoader();
      this.global.errorToast();
    }
  }

}
