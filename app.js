document.addEventListener('DOMContentLoaded', () => {
    let isAdmin = false;
    let whatsappGlobal = "5493725449776";

    // Publicaciones iniciales de ejemplo
    let publicaciones = [
        { id: 1, title: "International Pack By LiveGood", img: "https://via.placeholder.com/300x250?text=Pack+1" },
        { id: 2, title: "Super Redes y Verdes Orgánicos", img: "https://via.placeholder.com/300x250?text=Pack+2" }
    ];

    // Renderizar publicaciones
    function renderizarProductos() {
        const grid = document.getElementById('grid-productos');
        if (!grid) return;
        
        grid.innerHTML = '';

        publicaciones.forEach(pub => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${pub.img}" alt="${pub.title}">
                
                <div class="admin-controls">
                    <i class="fas fa-link" title="Copiar Link" onclick="accionAdmin('compartir', ${pub.id})"></i>
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

    // Botón de alternar Admin
    const btnAdmin = document.getElementById('btn-login-admin');
    if (btnAdmin) {
        btnAdmin.addEventListener('click', () => {
            isAdmin = !isAdmin;
            const body = document.getElementById('app-body');
            
            if (isAdmin) {
                body.classList.add('admin-mode-active');
                btnAdmin.innerText = "Salir Admin";
                document.getElementById('modal-admin').style.display = 'flex';
                document.getElementById('panel-producto').classList.add('open');
            } else {
                body.classList.remove('admin-mode-active');
                btnAdmin.innerText = "admin";
                document.getElementById('panel-producto').classList.remove('open');
                document.getElementById('modal-admin').style.display = 'none';
            }
        });
    }

    // Botones para cerrar modal y panel
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => {
            document.getElementById('modal-admin').style.display = 'none';
        });
    }

    const btnCerrarPanel = document.getElementById('btn-cerrar-panel');
    if (btnCerrarPanel) {
        btnCerrarPanel.addEventListener('click', () => {
            document.getElementById('panel-producto').classList.remove('open');
        });
    }

    // Guardar configuración vendedor
    const btnGuardarConfig = document.getElementById('btn-guardar-config');
    if (btnGuardarConfig) {
        btnGuardarConfig.addEventListener('click', () => {
            const linkInput = document.getElementById('input-link').value;
            const linkDisplay = document.getElementById('display-official-link');
            
            if (linkDisplay) {
                linkDisplay.innerText = linkInput;
                linkDisplay.href = linkInput;
            }
            
            document.getElementById('display-vendor-text').innerText = document.getElementById('input-text').value;
            whatsappGlobal = document.getElementById('input-wa').value;
            
            document.getElementById('modal-admin').style.display = 'none';
            alert("Configuración guardada correctamente");
        });
    }

    // Agregar producto
    const btnAgregarProducto = document.getElementById('btn-agregar-producto');
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', () => {
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
                alert("Ingresa un título para la publicación.");
            }
        });
    }

    // Funciones globales
    window.accionAdmin = function(accion, id) {
        if (accion === 'borrar') {
            if (confirm("¿Deseas eliminar esta publicación?")) {
                publicaciones = publicaciones.filter(p => p.id !== id);
                renderizarProductos();
            }
        } else if (accion === 'editar') {
            const pub = publicaciones.find(p => p.id === id);
            if (pub) {
                const nuevoTitulo = prompt("Editar título:", pub.title);
                if (nuevoTitulo && nuevoTitulo.trim() !== "") {
                    pub.title = nuevoTitulo.trim();
                    renderizarProductos();
                }
            }
        } else if (accion === 'compartir') {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert("Enlace copiado al portapapeles.");
            }).catch(() => {
                alert("Enlace: " + url);
            });
        }
    };

    window.abrirWhatsApp = function(producto) {
        const msj = encodeURIComponent("Hola, quiero consultar sobre: " + producto);
        window.open(`https://wa.me/${whatsappGlobal}?text=${msj}`, '_blank');
    };

    // Carga inicial
    renderizarProductos();
});
