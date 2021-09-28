import {
  ElementRef,
  AfterViewInit,
  Component,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  center?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        width: 100%;
        height: 100%;
      }

      .list-group {
        position: fixed;
        width: 100px;
        z-index: 99;
        right: 20px;
        top: 20px;
      }

      li {
        cursor: pointer;
      }
    `,
  ],
})
export class MarcadoresComponent implements AfterViewInit, OnDestroy {
  public mapa!: mapboxgl.Map;
  @ViewChild('mapa') divMapa!: ElementRef;
  public zoomLevel: number = 15;
  public center: [number, number] = [-74.22541210311157, 11.206870652992308];
  public marcadores: MarcadorColor[] = [];

  constructor() {}

  ngOnDestroy(): void {
    this.mapa.off('dragend', () => {});
  }

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });

    this.leerLocalStorage();
    //============Crear un elemento personalizado:     =============//

    // const markerHtml: HTMLElement = document.createElement('div');
    // markerHtml.innerHTML = 'Hola Mundo';

    //===========Crear un marcador de manera estatica: =============//

    // const marker = new mapboxgl.Marker({
    //   ///element: markerHtml,
    // })
    //   .setLngLat(this.center)
    //   .addTo(this.mapa);
  }

  agregarMarcador() {
    const color = '#xxxxxx'.replace(/x/g, (y) =>
      ((Math.random() * 16) | 0).toString(16)
    );

    const nuevoMarker = new mapboxgl.Marker({
      draggable: true,
      color,
    })
      .setLngLat(this.center)
      .addTo(this.mapa);

    //Se crea un objeto para manejar el color:
    this.marcadores.push({
      color,
      marker: nuevoMarker,
    });

    this.guardarLocalStorage();

    nuevoMarker.on('dragend', () => {
      this.guardarLocalStorage();
    });
  }

  irMarcador(marcador: mapboxgl.Marker | undefined) {
    this.mapa.flyTo({
      center: marcador!.getLngLat(),
    });
  }

  guardarLocalStorage() {
    const lngLatArr: MarcadorColor[] = [];

    this.marcadores.forEach((marcador) => {
      const color = marcador.color;
      const { lng, lat } = marcador.marker!.getLngLat();

      lngLatArr.push({
        color,
        center: [lng, lat],
      });
    });

    localStorage.setItem('marcadores', JSON.stringify(lngLatArr));
  }

  leerLocalStorage() {
    if (!localStorage.getItem('marcadores')) {
      return;
    }

    const lngLatArr: MarcadorColor[] = JSON.parse(
      localStorage.getItem('marcadores')!
    );

    lngLatArr.forEach((m) => {
      const nuevoMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true,
      })
        .setLngLat(m.center!)
        .addTo(this.mapa);

      this.marcadores.push({
        marker: nuevoMarker,
        center: m.center,
        color: m.color,
      });

      nuevoMarker.on('dragend', () => {
        this.guardarLocalStorage();
      });
    });
  }

  borrarMarcador(i: number) {
    this.marcadores[i].marker?.remove();
    this.marcadores.splice(i, 1);
    this.guardarLocalStorage();
  }
}
