import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Factura } from '../facturacion/entities/factura.entity';
import { GastoCaja } from '../caja/entities/gasto-caja.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { IngresoManualCaja } from '../caja/entities/ingreso-manual-caja.entity';
import { Turno } from '../turnos/entities/turno.entity';
import { Liquidacion } from '../liquidaciones/entities/liquidacion.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura, GastoCaja, Cliente, IngresoManualCaja, Turno, Liquidacion]),
    TenantsModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
