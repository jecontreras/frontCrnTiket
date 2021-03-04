import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { STORAGES } from 'src/app/interfas/sotarage';
import { DataService } from 'src/app/services/data.service';
import { ToolsService } from 'src/app/services/tools.service';
import { ProductosService } from 'src/app/service-component/productos.service';
import { OrdenesService } from 'src/app/service-component/ordenes.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  
  dataUser:any = {};
  data:any = {};
  textoBuscar:string;
  listArticulos:any = [];
  listSeleccionado:any = [];
  vista:boolean = true;
  querys:any = {
    where:{},
    skip: 0
  };
  public ev:any = {};
  public disable_list:boolean = true;
  public evScroll:any = {};
  disabledAccion:boolean = false;
  constructor( 
    private _store: Store<STORAGES>,
    public _tools: ToolsService,
    private _data: DataService,
    private _productos: ProductosService,
    private _ordenes: OrdenesService
  ) {
    this._store.subscribe((store:any)=>{
      store = store.name;
      if( !store ) return false;
      // this.listRow = store.ordenes || [];
      this.dataUser = store.persona || {};
    });
  }

  ngOnInit() {
    //this.listArticulos = this._data.lista;
    this.getProductos();
  }

  doRefresh(ev){
    this.ev = ev;
    this.disable_list = false;
    this.listArticulos = [];
    this.getProductos();
  }

  loadData(ev){
    //console.log(ev);
    this.evScroll = ev;
    this.querys.skip++;
    this.getProductos();
  }

  getProductos(){
    //this._tools.presentLoading();
    this._productos.get( this.querys ).subscribe( ( res:any )=>{
      this.listArticulos = res.data;
      if( this.evScroll.target ){
        this.evScroll.target.complete()
      }
      if(this.ev){
        this.disable_list = true;
        if(this.ev.target){
          this.ev.target.complete();
        }
      }
      this.listArticulos = _.map( this.listArticulos, ( item:any )=>{
        let filtro:any = this.listSeleccionado.find(( row:any )=> row.id == item.id );
        if( filtro ) item.check = true;
        return item;
      });
      //this._tools.dismisPresent();
    },( error:any )=> { this._tools.presentToast( "Error de servidor" )} );
  }
  

  buscarProducto( ev:any ){
    this.textoBuscar = ev.detail.value;
    //console.log("***2", this.textoBuscar);
    this.querys = {
      where: {
        estado: true
      },
      skip: 0
    };
    if( this.textoBuscar !== ''){
      this.querys.where.or = [
        {
          slug: {
            contains: this.textoBuscar || ''
          }
        },
        {
          titulo: {
            contains: this.textoBuscar || ''
          }
        },
        {
          codigo: {
            contains: this.textoBuscar || ''
          }
        },
      ];
    }
    this.getProductos();
    /*if( this.textoBuscar == "") this.listArticulos = this._data.lista;
    else this.listArticulos = this.findMatches( this.textoBuscar);*/
  }

  findMatches( wordToSearch:string ) {
    return this.listArticulos.filter(rorw => {
        const regex = new RegExp(wordToSearch, 'gi');
        return rorw.titulo.match(regex)
    })
}

  async seleccionando( data:any ){
    if( !data.check ){
      data.cantidad = ( await this._tools.cantidadSelect( data ) );
      console.log( data );
      if( !data.cantidad ) return false;
      data.valor = Number( data.valor );
      data.total = Number( data.valor ) * Number( data.cantidad );
      this.listSeleccionado.push( data );
      data.check = !data.check;
    }else{
      this.listSeleccionado = this.listSeleccionado.filter( ( item:any )=> item.id !== data.id );
      data.check = !data.check;
    }
    this.suma();
  }

  suma(){
    this.data.total = _.sumBy( this.listSeleccionado, 'total');
  }

  verTiket(){
    this.suma();
    this.vista = false;
  }

  creandoTiket(){
    this.suma();
    this.vista = true;
  }

  async finalizarTiket(){
    if( !this.data.cliente ) return this._tools.presentToast( "Error no tiene ( nombre o mesa )");
    if( this.listSeleccionado.lenght == 0 ) return this._tools.presentToast( "Debe tener al menos 1 producto");
    let alert:any = await this._tools.presentAlertConfirm( { mensaje: "Deseas Finalizar Ticket"} );
    if( !alert ) return false;
    if( this.disabledAccion ) return false;
    this.disabledAccion = true;
    console.log( this.data );
    let data:any = {
      cliente: this.data.cliente,
      factura:{
        idVendedor: this.dataUser.id,
        precio: this.data.total,
        fecha_pedido: new Date(),
        detalles: this.data.detalles,
        codigo: this._tools.codigo(),
        domicilio: this.data.domicilio,
        direccionCliente: this.data.direccionCliente,
        celularCliente: this.data.celularCliente
      },
      articulo: this.listSeleccionado
    };
    this._ordenes.saved( data ).subscribe(( res:any )=>{
      res = res.data;
      this.disabledAccion = false;
      this._tools.presentToast( "Tiket creado exitos");
      this._tools.presentAlertConfirm( { mensaje: "Tiket creado con el nombre de "+ res.cliente } );
      this.resetearDatos();
    },( error:any )=> { this._tools.presentToast( "Tenemos problemas de conexion"); this.disabledAccion = false; } );
  }

  resetearDatos(){
    this.data = {};
    this.listSeleccionado = [];
    this.listArticulos = _.map( row =>{
      return {
        ...row,
        check: false
      };
    });
  }

}
