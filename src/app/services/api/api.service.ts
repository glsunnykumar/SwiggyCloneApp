import { Injectable } from '@angular/core';
import { Address } from 'src/app/models/address.model';
import { Category } from 'src/app/models/category.model';
import { Item } from 'src/app/models/item.model';
import { Order } from 'src/app/models/order.model';
import { Restaurant } from 'src/app/models/restaurant.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { switchMap } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as geofirestore from 'geofirestore';
import { 
  addDoc, collection, collectionData, deleteDoc, doc, endAt, 
  Firestore, getDoc, getDocs, limit, orderBy, query, setDoc, 
  startAt, updateDoc, where 
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  radius = 25;
  firestore = firebase.firestore();
  GeoFirestore = geofirestore.initializeApp(this.firestore);

  constructor(private adb: AngularFirestore
    ) { }

   collection(path,querFunc?){
    return  this.adb.collection(path,querFunc);
  }

  docRef(path) {
    return doc(this.firestore, path);
  }


  geoCollection(path){
    return this.GeoFirestore.collection(path);
  }

  randomString(){
    const id= Math.floor(1000000 + Math.random() * 900000);
    return id.toString();
  }

  setDocument(path,data){
    const dataRef = this.docRef(path);
    return setDoc(dataRef,data);
  }

  async addBanner(data){
   try{
    const id = this.randomString();
    data.id =id;
    await this.collection('banners').doc(id).set(data);
   }
   catch(e){
    console.log(e);
    throw e;
   }
  }

  addCategories(categories ,uid){
    try{
      categories.forEach(async(element) => {
        const id = this.randomString();
        const data = new Category(
          id,
          element,
          uid
        );
        await this.collection('categories').doc(uid).set(Object.assign({},data));
      });
      return true;
    }
    catch(e){
      throw e;
    }
   }
  
  
   //menu
   async addMenuItem(data){
    try{
      const id = this.randomString();
      data.id =id;
      const item = new Item(
        id,
        this.firestore.collection('categories').doc(data.category_id),
        data.restaurant_id,
        data.cover,
        data.name,
        data.description,
        data.price,
        0,
        false,
        false,
        data.veg
      )
      let itemData = Object.assign({},item);
      delete itemData.quantity;
      const result = await this.collection('menu').doc(data.restaurant_id).collection('allItems').doc(id).set(itemData);
      return result;
     }
     catch(e){
      console.log(e);
      throw e;
     }
   }

  async getRestuarantMenu(uid){
  try{
    const itemsRef = await this.collection('menu').doc(uid).collection
    ('allItems', ref => ref.where('status' ,'==' , false));
    const items=itemsRef.get().pipe(
      switchMap(async (data :any) =>{
        let itemData = await data.docs.map(element =>{
          let item  = element.data();
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


        return itemData
      })
    ).toPromise();
    return items;
  }
  catch(e){
    throw(e);
  }
   }

 async getBanner(){
     try{
      const banners = await this.collection('banners').get().pipe(
        switchMap(async (data :any) =>{
          let bannerData = await data.docs.map(element =>{
            const item  = element.data();
            return item;
          });
          return bannerData
        })
      ).toPromise();
      return banners;
     }
     catch(e){
      console.log(e);
     }
  }

  async getCities(){
    try{
     const cities = await this.collection('cities').get().pipe(
       switchMap(async (data :any) =>{
         let cityData = await data.docs.map(element =>{
           const item  = element.data();
           return item;
         });
         console.log(cityData);
         return cityData
       })
     ).toPromise();
     return cities;
    }
    catch(e){
     console.log(e);
    }
 }

 getDocById(path) {
  const dataRef = this.docRef(path);
  return getDoc(dataRef);
}

 //restuatant

 async addRestaurant(data:any,uid){
  try{
  let restaurant  :any =Object.assign({},data);
      delete restaurant.g;
      delete restaurant.distance;
       const response = await this.geoCollection('restaurants').doc(uid).set(restaurant);
    
      return response;
  }
  catch(e){
    throw e;
  }
 }

 async getRestaurantCategories(restId){
  try{
    const categories = await this.collection
    ('categories',
      ref => ref.where('uid' ,'==' , restId)
    )
    .get().pipe(
      switchMap(async (data :any) =>{
        let categoryData = await data.docs.map(element =>{
          const item  = element.data();
          return item;
        });
        return categoryData
      })
    ).toPromise();
    return categories;
   }
   catch(e){
    console.log(e);
   }
 }

async getRestaurants() {
  try{
    const restaurants = await this.collection('restaurants').get().pipe(
      switchMap(async (data :any) =>{
        let restaurantData = await data.docs.map(element =>{
          const item  = element.data();
          return item;
        });
        return restaurantData
      })
    ).toPromise();
    return restaurants;
   }
   catch(e){
    console.log(e);
   }
}

async getRestaurantById (id): Promise<any>{
  try{
  const restuarant =(await (this.collection('restaurants').doc(id).get().toPromise())).data();
  return restuarant;
  }
  catch(e){
    console.log(e);
    throw(e);
  }
}

 async getNearByRestuarant(lat,lng) :Promise<any>{
  try{
   const center = new firebase.firestore.GeoPoint(lat,lng);
   const data= await(await this.geoCollection('restaurants').near({center,radius : this.radius}).get()).docs
   .sort((a,b)=>a.distance - b.distance).map(element =>{
    let item = element.data();
    item['id'] = element.id;
    item['distance'] = element.distance;
    return item
   });
   return data;
  }
  catch(e){
    throw e;
  }

 }


  
  restaurants: Restaurant[] = [];

  allRestaurants: Restaurant[] = [];

  restaurants1: Restaurant[] = [];
  
  categories: Category[] = []; 

  allItems: Item[] = [];

  addresses: Address[] = [];

  orders: Order[] = [ ];

  cities :[
    'Delhi',
    'Chandgarh',
    'Dharamshala',
    'Una',
    'Masuri'
  ]
  
}
