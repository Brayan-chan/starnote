// Crear instancia de Peer
const peer = new Peer();

// Variables
let connections = []; // Arreglo para almacenar todas las conexiones
const editor = document.getElementById('editor');
let isTyping = false; // Bandera para evitar bucles infinitos de sincronización

// Mostrar el ID de peer del usuario
peer.on('open', (id) => {
    document.getElementById('peer-id').value = id;
    console.log('Mi ID de Peer es:', id);
});

// Escuchar cuando se conecta un nuevo peer (recibiendo conexiones)
peer.on('connection', (conn) => {
    setupNewConnection(conn);
});

// Conectar a otro peer con el ID ingresado manualmente
document.getElementById('connect-button').addEventListener('click', () => {
    const connectToId = document.getElementById('connect-to-id').value;
    if (connectToId) {
        const conn = peer.connect(connectToId);
        setupNewConnection(conn);
    }
});

// Configurar una nueva conexión y agregarla al arreglo de conexiones
function setupNewConnection(conn) {
    // Agregar la conexión a la lista si aún no existe
    if (!connections.includes(conn)) {
        connections.push(conn);
    }

    // Enviar el contenido actual al nuevo peer cuando la conexión se abre
    conn.on('open', () => {
        conn.send({ type: 'initial', content: editor.value });
    });

    // Escuchar datos entrantes de otros peers
    conn.on('data', (data) => {
        if (data.type === 'update' && !isTyping) {
            editor.value = data.content;
        }
    });

    // Manejar el cierre de la conexión
    conn.on('close', () => {
        connections = connections.filter((c) => c !== conn);
    });
}

// Sincronizar cambios en el editor con todos los peers
editor.addEventListener('input', () => {
    isTyping = true;
    connections.forEach((conn) => {
        if (conn.open) {
            conn.send({ type: 'update', content: editor.value });
        }
    });
    setTimeout(() => { isTyping = false; }, 100);
});

// Manejar errores de Peer.js
peer.on('error', (err) => {
    console.error(err);
});
