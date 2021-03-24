import { Component, OnInit } from '@angular/core';
import { ProductosService } from 'src/app/service-component/productos.service';
import { ToolsService } from 'src/app/services/tools.service';
import * as _ from 'lodash';
import { CategoriaService } from 'src/app/service-component/categoria.service';
import { ModalController, NavParams } from '@ionic/angular';
import { OrdenesService } from 'src/app/service-component/ordenes.service';
import * as moment from 'moment';

@Component({
  selector: 'app-form-articulos',
  templateUrl: './form-articulos.page.html',
  styleUrls: ['./form-articulos.page.scss'],
})
export class FormArticulosPage implements OnInit {
  listArticulos:any = [];
  querys:any = {
    where:{},
    skip: 0
  };
  public ev:any = {};
  public disable_list:boolean = true;
  public evScroll:any = {};
  listSeleccionado:any = [];
  textoBuscar:string;
  listCategorias:any = [];
  data:any = {};
  evento:any = {};

  constructor(
    public _tools: ToolsService,
    private _productos: ProductosService,
    private _categorias: CategoriaService,
    private modalCtrl: ModalController,
    private navparams: NavParams,
    private _factura: OrdenesService
  ) { }

  ngOnInit() {
    this.evento = this.navparams.get('obj');
    this.getCategorias();
    this.getProductos();
  }

  getCategorias(){
    this._categorias.get( {
      where: { estado: 0 },
      sort: 'ordenar ASC',
      limit: 1000
    } ).subscribe(( res:any )=>{
      this.listCategorias = res.data;
    });
  }

  close(){
    this.modalCtrl.dismiss();
  }

  doRefresh(ev){
    this.ev = ev;
    this.disable_list = false;
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

  loadData(ev){
    //console.log(ev);
    this.evScroll = ev;
    this.querys.skip++;
    this.getProductos();
  }

  suma(){
    this.data.total = _.sumBy( this.listSeleccionado, 'total');
  }

  cambioCategoria( ev:any ){
    this.querys.where.categoria = ev.detail.value;
    this.querys.skip = 0;
    this.listArticulos = [];
    this.getProductos();
  }

  async finalizar(){
    let arregloFinal = [];
    for (let row of this.listSeleccionado ){
      arregloFinal.push( await this.nextProceso( row ) );
    }
    this.modalCtrl.dismiss({
      articulos: arregloFinal
    });
    
  }

  nextProceso( row:any ){
    return new Promise( resolve =>{
      let data:any = {
        factura: this.evento.id,
        precio: row.precio,
        create: moment().format('DD/MM/YYYY'),
        cantidad: row.cantidad,
        descripcion: row.descripcion,
        producto: row.id
      };
      this._factura.savedFacturaArticulo( data ).subscribe(( res:any )=>{
        resolve( res );
      },()=>resolve( false ) );
    });
  }

}
