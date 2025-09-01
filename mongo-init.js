// Script de inicialización de MongoDB
db.createUser({
  user: 'nodeuser',
  pwd: 'nodepassword',
  roles: [
    {
      role: 'readWrite',
      db: 'products-order'
    }
  ]
});

// Crear colecciones iniciales
db.createCollection('products');
db.createCollection('orders');
db.createCollection('audits');
db.createCollection('users');

// Insertar usuario admin por defecto (opcional)
db.users.insertOne({
  username: 'admin',
  password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
  email: 'admin@example.com',
  roles: ['admin'],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ MongoDB initialized successfully');