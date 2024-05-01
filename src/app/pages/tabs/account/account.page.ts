import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { subscriptionLogsToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import { Order } from 'src/app/models/order.model';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { OrderService } from 'src/app/services/orders/orders.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit,OnDestroy {

  profile :any 
  isLoading :boolean;

  orders:Order[] = [  ];

  orderSub :Subscription;
  profileSub :Subscription;
  constructor(
    private navCtrl :NavController,
    private apiService :ApiService,
    private orderService :OrderService,
    private cartService :CartService,
    private global : GlobalService,
    private profileService :ProfileService,
    private authService :AuthService
    ) { }
  ngOnDestroy(): void {
    if(this.orderSub) this.orderSub.unsubscribe();
    if(this.profileSub) this.profileSub.unsubscribe();
  }

  ngOnInit() {
    this.orderSub = this.orderService.orders.subscribe(order =>{
    console.log('order' ,order);
    this.orders =order;
    },
    e =>{
      console.log(e);
    });
    
    this.profileSub = this.profileService.profile.subscribe(profile =>{
      this.profile = profile;
    })

    this.getData();
  }

  async getData(){
    this.isLoading = true;
    await this.profileService.getProfile();
    await this.orderService.getOrders();
    this.isLoading = false;
  }

  confirmLogout(){
    this.global.showAlert(
      'Are you Sure to sign out',
      'Confirm',
      [{
        text :'No',
        role :'cancel'
      },
       {
        text :'yes',
        handler :()=>{
          this.logout();
        }
       }
    ]
    );
  }

  logout(){
    this.global.showLoader();
    this.authService.logOut().then(()=>{
      this.navCtrl.navigateRoot('/login');
      this.global.hideLoader();
    })
    .catch(e=>{
      console.log(e);
      this.global.hideLoader();
      this.global.errorToast('Logout failed ? Check your internet connection');
    })
    ;
  }

  async reorder(order :Order){
   let data : any = await this.cartService.getCartData();
   if(data?.value){
        this.cartService.alertClearCart(null,null,null,order);
   }
   else{
    this.cartService.orderToCart(order);
   }
  }

  async editProfile(){
    const option ={
      component:EditProfileComponent,
      componentProps:{
        profile : this.profile
      },
      cssClass:'custom-model',
      swipeToClose :true
    }
    const modal = await this.global.createModal(option);
  }

  getHelp(order){
   console.log(order);
  }

}
