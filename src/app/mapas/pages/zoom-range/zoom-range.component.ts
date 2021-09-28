import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-zoom-range',
  templateUrl: './zoom-range.component.html',
  styles: [
    `
      .mapa-container {
        width: 100%;
        height: 100%;
      }

      .row {
        background-color: white;
        position: fixed;
        border-radius: 5px;
        bottom: 50px;
        left: 50px;
        padding: 10px;
        z-index: 9999;
        width: 400px;
      }
    `,
  ],
})
export class ZoomRangeComponent implements AfterViewInit, OnDestroy {
  public mapa!: mapboxgl.Map;
  @ViewChild('mapa') divMapa!: ElementRef;
  public zoomLevel: number = 10;
  public center: [number, number] = [-74.22541210311157, 11.206870652992308];

  constructor() {}

  ngOnDestroy(): void {
    //===== Regla de ORO Siempre Tienes que destruir los Event Listeners para dejar de consumir recursos ====//
    this.mapa.off('zoom', () => {}); //destruye el evento Off para que deje de consumir recursos
    this.mapa.off('zoomend', () => {}); //destruye el evento Off para que deje de consumir recursos
    this.mapa.off('move', () => {}); //destruye el evento Off para que deje de consumir recursos
  }

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });

    //Para obtener el nivel del Zoom:
    this.mapa.on('zoom', (e) => (this.zoomLevel = this.mapa.getZoom()));

    //Para limitar el Zoom a 18:
    this.mapa.on('zoomend', (e) => {
      if (this.mapa.getZoom() > 18) {
        this.mapa.zoomTo(18);
      }
    });

    //Para obtener el movimiento del mapa:
    this.mapa.on('move', (e) => {
      const target = e.target;
      const { lng, lat } = target.getCenter();
      this.center = [lng, lat];
    });
  }

  zoomOut() {
    this.mapa.zoomOut();
  }

  zoomIn() {
    this.mapa.zoomIn();
  }

  zoomCambio(valor: string) {
    this.mapa.zoomTo(Number(valor));
  }
}
