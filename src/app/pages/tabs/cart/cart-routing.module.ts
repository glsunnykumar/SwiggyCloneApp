import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartPage } from './cart.page';

const routes: Routes = [
  {
    path: '',
    component: CartPage
  },
  {
    path: 'address',
    loadChildren: () => import('../../../pages/tabs/address/address.module').then( m => m.AddressPageModule)
  },
  {
    path: 'payment-option',
    loadChildren: () => import('./payment-options/payment-options.module').then( m => m.PaymentOptionsPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartPageRoutingModule {}
