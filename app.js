// Crear instancia de Peer
const peer = new Peer();

// Variables de conexión y referencia al editor
let conn;
const editor = document.getElementById('editor');

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
        conn.send(editor.value);
    });

    // Recibir cambios de otros peers
    conn.on('data', (data) => {
        editor.value = data;
    });

    // Escuchar cambios en el editor y enviarlos al peer
    editor.addEventListener('input', () => {
        if (conn.open) {
            conn.send(editor.value);
        }
    });
}

// Manejar errores de Peer.js
peer.on('error', (err) => {
    console.error(err);
});
