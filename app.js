// REEMPLAZÁ CON TUS MISMAS CLAVES DE FIREBASE DE SIEMPRE
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Datos por defecto
let appData = {
    bannerUrl: "banner.jpg",
    officialUrl: "https://www.livegood.com/internationalWellnessPack#?enroller=Normaolgadu",
    sellerText: "ADQUIRÍ ESTE PACK EN TODO EL MUNDO A PRECIO DE FÁBRICA. Carga de combos e información oficial.",
    sellerPhone: "5493725449776",
    adminPass: "1234"
};

// Productos de muestra iniciales
const productos = [
    {
        id: "p1",
        nombre: "International Pack By LiveGood",
        imagen: "banner.jpg"
    },
    {
        id: "p2",
        nombre: "Super Redes y Verdes Orgánicos",
        imagen: "banner.jpg"
    }
];

// Cargar configuración de Firestore en tiempo real
function escucharFirebase() {
    db.collection("vivirbien").doc("configuracion").onSnapshot((doc) => {
        if (doc.exists) {
            appData = doc.data();
            renderizar();
        } else {
            // Guardar configuración inicial si no existe
            db.collection("vivirbien").doc("configuracion").set(appData);
            renderizar();
        }
    });
}

function renderizar() {
    document.getElementById('main-banner').src = appData.bannerUrl || 'banner.jpg';
    document.getElementById('official-link-btn').href = appData.officialUrl || '#';
    document.getElementById('seller-text-display').innerText = appData.sellerText || '';

    renderizarCatalogo();
}

function renderizarCatalogo() {
    const grid = document.getElementById('grid-productos');
    grid.innerHTML = '';

    productos.forEach(prod => {
        const textWa = encodeURIComponent(`Hola! Quisiera consultar por el producto: ${prod.nombre}`);
        const urlWaConsulta = `https://wa.me/${appData.sellerPhone}?text=${textWa}`;

        const div = document.createElement('div');
        div.className = 'card-product';
        div.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.src='banner.jpg'">
            <div class="card-title">${prod.nombre}</div>
            <a href="${urlWaConsulta}" target="_blank" class="btn-wa-card">whatsapp consulta vendedor</a>
            <button onclick="compartirFormatoPublicacion('${prod.nombre}')" class="btn-share-card">📲 Compartir Publicación</button>
        `;
        grid.appendChild(div);
    });
}

// FORMATO EXACTO DE PUBLICACIÓN (Boceto 2 de Paint: producto, link oficial, url vivir bien, whatsapp)
function compartirFormatoPublicacion(nombreProducto) {
    const urlVivirBien = window.location.href;
    const linkWaVendedor = `https://wa.me/${appData.sellerPhone}`;

    // Estructura idéntica al dibujo de formato publicacion.jpg
    const textoPublicacion = 
`*${nombreProducto}*

*linck de pagina oficial:*
${appData.officialUrl}

*url de la pagina vivir bien:*
${urlVivirBien}

*whatsapp vendedor:*
${linkWaVendedor}`;

    if (navigator.share) {
        navigator.share({
            title: nombreProducto,
            text: textoPublicacion
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(textoPublicacion);
        alert('¡Publicación copiada al portapapeles! Ya podés pegarla en WhatsApp o Redes.');
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textoPublicacion)}`, '_blank');
    }
}

// Panel Admin
document.getElementById('btn-abrir-admin').addEventListener('click', () => {
    const pass = prompt('Ingresá la contraseña de administrador:');
    if (pass === appData.adminPass) {
        document.getElementById('input-banner-url').value = appData.bannerUrl;
        document.getElementById('input-official-url').value = appData.officialUrl;
        document.getElementById('input-seller-text').value = appData.sellerText;
        document.getElementById('input-seller-phone').value = appData.sellerPhone;
        document.getElementById('modal-admin').classList.remove('hidden');
    } else if (pass !== null) {
        alert('Contraseña incorrecta.');
    }
});

document.getElementById('btn-cerrar-admin').addEventListener('click', () => {
    document.getElementById('modal-admin').classList.add('hidden');
});

document.getElementById('btn-guardar-admin').addEventListener('click', () => {
    const nuevosDatos = {
        bannerUrl: document.getElementById('input-banner-url').value,
        officialUrl: document.getElementById('input-official-url').value,
        sellerText: document.getElementById('input-seller-text').value,
        sellerPhone: document.getElementById('input-seller-phone').value,
        adminPass: document.getElementById('input-admin-pass').value || appData.adminPass
    };

    db.collection("vivirbien").doc("configuracion").set(nuevosDatos)
        .then(() => {
            alert('¡Guardado exitosamente en Firebase!');
            document.getElementById('modal-admin').classList.add('hidden');
        })
        .catch(err => {
            alert('Error al guardar: ' + err.message);
        });
});

window.onload = escucharFirebase;
