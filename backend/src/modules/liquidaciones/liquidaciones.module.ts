import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Liquidacion } from './entities/liquidacion.entity';
import { Turno } from '../turnos/entities/turno.entity';
import { LiquidacionesController } from './liquidaciones.controller';
import { LiquidacionesService } from './liquidaciones.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Liquidacion, Turno]), UsuariosModule],
  controllers: [LiquidacionesController],
  providers: [LiquidacionesService],
})
export class LiquidacionesModule {}
