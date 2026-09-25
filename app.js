// Constante fija del teléfono (no editable desde la interfaz)
const TELEFONO_WHATSAPP = "5493725449776";

// Valores iniciales
const DEFAULT_CONFIG = {
    bannerUrl: "https://via.placeholder.com/1000x250?text=Banner+Vivir+Bien",
    officialLink: "https://www.livegood.com/internationalWellnessPack",
    vendorText: "ADQUIRÍ ESTE PACK EN TODO EL MUNDO A PRECIO DE FÁBRICA. Carga de combos e información oficial."
};

// Estado de la aplicación
let isAdmin = false;
let config = JSON.parse(localStorage.getItem('vivirbien_config')) || DEFAULT_CONFIG;
let productos = JSON.parse(localStorage.getItem('vivirbien_productos')) || [];

// Variables temporales para fotos subidas
let tempBannerBase64 = "";
let tempProductoBase64 = "";
let editandoId = null;

// Elementos del DOM - Modal Admin
const btnLoginAdmin = document.getElementById('btn-login-admin');
const modalAdmin = document.getElementById('modal-admin');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnGuardarConfig = document.getElementById('btn-guardar-config');

const inputBannerFile = document.getElementById('input-banner-file');
const btnTriggerBannerFile = document.getElementById('btn-trigger-banner-file');
const previewBannerContainer = document.getElementById('preview-banner-container');
const previewBannerImg = document.getElementById('preview-banner-img');

const inputLink = document.getElementById('input-link');
const inputText = document.getElementById('input-text');

// Elementos del DOM - Vista Principal
const displayBannerImg = document.getElementById('display-banner-img');
const displayOfficialLink = document.getElementById('display-official-link');
const displayVendorText = document.getElementById('display-vendor-text');
const gridProductos = document.getElementById('grid-productos');

// Elementos del DOM - Panel Producto
const panelProducto = document.getElementById('panel-producto');
const btnCerrarPanel = document.getElementById('btn-cerrar-panel');
const tituloPanelProducto = document.getElementById('titulo-panel-producto');

const inputProductoFile = document.getElementById('input-producto-file');
const btnTriggerProductoFile = document.getElementById('btn-trigger-producto-file');
const previewProductoContainer = document.getElementById('preview-producto-container');
const previewProductoImg = document.getElementById('preview-producto-img');

const nuevoTitulo = document.getElementById('nuevo-titulo');
const btnGuardarProducto = document.getElementById('btn-guardar-producto');

// Carga Inicial
document.addEventListener('DOMContentLoaded', () => {
    renderConfig();
    renderProductos();
    setupEventListeners();
});

// Renderizar la vista pública
function renderConfig() {
    if (displayBannerImg) displayBannerImg.src = config.bannerUrl;
    if (displayOfficialLink) {
        displayOfficialLink.href = config.officialLink;
        displayOfficialLink.textContent = config.officialLink;
    }
    if (displayVendorText) displayVendorText.textContent = config.vendorText;

    if (inputLink) inputLink.value = config.officialLink;
    if (inputText) inputText.value = config.vendorText;

    if (config.bannerUrl && previewBannerImg) {
        previewBannerImg.src = config.bannerUrl;
        previewBannerContainer.style.display = 'block';
    }
}

// Renderizar únicamente productos existentes
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
                <i class="fas fa-link" title="Compartir publicación" onclick="compartirProducto('${prod.id}')"></i>
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

function guardarDatos() {
    localStorage.setItem('vivirbien_config', JSON.stringify(config));
    localStorage.setItem('vivirbien_productos', JSON.stringify(productos));
}

// Event Listeners principales
function setupEventListeners() {
    // Alternar modo Admin
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

    // Modal Admin
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalAdmin);

    // Selección de archivo para Banner
    if (btnTriggerBannerFile) {
        btnTriggerBannerFile.addEventListener('click', () => inputBannerFile.click());
    }

    if (inputBannerFile) {
        inputBannerFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    tempBannerBase64 = event.target.result;
                    previewBannerImg.src = tempBannerBase64;
                    previewBannerContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Guardar Configuración General
    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', () => {
            if (tempBannerBase64) {
                config.bannerUrl = tempBannerBase64;
            }
            config.officialLink = inputLink.value.trim() || DEFAULT_CONFIG.officialLink;
            config.vendorText = inputText.value.trim() || DEFAULT_CONFIG.vendorText;

            guardarDatos();
            renderConfig();
            cerrarModalAdmin();
        });
    }

    // Panel Lateral de Producto
    if (btnCerrarPanel) btnCerrarPanel.addEventListener('click', cerrarPanelProducto);

    // Selección de archivo para Producto
    if (btnTriggerProductoFile) {
        btnTriggerProductoFile.addEventListener('click', () => inputProductoFile.click());
    }

    if (inputProductoFile) {
        inputProductoFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    tempProductoBase64 = event.target.result;
                    previewProductoImg.src = tempProductoBase64;
                    previewProductoContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Publicar o Editar Producto
    if (btnGuardarProducto) {
        btnGuardarProducto.addEventListener('click', () => {
            const titulo = nuevoTitulo.value.trim();

            if (!tempProductoBase64 && !editandoId) {
                alert('Por favor, selecciona una foto desde tu dispositivo.');
                return;
            }

            if (!titulo) {
                alert('Por favor, escribe un título para la publicación.');
                return;
            }

            if (editandoId) {
                const idx = productos.findIndex(p => p.id === editandoId);
                if (idx !== -1) {
                    productos[idx].titulo = titulo;
                    if (tempProductoBase64) {
                        productos[idx].imagen = tempProductoBase64;
                    }
                }
            } else {
                const nuevoProd = {
                    id: Date.now().toString(),
                    titulo: titulo,
                    imagen: tempProductoBase64
                };
                productos.push(nuevoProd);
            }

            guardarDatos();
            renderProductos();
            cerrarPanelProducto();
        });
    }
}

// Manejo de Paneles y Modales
function abrirModalAdmin() {
    tempBannerBase64 = "";
    if (modalAdmin) modalAdmin.style.display = 'flex';
}

function cerrarModalAdmin() {
    if (modalAdmin) modalAdmin.style.display = 'none';
}

function abrirPanelNuevoProducto() {
    editandoId = null;
    tempProductoBase64 = "";
    if (tituloPanelProducto) tituloPanelProducto.textContent = "Nueva Publicación";
    if (btnGuardarProducto) btnGuardarProducto.textContent = "Publicar Producto";
    if (nuevoTitulo) nuevoTitulo.value = "";
    if (inputProductoFile) inputProductoFile.value = "";
    if (previewProductoContainer) previewProductoContainer.style.display = 'none';
    if (panelProducto) panelProducto.classList.add('open');
}

function cerrarPanelProducto() {
    if (panelProducto) panelProducto.classList.remove('open');
    tempProductoBase64 = "";
    editandoId = null;
}

// Funciones globales de tarjeta
window.prepararEdicion = function(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    editandoId = id;
    tempProductoBase64 = prod.imagen;
    if (tituloPanelProducto) tituloPanelProducto.textContent = "Editar Publicación";
    if (btnGuardarProducto) btnGuardarProducto.textContent = "Guardar Cambios";
    if (nuevoTitulo) nuevoTitulo.value = prod.titulo;
    
    if (previewProductoImg && previewProductoContainer) {
        previewProductoImg.src = prod.imagen;
        previewProductoContainer.style.display = 'block';
    }

    if (panelProducto) panelProducto.classList.add('open');
};

window.eliminarProducto = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        renderProductos();
    }
};

window.compartirProducto = function(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    const textoCompartir = `Consulta sobre: *${prod.titulo}*`;
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
        });
    }
};
