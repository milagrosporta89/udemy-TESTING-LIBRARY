# Apagón en la oficina

Un escape room con humor para aprender a usar un lector de pantalla (NVDA, JAWS o VoiceOver) sin apoyo visual.

Viernes, 18:59: se corta la luz en la oficina. Una cortina negra tapa la pantalla y bloquea el mouse, y para salir
solo puedes usar el teclado y la voz del lector. Cada sala enseña una habilidad:

| Sala | Lo que aprendes |
|---|---|
| La recepción | Leer elemento por elemento y activar un botón |
| El pasillo de las salas de reunión | Saltar por encabezados para encontrar la clave del wifi |
| La cocina | Saltar entre botones hasta dar con la tarjeta de acceso |
| La puerta de salida | Completar un formulario y entender sus errores |
| Final sorpresa: la intranet de 2009 | Sentir lo que es una página inaccesible, y ver qué estaba roto |

## Puntaje y ranking

Arrancas con 1000 puntos y pierdes 1 por segundo, 100 por pista y 25 por respuesta equivocada. El final sorpresa no
resta puntos. Si prendes la luz (`Escape` tres veces), la partida no entra al ranking.

Publicado en Vercel con la base de datos conectada, el ranking se comparte entre todas las personas que juegan y
guarda el mejor puntaje de cada navegador. Abierto como archivo local, el ranking queda guardado solo en ese navegador.

## Publicarlo en Vercel (gratis)

1. Entra a [vercel.com](https://vercel.com) y crea una cuenta con tu usuario de GitHub.
2. Elige **Add New → Project**, importa este repositorio y presiona **Deploy** sin cambiar nada.
3. En el proyecto, abre la pestaña **Storage**, crea una base de datos **Upstash for Redis** con el plan gratuito y
   conéctala al proyecto. Vercel agrega solo las claves que necesita el ranking.
4. Ve a **Deployments** y vuelve a desplegar el último para que tome la base de datos.

Sin el paso 3 el juego funciona igual, pero cada persona ve solo sus propios puntajes.

## Archivos

- `index.html`: el juego completo.
- `api/ranking.js`: guarda y devuelve el ranking.

## Probarlo en tu computadora

Abre `index.html` en el navegador. Para probar también el ranking compartido, usa `npx vercel dev`.
