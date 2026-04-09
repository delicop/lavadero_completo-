import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from './entities/turno.entity';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';
import { ClientesModule } from '../clientes/clientes.module';
import { VehiculosModule } from '../vehiculos/vehiculos.module';
import { ServiciosModule } from '../servicios/servicios.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Turno]),
    ClientesModule,
    VehiculosModule,
    ServiciosModule,
    UsuariosModule,
    EventsModule,
  ],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService],
})
export class TurnosModule {}
