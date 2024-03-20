import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Category } from 'src/app/models/category.model';
import { Item } from 'src/app/models/item.model';
import { Restaurant } from 'src/app/models/restaurant.model';
import { ApiService } from 'src/app/services/api/api.service';
import { CartService } from 'src/app/services/cart/cart.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
})
export class ItemsPage implements OnInit,OnDestroy {
  id: any;
  data={} as Restaurant ;
  items: Item[] = [];
  cartData: any = {};
  isLoading: boolean = false;
  categories: Category[] = [];

  cartSub: Subscription;
  routeSub :Subscription;
  storedData: any = {};
  veg: boolean = false;

  model: any = {
    icon: 'fast-food-outline',
    title: 'No Menu Available',
  };

  allRestuarant: Restaurant[] = [];

  allItems: Item[] = [];

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cartService: CartService
  ) {}
  ngOnDestroy(): void {
   if(this.cartSub) this.cartSub.unsubscribe();
  }

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((param) => {
      if (!param.has('restuarantId')) {
        this.navCtrl.back();
        return;
      }
      this.id = param.get('restuarantId');
      this.getItems();
    });

    this.cartSub = this.cartService.cart.subscribe((cart) => {
      this.cartData = {};
      this.storedData = {}; 
      if (cart) {
        this.storedData = cart;
        // this.cartData.items = this.storedData.items;
        this.cartData.totalItem = this.storedData.totalItem;
        this.cartData.totalPrice = this.storedData.totalPrice;
        if (cart?.restaurant?.uid === this.id) {
          this.allItems.forEach((element) => {
            cart.items.forEach((element2) => {
              if (element.id != element2.id) return;
              element.quantity = element2.quantity;
            });
          });
        }
        else{
          this.allItems.forEach((element) => {
          element.quantity =0;
          });
          if(this.veg ==true)this.items = this.allItems.filter(x => x.veg ===true);
          else this.items =[...this.allItems];
        }
      }
    });
  }

  getCart() {
    return Preferences.get({
      key: 'cart',
    });
  }

  async getItems() {
    try {
      this.isLoading = true;
      this.data = {} as Restaurant;
      this.cartData = {};
      this.storedData = {};
      setTimeout(async () => {
        this.allItems = this.apiService.allItems;
       
        // this.categories = this.apiService.categories;
        let data: any = this.apiService.restaurants1.filter(
          x => x.uid == this.id
        );
        this.data = data[0];
        this.categories = this.apiService.categories.filter(
          (x) => x.uid === this.id
        );
        this.allItems = this.apiService.allItems.filter(
          (x) => x.uid === this.id
        );
        this.allItems.forEach((element,index)=>{
          this.allItems[index].quantity =0;
        })

        this.items = [...this.allItems];
        await this.cartService.getCartData();
        this.isLoading = false;
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }

  vegOnly(event) {
    console.log(event);
    this.items = [];
    if (event.detail.checked == true) {
      this.items = this.allItems.filter((x) => x.veg === true);
    } else {
      this.items = this.allItems;
    }
  }

  quantityMinus(item) {
    try {
      const index = this.allItems.findIndex(x => x.id === item.id);
      this.cartService.quantityMinus(index,this.allItems);
    } catch (e) {
      console.log('error', e);
    }
  }

  quantityPlus(item) {
    try {
      const index = this.allItems.findIndex(x => x.id === item.id);
      
      if(!this.allItems[index].quantity || this.allItems[index].quantity == 0) {
        if(!this.storedData.restaurant || (this.storedData.restaurant && this.storedData.restaurant.uid == this.id)) {
         
          this.cartService.quantityPlus(index, this.allItems, this.data);
        } else {
          // alert for clear cart
          this.cartService.alertClearCart(index, this.allItems, this.data);
        }
      } else {
        this.cartService.quantityPlus(index, this.allItems, this.data);
      }  
    } catch (e) {
      console.log(e);
    }
  }

  async viewCart() {
    console.log('CartData', this.cartData);
    if (this.cartData.items && this.cartData.items.length > 0)
      await this.saveToCart();
    this.router.navigate([this.router.url + '/cart']);
  }

  saveToCart() {
    try {
      this.cartData.restaurant = {};
      this.cartData.restaurant = this.data;
      this.cartService.saveCart();
    } catch(e) {
      console.log(e);
    }
  }

  async ionViewWillLeave() {
    console.log('ionViewWillLeave ItemsPage');
    if (this.cartData?.items && this.cartData?.items.length > 0)
      await this.saveToCart();
    if(this.routeSub) this.routeSub.unsubscribe();
  }
}
