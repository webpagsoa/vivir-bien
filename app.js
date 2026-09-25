let isAdmin = false;
let whatsappGlobal = "5493725449776";

// Base de datos de publicaciones dinámicas
let publicaciones = [
    { id: 1, title: "International Pack By LiveGood", img: "https://via.placeholder.com/300x250?text=Pack+1" },
    { id: 2, title: "Super Redes y Verdes Orgánicos", img: "https://via.placeholder.com/300x250?text=Pack+2" }
];

// 1. Renderizar tarjetas de publicaciones
function renderizarProductos() {
    const grid = document.getElementById('grid-productos');
    grid.innerHTML = '';

    publicaciones.forEach(pub => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${pub.img}" alt="${pub.title}">
            
            <!-- Controles visibles únicamente si isAdmin es true -->
            <div class="admin-controls">
                <i class="fas fa-link" title="Copiar Link / Compartir" onclick="accionAdmin('compartir', ${pub.id})"></i>
                <i class="fas fa-pencil-alt" title="Editar" onclick="accionAdmin('editar', ${pub.id})"></i>
                <i class="fas fa-trash" title="Borrar" onclick="accionAdmin('borrar', ${pub.id})"></i>
            </div>

            <div class="card-info">
                <p class="card-title">${pub.title}</p>
                <button class="btn-whatsapp" onclick="abrirWhatsApp('${pub.title}')">
                    <i class="fab fa-whatsapp"></i> whatsapp consulta vendedor
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 2. Conmutar Modo Admin
document.getElementById('btn-login-admin').addEventListener('click', () => {
    isAdmin = !isAdmin;
    const body = document.getElementById('app-body');
    
    if (isAdmin) {
        body.classList.add('admin-mode-active');
        document.getElementById('btn-login-admin').innerText = "Salir Admin";
        document.getElementById('modal-admin').style.display = 'flex';
        document.getElementById('panel-producto').classList.add('open');
    } else {
        body.classList.remove('admin-mode-active');
        document.getElementById('btn-login-admin').innerText = "admin";
        document.getElementById('panel-producto').classList.remove('open');
        document.getElementById('modal-admin').style.display = 'none';
    }
});

// 3. Control de Modales y Configuración
document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
    document.getElementById('modal-admin').style.display = 'none';
});

document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
    document.getElementById('panel-producto').classList.remove('open');
});

document.getElementById('btn-guardar-config').addEventListener('click', () => {
    const linkInput = document.getElementById('input-link').value;
    const linkDisplay = document.getElementById('display-official-link');
    
    linkDisplay.innerText = linkInput;
    linkDisplay.href = linkInput;
    
    document.getElementById('display-vendor-text').innerText = document.getElementById('input-text').value;
    whatsappGlobal = document.getElementById('input-wa').value;
    
    document.getElementById('modal-admin').style.display = 'none';
    alert("Configuración guardada correctamente");
});

// 4. Operaciones de Productos (Agregar, Editar, Borrar, Compartir)
document.getElementById('btn-agregar-producto').addEventListener('click', () => {
    const inputTitulo = document.getElementById('nuevo-titulo');
    const titulo = inputTitulo.value.trim();
    
    if (titulo) {
        publicaciones.push({
            id: Date.now(),
            title: titulo,
            img: "https://via.placeholder.com/300x250?text=Nuevo+Producto"
        });
        renderizarProductos();
        inputTitulo.value = '';
        alert("Publicación agregada correctamente");
    } else {
        alert("Por favor, ingresa un título para la publicación.");
    }
});

function accionAdmin(accion, id) {
    if (accion === 'borrar') {
        if (confirm("¿Seguro que quieres borrar esta publicación?")) {
            publicaciones = publicaciones.filter(p => p.id !== id);
            renderizarProductos();
        }
    } else if (accion === 'editar') {
        const pub = publicaciones.find(p => p.id === id);
        if (pub) {
            const nuevoTitulo = prompt("Editar título de la publicación:", pub.title);
            if (nuevoTitulo !== null && nuevoTitulo.trim() !== "") {
                pub.title = nuevoTitulo.trim();
                renderizarProductos();
            }
        }
    } else if (accion === 'compartir') {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert("Enlace de publicación copiado al portapapeles (ID: " + id + ")");
        }).catch(() => {
            alert("Enlace de publicación ID: " + id);
        });
    }
}

function abrirWhatsApp(producto) {
    const msj = encodeURIComponent("Hola, quiero consultar sobre: " + producto);
    window.open(`https://wa.me/${whatsappGlobal}?text=${msj}`, '_blank');
}

// Inicializar renderizado al cargar
renderizarProductos();
