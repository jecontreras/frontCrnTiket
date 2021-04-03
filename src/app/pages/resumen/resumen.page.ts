import { Component, OnInit } from '@angular/core';
import { OrdenesService } from 'src/app/service-component/ordenes.service';
import * as moment from 'moment';
import { ToolsService } from 'src/app/services/tools.service';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { jsPDF } from "jspdf";
import { NavController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
})
export class ResumenPage {
  querys: any = {
    where: {

    },
    limit: 100000,
    skip: 0
  };
  listRow: any = {};
  filtro: any = {
    fecha1: moment().format('DD/MM/YYYY'),
  };
  disableFiltro: boolean = false;

  constructor(
    private _ventas: OrdenesService,
    public _tools: ToolsService,
    private printer: Printer,
  ) { 
    this.buscarFiltro();
    this.getResumen();
  }

  buscarFiltro() {
    var dateFormat = 'YYYY-MM-DD';
    if (!(moment(moment(this.filtro.fecha1).format(dateFormat), dateFormat).isValid())) return false;
    this.disableFiltro = true;
    this.querys.where.create = moment().format("DD/MM/YYYY");
    this.getResumen();
  }

  getResumen() {
    this._ventas.getResumen(this.querys).subscribe((res: any) => {
      this.listRow = res;
      console.log(this.listRow)
    });
  }

  async imprimir() {
    this.onSuccessLoad();
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad PrinterViewPage');
  }

  print() {
    this.printer.isAvailable().then(this.onSuccessLoad, this.onErrorLoad);

  }

  onSuccessLoad() {
    let options: PrintOptions = {
      name: 'MyDocument',
      duplex: true,
    };


    this.printer.print("http://google.com", options).then(this.onSuccessPrint,
      this.onErrorPrint);
  }

  onErrorLoad() {
    alert('Error : printing is unavailable on your device ');
  }

  onSuccessPrint() {
    alert("printing done successfully !");
  }

  onErrorPrint() {
    alert("Error while printing !");
  }
}