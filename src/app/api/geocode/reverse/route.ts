export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return Response.json({ error: "Missing lat/lng" }, { status: 400 });
    }

    const latNumber = Number(lat);
    const lngNumber = Number(lng);
    if (!Number.isFinite(latNumber) || !Number.isFinite(lngNumber)) {
      return Response.json({ error: "Invalid lat/lng" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

    if (apiKey) {
      const googleRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latNumber},${lngNumber}&key=${apiKey}`,
      );

      if (googleRes.ok) {
        const googleData = await googleRes.json();
        if (googleData?.results?.length) {
          return Response.json({
            address: googleData.results[0].formatted_address,
            source: "google",
          });
        }
      }
    }

    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latNumber}&lon=${lngNumber}`,
      {
        headers: {
          "User-Agent": "shifa-app/1.0",
          Accept: "application/json",
        },
      },
    );

    if (osmRes.ok) {
      const osmData = await osmRes.json();
      if (osmData?.display_name) {
        return Response.json({
          address: osmData.display_name,
          source: "osm",
        });
      }
    }

    return Response.json({
      address: `${latNumber.toFixed(5)}, ${lngNumber.toFixed(5)}`,
      source: "fallback",
    });
  } catch (err: unknown) {
    return Response.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unexpected reverse geocode error",
      },
      { status: 500 },
    );
  }
}
