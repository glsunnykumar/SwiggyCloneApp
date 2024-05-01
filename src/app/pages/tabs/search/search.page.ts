import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { Observable, Subject, Subscription, combineLatest, take } from 'rxjs';
import { Restaurant } from 'src/app/models/restaurant.model';
import { AddressService } from 'src/app/services/address/address.service';
import { ApiService } from 'src/app/services/api/api.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit ,OnDestroy {
  @ViewChild('searchInput')sInput!: IonInput;
  restuarants:Restaurant[] =[];
  query : any;
  model :any ={
    icon:'search-outline',
    title :'No Restuarants Found'
  }
  isLoading : boolean;
  allRestuarant :Restaurant[] =[];
  
  startAt = new Subject();
  endAt = new Subject();
  
  startObs = this.startAt.asObservable();
  endObs = this.endAt.asObservable();

  querySub :Subscription;
  addressSub:Subscription;

  location :any ={}

  constructor(private apiService :ApiService,
    private global :GlobalService,
    private addService :AddressService
    ) { }
  ngOnDestroy(): void {
    if(this.querySub) this.querySub.unsubscribe();
    if(this.addressSub)this.addressSub.unsubscribe();
  }

  ngOnInit() {
    this.querySub = combineLatest(this.startObs,this.endObs).subscribe(val =>{
     this.queryResults(val[0],val[1]);
    });

    // this.addressSub = this.addService.changeAddress.subscribe(
    //   (address) => {
    //     if (address && address?.lat) {
    //       this.location = address;
    //       if(this.query.length>0){
    //         this.querySearch();
    //       }
    //     } 
    //   },
    //   (e) => {
    //     console.log(e);
    //     this.isLoading = false;
    //     this.global.errorToast();
    //   }
    // );
  }

  async queryResults(start,end){
    this.isLoading = true;
    this.apiService.collection('restaurant',ref =>ref.orderBy('res_name').startAt(start).endAt(end))
    .valueChanges()
    .pipe(take(1))
    .subscribe((data :any)=>{
     this.restuarants = data;
     this.isLoading = false;
    }, e =>{
      this.isLoading = false;
      console.log(e);
    }
    )
  }

  ionViewDidEnter() {
    this.sInput.setFocus();
  }

  async onSearchChange(event){
    console.log(event);
    this.query = event.detail.value.toLowerCase();
    this.querySearch();
  }

  querySearch(){
    if(this.query.length >0){
      this.isLoading =true;
      this.startAt.next(this.query);
      this.endAt.next(this.endAt.next(this.query +'\uf8ff'));
    }
  }

}
