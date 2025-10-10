# 🛒 Sistema de Carrito de Compras - Microservicios

Sistema de e-commerce con arquitectura de microservicios usando Node.js, Express y DynamoDB.

## 📁 Estructura del Proyecto

```
APP CARRITO/
├── catalog-service/          # Puerto 3001 - Gestión de catálogo
├── cart-service/             # Puerto 3002 - Carrito de compras
├── order-service/            # Puerto 3003 - Gestión de órdenes
├── create-dynamodb-table.js  # Script para crear tabla
├── seed-data.js              # Script para datos de prueba
├── package.json              # Dependencias raíz
└── README.md                 # Este archivo
```

## 🚀 Instalación Rápida

### 1. Instalar dependencias de todos los servicios

```bash
npm run setup
```

O manualmente:

```bash
npm install
cd catalog-service && npm install
cd ../cart-service && npm install
cd ../order-service && npm install
```

### 2. Configurar AWS

Asegúrate de tener configuradas tus credenciales AWS:

```bash
aws configure
```

O verifica que exista `~/.aws/credentials`

### 3. Crear tabla DynamoDB

```bash
npm run create-table
```

Espera 10-30 segundos hasta que la tabla esté activa.

### 4. Cargar datos de prueba

```bash
npm run seed-data
```

### 5. Iniciar microservicios

**Opción A: En terminales separadas**

```bash
# Terminal 1
npm run dev:catalog

# Terminal 2
npm run dev:cart

# Terminal 3
npm run dev:order
```

**Opción B: Con PM2 (Producción)**

```bash
pm2 start catalog-service/src/app.js --name catalog
pm2 start cart-service/src/app.js --name cart
pm2 start order-service/src/app.js --name order
```

## 🧪 Probar el Sistema

### 1. Verificar que los servicios estén corriendo

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### 2. Listar componentes disponibles

```bash
curl http://localhost:3001/api/components
```

### 3. Listar configuraciones disponibles

```bash
curl http://localhost:3001/api/configs
```

### 4. Ver una configuración con sus componentes

```bash
curl http://localhost:3001/api/configs/LAPTOP-GAMING-01
```

### 5. Verificar disponibilidad de stock

```bash
curl -X POST http://localhost:3002/api/cart/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "configId": "LAPTOP-GAMING-01",
    "quantity": 2
  }'
```

### 6. Crear una orden (descuenta stock automáticamente)

```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "configId": "LAPTOP-GAMING-01",
        "quantity": 1,
        "price": 1299.00
      }
    ]
  }'
```

### 7. Verificar que el stock se descontó

```bash
curl http://localhost:3001/api/components
```

### 8. Ver todas las órdenes

```bash
curl http://localhost:3003/api/orders
```

## 📊 Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Catalog Service│     │  Cart Service   │     │  Order Service  │
│   Port: 3001    │     │   Port: 3002    │     │   Port: 3003    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                        │
         └───────────────────────┴────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   DynamoDB (Shared)     │
                    │   Table: ecommerce-main │
                    └─────────────────────────┘
```

## 🗂️ Modelo de Datos DynamoDB

### Single Table Design

| PK | SK | Type | Attributes |
|----|----|----|------------|
| COMPONENT#{id} | METADATA | component | name, stock, price, specs |
| CONFIG#{id} | METADATA | config | name, price, description |
| CONFIG#{id} | COMPONENT#{id} | composition | quantity |
| ORDER#{id} | METADATA | order | userId, total, status, date |
| ORDER#{id} | ITEM#{n} | order_item | configId, quantity, price |
| ORDER#{id} | RESERVATION#{id} | reservation | components[], status |

## 🔧 Microservicios

### Catalog Service (Puerto 3001)
- Gestión de componentes (RAM, CPU, GPU, etc.)
- Gestión de configuraciones (laptops pre-armadas)
- Consulta de stock

### Cart Service (Puerto 3002)
- Agregar items al carrito
- Verificar disponibilidad de componentes
- Validar stock antes de comprar

### Order Service (Puerto 3003)
- Crear órdenes
- **Descontar stock automáticamente de componentes**
- Crear registros de reserva
- Consultar historial de órdenes

## ⚡ Flujo de Compra

1. Usuario consulta **catálogo** → Catalog Service
2. Usuario agrega al **carrito** → Cart Service verifica disponibilidad
3. Usuario **confirma compra** → Order Service:
   - Crea la orden
   - Lee los componentes de cada configuración
   - Descuenta stock de cada componente (transacción atómica)
   - Crea registros de reserva

## 💡 Características Destacadas

✅ **Single Table Design** - Una sola tabla DynamoDB para todo
✅ **Transacciones Atómicas** - Descuento de stock seguro usando `ConditionExpression`
✅ **Base de Datos Compartida** - Los 3 servicios usan la misma tabla
✅ **Descuento Automático** - Al crear orden, se descuentan todos los componentes
✅ **Trazabilidad** - Registros de reserva documentan qué se descontó

## 🌐 Deploy en AWS EC2

Ver guía completa en cada microservicio o consultar `deployment-guide.md`

## 📝 Comandos Útiles

```bash
# Instalar todo
npm run setup

# Crear tabla DynamoDB
npm run create-table

# Cargar datos de prueba
npm run seed-data

# Iniciar servicios en desarrollo
npm run dev:catalog
npm run dev:cart
npm run dev:order

# Ver logs con PM2
pm2 logs

# Reiniciar servicios
pm2 restart all
```

## 🆘 Troubleshooting

### Error: "Table does not exist"
```bash
npm run create-table
```

### Error: "Cannot connect to DynamoDB"
Verifica tus credenciales AWS:
```bash
aws configure list
```

### Puerto ocupado
```bash
lsof -i :3001
kill -9 <PID>
```

## 📚 Documentación

- [Catalog Service README](./catalog-service/README.md)
- [Cart Service README](./cart-service/README.md)
- [Order Service README](./order-service/README.md)

## 🔒 Seguridad

- No commitear archivos `.env`
- Usar IAM Roles en producción
- Validar todos los inputs
- Implementar rate limiting en producción

## 📄 Licencia

ISC