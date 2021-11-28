const displayMap = (locations) => {
    const coordinates = locations.map((loc) => loc.coordinates);

    mapboxgl.accessToken =
        "pk.eyJ1IjoiY2hyaXNuZ3V5ZW4xMTA5IiwiYSI6ImNrd2MzYmZ1bmF5NW4ydXMxeGQzc2h3YmsifQ.Ekx3dqYu5F_F9uye63O4iw";

    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/chrisnguyen1109/ckwc5pxehf26b14pa6esg3v84",
        scrollZoom: false,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        // Create marker
        const el = document.createElement("div");
        el.className = "marker";

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom",
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30,
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 150,
            right: 150,
        },
    });

    map.on("load", function () {
        map.addLayer({
            id: "route",
            type: "line",
            source: {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates,
                    },
                },
            },
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": "#55c57a",
                "line-opacity": 0.6,
                "line-width": 3,
            },
        });
    });
};

export default { displayMap };
