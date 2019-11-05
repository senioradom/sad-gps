import L from 'leaflet';
import 'leaflet-draw';
import * as drawLocales from 'leaflet-draw-locales';
import NotificationService from "./notification-service";

class LeafletDrawService {
    _debug = true;

    _MAX_NUMBER_OF_CIRCLES = 10;

    _FRANCE_CENTERED = {
        lat: 46.92,
        lng: 2.68,
        zoom: 6
    };

    _initialShapes = 0;

    constructor() {
        this.notificationService = new NotificationService();

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
                    feet: false,
                    shapeOptions: {
                        color: '#7a7a7a'
                    }
                },
                marker: false,
                circlemarker: false,
                polygon: false,
                polyline: false,
                rectangle: false
            },
            edit: {
                featureGroup: this.featureGroup,
                edit: {
                    selectedPathOptions: {
                        color: '#00acf0',
                        fillColor: '#00acf0'
                    }
                }
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
            this._initialGeoJsonState = geoJSON;
            this._importGeoJSON(geoJSON);
        }
    }

    resetMap() {
        this._disableEditMode();
        this._deleteAllLayers();
        this._importGeoJSON(this._initialGeoJsonState);
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

            this._enableEdit();

            features.forEach(feature => {
                if (feature.type === 'Feature') {
                    if (feature.geometry.type === 'Point') {
                        const latLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);

                        let handler;
                        if (feature.properties.drawtype === L.Draw.Circle.TYPE) {
                            this._initialShapes++;
                            handler = this.controlDraw._toolbars.draw._modes.circle.handler;
                            this.circle = new L.Circle(latLng, feature.properties.radius, handler.options.shapeOptions);
                            this.circle.feature = feature;
                            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(handler, this.circle);
                        } else {
                            this._initialShapes++;
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

    _deleteAllLayers() {
        this.featureGroup.clearLayers();
    }

    _disableEditMode() {
        for (let key in this.controlDraw._toolbars) {
            if (this.controlDraw._toolbars.hasOwnProperty(key) && this.controlDraw._toolbars[key] instanceof L.EditToolbar) {
                this.controlDraw._toolbars[key].disable();
            }
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
            this._disableEdit();
        }
    }

    _disableEdit() {
        this._toggleEdit(false);
    }

    _enableEdit() {
        this._toggleEdit(true);
    }

    _toggleEdit(bool) {
        this.controlDraw.setDrawingOptions({
            circle: bool
        });

        this.map.removeControl(this.controlDraw);
        this.map.addControl(this.controlDraw);
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

    _regenerateTooltips() {
        this.map.eachLayer((layer) => {
            if (layer.feature && layer.feature.properties && layer.feature.properties.drawtype) {
                if (layer.feature.properties.drawtype === 'circle') {
                    this._labelArea(this.featureGroup.getLayerId(layer), false, false);
                }
            }
        });
    }

    _recoverStateBeforeDeletion() {
        this.map.eachLayer((layer) => {
            if (layer.feature && layer.feature.properties && layer.feature.properties.drawtype) {
                if (layer.feature.properties.drawtype === 'circle') {
                    const id = this.featureGroup.getLayerId(layer);
                    if (!document.getElementById(`label-${id}`)) {
                        try {
                            const originalLabel = layer._popup._content.split('\n').filter(v => v.indexOf('value="') > -1)[0].trim().replace('value="', '').replace(/"$/, '');
                            layer.feature.properties.label = originalLabel;

                            this._initPopup(layer);
                        } catch (e) {
                            layer.remove();
                        }
                    }
                }
            }
        });
    }

    _labelArea(id, distance, save) {
        const label = document.getElementById(`label-${id}`).value;
        const layer = this.featureGroup.getLayer(id);

        layer.feature.properties.label = label;
        layer.setPopupContent(this._createPopUpContent(id, label, distance));

        if (save) {
            this._emitEvent('mapEdited');
        }
    }

    _createPopUpContent(id, label, distance) {
        let radiusInKm;
        if (distance) {
            radiusInKm = distance / 1000;
        } else {
            // radiusInKm = (this.featureGroup.getLayer(id).feature.properties.radius / 1000);
            radiusInKm = (this.featureGroup.getLayer(id)._mRadius / 1000);
        }

        if (radiusInKm < 1) {
            radiusInKm *= 1000;
            radiusInKm = `${radiusInKm.toFixed(0)} m`
        } else {
            radiusInKm = `${radiusInKm.toFixed(2)} km`
        }

        return `
            <input 
                id="label-${id}" 
                type="text" 
                value="${label}" 
                required
                autocomplete="off"
                maxlength="10"
                onkeyup="leafletDrawServiceInstance._onKeyUp(event);"
                onfocusout="leafletDrawServiceInstance._labelArea(${id}, ${distance}, true);"
            >
            <div id="distance-${id}">${radiusInKm}</div>
        `;
    }

    _getDuplicatedLabels() {
        const labelsArray = [];
        document.querySelectorAll('[id^="label-"]').forEach(function (el) {
            labelsArray.push(el.value);
        });

        const duplicatedLabelsArray = labelsArray.reduce((accumulator, currentValue, index, array) => {
            if (array.indexOf(currentValue) !== index && !accumulator.includes(currentValue)) {
                accumulator.push(currentValue)
            }

            return accumulator;
        }, []);

        return duplicatedLabelsArray;
    }

    _checkLabels() {
        const condDuplicated = this._getDuplicatedLabels().length === 0;

        let condNotEmpy = true;
        document.querySelectorAll('[id^="label-"]').forEach((el) => {
            if (el.value === '') {
                condNotEmpy = false;
            }
        });

        // @todo : Can do with extra check on 10 chars max length (currently checked via HTML input rule)

        return condNotEmpy && condDuplicated;
    }

    _updateLabels(isValid) {
        if (isValid) {
            document.querySelectorAll('[id^="label-"].not-valid').forEach(function (el) {
                el.classList.remove('not-valid');
            });
        } else {
            const duplicatedLabelsArray = this._getDuplicatedLabels();

            document.querySelectorAll('[id^="label-"]').forEach(function (el) {
                if (duplicatedLabelsArray.includes(el.value) || el.value === '') {
                    el.classList.add('not-valid');
                } else {
                    el.classList.remove('not-valid');
                }
            });
        }
    }

    // --
    // Events handler
    // --------------------
    _emitEvent(type) {
        if (this._checkLabels()) {
            this._updateLabels(true);

            document.dispatchEvent(new Event(type));
        } else {
            this._updateLabels(false);

            this.notificationService.notify('FAILURE', 'Labels validation failed...');
        }
    }

    _initEventListeners() {
        // Events listeners
        this.map.on(L.Draw.Event.CREATED, this._drawCreatedEvent.bind(this));

        this.map.on(L.Draw.Event.EDITED, this._drawEditedEvent.bind(this));

        this.map.on(L.Draw.Event.DELETED, this._drawDeletedEvent.bind(this));

        this.map.on(L.Draw.Event.EDITRESIZE, this._drawEditedResizeEvent.bind(this));

        this.map.on(L.Draw.Event.EDITSTOP, this._drawEditStopEvent.bind(this));

        this.map.on(L.Draw.Event.DELETESTOP, this._drawDeleteStopEvent.bind(this));

        // Events debugging
        if (this._debug) {
            this.map.on(L.Draw.Event.DRAWSTART, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.DRAWSTOP, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.DRAWVERTEX, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.EDITSTART, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.EDITMOVE, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.EDITVERTEX, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.DELETESTART, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.DELETESTOP, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.TOOLBAROPENED, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.TOOLBARCLOSED, this._debugEvent.bind(this));
            this.map.on(L.Draw.Event.MARKERCONTEXT, this._debugEvent.bind(this));
        }
    }

    _onKeyUp(event) {
        if (event.keyCode === 13) {
            if (document && document.activeElement) {
                document.activeElement.blur();
            }
        }

        if (this._checkLabels()) {
            this._updateLabels(true);
        } else {
            this._updateLabels(false);
        }
    }

    _drawCreatedEvent(e) {
        this.featureGroup.addLayer(e.layer);

        e.layer.feature = e.layer.feature || {};
        e.layer.feature.properties = e.layer.feature.properties || {};
        e.layer.feature.type = 'Feature';

        this._setFeatureProperties(e.layer);

        this._disableEditIfMaxNumberOfCircleslReached();

        this._initPopup(this.featureGroup.getLayers()[this.featureGroup.getLayers().length - 1]);

        if (this._initialShapes > 0) {
            this._initialShapes--;
        } else {
            this._emitEvent('mapEdited');
        }
    }

    _drawEditedResizeEvent(e) {
        this._labelArea(e.layer._leaflet_id, e.layer._mRadius, false);
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

    _drawEditStopEvent(e) {
        this._regenerateTooltips();
    }

    _drawDeleteStopEvent(e) {
        this._recoverStateBeforeDeletion();
    }
    _debugEvent(e) {
        console.log(`[debug] : Event : ${e.type}`);

        switch (e.type) {
            case 'draw:editstop':
                //
                break;
        }
    }
}

export default LeafletDrawService;
