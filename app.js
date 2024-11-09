const peer = new Peer();

// Variables
let connections = []; // Arreglo para almacenar todas las conexiones
const editor = document.getElementById('editor');
const imageUpload = document.getElementById('image-upload');
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
    if (!connections.includes(conn)) {
        connections.push(conn);
    }

    // Enviar el contenido actual del editor al nuevo peer cuando la conexión se abre
    conn.on('open', () => {
        conn.send({ type: 'initial', content: editor.innerHTML });
    });

    // Escuchar datos entrantes de otros peers
    conn.on('data', (data) => {
        if (data.type === 'update' && !isTyping) {
            editor.innerHTML = data.content;
            broadcastChange(data.content, conn);
        } else if (data.type === 'initial') {
            editor.innerHTML = data.content;
        } else if (data.type === 'new-image') {
            insertImageInEditor(data.data);
        }
    });

    // Manejar el cierre de la conexión
    conn.on('close', () => {
        connections = connections.filter((c) => c !== conn);
    });
}

// Función para propagar el cambio a todos los peers excepto al que envió el cambio
function broadcastChange(content, originConn) {
    connections.forEach((conn) => {
        if (conn !== originConn && conn.open) {
            conn.send({ type: 'update', content: content });
        }
    });
}

// Sincronizar cambios en el editor con todos los peers
editor.addEventListener('input', () => {
    isTyping = true;
    const content = editor.innerHTML;
    connections.forEach((conn) => {
        if (conn.open) {
            conn.send({ type: 'update', content: content });
        }
    });
    setTimeout(() => { isTyping = false; }, 100);
});

// Subir e insertar una imagen en el editor
imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Image = reader.result;
            insertImageInEditor(base64Image);
            broadcastImage(base64Image);
        };
        reader.readAsDataURL(file);
    }
});

// Función para insertar una imagen en el contenido del editor
function insertImageInEditor(base64Image) {
    const imgElement = document.createElement('img');
    imgElement.src = base64Image;
    editor.appendChild(imgElement);
}

// Función para enviar la imagen a todos los peers conectados
function broadcastImage(base64Image) {
    connections.forEach((conn) => {
        if (conn.open) {
            conn.send({ type: 'new-image', data: base64Image });
        }
    });
}

// Manejar errores de Peer.js
peer.on('error', (err) => {
    console.error(err);
});