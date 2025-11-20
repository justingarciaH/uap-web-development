// test-mongo.js - Archivo temporal para probar la conexión
const mongoose = require('mongoose');

const MONGO_URL = 'mongodb+srv://todouser:FoUoMg638qu5hkwj@cluster1.fqyhwpp.mongodb.net/TODOLIST-DB?retryWrites=true&w=majority&appName=Cluster1';

console.log('🔄 Intentando conectar a MongoDB...');
console.log('URL:', MONGO_URL.replace(/atlas123/, '****')); // Ocultar contraseña en log

mongoose.connect(MONGO_URL, {
  bufferCommands: false,
})
.then(() => {
  console.log('✅ ¡Conexión exitosa a MongoDB Atlas!');
  console.log('📊 Estado de la conexión:', mongoose.connection.readyState);
  console.log('🗄️  Base de datos:', mongoose.connection.name);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Error de conexión:', error.message);
  console.error('\n💡 Posibles soluciones:');
  console.error('1. Verifica que tu IP esté en Network Access (0.0.0.0/0)');
  console.error('2. Verifica usuario/contraseña en Database Access');
  console.error('3. Espera 1-2 minutos después de agregar la IP');
  console.error('4. Verifica que el cluster esté activo (no pausado)');
  process.exit(1);
});

// Timeout de 30 segundos
setTimeout(() => {
  console.error('⏱️  Timeout: No se pudo conectar en 30 segundos');
  process.exit(1);
}, 30000);