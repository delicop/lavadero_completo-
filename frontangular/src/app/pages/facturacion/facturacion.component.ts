import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturacionService } from '../../core/services/facturacion.service';
import { formatFecha, formatPrecio, fechaLocal, primerDiaMesLocal } from '../../shared/utils/formatters';
import type { Factura, MetodoPago } from '../../shared/types';

const METODO_LABEL: Record<MetodoPago, string> = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  debito:        'Débito',
  credito:       'Crédito',
};

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturacion.component.html',
})
export class FacturacionComponent implements OnInit {
  private readonly svc = inject(FacturacionService);

  readonly formatFecha  = formatFecha;
  readonly formatPrecio = formatPrecio;
  readonly METODO_LABEL = METODO_LABEL;

  facturas: Factura[] = [];
  cargando = true;

  filtroDesde = primerDiaMesLocal();
  filtroHasta = fechaLocal();

  facturaSeleccionada: Factura | null = null;

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    this.facturas = await this.svc.listar(this.filtroDesde, this.filtroHasta);
    this.cargando = false;
  }

  get totalIngresos(): number {
    return this.facturas.reduce((s, f) => s + Number(f.total), 0);
  }

  get totalPorMetodo(): Record<MetodoPago, number> {
    const r: Record<MetodoPago, number> = { efectivo: 0, transferencia: 0, debito: 0, credito: 0 };
    for (const f of this.facturas) r[f.metodoPago] += Number(f.total);
    return r;
  }

  get promedioPorOrden(): number {
    return this.facturas.length ? this.totalIngresos / this.facturas.length : 0;
  }

  verFactura(f: Factura): void {
    this.facturaSeleccionada = f;
  }

  cerrarFactura(): void {
    this.facturaSeleccionada = null;
  }

  imprimir(): void {
    window.print();
  }
}
