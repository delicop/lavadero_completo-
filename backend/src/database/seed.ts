import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, RolUsuario } from '../modules/usuarios/entities/usuario.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: Number(process.env['DB_PORT'] ?? 5432),
  database: process.env['DB_NAME'] ?? 'lavadero',
  username: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? 'password',
  entities: [Usuario],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  const repo = dataSource.getRepository(Usuario);

  const passwordHash = await bcrypt.hash('Admin1234', 10);
  const existe = await repo.findOne({ where: { email: 'admin@lavadero.com' } });

  if (existe) {
    // Reactivar y restaurar rol admin aunque haya sido modificado
    existe.activo = true;
    existe.rol    = RolUsuario.ADMIN;
    existe.passwordHash = passwordHash;
    await repo.save(existe);
    console.log('✓ Usuario admin reactivado:');
  } else {
    const admin = repo.create({
      nombre: 'Admin',
      apellido: 'Lavadero',
      email: 'admin@lavadero.com',
      passwordHash,
      rol: RolUsuario.ADMIN,
      activo: true,
    });
    await repo.save(admin);
    console.log('✓ Usuario admin creado:');
  }

  console.log('  Email:    admin@lavadero.com');
  console.log('  Password: Admin1234');
  console.log('  Rol:      admin');
  console.log('\n  ⚠ Cambiá la contraseña después del primer login.');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
