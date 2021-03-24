import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormArticulosPageRoutingModule } from './form-articulos-routing.module';

import { FormArticulosPage } from './form-articulos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormArticulosPageRoutingModule
  ],
  declarations: [FormArticulosPage]
})
export class FormArticulosPageModule {}
