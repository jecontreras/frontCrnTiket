import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { STORAGES } from 'src/app/interfas/sotarage';
import { DataService } from 'src/app/services/data.service';
import { ToolsService } from 'src/app/services/tools.service';
import { ProductosService } from 'src/app/service-component/productos.service';
import { OrdenesService } from 'src/app/service-component/ordenes.service';
import { CategoriaService } from 'src/app/service-component/categoria.service';
import { CarritoAction } from 'src/app/redux/app.actions';
import { IonSegment } from '@ionic/angular';

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
  urlColor:string ="success";
  listCategorias:any = [];
  listCarritos:any = [];

  @ViewChild(IonSegment, {static: false}) segment: IonSegment;

  constructor( 
    private _store: Store<STORAGES>,
    public _tools: ToolsService,
    private _data: DataService,
    private _productos: ProductosService,
    private _ordenes: OrdenesService,
    private _categorias: CategoriaService
  ) {
    this._store.subscribe((store:any)=>{
      store = store.name;
      if( !store ) return false;
      // this.listRow = store.ordenes || [];
      this.dataUser = store.persona || {};
      this.listCarritos = store.carrito || [];
    });
  }

  ngOnInit() {
    //this.listArticulos = this._data.lista;
    setInterval(()=>{
      let color:string = "danger";
      if( this.data.domicilio ) color = "warning";
      if( this.data.mesa ) color = "success";
      this.urlColor =  color;
    }, 100 );
    this.getProductos();
    this.getCategorias();
  }

  getCategorias(){
    this._categorias.get( {
      where: { estado: 0 },
      sort: 'ordenar ASC',
      limit: 1000
    } ).subscribe(( res:any )=>{
      this.listCategorias = res.data;
      this.segment.value = this.listCategorias[0].id;
    });
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

  cambioCategoria( ev:any ){
    this.querys.where.categoria = ev.detail.value;
    this.querys.skip = 0;
    this.listArticulos = [];
    this.getProductos();
  }

  getProductos(){
    //this._tools.presentLoading();
    this._productos.get( this.querys ).subscribe( ( res:any )=>{
      this.listArticulos = _.unionBy(this.listArticulos || [], res.data, 'id');;
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
    this.listArticulos = [];
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
      let alertInput:any = await this._tools.cantidadSelect( data );
      data.cantidad = alertInput.valor;
      data.descripcion = alertInput.descripcion
      console.log( data );
      if( !data.cantidad ) return false;
      data.valor = Number( data.valor );
      data.total = Number( data.valor ) * Number( data.cantidad );
      this.listSeleccionado.push( data );
      data.check = !data.check;
    }else{
      let alert:any = await this._tools.presentAlertConfirm( { mensaje: "Esta Seguro desea eliminar" });
      if( !alert ) return false;
      this.listSeleccionado = this.listSeleccionado.filter( ( item:any )=> item.id !== data.id );
      data.check = !data.check;
    }
    this.suma();
  }

  async borrarSelect( item:any ){
    await this.seleccionando( item );
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
      id: this._tools.codigo(),
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
    let accion:any = new CarritoAction( data, "post" );
    this._store.dispatch( accion );
    this._tools.presentToast( "Tiket creado exitos");
    this._tools.presentAlertConfirm( { mensaje: "Tiket creado con el nombre de "+ data.cliente } );
    setTimeout( async ()=> { let listaCarrito = this.listCarritos || []; await this.nextGuardar( listaCarrito ) } ,3000 );
    this.disabledAccion = false;
  }

  async nextGuardar( list ){
    for( let row of list ){
      await this.guardadoFull( row );
      let accion = new CarritoAction( row, 'delete');
      this._store.dispatch( accion );
    }
    return false;
  }

  async guardadoFull( row ){
    return new Promise( resolve =>{
      this._ordenes.saved( row ).subscribe(( res:any )=>{
        res = res.data;
        this.resetearDatos();
        resolve( true );
      },( error:any )=> { this._tools.presentToast( "Tenemos problemas de conexion");resolve( false ); } );
    } );
  }

  resetearDatos(){
    this.data = {};
    this.listSeleccionado = [];
    this.vista = true;
    this.listArticulos = [];
    this.querys = {
      where: {
        estado: true
      },
      skip: 0
    };
    this.getProductos();
    console.log( this.listArticulos );
  }

}
