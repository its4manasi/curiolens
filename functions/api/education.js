export async function onRequestGet(context) {
  const apiKey = context.env.DATA_GOV_API_KEY;
  const resourceId = context.env.DATA_GOV_EDUCATION_RESOURCE_ID;

  if (!apiKey || !resourceId) {
    return Response.json(
      {
        message: 'Missing DATA_GOV_API_KEY or DATA_GOV_EDUCATION_RESOURCE_ID in Cloudflare Pages environment variables.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const url = new URL(`https://api.data.gov.in/resource/${resourceId}`);
  url.searchParams.set('api-key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '100');

  try {
    const upstream = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      cf: { cacheTtl: 21600, cacheEverything: true },
    });

    if (!upstream.ok) {
      return Response.json(
        { message: `data.gov.in returned ${upstream.status}. Check the resource ID and API access.` },
        { status: 502, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const body = await upstream.json();

    return Response.json(
      { records: Array.isArray(body.records) ? body.records : [] },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=21600',
        },
      }
    );
  } catch {
    return Response.json(
      { message: 'Could not reach data.gov.in right now.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
