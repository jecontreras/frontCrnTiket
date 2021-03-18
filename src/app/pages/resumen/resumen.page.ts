import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/service-component/ordenes.service';
import * as moment from 'moment';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
})
export class ResumenPage implements OnInit {
  querys:any = {
    where: {
      
    },
    limit: 100000,
    skip:0
  };
  listRow:any = {};
  filtro:any = {
    fecha1: moment().format('DD/MM/YYYY'),
  };
  disableFiltro:boolean = false;

  constructor(
    private _ventas: OrdenesService,
    public _tools: ToolsService
  ) { }

  ngOnInit() {
    this.buscarFiltro();
    this.getResumen();
  }

  buscarFiltro(){
    var dateFormat = 'YYYY-MM-DD';
    if( !( moment(moment( this.filtro.fecha1 ).format(dateFormat),dateFormat ).isValid() ) ) return false;
    this.disableFiltro = true;
    this.querys.where.create = moment( this.filtro.fecha1 ).format("DD/MM/YYYY");
    this.getResumen();
  }

  getResumen(){
    this._ventas.getResumen( this.querys ).subscribe(( res:any )=>{
      this.listRow = res;
      console.log( this.listRow )
    });
  }

}
