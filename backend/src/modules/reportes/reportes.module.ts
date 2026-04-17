import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Factura } from '../facturacion/entities/factura.entity';
import { GastoCaja } from '../caja/entities/gasto-caja.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, GastoCaja, Cliente])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
