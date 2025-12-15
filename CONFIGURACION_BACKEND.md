# Configuración Frontend con Backend Java Spring Boot

## ✅ Cambios Realizados

### 1. **Interfaces TypeScript Actualizadas**

#### Producto
- ❌ Eliminado: `codigo`, `stock_critico`, `imagen`
- ✅ Agregado: `imagenUrl`, `activo`
- La interfaz ahora coincide con el DTO de Java

#### Usuario
- ❌ Eliminado: `fecha_nacimiento`, `estado`
- ✅ Agregado: `telefono` (opcional)
- El campo `rol` acepta strings como "ADMIN" o "CLIENTE"

#### Pedido
- Estructura completamente actualizada para coincidir con el backend
- Usa `detalles` (DetallePedido[]) en lugar de `items`
- Incluye campos: `usuarioId`, `estado`, `direccionEnvio`, `comunaEnvio`, `regionEnvio`

### 2. **API Endpoints Actualizados**

```typescript
// Autenticación
POST /api/auth/login       // { email, password }
POST /api/auth/register    // { rut, nombre, apellido, email, password, ... }

// Productos
GET    /api/api/productos?size=100
GET    /api/api/productos/:id
POST   /api/api/productos
PUT    /api/api/productos/:id
DELETE /api/api/productos/:id

// Pedidos
POST   /api/pedidos        // { detalles: [{productoId, cantidad}], direccionEnvio, ... }
GET    /api/pedidos
GET    /api/pedidos/:id

// Usuarios (Admin)
GET    /api/usuarios
GET    /api/usuarios/:id
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id

// Contacto
POST   /api/contacto
```

### 3. **Autenticación con JWT**

El backend devuelve:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "rol": "ADMIN",
  "email": "user@example.com"
}
```

El token se guarda automáticamente en:
- `localStorage.authToken`
- `localStorage.userRole`
- `localStorage.userEmail`

## 🚀 Cómo Iniciar el Sistema

### Paso 1: Clonar el Backend
```bash
cd c:\Users\brian\Documents\GitHub
git clone https://github.com/Klainer00/usuarioreact.git
```

### Paso 2: Iniciar los Microservicios
```bash
cd usuarioreact
.\start-all.bat
```

Esto iniciará:
- **auth-service** (Puerto: 8081) - Autenticación y usuarios
- **productos-service** (Puerto: 8082) - Gestión de productos
- **pedidos-service** (Puerto: 8083) - Gestión de pedidos
- **contacto-service** (Puerto: 8084) - Mensajes de contacto
- **ecommerce-gateway** (Puerto: 8080) - API Gateway principal

### Paso 3: Iniciar el Frontend
```bash
cd c:\Users\brian\Documents\GitHub\hreact
npm run dev
```

El frontend se conectará automáticamente al gateway en `localhost:8080` gracias al proxy configurado en `vite.config.ts`.

## 📝 Credenciales de Prueba

El backend carga datos de prueba automáticamente:

### Admin
- Email: `admin@ecommerce.com` (crear manualmente con rol ADMIN)
- Password: (tu contraseña)

### Cliente
- Crear cuenta desde el formulario de registro

## 🔧 Configuración Actual

### Proxy de Vite
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',  // API Gateway
      changeOrigin: true
    }
  }
}
```

### Productos Precargados
El `productos-service` carga automáticamente 6 productos de ejemplo:
- Manzana Fuji
- Lechuga Hidropónica
- Miel de Ulmo
- Huevos de Campo
- Zanahorias
- Plátano

## ⚠️ Notas Importantes

1. **Roles**: El backend usa `ADMIN` y `CLIENTE` (en mayúsculas)
2. **IDs**: Los productos usan IDs numéricos autogenerados por la base de datos
3. **Imágenes**: Usar la propiedad `imagenUrl` (ej: `/img/producto.png`)
4. **Tokens**: Se guardan automáticamente en localStorage y se incluyen en headers

## 🐛 Solución de Problemas

### Error de conexión
- Verifica que todos los microservicios estén corriendo
- Comprueba que el gateway esté en puerto 8080

### Error 401 Unauthorized
- Verifica que el token esté guardado en localStorage
- Intenta hacer logout y login nuevamente

### Productos no cargan
- Verifica que `productos-service` esté corriendo
- Comprueba la consola del navegador para errores

### Estructura de datos incorrecta
- Revisa que estés usando `imagenUrl` en lugar de `imagen`
- Verifica que uses `id` en lugar de `codigo`

## 📚 Documentación del Backend

Para más detalles sobre los endpoints y estructuras de datos, consulta el código fuente del backend en:
https://github.com/Klainer00/usuarioreact

---

**Última actualización**: Diciembre 15, 2025
**Versión**: 1.0.0
