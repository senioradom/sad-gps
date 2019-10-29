import L from 'leaflet';
import 'leaflet-draw';
import * as drawLocales from 'leaflet-draw-locales';

class LeafletDrawService {
    MAX_NUMBER_OF_CIRCLES = 10;

    FRANCE_CENTERED = {
        lat: 46.92,
        lng: 2.68,
        zoom: 6
    };

    constructor(
    ) {
    }

    generateMap(el, geoJSON) {
        // drawLocales(this.localeService.getLocale() as drawLocales.Languages);

        const config = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {});

        this.map = L.map(el, {
            center: [this.FRANCE_CENTERED.lat, this.FRANCE_CENTERED.lng],
            zoom: this.FRANCE_CENTERED.zoom,
            zoomControl: true,
            layers: [config]
        });

        this.featureGroup = new L.FeatureGroup();
        this.featureGroup.addTo(this.map);

        this.controlDraw = new L.Control.Draw({
            draw: {
                circle: {
                    feet: false
                },
                marker: false,
                circlemarker: false,
                polygon: false,
                polyline: false,
                rectangle: false
            },
            edit: {
                featureGroup: this.featureGroup
            }
        }).addTo(this.map);

        L.control.layers({
            // [this.translateService.instant('MAP.MAP')]: config.addTo(this.map),
            // [this.translateService.instant('MAP.SATELLITE')]: L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
            'Carte': config.addTo(this.map),
            'Satellite': L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
                attribution: 'google'
            })
        }, {}, {
            position: 'topright',
            collapsed: false
        }).addTo(this.map);

        this.map.on(L.Draw.Event.CREATED, this.drawCreatedEvent.bind(this));

        this.map.on(L.Draw.Event.EDITED, this.drawEditedEvent.bind(this));

        this.map.on(L.Draw.Event.DELETED, this.drawDeletedEvent.bind(this));

        if (geoJSON) {
            this.importGeoJSON(geoJSON);
        }
    }

    drawCreatedEvent(e) {
        this.featureGroup.addLayer(e.layer);

        e.layer.feature = e.layer.feature || {};
        e.layer.feature.properties = e.layer.feature.properties || {};
        e.layer.feature.type = 'Feature';

        this.setFeatureProperties(e.layer);

        this.disableEditIfMaxNumberOfCircleslReached();

        this.emitEvent();
    }

    drawEditedEvent(e) {
        e.layers.eachLayer((layer) => {
            this.setFeatureProperties.bind(this, layer);
        });

        this.emitEvent();
    }

    drawDeletedEvent(e) {
        if (Object.keys(this.featureGroup._layers).length < this.MAX_NUMBER_OF_CIRCLES) {
            this.controlDraw.setDrawingOptions({
                circle: true
            });
            this.map.removeControl(this.controlDraw);
            this.map.addControl(this.controlDraw);
        }

        this.emitEvent();
    }

    disableEditIfMaxNumberOfCircleslReached() {
        if (Object.keys(this.featureGroup._layers).length >= this.MAX_NUMBER_OF_CIRCLES) {
            this.controlDraw.setDrawingOptions({
                circle: false
            });

            this.map.removeControl(this.controlDraw);
            this.map.addControl(this.controlDraw);
        }
    }

    setFeatureProperties(layer) {
        if (layer instanceof L.Circle) {
            layer.feature.properties.radius = layer.getRadius();
            layer.feature.properties.drawtype = L.Draw.Circle.TYPE;
        }
        if (layer instanceof L.Marker) {
            layer.feature.properties.drawtype = L.Draw.Marker.TYPE;
        }
    }

    importGeoJSON(geojson) {
        if (geojson) {
            let features;
            try {
                features = JSON.parse(geojson).features;
            } catch (ex) {
                console.log('Failed to parse as JSON...');
                return;
            }

            features.forEach(feature => {
                if (feature.type === 'Feature') {
                    if (feature.geometry.type === 'Point') {
                        const latLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                        let handler;

                        if (feature.properties.drawtype === L.Draw.Circle.TYPE) {
                            handler = this.controlDraw._toolbars.draw._modes.circle.handler;
                            this.circle = new L.Circle(latLng, feature.properties.radius, handler.options.shapeOptions);
                            this.circle.feature = feature;
                            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(handler, this.circle);
                        } else {
                            handler = this.controlDraw._toolbars.draw._modes.marker.handler;
                            const layer = new L.Marker(latLng, handler.options);
                            layer.feature = feature;
                            L.Draw.Feature.prototype._fireCreatedEvent.call(handler, layer);
                        }
                    }
                }
            });

            if (!(Object.keys(this.featureGroup.getBounds()).length === 0 && this.featureGroup.getBounds().constructor === Object)) {
                this.map.fitBounds(this.featureGroup.getBounds());
            }
        }
    }

    // Fix for radius not applied bug.
    exportGeoJSON() {
        const geoJson = this.featureGroup.toGeoJSON();
        const layers = this.featureGroup._layers;

        let layerFound = null;
        for (const feature of geoJson.features) {
            const lat = feature.geometry.coordinates[1];
            const lng = feature.geometry.coordinates[0];

            for (const layerKey in layers) {
                if (layers[layerKey]) {
                    const layer = layers[layerKey];

                    const coords = layer.toGeoJSON().geometry.coordinates;
                    if (coords[1] === lat && coords[0] === lng) {
                        layerFound = layer;
                        break;
                    }
                }
            }
            if (layerFound) {
                feature.properties.radius = layerFound._mRadius;
            }
        }

        return JSON.stringify(geoJson);
    }

    addMarker(latitude, longitude) {
        if (latitude && longitude) {
            if (this.marker) {
                this.map.removeLayer(this.marker);
            }

            this.map.panTo(new L.LatLng(latitude, longitude));
            this.marker = new L.Marker(new L.LatLng(latitude, longitude)).addTo(this.map);
        }
    }

    deleteAllLayers() {
        this.featureGroup.clearLayers();
    }

    emitEvent() {
        const  myCustomEvent = new Event('mapEdited');

        document.dispatchEvent(myCustomEvent);
    }
}

export default LeafletDrawService;
