// Constante fija del teléfono (no editable desde la interfaz)
const TELEFONO_WHATSAPP = "5493725449776";

// Valores por defecto
const DEFAULT_CONFIG = {
    bannerUrl: "banner.jpg",
    officialLink: "https://www.livegood.com/internationalWellnessPack",
    vendorText: "ADQUIRÍ ESTE PACK EN TODO EL MUNDO A PRECIO DE FÁBRICA. Carga de combos e información oficial."
};

const DEFAULT_PRODUCTOS = [
    {
        id: "1",
        titulo: "International Pack By LiveGood",
        imagen: "https://via.placeholder.com/300x240?text=International+Pack"
    },
    {
        id: "2",
        titulo: "Super Redes y Verdes Orgánicos",
        imagen: "https://via.placeholder.com/300x240?text=Super+Redes+y+Verdes"
    }
];

// Estado global de la aplicación
let isAdmin = false;
let config = JSON.parse(localStorage.getItem('vivirbien_config')) || DEFAULT_CONFIG;
let productos = JSON.parse(localStorage.getItem('vivirbien_productos')) || DEFAULT_PRODUCTOS;

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
const nuevoTitulo = document.getElementById('nuevo-titulo');
const btnAgregarProducto = document.getElementById('btn-agregar-producto');

// Inicialización de la app
document.addEventListener('DOMContentLoaded', () => {
    renderConfig();
    renderProductos();
    setupEventListeners();
});

// Renderizar la configuración visual (Banner, Enlace oficial y Texto)
function renderConfig() {
    if (displayBannerImg) displayBannerImg.src = config.bannerUrl;
    if (displayOfficialLink) {
        displayOfficialLink.href = config.officialLink;
        displayOfficialLink.textContent = config.officialLink;
    }
    if (displayVendorText) displayVendorText.textContent = config.vendorText;

    // Cargar datos actuales en los campos del Modal
    if (inputBanner) inputBanner.value = config.bannerUrl;
    if (inputLink) inputLink.value = config.officialLink;
    if (inputText) inputText.value = config.vendorText;
}

// Renderizar las tarjetas de productos
function renderProductos() {
    if (!gridProductos) return;
    gridProductos.innerHTML = '';

    productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'card';

        // Construcción del mensaje para WhatsApp con el número fijo
        const mensajeWA = encodeURIComponent(`Hola, quisiera más información sobre: ${prod.titulo}`);
        const urlWA = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensajeWA}`;

        card.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.titulo}">
            <div class="admin-controls">
                <i class="fas fa-link" title="Copiar enlace" onclick="copiarEnlace('${prod.id}')"></i>
                <i class="fas fa-pencil-alt" title="Editar" onclick="editarProducto('${prod.id}')"></i>
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

// Guardar los datos en LocalStorage
function guardarDatos() {
    localStorage.setItem('vivirbien_config', JSON.stringify(config));
    localStorage.setItem('vivirbien_productos', JSON.stringify(productos));
}

// Event Listeners principales
function setupEventListeners() {
    // Botón de Admin
    if (btnLoginAdmin) {
        btnLoginAdmin.addEventListener('click', () => {
            isAdmin = !isAdmin;
            document.body.classList.toggle('admin-mode-active', isAdmin);

            if (isAdmin) {
                btnLoginAdmin.textContent = 'Salir Admin';
                abrirModalAdmin();
            } else {
                btnLoginAdmin.textContent = 'admin';
                cerrarModalAdmin();
                cerrarPanelProducto();
            }
        });
    }

    // Modal de Configuración
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

    // Panel Lateral para Agregar Producto
    if (btnCerrarPanel) btnCerrarPanel.addEventListener('click', cerrarPanelProducto);

    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', () => {
            const titulo = nuevoTitulo.value.trim();
            if (!titulo) {
                alert('Por favor, ingresa un título para la publicación.');
                return;
            }

            const nuevoProd = {
                id: Date.now().toString(),
                titulo: titulo,
                imagen: 'https://via.placeholder.com/300x240?text=' + encodeURIComponent(titulo)
            };

            productos.push(nuevoProd);
            guardarDatos();
            renderProductos();

            nuevoTitulo.value = '';
            cerrarPanelProducto();
        });
    }
}

// Funciones para abrir y cerrar paneles/modales
function abrirModalAdmin() {
    if (modalAdmin) modalAdmin.style.display = 'flex';
}

function cerrarModalAdmin() {
    if (modalAdmin) modalAdmin.style.display = 'none';
}

function cerrarPanelProducto() {
    if (panelProducto) panelProducto.classList.remove('open');
}

// Funciones globales invocadas desde las tarjetas
window.eliminarProducto = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        renderProductos();
    }
};

window.editarProducto = function(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    const nuevoNombre = prompt('Editar título del producto:', prod.titulo);
    if (nuevoNombre !== null && nuevoNombre.trim() !== '') {
        prod.titulo = nuevoNombre.trim();
        guardarDatos();
        renderProductos();
    }
};

window.copiarEnlace = function(id) {
    const prod = productos.find(p => p.id === id);
    if (prod) {
        const url = window.location.href.split('#')[0] + '#' + id;
        navigator.clipboard.writeText(url).then(() => {
            alert('Enlace copiado al portapapeles');
        });
    }
};
