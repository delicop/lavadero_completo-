import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { CajaDia } from '../caja/entities/caja-dia.entity';
import { FacturacionController } from './facturacion.controller';
import { FacturacionService } from './facturacion.service';
import { TurnosModule } from '../turnos/turnos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, CajaDia]), TurnosModule],
  controllers: [FacturacionController],
  providers: [FacturacionService],
})
export class FacturacionModule {}
