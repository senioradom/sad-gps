import L from 'leaflet';
import 'leaflet-draw';
import * as drawLocales from 'leaflet-draw-locales';

class LeafletDrawService {
    _MAX_NUMBER_OF_CIRCLES = 10;

    _FRANCE_CENTERED = {
        lat: 46.92,
        lng: 2.68,
        zoom: 6
    };

    constructor() {
        window.leafletDrawServiceInstance = this;
    }

    // --------------------
    // Public
    // --------------------
    generateMap(el, geoJSON) {
        // drawLocales(this.localeService.getLocale() as drawLocales.Languages);

        const config = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {});

        this.map = L.map(el, {
            center: [this._FRANCE_CENTERED.lat, this._FRANCE_CENTERED.lng],
            zoom: this._FRANCE_CENTERED.zoom,
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

        this._initEventListeners();

        if (geoJSON) {
            this._importGeoJSON(geoJSON);
        }
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

    exportGeoJSON() {
        const geoJson = this.featureGroup.toGeoJSON();
        const layers = this.featureGroup._layers;

        let layerFound = null;
        for (const feature of geoJson.features) {
            const lat = feature.geometry.coordinates[1];
            const lng = feature.geometry.coordinates[0];

            for (const layerKey in layers) {
                if (layers.hasOwnProperty(layerKey)) {
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

    deleteAllLayers() {
        this.featureGroup.clearLayers();
    }

    // --------------------
    // Privates
    // --------------------
    // --
    // Methods
    // --------------------
    _importGeoJSON(geojson) {
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

            this._centerMap();
        }
    }

    _initPopup(layer) {
        const id = this.featureGroup.getLayerId(layer);
        let label = layer.feature.properties.label;
        if (!label) {
            label = `zone ${this.featureGroup.getLayers().length}`;
        }

        const popup = new L.popup({
            autoPan: false,
            closeButton: false,
            autoClose: false,
            closeOnClick: false,
            closeOnEscapeKey: false,
        });

        popup.setContent(this._createPopUpContent(id, label));
        popup.setLatLng(layer.getLatLng());

        layer.bindPopup(popup);
        layer.off('click', this.openPopup);

        popup.addTo(this.map);
    }

    _disableEditIfMaxNumberOfCircleslReached() {
        if (this.featureGroup.getLayers().length >= this._MAX_NUMBER_OF_CIRCLES) {
            this.controlDraw.setDrawingOptions({
                circle: false
            });

            this.map.removeControl(this.controlDraw);
            this.map.addControl(this.controlDraw);
        }
    }

    _setFeatureProperties(layer) {
        if (layer instanceof L.Circle) {
            layer.feature.properties.radius = layer.getRadius();
            layer.feature.properties.drawtype = L.Draw.Circle.TYPE;
        }
        if (layer instanceof L.Marker) {
            layer.feature.properties.drawtype = L.Draw.Marker.TYPE;
        }
    }

    _centerMap() {
        if (!(Object.keys(this.featureGroup.getBounds()).length === 0 && this.featureGroup.getBounds().constructor === Object)) {
            this.map.fitBounds(this.featureGroup.getBounds());
        }
    }

    _createPopUpContent(id, label) {
        // <i><small>Nom de la zone</small></i><br>
        return `
            <input id="label-${id}" type="text" value="${label}" maxlength="10" onfocusout="leafletDrawServiceInstance.setLabel(${id})">
        `;
        // <input type="button" value="Save" onclick="leafletDrawServiceInstance.setLabel(${id})">
    }

    _setLabel(id) {
        const label = document.getElementById(`label-${id}`).value;
        this.featureGroup.getLayer(id).feature.properties.label = label;
        this.featureGroup.getLayer(id).setPopupContent(this._createPopUpContent(id, label));

        this._emitEvent('mapEdited');
    }

    // --
    // Events handler
    // --------------------
    _emitEvent(type) {
        document.dispatchEvent(new Event(type));
    }

    _initEventListeners() {
        // Events listeners
        this.map.on(L.Draw.Event.CREATED, this._drawCreatedEvent.bind(this));

        this.map.on(L.Draw.Event.EDITED, this._drawEditedEvent.bind(this));

        this.map.on(L.Draw.Event.DELETED, this._drawDeletedEvent.bind(this));

        // Events debugging
        this.map.on(L.Draw.Event.DRAWSTART, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.DRAWSTOP, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.DRAWVERTEX, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.EDITSTART, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.EDITMOVE, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.EDITRESIZE, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.EDITVERTEX, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.EDITSTOP, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.DELETESTART, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.DELETESTOP, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.TOOLBAROPENED, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.TOOLBARCLOSED, this._debugEvent.bind(this));
        this.map.on(L.Draw.Event.MARKERCONTEXT, this._debugEvent.bind(this));
    }

    _drawCreatedEvent(e) {
        this.featureGroup.addLayer(e.layer);

        e.layer.feature = e.layer.feature || {};
        e.layer.feature.properties = e.layer.feature.properties || {};
        e.layer.feature.type = 'Feature';

        this._setFeatureProperties(e.layer);

        this._disableEditIfMaxNumberOfCircleslReached();

        this._initPopup(this.featureGroup.getLayers()[this.featureGroup.getLayers().length - 1]);

        this._emitEvent('mapEdited');
    }

    _drawEditedEvent(e) {
        e.layers.eachLayer((layer) => {
            this._setFeatureProperties.bind(this, layer);
        });

        this._emitEvent('mapEdited');
    }

    _drawDeletedEvent(e) {
        if (Object.keys(this.featureGroup._layers).length < this._MAX_NUMBER_OF_CIRCLES) {
            this.controlDraw.setDrawingOptions({
                circle: true
            });
            this.map.removeControl(this.controlDraw);
            this.map.addControl(this.controlDraw);
        }

        this._emitEvent('mapEdited');
    }

    _debugEvent(e) {
        console.log(`[debug] : Event : ${e.type}`);
    }
}

export default LeafletDrawService;
