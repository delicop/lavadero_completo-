import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';

export interface TenantConStats {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  fechaCreacion: Date;
  nombreComercial: string | null;
  totalUsuarios: number;
  usuariosActivos: number;
}

export interface MetricasGlobales {
  totalTenants: number;
  tenantsActivos: number;
  totalUsuarios: number;
  usuariosActivos: number;
}

export interface UsuarioConTenant {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  disponible: boolean;
  fechaRegistro: Date;
  tenantId: string;
  tenantNombre: string;
  tenantSlug: string;
}

@Injectable()
export class SuperadminService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepo: Repository<Tenant>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async listarTenants(): Promise<TenantConStats[]> {
    const tenants = await this.tenantsRepo.find({ order: { fechaCreacion: 'DESC' } });

    return Promise.all(
      tenants.map(async (t) => {
        const [totalUsuarios, usuariosActivos] = await Promise.all([
          this.usuariosRepo.count({ where: { tenantId: t.id } }),
          this.usuariosRepo.count({ where: { tenantId: t.id, activo: true } }),
        ]);
        return {
          id: t.id,
          nombre: t.nombre,
          slug: t.slug,
          activo: t.activo,
          fechaCreacion: t.fechaCreacion,
          nombreComercial: t.nombreComercial,
          totalUsuarios,
          usuariosActivos,
        };
      }),
    );
  }

  async obtenerMetricas(): Promise<MetricasGlobales> {
    const [totalTenants, tenantsActivos, totalUsuarios, usuariosActivos] = await Promise.all([
      this.tenantsRepo.count(),
      this.tenantsRepo.count({ where: { activo: true } }),
      // Excluye superadmins (tenantId null)
      this.usuariosRepo.count({ where: { tenantId: Not(IsNull()) } }),
      this.usuariosRepo.count({ where: { tenantId: Not(IsNull()), activo: true } }),
    ]);
    return { totalTenants, tenantsActivos, totalUsuarios, usuariosActivos };
  }

  async listarUsuarios(tenantId?: string): Promise<UsuarioConTenant[]> {
    // Trae todos los usuarios de tenants (excluye superadmins)
    const usuarios = await this.usuariosRepo
      .createQueryBuilder('u')
      .where('u.tenantId IS NOT NULL')
      .andWhere(tenantId ? 'u.tenantId = :tenantId' : '1=1', { tenantId })
      .orderBy('u.tenantId', 'ASC')
      .addOrderBy('u.nombre', 'ASC')
      .getMany();

    // Carga los tenants necesarios de una sola vez
    const tenantIds = [...new Set(usuarios.map(u => u.tenantId!))];
    const tenants = await this.tenantsRepo.findByIds(tenantIds);
    const tenantMap = new Map(tenants.map(t => [t.id, t]));

    return usuarios.map(u => {
      const tenant = tenantMap.get(u.tenantId!);
      return {
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        rol: u.rol,
        activo: u.activo,
        disponible: u.disponible,
        fechaRegistro: u.fechaRegistro,
        tenantId: u.tenantId!,
        tenantNombre: tenant?.nombre ?? '—',
        tenantSlug: tenant?.slug ?? '—',
      };
    });
  }

  async toggleActivoUsuario(usuarioId: string): Promise<Omit<Usuario, 'passwordHash'>> {
    const usuario = await this.usuariosRepo.findOne({ where: { id: usuarioId, tenantId: Not(IsNull()) } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);
    usuario.activo = !usuario.activo;
    const guardado = await this.usuariosRepo.save(usuario);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...resto } = guardado;
    return resto;
  }

  async cambiarPasswordUsuario(usuarioId: string, nuevaPassword: string): Promise<void> {
    const usuario = await this.usuariosRepo.findOne({ where: { id: usuarioId, tenantId: Not(IsNull()) } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);
    usuario.passwordHash = await bcrypt.hash(nuevaPassword, 10);
    await this.usuariosRepo.save(usuario);
  }

  async eliminarUsuario(usuarioId: string): Promise<void> {
    const usuario = await this.usuariosRepo.findOne({ where: { id: usuarioId, tenantId: Not(IsNull()) } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);
    await this.usuariosRepo.remove(usuario);
  }
}
