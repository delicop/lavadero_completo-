import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log, TipoLog, OrigenLog } from './entities/log.entity';

export interface RegistrarLogDto {
  tipo:      TipoLog;
  origen:    OrigenLog;
  mensaje:   string;
  detalle?:  string;
  ruta?:     string;
  tenantId?: string | null;
  usuarioId?: string | null;
}

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly repo: Repository<Log>,
  ) {}

  async registrar(data: RegistrarLogDto): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          tipo:      data.tipo,
          origen:    data.origen,
          mensaje:   data.mensaje.slice(0, 500),
          detalle:   data.detalle   ? data.detalle.slice(0, 5000)  : null,
          ruta:      data.ruta      ? data.ruta.slice(0, 500)      : null,
          tenantId:  data.tenantId  ?? null,
          usuarioId: data.usuarioId ?? null,
          resuelto:  false,
        }),
      );
    } catch { /* nunca lanzar desde el servicio de logs */ }
  }

  async listar(filtros: {
    resuelto?: boolean;
    tipo?:     TipoLog;
    origen?:   OrigenLog;
    limite?:   number;
  }): Promise<Log[]> {
    const where: Partial<Log> = {};
    if (filtros.resuelto !== undefined) where.resuelto = filtros.resuelto;
    if (filtros.tipo)    where.tipo    = filtros.tipo;
    if (filtros.origen)  where.origen  = filtros.origen;

    return this.repo.find({
      where,
      order: { fechaCreacion: 'DESC' },
      take: filtros.limite ?? 200,
    });
  }

  async marcarResuelto(id: string): Promise<Log> {
    const log = await this.repo.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Log ${id} no encontrado`);
    log.resuelto = true;
    return this.repo.save(log);
  }

  async contarPendientes(): Promise<number> {
    return this.repo.count({ where: { resuelto: false } });
  }
}
