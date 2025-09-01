// Script de inicialización de MongoDB
// Cambiar a la base de datos del proyecto
db = db.getSiblingDB('products-order-mongo');

// Crear usuario para la aplicación
db.createUser({
  user: 'nodeuser',
  pwd: 'nodepassword',
  roles: [
    {
      role: 'readWrite',
      db: 'products-order-mongo',
    },
  ],
});

// Crear colecciones iniciales
db.createCollection('products');
db.createCollection('orders');
db.createCollection('users');

// Crear índices para mejorar el rendimiento
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.orders.createIndex({ identifier: 1 }, { unique: true });
db.orders.createIndex({ clientName: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

// Insertar usuario SuperAdmin por defecto
// Email: admin@demo.com, Contraseña: demodemo
const superAdminUser = db.users.insertOne({
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@demo.com',
  password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG', // demodemo
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
});

print('✅ SuperAdmin user created: admin@demo.com / demodemo');

// Insertar usuarios adicionales de prueba
const additionalUsers = [
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'Ana',
    lastName: 'López',
    email: 'ana.lopez@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'Pedro',
    lastName: 'Martínez',
    email: 'pedro.martinez@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'Laura',
    lastName: 'Sánchez',
    email: 'laura.sanchez@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'Miguel',
    lastName: 'Torres',
    email: 'miguel.torres@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'Carmen',
    lastName: 'Jiménez',
    email: 'carmen.jimenez@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'Antonio',
    lastName: 'Ruiz',
    email: 'antonio.ruiz@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'Isabel',
    lastName: 'Moreno',
    email: 'isabel.moreno@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

db.users.insertMany(additionalUsers);
print('✅ 10 additional test users created');

// Insertar productos de demostración
const products = [
  {
    name: 'Laptop Dell Inspiron 15',
    sku: 'DELL-INSP-001',
    price: 899.99,
    picture: 'https://example.com/images/laptop-dell.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'iPhone 14 Pro Max',
    sku: 'APL-IP14PM-001',
    price: 1299.99,
    picture: 'https://example.com/images/iphone14.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Samsung Galaxy S23',
    sku: 'SAM-GS23-001',
    price: 999.99,
    picture: 'https://example.com/images/galaxy-s23.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'MacBook Air M2',
    sku: 'APL-MBA-M2-001',
    price: 1499.99,
    picture: 'https://example.com/images/macbook-air.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Sony WH-1000XM4 Headphones',
    sku: 'SON-WH1000-001',
    price: 349.99,
    picture: 'https://example.com/images/sony-headphones.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'iPad Pro 12.9"',
    sku: 'APL-IPADPRO-001',
    price: 1199.99,
    picture: 'https://example.com/images/ipad-pro.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Nintendo Switch OLED',
    sku: 'NIN-SW-OLED-001',
    price: 349.99,
    picture: 'https://example.com/images/nintendo-switch.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Canon EOS R6 Camera',
    sku: 'CAN-EOSR6-001',
    price: 2499.99,
    picture: 'https://example.com/images/canon-r6.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Apple Watch Series 8',
    sku: 'APL-AW-S8-001',
    price: 429.99,
    picture: 'https://example.com/images/apple-watch.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Gaming Chair RGB',
    sku: 'GAM-CHAIR-RGB-001',
    price: 299.99,
    picture: 'https://example.com/images/gaming-chair.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Mechanical Keyboard',
    sku: 'MECH-KB-001',
    price: 159.99,
    picture: 'https://example.com/images/mechanical-kb.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Wireless Gaming Mouse',
    sku: 'GAM-MOUSE-001',
    price: 89.99,
    picture: 'https://example.com/images/gaming-mouse.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const insertedProducts = db.products.insertMany(products);
const productIds = Object.values(insertedProducts.insertedIds);
print('✅ 12 demo products created');

// Función para generar identificador único de orden
function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}

// Función para seleccionar productos aleatorios
function getRandomProducts(products, count) {
  const shuffled = products.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Crear órdenes de demostración
const clientNames = [
  'Empresa ABC S.A.',
  'Comercial XYZ Ltda.',
  'Tech Solutions Inc.',
  'Digital World Corp.',
  'Innovation Hub S.A.S.',
  'Creative Studios Ltd.',
  'Global Tech Partners',
  'Smart Business Co.',
  'Future Systems S.A.',
  'NextGen Solutions',
  'Advanced Tech Corp.',
  'Digital Innovation S.A.',
];

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const orders = [];

for (let i = 0; i < 15; i++) {
  const selectedProducts = getRandomProducts(products, Math.floor(Math.random() * 3) + 1);
  const orderProducts = [];
  let total = 0;

  selectedProducts.forEach((product, index) => {
    const quantity = Math.floor(Math.random() * 5) + 1;
    const price = product.price;
    const subtotal = quantity * price;
    total += subtotal;

    orderProducts.push({
      productId: productIds[products.indexOf(product)],
      quantity: quantity,
      price: price,
      name: product.name,
    });
  });

  const order = {
    identifier: generateOrderId(),
    clientName: clientNames[i % clientNames.length],
    total: Math.round(total * 100) / 100, // Redondear a 2 decimales
    products: orderProducts,
    status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Últimos 30 días
    updatedAt: new Date(),
  };

  orders.push(order);
}

db.orders.insertMany(orders);
print('✅ 15 demo orders created with random products and relationships');

print('🎉 MongoDB initialization completed successfully!');
print('📊 Database seeded with:');
print('   - 11 users (1 SuperAdmin + 10 test users)');
print('   - 12 products with realistic data');
print('   - 15 orders with product relationships');
print('');
print('🔐 SuperAdmin credentials:');
print('   Email: admin@demo.com');
print('   Password: demodemo');
print('');
print('🔗 All test users have the same password: demodemo');