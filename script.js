
// ==========================================
// 1. SELECCIONAR LOS ELEMENTOS DEL HTML
// ==========================================

// Obtenemos el formulario.
const formulario = document.getElementById("formulario");

// Obtenemos el input donde escribimos el subreddit.
const inputSubreddit = document.getElementById("nombreSubreddit");

// Obtenemos el contenedor donde aparecerán los carriles.
const contenedorCarriles = document.getElementById("carriles");

// Obtenemos el espacio para mostrar mensajes.
const mensaje = document.getElementById("mensaje");


// ==========================================
// 2. VARIABLES PRINCIPALES
// ==========================================

// Array que almacenará todos los carriles.
let carriles = [];


// ==========================================
// 3. GUARDAR LOS CARRILES EN LOCALSTORAGE
// ==========================================

function guardarCarriles() {

    // Obtenemos únicamente los nombres de los carriles válidos.
    const nombres = carriles
        .filter(carril => carril.valido)
        .map(carril => carril.nombre);

    // Convertimos el array en texto JSON y lo guardamos.
    localStorage.setItem("subreddits", JSON.stringify(nombres));
}


// ==========================================
// 4. MOSTRAR LOS CARRILES EN EL HTML
// ==========================================

function mostrarCarriles() {

    // Limpiamos el contenido anterior.
    contenedorCarriles.innerHTML = "";

    // Si no existen carriles, mostramos un mensaje.
    if (carriles.length === 0) {

        const texto = document.createElement("p");

        texto.textContent = "Agrega tu primer subreddit.";

        contenedorCarriles.appendChild(texto);

        return;
    }

    // Recorremos todos los carriles existentes.
    carriles.forEach(carril => {

        // Creamos el contenedor de una columna.
        const columna = document.createElement("div");

        columna.classList.add("carril");

        // Creamos el encabezado de la columna.
        const encabezado = document.createElement("div");

        encabezado.classList.add("cabecera-carril");

        // Creamos el nombre del subreddit.
        const titulo = document.createElement("h2");

        titulo.textContent = "/r/" + carril.nombre;

        // Creamos el contenedor de los botones.
        const acciones = document.createElement("div");

        acciones.classList.add("acciones");

        // Creamos el botón para actualizar.
        const botonActualizar = document.createElement("button");

        botonActualizar.textContent = "Actualizar";

        // Cuando hacemos clic, volvemos a consultar Reddit.
        botonActualizar.addEventListener("click", () => {

            cargarPublicaciones(carril.nombre);

        });

        // Creamos el botón para eliminar.
        const botonEliminar = document.createElement("button");

        botonEliminar.textContent = "Eliminar";

        // Cuando hacemos clic, eliminamos el carril.
        botonEliminar.addEventListener("click", () => {

            eliminarCarril(carril.nombre);

        });

        // Agregamos los botones al contenedor de acciones.
        acciones.appendChild(botonActualizar);

        acciones.appendChild(botonEliminar);

        // Agregamos el título y los botones al encabezado.
        encabezado.appendChild(titulo);

        encabezado.appendChild(acciones);

        // Agregamos el encabezado a la columna.
        columna.appendChild(encabezado);


        // ==========================================
        // 5. MOSTRAR EL ESTADO DE CARGA
        // ==========================================

        if (carril.cargando) {

            const textoCarga = document.createElement("p");

            textoCarga.classList.add("cargando");

            textoCarga.textContent = "Cargando publicaciones...";

            columna.appendChild(textoCarga);

        }

        // ==========================================
        // 6. MOSTRAR LOS ERRORES
        // ==========================================

        else if (carril.error) {

            const textoError = document.createElement("p");

            textoError.classList.add("error");

            // Mostramos el mensaje de error.
            textoError.textContent = carril.error;

            columna.appendChild(textoError);

        }

        // ==========================================
        // 7. MOSTRAR LAS PUBLICACIONES
        // ==========================================

        else {

            // Recorremos las publicaciones recibidas.
            carril.publicaciones.forEach(publicacion => {

                // Creamos una tarjeta para cada publicación.
                const tarjeta = document.createElement("div");

                tarjeta.classList.add("publicacion");

                // Creamos el título de la publicación.
                const tituloPost = document.createElement("h3");

                tituloPost.textContent = publicacion.titulo;

                // Creamos el nombre del autor.
                const autor = document.createElement("p");

                autor.textContent = "Autor: " + publicacion.autor;

                // Creamos la cantidad de votos.
                const votos = document.createElement("p");

                votos.textContent = "Votos: " + publicacion.votos;

                // Creamos un enlace para visitar la publicación.
                const enlace = document.createElement("a");

                enlace.textContent = "Ver publicación";

                enlace.href = publicacion.enlace;

                enlace.target = "_blank";

                enlace.rel = "noopener noreferrer";

                // Agregamos toda la información a la tarjeta.
                tarjeta.appendChild(tituloPost);

                tarjeta.appendChild(autor);

                tarjeta.appendChild(votos);

                tarjeta.appendChild(enlace);

                // Agregamos la tarjeta a la columna.
                columna.appendChild(tarjeta);

            });

            // Si no existen publicaciones, mostramos un mensaje.
            if (carril.publicaciones.length === 0) {

                const texto = document.createElement("p");

                texto.textContent = "No hay publicaciones disponibles.";

                columna.appendChild(texto);

            }

        }

        // Finalmente agregamos la columna al contenedor principal.
        contenedorCarriles.appendChild(columna);

    });

}


// ==========================================
// 8. CONSULTAR LAS PUBLICACIONES DE REDDIT
// ==========================================

async function cargarPublicaciones(nombre) {

    // Buscamos el carril correspondiente.
    const carril = carriles.find(c => c.nombre === nombre);

    // Si no encontramos el carril, terminamos la función.
    if (!carril) return;

    // Activamos el estado de carga.
    carril.cargando = true;

    // Limpiamos errores anteriores.
    carril.error = "";

    // Actualizamos la pantalla.
    mostrarCarriles();

    try {

        // Construimos la dirección de la API de Reddit.
        const url = `https://www.reddit.com/r/${encodeURIComponent(nombre)}.json?limit=10`;

        // Realizamos la petición a Reddit.
        const respuesta = await fetch(url);

        // Comprobamos si la respuesta fue correcta.
        if (!respuesta.ok) {

            // Si Reddit devuelve 404, el subreddit no existe.
            if (respuesta.status === 404) {

                throw new Error("El subreddit no existe. Verifica el nombre.");

            }

            // Si Reddit bloquea la petición.
            if (respuesta.status === 403) {

                throw new Error("No se puede acceder a este subreddit.");

            }

            // Si se hacen demasiadas peticiones.
            if (respuesta.status === 429) {

                throw new Error("Demasiadas solicitudes. Intenta más tarde.");

            }

            // Para otros errores del servidor.
            throw new Error("Reddit respondió con un error: " + respuesta.status);

        }

        // Convertimos la respuesta en formato JSON.
        const datos = await respuesta.json();

        // Comprobamos que la respuesta tenga publicaciones.
        if (!datos.data || !Array.isArray(datos.data.children)) {

            throw new Error("El subreddit no existe o no está disponible.");

        }

        // Obtenemos las publicaciones de Reddit.
        carril.publicaciones = datos.data.children

            // Extraemos la información de cada publicación.
            .map(elemento => elemento.data)

            // Excluimos las publicaciones marcadas para adultos.
            .filter(post => post && !post.over_18)

            // Seleccionamos solamente los datos que necesitamos.
            .map(post => ({

                titulo: post.title,

                autor: post.author,

                votos: post.score,

                enlace: "https://www.reddit.com" + post.permalink

            }));

        // Indicamos que el subreddit es válido.
        carril.valido = true;

    } catch (error) {

        // Guardamos el mensaje de error.
        carril.error = error.message;

        // Mostramos el error en la consola para depuración.
        console.error("Error al consultar Reddit:", error);

    } finally {

        // Desactivamos el estado de carga.
        carril.cargando = false;

        // Guardamos los carriles válidos.
        guardarCarriles();

        // Actualizamos nuevamente la pantalla.
        mostrarCarriles();

    }

}


// ==========================================
// 9. AGREGAR UN NUEVO SUBREDDIT
// ==========================================

// Escuchamos cuando el usuario envía el formulario.
formulario.addEventListener("submit", async (evento) => {

    // Evitamos que el formulario recargue la página.
    evento.preventDefault();

    // Obtenemos el nombre escrito por el usuario.
    let nombre = inputSubreddit.value.trim();

    // Permitimos escribir r/nombre o /r/nombre.
    nombre = nombre.replace(/^\/?r\//i, "");

    // Comprobamos que el nombre tenga un formato válido.
    if (!/^[a-zA-Z0-9_]{2,21}$/.test(nombre)) {

        mensaje.textContent = "Escribe un nombre de subreddit válido.";

        mensaje.className = "error";

        return;

    }

    // Comprobamos si el subreddit ya está agregado.
    const existe = carriles.some(

        carril => carril.nombre.toLowerCase() === nombre.toLowerCase()

    );

    // Si ya existe, mostramos un mensaje.
    if (existe) {

        mensaje.textContent = "Este subreddit ya está agregado.";

        mensaje.className = "error";

        return;

    }

    // Limpiamos los mensajes anteriores.
    mensaje.textContent = "";

    // Creamos el nuevo carril.
    const nuevoCarril = {

        nombre: nombre,

        publicaciones: [],

        cargando: true,

        error: "",

        valido: false

    };

    // Agregamos el carril al array principal.
    carriles.push(nuevoCarril);

    // Limpiamos el input.
    inputSubreddit.value = "";

    // Mostramos inmediatamente el nuevo carril.
    mostrarCarriles();

    // Consultamos las publicaciones del subreddit.
    await cargarPublicaciones(nombre);

});


// ==========================================
// 10. ELIMINAR UN SUBREDDIT
// ==========================================

function eliminarCarril(nombre) {

    // Filtramos el array para quitar el carril seleccionado.
    carriles = carriles.filter(

        carril => carril.nombre !== nombre

    );

    // Actualizamos el almacenamiento local.
    guardarCarriles();

    // Actualizamos la pantalla.
    mostrarCarriles();

}


// ==========================================
// 11. RESTAURAR LOS CARRILES GUARDADOS
// ==========================================

function iniciarAplicacion() {

    // Intentamos recuperar los subreddits guardados.
    try {

        const guardados = JSON.parse(

            localStorage.getItem("subreddits") || "[]"

        );

        // Comprobamos que los datos sean un array.
        if (!Array.isArray(guardados)) {

            throw new Error("Los datos guardados no son válidos.");

        }

        // Reconstruimos los carriles guardados.
        guardados.forEach(nombre => {

            // Verificamos que el nombre sea un texto válido.
            if (
                typeof nombre === "string" &&
                /^[a-zA-Z0-9_]{2,21}$/.test(nombre) &&
                !carriles.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())
            ) {

                carriles.push({

                    nombre: nombre,

                    publicaciones: [],

                    cargando: true,

                    error: "",

                    valido: true

                });

            }

        });

    } catch (error) {

        // Mostramos el error en la consola.
        console.error("Error al recuperar los carriles:", error);

        // Eliminamos los datos guardados que no se pueden leer.
        localStorage.removeItem("subreddits");

    }

    // Mostramos los carriles recuperados.
    mostrarCarriles();

    // Volvemos a consultar las publicaciones de cada carril.
    carriles.forEach(carril => {

        cargarPublicaciones(carril.nombre);

    });

}


// ==========================================
// 12. INICIAR LA APLICACIÓN
// ==========================================

// Ejecutamos la función principal al cargar el archivo.
iniciarAplicacion();
