import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestuarantsComponent } from './restuarants/restuarants.component';
import { IonicModule } from '@ionic/angular';
import { LoadingRestuarantsComponent } from './loading-restuarants/loading-restuarants.component';
import { EmptyScreenComponent } from './empty-screen/empty-screen.component';
import { CartItemComponent } from './cart-item/cart-item.component';
import { OrdersComponent } from './orders/orders.component';
import { SearchLocationComponent } from './search-location/search-location.component';



@NgModule({
  declarations: [
    RestuarantsComponent,
    LoadingRestuarantsComponent,
    EmptyScreenComponent,
    SearchLocationComponent
  ],
  imports: [
    IonicModule,
    CommonModule
  ],
  exports :[
    RestuarantsComponent,
    LoadingRestuarantsComponent,
    EmptyScreenComponent,
    SearchLocationComponent
  ]
})
export class ComponentsModule { }
