import { useState, useEffect } from 'react';
import { Alert, Button, Card, Container, ListGroup, Spinner } from 'react-bootstrap';

interface TestResult {
  nombre: string;
  estado: 'pendiente' | 'exito' | 'error';
  mensaje: string;
  tiempo?: number;
}

const TestConexion = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { nombre: 'Conexión al Backend', estado: 'pendiente', mensaje: 'Esperando...' },
    { nombre: 'Endpoint de Productos', estado: 'pendiente', mensaje: 'Esperando...' },
    { nombre: 'Endpoint de Usuarios', estado: 'pendiente', mensaje: 'Esperando...' },
    { nombre: 'Endpoint de Contacto', estado: 'pendiente', mensaje: 'Esperando...' },
  ]);

  const [ejecutando, setEjecutando] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const ejecutarTest = async (index: number, url: string, metodo: string = 'GET', body?: any): Promise<TestResult> => {
    const inicio = Date.now();
    try {
      const opciones: RequestInit = {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        opciones.body = JSON.stringify(body);
      }

      const response = await fetch(url, opciones);
      const tiempo = Date.now() - inicio;

      if (response.ok) {
        return {
          nombre: tests[index].nombre,
          estado: 'exito',
          mensaje: `✓ Respuesta exitosa (${response.status}) en ${tiempo}ms`,
          tiempo
        };
      } else {
        return {
          nombre: tests[index].nombre,
          estado: 'error',
          mensaje: `✗ Error ${response.status}: ${response.statusText}`,
          tiempo
        };
      }
    } catch (error: any) {
      const tiempo = Date.now() - inicio;
      return {
        nombre: tests[index].nombre,
        estado: 'error',
        mensaje: `✗ Error de conexión: ${error.message}`,
        tiempo
      };
    }
  };

  const ejecutarTodasLasPruebas = async () => {
    setEjecutando(true);
    setProgreso(0);

    const nuevosTests = [...tests];

    // Test 1: Verificar conexión general al backend
    setProgreso(25);
    nuevosTests[0] = await ejecutarTest(0, '/api/productos?size=1');
    setTests([...nuevosTests]);

    // Test 2: Endpoint de Productos
    setProgreso(50);
    nuevosTests[1] = await ejecutarTest(1, '/api/productos?size=5');
    setTests([...nuevosTests]);

    // Test 3: Endpoint de Usuarios (puede requerir autenticación)
    setProgreso(75);
    const resultadoUsuarios = await ejecutarTest(2, '/api/usuarios');
    // Si retorna 401/403, es normal (requiere autenticación)
    if (resultadoUsuarios.mensaje.includes('401') || resultadoUsuarios.mensaje.includes('403')) {
      nuevosTests[2] = {
        ...resultadoUsuarios,
        estado: 'exito',
        mensaje: '✓ Endpoint activo (requiere autenticación)'
      };
    } else {
      nuevosTests[2] = resultadoUsuarios;
    }
    setTests([...nuevosTests]);

    // Test 4: Endpoint de Contacto (POST)
    setProgreso(100);
    const testContacto = {
      nombre: 'Test',
      email: 'test@ejemplo.com',
      asunto: 'Prueba de conexión',
      mensaje: 'Este es un mensaje de prueba automático'
    };
    const resultadoContacto = await ejecutarTest(3, '/api/contacto', 'POST', testContacto);
    nuevosTests[3] = resultadoContacto;
    setTests([...nuevosTests]);

    setEjecutando(false);
  };

  useEffect(() => {
    // Ejecutar pruebas automáticamente al cargar
    ejecutarTodasLasPruebas();
  }, []);

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'exito': return 'success';
      case 'error': return 'danger';
      default: return 'secondary';
    }
  };

  const todosExitosos = tests.every(t => t.estado === 'exito');
  const algunError = tests.some(t => t.estado === 'error');

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">🔧 Verificación de Conexión Backend-Frontend</h2>
      
      {!ejecutando && todosExitosos && (
        <Alert variant="success" className="text-center">
          <strong>✅ ¡Todas las pruebas exitosas!</strong>
          <br />El frontend está correctamente conectado al backend.
        </Alert>
      )}

      {!ejecutando && algunError && (
        <Alert variant="warning" className="text-center">
          <strong>⚠️ Algunas pruebas fallaron</strong>
          <br />Verifica que el backend esté ejecutándose en <code>http://localhost:8080</code>
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Configuración Actual</h5>
        </Card.Header>
        <Card.Body>
          <p><strong>Backend URL:</strong> <code>http://localhost:8080</code></p>
          <p><strong>Proxy configurado en Vite:</strong> <code>/api → http://localhost:8080</code></p>
          <p className="mb-0"><strong>Estado del Backend:</strong> {ejecutando ? '🔄 Verificando...' : todosExitosos ? '✅ Conectado' : '❌ Sin conexión'}</p>
        </Card.Body>
      </Card>

      {ejecutando && (
        <div className="text-center mb-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Ejecutando pruebas... {progreso}%</p>
        </div>
      )}

      <Card>
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Resultados de las Pruebas</h5>
          <Button 
            variant="light" 
            size="sm" 
            onClick={ejecutarTodasLasPruebas}
            disabled={ejecutando}
          >
            🔄 Volver a Ejecutar
          </Button>
        </Card.Header>
        <ListGroup variant="flush">
          {tests.map((test, index) => (
            <ListGroup.Item key={index} className={`bg-${obtenerColorEstado(test.estado)} bg-opacity-10`}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{test.nombre}</strong>
                  <br />
                  <small className={`text-${obtenerColorEstado(test.estado)}`}>
                    {test.mensaje}
                  </small>
                </div>
                {test.tiempo && (
                  <span className="badge bg-secondary">{test.tiempo}ms</span>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>

      <Card className="mt-4">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">📋 Instrucciones</h5>
        </Card.Header>
        <Card.Body>
          <ol>
            <li>Asegúrate de que el backend Java Spring Boot esté ejecutándose en el puerto <code>8080</code></li>
            <li>Verifica que los endpoints estén disponibles: <code>/api/productos</code>, <code>/api/usuarios</code>, <code>/api/contacto</code></li>
            <li>Si ves errores de CORS, verifica la configuración de CORS en el backend</li>
            <li>Si el backend está en otra URL, actualiza <code>vite.config.ts</code> con el target correcto</li>
          </ol>
          
          <Alert variant="info" className="mt-3 mb-0">
            <strong>💡 Tip:</strong> Esta página se ejecuta automáticamente al cargar. 
            Usa el botón "Volver a Ejecutar" para probar nuevamente después de hacer cambios.
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestConexion;
