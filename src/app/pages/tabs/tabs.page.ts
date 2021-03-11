import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { STORAGES } from 'src/app/interfas/sotarage';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  dataUser:any = {};
  rolUser:string = "";
  constructor(
    private _store: Store<STORAGES>,
  ) { 
    this._store.subscribe((store:any)=>{
      store = store.name;
      if( !store ) return false;
      // this.listRow = store.ordenes || [];
      this.dataUser = store.persona || {};
      if( this.dataUser ) if( this.dataUser.rol ) this.rolUser = this.dataUser.rol.rol;
    });
  }

  ngOnInit() {
    console.log( this.rolUser )
  }

}
