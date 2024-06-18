import { Injectable } from '@angular/core';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  constructor() { }

  async payWithRazorpay(param){
    try{
    const options  = {
     // key :environment.razorpay.key_id,
      amount : (param.amount).toString(),
      currency :'INR',
      name: 'RitiEats',
      prefill: {
        email: param.email,
        contact: param.phone
      },
      theme :{
        color :'#3399cc'
      }

    }
  //  const data = await Checkout.open(options);
    // console.log(data.response);
    // return data.response
    }
    catch(e){
      throw(e);
    }
  }
}
