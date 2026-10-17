// Ranking compartido del juego. Guarda el mejor puntaje de cada jugador en Upstash Redis
// usando su API REST, así no hace falta instalar dependencias.
const CLAVE = 'apagon:ranking';

const URL_REDIS = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_REDIS = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(...comando) {
  const resp = await fetch(URL_REDIS, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN_REDIS}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comando),
  });
  if (!resp.ok) throw new Error(`Redis respondió ${resp.status}`);
  return (await resp.json()).result;
}

function entero(valor, min, max) {
  return Number.isInteger(valor) && valor >= min && valor <= max;
}

function validar(body) {
  if (!body || typeof body !== 'object') return null;
  const { id, apodo, puntos, segundos, pistas, errores } = body;
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{8,64}$/.test(id)) return null;
  if (typeof apodo !== 'string' || apodo.trim().length < 2) return null;
  if (!entero(puntos, 0, 1000) || !entero(segundos, 0, 86400) || !entero(pistas, 0, 4) || !entero(errores, 0, 10000)) return null;
  return { id, apodo: apodo.trim().slice(0, 24), puntos, segundos, pistas, errores };
}

async function leerRanking() {
  const plano = (await redis('HGETALL', CLAVE)) || [];
  const filas = [];
  for (let i = 0; i < plano.length; i += 2) {
    try { filas.push({ id: plano[i], ...JSON.parse(plano[i + 1]) }); } catch (e) { /* fila dañada */ }
  }
  return filas.sort((a, b) => b.puntos - a.puntos || a.segundos - b.segundos).slice(0, 20);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_REDIS || !TOKEN_REDIS) {
    return res.status(503).json({ error: 'Falta conectar la base de datos (Upstash Redis) en Vercel.' });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await leerRanking());
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
      const fila = validar(body);
      if (!fila) return res.status(400).json({ error: 'Puntaje inválido.' });

      const previoTexto = await redis('HGET', CLAVE, fila.id);
      const previo = previoTexto ? JSON.parse(previoTexto) : null;
      if (previo && previo.puntos >= fila.puntos) {
        return res.status(200).json({ estado: 'igual', mejor: previo.puntos });
      }
      const { id, ...datos } = fila;
      await redis('HSET', CLAVE, id, JSON.stringify({ ...datos, fecha: new Date().toISOString() }));
      return res.status(200).json({ estado: previo ? 'record' : 'nuevo', mejor: fila.puntos });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo leer o guardar el ranking.' });
  }
}
