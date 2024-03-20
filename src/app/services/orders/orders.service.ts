import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order } from 'src/app/models/order.model';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private _orders = new BehaviorSubject<Order[]>([]);

  get orders() {
    return this._orders.asObservable();
  }

  constructor(private api: ApiService) { }

  getOrders() {
    try {
      const orders = this.api.orders;
      console.log('orders', orders);
      this._orders.next(orders);
    } catch(e) {
      throw(e);
    }
  }

  placeOrder(param) {
    try {
      param.user_id = '1';
      // param.order = JSON.stringify(param.order);
      // param.order = JSON.parse(param.order);
      param.id = '5aG0RsPuze8NX00B7uE2';
      // let currentOrders = this._orders.value;
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
        param.id,
        param.user_id,
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
