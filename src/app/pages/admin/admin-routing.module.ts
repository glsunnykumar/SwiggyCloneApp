import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },
  {
    path: 'add-banner',
    loadChildren: () => import('./add-banner/add-banner.module').then( m => m.AddBannerPageModule)
  },
  {
    path: 'add-restuarant',
    loadChildren: () => import('./add-restuarant/add-restuarant.module').then( m => m.AddRestuarantPageModule)
  },
  {
    path: 'add-menu-item',
    loadChildren: () => import('./add-menu-item/add-menu-item.module').then( m => m.AddMenuItemPageModule)
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
