import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './superadmin.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, Usuario]),
    TenantsModule,
    LogsModule,
  ],
  controllers: [SuperadminController],
  providers: [SuperadminService],
})
export class SuperadminModule {}
