// Crear instancia de Peer
const peer = new Peer();

// Variables de conexión y referencia al editor
let conn;
const editor = document.getElementById('editor');
let isTyping = false; // Bandera para evitar bucles infinitos de sincronización

// Mostrar el ID de peer del usuario
peer.on('open', (id) => {
    document.getElementById('peer-id').value = id;
    console.log('Mi ID de Peer es:', id);
});

// Escuchar cuando se conecta un nuevo peer
peer.on('connection', (newConn) => {
    conn = newConn;
    setupConnection();
});

// Conectar a otro peer con el ID ingresado
document.getElementById('connect-button').addEventListener('click', () => {
    const connectToId = document.getElementById('connect-to-id').value;
    if (connectToId) {
        conn = peer.connect(connectToId);
        setupConnection();
    }
});

// Configurar la conexión para enviar y recibir datos
function setupConnection() {
    if (!conn) return;

    // Enviar contenido actual del editor al nuevo peer
    conn.on('open', () => {
        conn.send({ type: 'initial', content: editor.value });
    });

    // Recibir cambios de otros peers
    conn.on('data', (data) => {
        if (data.type === 'update' && !isTyping) {
            editor.value = data.content;
        }
    });

    // Escuchar cambios en el editor y enviarlos al peer
    editor.addEventListener('input', () => {
        isTyping = true;
        if (conn.open) {
            conn.send({ type: 'update', content: editor.value });
        }
        setTimeout(() => { isTyping = false; }, 100); // Reiniciar bandera después de una pausa
    });
}

// Manejar errores de Peer.js
peer.on('error', (err) => {
    console.error(err);
});
