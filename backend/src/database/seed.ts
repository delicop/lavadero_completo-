import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, RolUsuario } from '../modules/usuarios/entities/usuario.entity';
import { Tenant } from '../modules/tenants/entities/tenant.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: Number(process.env['DB_PORT'] ?? 5432),
  database: process.env['DB_NAME'] ?? 'lavadero',
  username: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? 'password',
  entities: [Usuario, Tenant],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  const tenantRepo  = dataSource.getRepository(Tenant);
  const usuarioRepo = dataSource.getRepository(Usuario);

  // 1. Crear o reutilizar el tenant demo
  let tenant = await tenantRepo.findOne({ where: { slug: 'demo' } });
  if (!tenant) {
    tenant = tenantRepo.create({ nombre: 'Demo Lavadero', slug: 'demo', activo: true });
    await tenantRepo.save(tenant);
    console.log(`✓ Tenant creado: "${tenant.nombre}" (id: ${tenant.id})`);
  } else {
    console.log(`✓ Tenant existente: "${tenant.nombre}" (id: ${tenant.id})`);
  }

  // 2. Crear o reactivar el usuario admin
  const passwordHash = await bcrypt.hash('Admin1234', 10);
  const existe = await usuarioRepo.findOne({ where: { email: 'admin@lavadero.com' } });

  if (existe) {
    existe.activo      = true;
    existe.rol         = RolUsuario.ADMIN;
    existe.passwordHash = passwordHash;
    existe.tenantId    = tenant.id;
    await usuarioRepo.save(existe);
    console.log('✓ Usuario admin reactivado y asignado al tenant');
  } else {
    const admin = usuarioRepo.create({
      nombre:       'Admin',
      apellido:     'Lavadero',
      email:        'admin@lavadero.com',
      passwordHash,
      rol:          RolUsuario.ADMIN,
      activo:       true,
      tenantId:     tenant.id,
    });
    await usuarioRepo.save(admin);
    console.log('✓ Usuario admin creado');
  }

  console.log('\n  Email:    admin@lavadero.com');
  console.log('  Password: Admin1234');
  console.log('  Rol:      admin');
  console.log(`  Tenant:   ${tenant.nombre} (slug: ${tenant.slug})`);
  console.log('\n  ⚠ Cambiá la contraseña después del primer login.');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
