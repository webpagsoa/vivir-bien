// Constante fija del teléfono (no editable desde la interfaz)
const TELEFONO_WHATSAPP = "5493725449776";

// Valores por defecto para configuración general
const DEFAULT_CONFIG = {
    bannerUrl: "https://via.placeholder.com/1000x250?text=Banner+Vivir+Bien",
    officialLink: "https://www.livegood.com/internationalWellnessPack",
    vendorText: "ADQUIRÍ ESTE PACK EN TODO EL MUNDO A PRECIO DE FÁBRICA. Carga de combos e información oficial."
};

// Estado global
let isAdmin = false;
let config = JSON.parse(localStorage.getItem('vivirbien_config')) || DEFAULT_CONFIG;
let productos = JSON.parse(localStorage.getItem('vivirbien_productos')) || []; // Inicia vacío
let imagenTemporal = ""; // Para previsualizar imágenes subidas o pegadas
let editandoId = null;   // ID de producto si se está editando

// Elementos del DOM
const btnLoginAdmin = document.getElementById('btn-login-admin');
const modalAdmin = document.getElementById('modal-admin');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnGuardarConfig = document.getElementById('btn-guardar-config');

const inputBanner = document.getElementById('input-banner');
const inputLink = document.getElementById('input-link');
const inputText = document.getElementById('input-text');

const displayBannerImg = document.getElementById('display-banner-img');
const displayOfficialLink = document.getElementById('display-official-link');
const displayVendorText = document.getElementById('display-vendor-text');
const gridProductos = document.getElementById('grid-productos');

const panelProducto = document.getElementById('panel-producto');
const btnCerrarPanel = document.getElementById('btn-cerrar-panel');
const tituloPanelProducto = document.getElementById('titulo-panel-producto');
const inputFotoFile = document.getElementById('input-foto-file');
const btnTriggerFile = document.getElementById('btn-trigger-file');
const nuevoImagenUrl = document.getElementById('nuevo-imagen-url');
const previewContainer = document.getElementById('preview-container');
const previewImg = document.getElementById('preview-img');
const nuevoTitulo = document.getElementById('nuevo-titulo');
const btnGuardarProducto = document.getElementById('btn-guardar-producto');

// Carga Inicial
document.addEventListener('DOMContentLoaded', () => {
    renderConfig();
    renderProductos();
    setupEventListeners();
});

// Renderizar configuración del encabezado/banner
function renderConfig() {
    if (displayBannerImg) displayBannerImg.src = config.bannerUrl;
    if (displayOfficialLink) {
        displayOfficialLink.href = config.officialLink;
        displayOfficialLink.textContent = config.officialLink;
    }
    if (displayVendorText) displayVendorText.textContent = config.vendorText;

    if (inputBanner) inputBanner.value = config.bannerUrl;
    if (inputLink) inputLink.value = config.officialLink;
    if (inputText) inputText.value = config.vendorText;
}

// Renderizar únicamente las publicaciones creadas
function renderProductos() {
    if (!gridProductos) return;
    gridProductos.innerHTML = '';

    if (productos.length === 0) {
        gridProductos.innerHTML = `
            <div class="sin-productos">
                <i class="fas fa-box-open" style="font-size:32px; margin-bottom:10px; display:block; color:#aaa;"></i>
                No hay publicaciones cargadas en el catálogo.
            </div>
        `;
        return;
    }

    productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'card';

        const mensajeWA = encodeURIComponent(`Hola, quisiera más información sobre: ${prod.titulo}`);
        const urlWA = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensajeWA}`;

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${prod.imagen}" alt="${prod.titulo}" onerror="this.src='https://via.placeholder.com/300x240?text=Sin+Imagen'">
            </div>
            <div class="admin-controls">
                <i class="fas fa-link" title="Copiar enlace / Compartir" onclick="compartirProducto('${prod.id}')"></i>
                <i class="fas fa-pencil-alt" title="Editar" onclick="prepararEdicion('${prod.id}')"></i>
                <i class="fas fa-trash" title="Eliminar" onclick="eliminarProducto('${prod.id}')"></i>
            </div>
            <div class="card-info">
                <h3 class="card-title">${prod.titulo}</h3>
                <a href="${urlWA}" target="_blank" class="btn-whatsapp">
                    <i class="fab fa-whatsapp"></i> whatsapp consulta vendedor
                </a>
            </div>
        `;
        gridProductos.appendChild(card);
    });
}

// Guardar en LocalStorage
function guardarDatos() {
    localStorage.setItem('vivirbien_config', JSON.stringify(config));
    localStorage.setItem('vivirbien_productos', JSON.stringify(productos));
}

// Event Listeners
function setupEventListeners() {
    // Activar/Desactivar Admin
    if (btnLoginAdmin) {
        btnLoginAdmin.addEventListener('click', () => {
            isAdmin = !isAdmin;
            document.body.classList.toggle('admin-mode-active', isAdmin);

            if (isAdmin) {
                btnLoginAdmin.textContent = 'Salir Admin';
                abrirModalAdmin();
                abrirPanelNuevoProducto();
            } else {
                btnLoginAdmin.textContent = 'admin';
                cerrarModalAdmin();
                cerrarPanelProducto();
            }
        });
    }

    // Modal Admin Configuración
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalAdmin);

    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', () => {
            config.bannerUrl = inputBanner.value.trim() || DEFAULT_CONFIG.bannerUrl;
            config.officialLink = inputLink.value.trim() || DEFAULT_CONFIG.officialLink;
            config.vendorText = inputText.value.trim() || DEFAULT_CONFIG.vendorText;

            guardarDatos();
            renderConfig();
            cerrarModalAdmin();
        });
    }

    // Panel Lateral
    if (btnCerrarPanel) btnCerrarPanel.addEventListener('click', cerrarPanelProducto);

    // Selección de archivo desde PC o Móvil
    if (btnTriggerFile) {
        btnTriggerFile.addEventListener('click', () => inputFotoFile.click());
    }

    if (inputFotoFile) {
        inputFotoFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagenTemporal = event.target.result;
                    mostrarVistaPrevia(imagenTemporal);
                    if (nuevoImagenUrl) nuevoImagenUrl.value = '';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Pegar URL directa de foto
    if (nuevoImagenUrl) {
        nuevoImagenUrl.addEventListener('input', () => {
            const url = nuevoImagenUrl.value.trim();
            if (url) {
                imagenTemporal = url;
                mostrarVistaPrevia(url);
            } else if (!inputFotoFile.files.length) {
                ocultarVistaPrevia();
            }
        });
    }

    // Publicar o Guardar Cambios del Producto
    if (btnGuardarProducto) {
        btnGuardarProducto.addEventListener('click', () => {
            const titulo = nuevoTitulo.value.trim();
            const urlManual = nuevoImagenUrl ? nuevoImagenUrl.value.trim() : '';
            const imagenFinal = imagenTemporal || urlManual;

            if (!imagenFinal) {
                alert('Por favor, selecciona una foto de tu dispositivo o pega un enlace de imagen.');
                return;
            }

            if (!titulo) {
                alert('Por favor, escribe un título para la publicación.');
                return;
            }

            if (editandoId) {
                // Editar existente
                const idx = productos.findIndex(p => p.id === editandoId);
                if (idx !== -1) {
                    productos[idx].titulo = titulo;
                    productos[idx].imagen = imagenFinal;
                }
            } else {
                // Crear nueva publicación
                const nuevoProd = {
                    id: Date.now().toString(),
                    titulo: titulo,
                    imagen: imagenFinal
                };
                productos.push(nuevoProd);
            }

            guardarDatos();
            renderProductos();
            cerrarPanelProducto();
        });
    }
}

// Vista previa
function mostrarVistaPrevia(src) {
    if (previewImg && previewContainer) {
        previewImg.src = src;
        previewContainer.style.display = 'block';
    }
}

function ocultarVistaPrevia() {
    if (previewImg && previewContainer) {
        previewImg.src = '';
        previewContainer.style.display = 'none';
    }
    imagenTemporal = "";
}

// Preparar panel para una nueva publicación
function abrirPanelNuevoProducto() {
    editandoId = null;
    if (tituloPanelProducto) tituloPanelProducto.textContent = "Nueva Publicación";
    if (btnGuardarProducto) btnGuardarProducto.textContent = "Publicar Producto";
    if (nuevoTitulo) nuevoTitulo.value = "";
    if (nuevoImagenUrl) nuevoImagenUrl.value = "";
    if (inputFotoFile) inputFotoFile.value = "";
    ocultarVistaPrevia();
    if (panelProducto) panelProducto.classList.add('open');
}

// Preparar edición de un producto
window.prepararEdicion = function(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    editandoId = id;
    if (tituloPanelProducto) tituloPanelProducto.textContent = "Editar Publicación";
    if (btnGuardarProducto) btnGuardarProducto.textContent = "Guardar Cambios";
    if (nuevoTitulo) nuevoTitulo.value = prod.titulo;
    if (nuevoImagenUrl) nuevoImagenUrl.value = prod.imagen.startsWith('data:') ? '' : prod.imagen;
    
    imagenTemporal = prod.imagen;
    mostrarVistaPrevia(prod.imagen);

    if (panelProducto) panelProducto.classList.add('open');
};

// Eliminar producto
window.eliminarProducto = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        renderProductos();
    }
};

// Compartir (Solo disponible si es admin)
window.compartirProducto = function(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    const textoCompartir = `Miren esta publicación de Vivir Bien: *${prod.titulo}*`;
    const urlPublicacion = window.location.href.split('#')[0] + '#' + id;

    if (navigator.share) {
        navigator.share({
            title: prod.titulo,
            text: textoCompartir,
            url: urlPublicacion
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(`${textoCompartir}\n${urlPublicacion}`).then(() => {
            alert('¡Enlace e información copiada al portapapeles!');
        }).catch(() => {
            alert(`Publicación: ${prod.titulo}\nEnlace: ${urlPublicacion}`);
        });
    }
};

function abrirModalAdmin() {
    if (modalAdmin) modalAdmin.style.display = 'flex';
}

function cerrarModalAdmin() {
    if (modalAdmin) modalAdmin.style.display = 'none';
}

function cerrarPanelProducto() {
    if (panelProducto) panelProducto.classList.remove('open');
    ocultarVistaPrevia();
    editandoId = null;
}
