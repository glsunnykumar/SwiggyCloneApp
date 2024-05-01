import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRestuarantPageRoutingModule } from './add-restuarant-routing.module';

import { AddRestuarantPage } from './add-restuarant.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddRestuarantPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AddRestuarantPage]
})
export class AddRestuarantPageModule {}
