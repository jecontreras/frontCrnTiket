import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { PipeModule } from 'src/app/pipe/pipe.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@NgModule({
  imports: [
    PipeModule,
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  providers:[
    InAppBrowser
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
