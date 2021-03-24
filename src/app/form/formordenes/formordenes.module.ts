import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormordenesPageRoutingModule } from './formordenes-routing.module';

import { FormordenesPage } from './formordenes.page';
import { PipeModule } from 'src/app/pipe/pipe.module';
import { FormArticulosPageModule } from '../form-articulos/form-articulos.module';

@NgModule({
  imports: [
    PipeModule,
    CommonModule,
    FormsModule,
    IonicModule,
    FormordenesPageRoutingModule,
    FormArticulosPageModule
  ],
  declarations: [FormordenesPage]
})
export class FormordenesPageModule {}
