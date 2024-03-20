import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { IonContent, NavController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global/global.service';
import { OrderService } from 'src/app/services/orders/orders.service';
import * as moment from 'moment';
import { CartService } from 'src/app/services/cart/cart.service';
import { Subscription } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Order } from 'src/app/models/order.model';
import { AddressService } from 'src/app/services/address/address.service';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit ,OnDestroy {

  @ViewChild(IonContent ,{static:false}) content :IonContent;
  urlCheck : any;
  url:any;
  model: any ={};
  deliveryCharge =20;
  instructions :any;
  location = {} as Address;
  cartSub :Subscription;
  addressSub : Subscription;
  radius :any;

  constructor(private router :Router,
    private orderService :OrderService,
    private globalService :GlobalService,
    private navCntrl: NavController,
    private cartService :CartService,
    private addService :AddressService
    ) { }
  ngOnDestroy(): void {
    if(this.addressSub)this.addressSub.unsubscribe();
    if(this.cartSub)this.cartSub.unsubscribe();
    throw new Error('Method not implemented.');
  }


 

  async ngOnInit() {
    await this.getCartData();
    this.addressSub = this.addService.changeAddress.subscribe(async (address) =>{
      this.location = address;
      if(this.location?.lat){
        const radius= this.addService.radius;
        const result= this.cartService.checkCart(this.location.lat,this.location.lng,radius);
        if(result){
          this.globalService.errorToast
          ('Your Location is to far from restuarant in cart! Kindly search for other restuarant nearby',
          5000  );
          await this.cartService.clearCart();
        }
      }
    })

     this.cartSub = this.cartService.cart.subscribe(cart =>{
      this.model = cart;
      if(!this.model) this.location ={} as Address;
     })
     this.checkUrl();
    
  }

  // ngOnDestroy() {
  //   if(this.addressSub)this.addressSub.unsubscribe();
  //   if(this.cartSub)this.cartSub.unsubscribe();
  //   throw new Error('Method not implemented.');
  // }

 

  async getCartData(){
    await this.checkUrl();
    await this.cartService.getCartData();  
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

  quantityPlus(index){{
    try{
      this.cartService.quantityPlus(index);
     }
     catch(e){
   
     }
  }
}

  quantityMinus(index){
    try{
     this.cartService.quantityMinus(index);
    }
    catch(e){
  
    }
  }

  ScrollToBottom(){
  this.content.scrollToBottom(500);
  }
  
 

  addAddress(location?){
    let url: any;
    let navData: NavigationExtras;
    if(location) {
      location.from = 'cart';
      navData = {
        queryParams: {
          data: JSON.stringify(location)
        }
      }
    }
    if(this.urlCheck =='tabs') url=['/','tabs','address','edit-address'];
    else url = [this.router.url,'address','edit-address'];
    this.router.navigate(url,navData);
  }

  async changeAddress(){
    try{
      const options ={
        component :SearchLocationComponent,
        swipeToClose : true,
        cssClass :'custom-model',
        componentProps :{
        from :'cart'
        }
      }
      const address = await this.globalService.createModal(options);
      if(address){
        if(address == 'add') this.addAddress();
        await this.addService.changeAdress(address);
      }
    }
    catch(e){
      console.log(e);
    }
  }

  async makePayement(){
    try{
         const data :Order ={
          restaurant_id  : this.model.restaurant.id,
          restaurant : this.model.restaurant,
          instruction : this.instructions? this.instructions : ' ',
          order : this.model.items,//JSON.stringify(this.model.items),
          time :moment().format('lll'),
          address :this.location ,
          total : this.model.totalPrice,
          grandTotal : this.model.grandTotal,
          deliveryCharge : this.deliveryCharge,
          status :'create',
          paid :'COD'
         }

         await this.orderService.placeOrder(data);
         //clear cart
         this.cartService.clearCart();
         this.model ={};
         this.globalService.successToast('Your Order is Placed');
         this.navCntrl.navigateRoot(['tabs/account']);
    }
    catch(e){
      console.log(e);
    }
  }

  ionViewWillLeave(){
    console.log('ion will leave cart change');
    if(this.model?.items && this.model?.items.length>0){
      this.cartService.saveCart();
    }
  }

}
