import { Injectable } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Order } from 'src/app/models/order.model';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { GlobalService } from '../global/global.service';
import { StorageService } from '../storage/storage.service';
import { Strings } from 'src/app/enum/strings';
import { Cart } from 'src/app/models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private _orders = new BehaviorSubject<Order[]>([]);
  private _cart = new BehaviorSubject<Cart>(null);
  uid : string;

  get cart(){
    return this._cart.asObservable();
  }

  get orders() {
    return this._orders.asObservable();
  }
 async getUid(){
  if(!this.uid) return await this.auth.getId();
  else return this.uid;
 }

  async getOrderRef(){
    this.uid = await this.getUid();
    return this.api.collection('orders').doc(this.uid).collection('all');
  }

  constructor(private auth:AuthService, 
    private api: ApiService,
    private global :GlobalService,
    private storage :StorageService
  ) { }

  getRadius(){
    return this.api.radius;
  }

  async getOrders() {
    try {
      const orders :Order[] = await (await this.getOrderRef())
      .get().pipe(
      switchMap(async (data :any) =>{
        let itemData = await data.docs.map(element =>{
          let item  = element.data();
          item.id = element.id;   
          item.order =JSON.stringify(item.order) ;
          item.restaurant.get()
          .then(rData =>{
           item.restaurant = rData.data();
          })
          .catch(e =>{ throw (e)});
          return item;
        });
        console.log('itemData',itemData);
        return itemData
      })
    ).toPromise();

      console.log('orders', orders);
      this._orders.next(orders);
    } catch(e) {
      throw(e);
    }
  }

  async clearCart(){
    this.global.showLoader();
    await this.storage.removeStorage(Strings.CART_STORAGE);
    await this.storage.removeStorage(Strings.CART_ORDER);
    this._cart.next(null);
    this.global.hideLoader();
  }

  async placeOrder(param) {
    try {
      let data ={...param};
      data.order =  JSON.stringify(param.order);
      const uid = await this.getUid();
      data.restaurant = await this.api.firestore.collection('restaurant').doc(param.restaurant_id);
     
      const orderRef =await (await this.getOrderRef()).add(data);
      const order_id = orderRef.id;
      console.log('latest order: ', param);
      let currentOrders: Order[] = [];
      currentOrders.push(new Order(
        param.address,
        param.restaurant,
        param.restaurant_id,
        param.order,
        param.total,
        param.grandTotal,
        param.deliveryCharge,
        param.status,
        param.time,
        param.paid,    
        order_id,
        uid,
        param.instruction    
      ));
      console.log('latest order: ', currentOrders);
      currentOrders = currentOrders.concat(this._orders.value);
      console.log('orders: ', currentOrders);
      this._orders.next(currentOrders);
    } catch(e) {
      throw(e);
    }
  }

}
