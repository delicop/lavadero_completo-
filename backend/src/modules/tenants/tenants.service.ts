import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { ActualizarConfigTenantDto } from './dto/actualizar-config-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly repo: Repository<Tenant>,
    private readonly dataSource: DataSource,
  ) {}

  async crear(nombre: string, slug: string): Promise<Tenant> {
    const existe = await this.repo.findOne({ where: { slug } });
    if (existe) throw new ConflictException(`Ya existe un tenant con el slug "${slug}"`);

    const tenant = this.repo.create({ nombre, slug });
    return this.repo.save(tenant);
  }

  async buscarPorId(id: string): Promise<Tenant> {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException(`Tenant ${id} no encontrado`);
    return tenant;
  }

  async buscarPorSlug(slug: string): Promise<Tenant | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async buscarTodos(): Promise<Tenant[]> {
    return this.repo.find({ order: { fechaCreacion: 'DESC' } });
  }

  async actualizarConfig(id: string, dto: ActualizarConfigTenantDto): Promise<Tenant> {
    const tenant = await this.buscarPorId(id);
    Object.assign(tenant, dto);
    return this.repo.save(tenant);
  }

  async toggleActivo(id: string): Promise<Tenant> {
    const tenant = await this.buscarPorId(id);
    tenant.activo = !tenant.activo;
    return this.repo.save(tenant);
  }

  fechaDesdeZona(zonaHoraria: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: zonaHoraria }).format(new Date());
  }

  offsetDesdeZona(zonaHoraria: string): string {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: zonaHoraria,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    const offsetStr = partes.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';
    const match = offsetStr.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!match) return '+00:00';
    const horas = match[2].padStart(2, '0');
    const minutos = (match[3] ?? '00').padStart(2, '0');
    return `${match[1]}${horas}:${minutos}`;
  }

  async fechaHoyParaTenant(tenantId: string): Promise<string> {
    const tenant = await this.buscarPorId(tenantId);
    return this.fechaDesdeZona(tenant.zonaHoraria);
  }

  async offsetParaTenant(tenantId: string): Promise<string> {
    const tenant = await this.buscarPorId(tenantId);
    return this.offsetDesdeZona(tenant.zonaHoraria);
  }

  async eliminar(id: string): Promise<void> {
    await this.buscarPorId(id);
    // Eliminar todas las tablas relacionadas al tenant usando el tenantId
    const tablas = [
      'facturas', 'liquidaciones', 'turnos', 'gastos_caja',
      'ingresos_manuales_caja', 'caja_dias', 'vehiculos',
      'clientes', 'servicios', 'login_logs', 'usuarios',
    ];
    await this.dataSource.transaction(async (manager) => {
      for (const tabla of tablas) {
        await manager.query(`DELETE FROM "${tabla}" WHERE "tenantId" = $1`, [id]);
      }
      await manager.query(`DELETE FROM "tenants" WHERE "id" = $1`, [id]);
    });
  }
}
