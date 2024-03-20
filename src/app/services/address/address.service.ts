import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  radius =20;

  private _addresses = new BehaviorSubject<Address[]>([]);
  private _changeAddress = new BehaviorSubject<Address>(null);

  get addresses() {
    return this._addresses.asObservable();
  }

  get changeAddress(){
    return this._changeAddress.asObservable();
  }

  constructor(private api: ApiService) { }

  getAddresses(num?) {
    try {
      //user id
      let allAddress: Address[] = this.api.addresses;
      if(num){
        let address :Address[] =[];
        let length =num;
        if(allAddress.length < length) length=allAddress.length;
        for(let i=0 ;i <length ;i++){
          address.push(allAddress[i]); 
        }
        allAddress = address;
      }
      console.log(allAddress);
      this._addresses.next(allAddress);
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  addAddress(param) {
    param.id = 'address1';
    param.user_id = 'user1';
    const currentAddresses = this._addresses.value;
    const data =  new Address(
      param.id,
      param.user_id,
      param.title,
      param.address,
      param.landmark,
      param.house,
      param.lat,
      param.lng
    )
    currentAddresses.push(data);
    this._addresses.next(currentAddresses);
    this._changeAddress.next(data);

  }

  updateAddress(id, param) {
    param.id = id;
    let currentAddresses = this._addresses.value;
    const index = currentAddresses.findIndex(x => x.id == id);
    currentAddresses[index] = new Address(
      id,
      param.user_id,
      param.title,
      param.address,
      param.landmark,
      param.house,
      param.lat,
      param.lng
    );
    this._addresses.next(currentAddresses);
    this._changeAddress.next(param);
  }

  deleteAddress(param) {
    let currentAddresses = this._addresses.value;
    currentAddresses = currentAddresses.filter(x => x.id != param.id);
    this._addresses.next(currentAddresses);
  }

  changeAdress(address){
    this._changeAddress.next(address);
  }

  async  checkAddressExit(location){
    let loc :Address =location;
    const address = await this.api.addresses.find(x => x.lat === location.lat && x.lng ===location.lng);
    if(address){
      loc = address
    }
    this.changeAdress(loc);
  }
}
