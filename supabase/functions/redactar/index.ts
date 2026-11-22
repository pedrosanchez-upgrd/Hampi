// Supabase Edge Function «redactar»: mejora la redacción de una historia clínica con Claude.
// ESTADO: escrita pero NO desplegada ni probada contra la API. Para activarla hace falta
// autorización del dueño, el proyecto de Supabase y el secreto ANTHROPIC_API_KEY
// (`supabase secrets set ANTHROPIC_API_KEY=...`; nunca en el repositorio).
//
// Privacidad: la app envía el texto ya sin nombre, cédula, HCU ni contacto
// (ver `textoParaIA` en src/lib/historia.ts) y aquí se vuelve a filtrar por si acaso.

import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const SISTEMA = `Eres un asistente de redacción clínica para médicos de medicina interna en Cuenca, Ecuador.
Recibes los datos de una historia clínica escritos durante la entrevista y devuelves la misma historia
redactada en español médico formal, clara y ordenada.

Reglas:
- No agregues datos, diagnósticos, hallazgos ni tratamientos que no estén en el texto recibido.
- Conserva el orden: RESUMEN y SIGNOS DE ALARMA al inicio, luego los apartados numerados.
- Si un apartado obligatorio no tiene datos, escribe «No consignado» en lugar de inventarlo.
- Conserva cifras, unidades y nombres de medicamentos tal como vienen.
- El médico revisa y firma el texto: tu trabajo es solo la redacción.`

// Quita números de 10 dígitos (cédulas) y teléfonos que se hayan colado en el texto libre.
const filtrar = (t: string) => t.replace(/\b\d{10}\b/g, '[dato retirado]').replace(/\b0?9\d{8}\b/g, '[dato retirado]')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const json = (cuerpo: unknown, status = 200) =>
    new Response(JSON.stringify(cuerpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  // Solo usuarios con sesión iniciada.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return json({ error: 'Inicie sesión para usar la redacción con IA.' }, 401)

  const { texto } = await req.json().catch(() => ({ texto: '' }))
  if (typeof texto !== 'string' || !texto.trim()) return json({ error: 'No llegó el texto de la historia.' }, 400)
  if (texto.length > 60_000) return json({ error: 'La historia es demasiado larga para redactarla de una vez.' }, 413)

  const client = new Anthropic() // lee ANTHROPIC_API_KEY de los secretos de Supabase
  try {
    const respuesta = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SISTEMA,
      messages: [{ role: 'user', content: filtrar(texto) }],
    })
    if (respuesta.stop_reason === 'refusal') {
      return json({ error: 'La IA no pudo redactar este texto. Use la redacción ordenada sin IA.' }, 422)
    }
    const redactado = respuesta.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n').trim()
    return json({ redactado, modelo: respuesta.model })
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'Demasiadas solicitudes. Intente en un minuto.' }, 429)
    if (e instanceof Anthropic.APIError) return json({ error: `Error del servicio de IA (${e.status}).` }, 502)
    return json({ error: 'No se pudo conectar con el servicio de IA.' }, 502)
  }
})
