import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { VehiculosModule } from './modules/vehiculos/vehiculos.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { TurnosModule } from './modules/turnos/turnos.module';
import { FacturacionModule } from './modules/facturacion/facturacion.module';
import { LiquidacionesModule } from './modules/liquidaciones/liquidaciones.module';
import { CajaModule } from './modules/caja/caja.module';
import { EventsModule } from './modules/events/events.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SuperadminModule } from './modules/superadmin/superadmin.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { LogsModule } from './modules/logs/logs.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get<string>('DB_NAME', 'lavadero'),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: ['error'],
        logger: 'advanced-console',
        extra: { max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 },
      }),
    }),
    TenantsModule,
    SuperadminModule,
    ReportesModule,
    LogsModule,
    AuthModule,
    UsuariosModule,
    ClientesModule,
    VehiculosModule,
    ServiciosModule,
    TurnosModule,
    FacturacionModule,
    LiquidacionesModule,
    CajaModule,
    EventsModule,
  ],
  providers: [
    { provide: APP_FILTER,  useClass: AllExceptionsFilter },
    { provide: APP_GUARD,   useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
