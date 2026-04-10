import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { VehiculosModule } from './modules/vehiculos/vehiculos.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { TurnosModule } from './modules/turnos/turnos.module';
import { FacturacionModule } from './modules/facturacion/facturacion.module';
import { LiquidacionesModule } from './modules/liquidaciones/liquidaciones.module';
import { CajaModule } from './modules/caja/caja.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get<string>('DB_NAME', 'lavadero'),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsuariosModule,
    ClientesModule,
    VehiculosModule,
    ServiciosModule,
    TurnosModule,
    FacturacionModule,
    LiquidacionesModule,
    CajaModule,
  ],
})
export class AppModule {}
