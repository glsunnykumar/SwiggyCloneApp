import { Injectable } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  uid :string;

  private _addresses = new BehaviorSubject<Address[]>([]);
  private _changeAddress = new BehaviorSubject<Address>(null);

  get addresses() {
    return this._addresses.asObservable();
  }

  get changeAddress() {
    return this._changeAddress.asObservable();
  }

  constructor(private auth: AuthService, private api: ApiService) {}

  async getUid(){
    return await this.auth.getId();
  }

  async getAddressRef(query?){
    if(!this.uid) this.uid = await this.getUid();
    return await this.api.collection('address').doc(this.uid).collection('all',query)
  }

  async getAddresses(num?) {
    try {
      //user id
      let addressRef;
      if (num)
        addressRef = await this.getAddressRef(ref => ref.limit(num));
      else addressRef = await this.getAddressRef();
      const allAddress: Address[] = await addressRef
        .get()
        .pipe(
          switchMap(async (data: any) => {
            let itemData = await data.docs.map((element) => {
              let item = element.data();
              item.id = element.id;
              // console.log('item',item);
              // item.category_id.get()
              // .then(cData =>{
              //   item.category_id = cData.data();
              // })
              // .catch(e =>{
              //  throw(e);
              // })
              return item;
            });
            console.log('itemData', itemData);
            return itemData;
          })
        )
        .toPromise();
      console.log(allAddress);
      this._addresses.next(allAddress);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async addAddress(param) {
    try {
      const uid = await this.auth.getId();
      const currentAddresses = this._addresses.value;
      const data = new Address(
       this.uid ?this.uid :await this.getUid(),
        param.title,
        param.address,
        param.landmark,
        param.house,
        param.lat,
        param.lng
      );
      let addressData = Object.assign({}, data);
      delete addressData.id;
      const response = await (await this.getAddressRef()).add(addressData);
      const id = await response.id;
      const address = { ...addressData, id };
      currentAddresses.push(address);
      this._addresses.next(currentAddresses);
      this._changeAddress.next(address);
    } catch (e) {
      throw e;
    }
  }

  async updateAddress(id, param) {
    try {
      const uid = await this.getUid();
      const address = await (await this.getAddressRef()).doc(id)
        .update(param);
      let currentAddresses = this._addresses.value;
      const index = currentAddresses.findIndex((x) => x.id == id);
      const data = new Address(
        param.user_id,
        param.title,
        param.address,
        param.landmark,
        param.house,
        param.lat,
        param.lng,
        id
      );
      currentAddresses[index] = data;
      this._addresses.next(currentAddresses);
      this._changeAddress.next(data);
    } catch (e) {
      throw e;
    }
  }

  async deleteAddress(param) {
    try {
      const uid = await this.getUid();
      await (await this.getAddressRef()).doc(param.id)
        .delete();
      let currentAddresses = this._addresses.value;
      currentAddresses = currentAddresses.filter((x) => x.id != param.id);
      this._addresses.next(currentAddresses);
    } catch (e) {
      throw e;
    }
  }

  changeAdress(address) {
    this._changeAddress.next(address);
  }

  async checkAddressExit(location) {
    let loc: Address = location;
    const uid = await this.getUid();

    const addresses :Address[] = await (await this.getAddressRef(ref => ref.where('lat', '==', location.lat).where('lng', '==', location.lng)
    )).get().pipe(
      switchMap(async (data :any) =>{
        let itemData = await data.docs.map(element =>{
          let item  = element.data();
          item.id = element.id;       
          return item;
        });
        console.log('itemData',itemData);
        return itemData
      })
    ).toPromise();
    // const address = await this.api.addresses.find(
    //   (x) => x.lat === location.lat && x.lng === location.lng
    // );
    if (addresses?.length >0) {
      loc = addresses[0];
    }
    this.changeAdress(loc);
  }
}
