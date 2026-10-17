// Atajos de cada lector de pantalla, usados en los consejos de cada lección
const ATAJOS = {
  nvda: {
    encender: 'En NVDA se enciende con Control + Alt + N. Para callar la voz en cualquier momento, presiona Control.',
    leer: 'Para leer, usa la flecha abajo (siguiente línea) y la flecha arriba (anterior). Insert + flecha abajo lee todo de corrido.',
    activar: 'Para activar un botón, presiona Enter o Espacio.',
    encabezado: 'Presiona la letra H para ir al siguiente encabezado, y Shift + H para volver al anterior. Insert + F7 abre la lista de elementos de la página.',
    campo: 'La letra E te lleva al siguiente campo de texto. Al escribir, NVDA entra en modo foco y suena un tono agudo. Con Escape vuelves a navegar.',
    boton: 'Presiona la letra B para ir al siguiente botón, y Shift + B para el anterior.',
    formulario: 'Usa Tab para avanzar entre campos y Shift + Tab para retroceder. En la lista desplegable, elige con las flechas. La casilla se marca con Espacio.',
  },
  jaws: {
    encender: 'JAWS se abre desde el menú Inicio o con el atajo que hayas configurado. Para callar la voz, presiona Control.',
    leer: 'Para leer, usa la flecha abajo (siguiente línea) y la flecha arriba (anterior). Insert + flecha abajo lee todo de corrido.',
    activar: 'Para activar un botón, presiona Enter o Espacio.',
    encabezado: 'Presiona la letra H para ir al siguiente encabezado, y Shift + H para volver al anterior. Insert + F6 abre la lista de encabezados.',
    campo: 'La letra E te lleva al siguiente campo de texto. Presiona Enter para entrar en modo formulario y escribir. Con Escape vuelves a navegar.',
    boton: 'Presiona la letra B para ir al siguiente botón, y Shift + B para el anterior.',
    formulario: 'Usa Tab para avanzar entre campos y Shift + Tab para retroceder. En la lista desplegable, elige con las flechas. La casilla se marca con Espacio.',
  },
  voiceover: {
    encender: 'VoiceOver se enciende con Comando + F5. La tecla VO es Control + Option. Para callar la voz, presiona Control.',
    leer: 'Para leer, usa VO + flecha derecha (siguiente elemento) y VO + flecha izquierda (anterior). VO + A lee todo de corrido.',
    activar: 'Para activar un botón, presiona VO + Espacio.',
    encabezado: 'Presiona VO + Comando + H para ir al siguiente encabezado. VO + U abre el rotor, donde puedes ver la lista de encabezados.',
    campo: 'VO + Comando + J te lleva al siguiente control de formulario. Cuando estés en el campo, escribe directamente.',
    boton: 'Presiona VO + Comando + J para saltar entre controles, o abre el rotor con VO + U y busca la lista de botones.',
    formulario: 'Usa Tab para avanzar entre campos y Shift + Tab para retroceder. En la lista desplegable, ábrela con VO + Espacio y elige con las flechas. La casilla se marca con VO + Espacio.',
  },
};

const PANTALLAS = ['bienvenida', 'leccion-1', 'leccion-2', 'leccion-3', 'leccion-4', 'final'];

const cortina = document.getElementById('cortina');
const anuncios = document.getElementById('anuncios');
let actual = 0;
let lector = 'nvda';

function anunciar(texto) {
  // Vaciar primero para que el lector repita un mismo mensaje
  anuncios.textContent = '';
  setTimeout(() => { anuncios.textContent = texto; }, 50);
}

function ponerCortina(activa) {
  cortina.hidden = !activa;
  document.body.classList.toggle('a-ciegas', activa);
}

function aplicarAtajos() {
  const atajos = ATAJOS[lector];
  document.getElementById('encender-texto').textContent = atajos.encender;
  document.querySelectorAll('[data-tip]').forEach((p) => {
    p.textContent = atajos[p.dataset.tip];
  });
}

function irA(indice) {
  actual = indice;
  PANTALLAS.forEach((id, i) => {
    document.getElementById(id).hidden = i !== indice;
  });
  const titulo = document.querySelector(`#${PANTALLAS[indice]} h1`);
  // Mover el foco al título para que el lector arranque a leer la nueva lección
  setTimeout(() => titulo.focus(), 100);
}

function siguiente() {
  irA(actual + 1);
}

// Bienvenida
document.querySelectorAll('input[name="lector"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    lector = radio.value;
    aplicarAtajos();
  });
});

document.getElementById('form-inicio').addEventListener('submit', (e) => {
  e.preventDefault();
  ponerCortina(true);
  irA(1);
});

// Acciones comunes: siguiente, quitar cortina, reiniciar
document.addEventListener('click', (e) => {
  const control = e.target.closest('[data-accion]');
  if (!control) return;
  e.preventDefault();
  const accion = control.dataset.accion;
  if (accion === 'siguiente') siguiente();
  if (accion === 'quitar-cortina') {
    ponerCortina(false);
    anunciar('Pantalla negra desactivada.');
  }
  if (accion === 'reiniciar') {
    ponerCortina(false);
    irA(0);
  }
});

// Lección 2: palabra secreta
document.querySelector('[data-ejercicio="palabra"]').addEventListener('submit', (e) => {
  e.preventDefault();
  const campo = document.getElementById('palabra');
  const valor = campo.value.trim().toLowerCase();
  if (valor === 'faro') {
    anunciar('¡Correcto! La palabra era faro.');
    setTimeout(siguiente, 1500);
  } else if (valor === '') {
    anunciar('El campo está vacío. Escribe la palabra secreta y vuelve a comprobar.');
    campo.focus();
  } else {
    anunciar(`"${campo.value}" no es la palabra secreta. Vuelve a las salas usando los encabezados.`);
    campo.focus();
  }
});

// Lección 3: botón Mango
document.querySelector('[data-ejercicio="frutas"]').addEventListener('click', (e) => {
  const boton = e.target.closest('button');
  if (!boton) return;
  if (boton.textContent === 'Mango') {
    anunciar('¡Bien! Encontraste el Mango.');
    setTimeout(siguiente, 1500);
  } else {
    anunciar(`Ese es ${boton.textContent}. Sigue buscando el Mango.`);
  }
});

// Lección 4: formulario con errores accesibles
document.querySelector('[data-ejercicio="formulario"]').addEventListener('submit', (e) => {
  e.preventDefault();
  const campos = [
    { el: document.getElementById('nombre'), vacio: (el) => el.value.trim() === '', mensaje: 'Escribe tu nombre.' },
    { el: document.getElementById('experiencia'), vacio: (el) => el.value === '', mensaje: 'Elige una opción de la lista.' },
    { el: document.getElementById('compromiso'), vacio: (el) => !el.checked, mensaje: 'Marca la casilla para continuar.' },
  ];
  const conError = [];
  campos.forEach(({ el, vacio, mensaje }) => {
    const error = document.getElementById(`${el.id}-error`);
    const mal = vacio(el);
    error.textContent = mal ? mensaje : '';
    el.setAttribute('aria-invalid', String(mal));
    if (mal) conError.push(el);
  });

  if (conError.length) {
    const plural = conError.length === 1 ? 'Hay 1 campo' : `Hay ${conError.length} campos`;
    anunciar(`${plural} por corregir. Te llevamos al primero.`);
    setTimeout(() => conError[0].focus(), 1200);
    return;
  }
  const nombre = document.getElementById('nombre').value.trim();
  document.getElementById('final-saludo').textContent =
    `${nombre}, completaste las cuatro lecciones sin mirar la pantalla.`;
  siguiente();
});

// Salida de emergencia: Escape tres veces seguidas
let escapes = [];
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || cortina.hidden) return;
  const ahora = Date.now();
  escapes = escapes.filter((t) => ahora - t < 1500).concat(ahora);
  if (escapes.length >= 3) {
    escapes = [];
    ponerCortina(false);
    anunciar('Pantalla negra desactivada.');
  }
});

aplicarAtajos();
