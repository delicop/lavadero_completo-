import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaDia } from './entities/caja-dia.entity';
import { GastoCaja } from './entities/gasto-caja.entity';
import { IngresoManualCaja } from './entities/ingreso-manual-caja.entity';
import { Factura } from '../facturacion/entities/factura.entity';
import { Turno } from '../turnos/entities/turno.entity';
import { CajaController } from './caja.controller';
import { CajaService } from './caja.service';

@Module({
  imports: [TypeOrmModule.forFeature([CajaDia, GastoCaja, IngresoManualCaja, Factura, Turno])],
  controllers: [CajaController],
  providers: [CajaService],
})
export class CajaModule {}
