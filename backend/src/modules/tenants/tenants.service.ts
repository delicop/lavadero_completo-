import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { ActualizarConfigTenantDto } from './dto/actualizar-config-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly repo: Repository<Tenant>,
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
}
