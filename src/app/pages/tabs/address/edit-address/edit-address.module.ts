import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAddressPageRoutingModule } from './edit-address-routing.module';

import { EditAddressPage } from './edit-address.page';
import { MapComponent } from 'src/app/components/map/map.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    EditAddressPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [EditAddressPage ,MapComponent]
})
export class EditAddressPageModule {}
