export default async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { formData } = req.body;
        
        if (!formData) {
            return res.status(400).json({ error: 'Missing formData' });
        }

        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            console.error('API_KEY not configured in environment');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const prompt = `Eres un experto en branding, marketing y diseño profesional. Un cliente te contactó con esta información:

TIPO DE NEGOCIO: ${formData.tipoNegocio}
NOMBRE: ${formData.nombreNegocio}
EXPERIENCIA: ${formData.tiempoNegocio}
CLIENTES IDEALES: ${formData.clientesTarget}
PROPUESTA ÚNICA: ${formData.propuestaUnica}
SERVICIOS PRINCIPALES: ${formData.serviciosPrincipales}
TONO DE COMUNICACIÓN: ${formData.comunicacion}
PRESUPUESTO: ${formData.presupuesto}
PRESENCIA ONLINE: ${formData.presenciaOnline}
MEJORAS PRINCIPALES: ${formData.mejorasPrincipales}
OBJETIVO: ${formData.objetivo}
COLORES PREFERIDOS: ${formData.coloresPreferidos}
COMENTARIOS: ${formData.comentariosAdicionales}

Genera una PROPUESTA PROFESIONAL que incluya:
1. Análisis del Negocio
2. Estrategia Visual
3. Plan de Implementación
4. Timeline
5. Inversión Estimada

700-900 palabras, profesional y convincente.`;

        const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-opus-4-6',
                max_tokens: 2000,
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Claude API error:', errorText);
            return res.status(apiResponse.status).json({ error: `API Error: ${apiResponse.status}` });
        }

        const data = await apiResponse.json();
        
        if (!data.content || !data.content[0] || !data.content[0].text) {
            console.error('Unexpected API response:', data);
            return res.status(500).json({ error: 'Invalid API response' });
        }

        const proposal = data.content[0].text;

        return res.status(200).json({ proposal });

    } catch (error) {
        console.error('Endpoint error:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
}
