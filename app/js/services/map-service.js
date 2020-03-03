import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet.timeline';
import drawLocales from 'leaflet-draw-locales';
import moment from 'moment';
import 'moment-timezone';

class MapService {
    _elements = {
        map: document.getElementById('js-map'),
        buttons: {
            container: document.getElementById('js-app-map__buttons-container')
        }
    };

    _debug = true;

    _mode = 'GPS-ALERTS-CONFIGURATION-MODE';

    _MAX_NUMBER_OF_CIRCLES = 10;

    _FRANCE_CENTERED = {
        lat: 46.92,
        lng: 2.68,
        zoom: 6
    };

    _initialShapes = 0;

    constructor(gpsService, notificationService, translationService, locale, distributorColor) {
        // List here : https://github.com/DenisCarriere/Leaflet.draw.locales
        if (['en', 'fr', 'es', 'sk', 'cs', 'zh'].includes(locale)) {
            drawLocales(locale);
        }

        this._colors = {
            circle: {
                view: distributorColor
            }
        };

        this._leafLetConfigOverrides();
        this._gpsService = gpsService;
        this._notificationService = notificationService;
        this._translationService = translationService;

        window.mapServiceInstance = this;
    }

    // --------------------
    // Public
    // --------------------
    generateMap(el, geoJSON) {
        const mapAsImage = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            noWrap: true
        });

        this.map = L.map(el, {
            center: [this._FRANCE_CENTERED.lat, this._FRANCE_CENTERED.lng],
            zoom: this._FRANCE_CENTERED.zoom,
            // doubleClickZoom: false,
            zoomControl: false,
            layers: [mapAsImage]
        });

        this.alertsGPSConfigurationShapesGroup = new L.FeatureGroup();
        this.alertsGPSConfigurationShapesGroup.addTo(this.map);

        this.alertsGPSConfigurationLabelsGroup = new L.FeatureGroup();
        this.alertsGPSConfigurationLabelsGroup.addTo(this.map);

        this.lastUserPositionGroup = new L.FeatureGroup();
        this.lastUserPositionGroup.addTo(this.map);

        this.userPositionsHistoryGroup = new L.FeatureGroup();
        this.userPositionsHistoryGroup.addTo(this.map);

        this.controlDraw = new L.Control.Draw({
            position: 'topright',
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
                featureGroup: this.alertsGPSConfigurationShapesGroup,
                edit: {
                    selectedPathOptions: {
                        color: this._colors.circle.view,
                        fillColor: this._colors.circle.view
                    }
                }
            }
        });
        this.controlDraw.addTo(this.map);

        this.map.addControl(L.control.zoom({ position: 'bottomleft' }));

        this._initEventListeners();

        if (geoJSON) {
            this._initialGeoJsonState = geoJSON;
            this._importGeoJSON(geoJSON);
        }
    }

    isMapDirty() {
        return this._initialGeoJsonState !== this.exportGeoJSON();
    }

    updateInitialGeoJsonState() {
        this._initialGeoJsonState = this.exportGeoJSON();
    }

    resetMap() {
        this._disableEditMode();
        this._deleteAllLayers();

        Array.from(document.querySelectorAll('[id^="js-map__custom-zone-label-"]')).forEach(element => {
            element.remove();
        });

        this._importGeoJSON(this._initialGeoJsonState);
    }

    addCurrentPositionMarker(callback) {
        this._gpsService.getLastPosition().then(result => {
            if (!(result.latitude && result.longitude && result.createdAt)) {
                return;
            }

            this.map.panTo(new L.LatLng(result.latitude, result.longitude));

            this.lastUserPositionMarker = new L.marker([result.latitude, result.longitude], {
                icon: L.divIcon({
                    className: 'user',
                    html: `
<i class="user__icon fas fa-portrait"></i>
<div class="user__label">${moment(result.createdAt).format('DD/MM/YYYY - HH:mm')}</div>
`,
                    iconSize: [30, 42],
                    iconAnchor: [15, 42]
                })
            });

            this.lastUserPositionMarker.addTo(this.lastUserPositionGroup);
            this._centerMap('lastUserPositionGroup');

            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }

    exportGeoJSON() {
        const geoJson = this.alertsGPSConfigurationShapesGroup.toGeoJSON();
        const layers = this.alertsGPSConfigurationShapesGroup._layers;

        let matchingLayer = null;

        Object.values(geoJson.features).forEach(feature => {
            const lat = feature.geometry.coordinates[1];
            const lng = feature.geometry.coordinates[0];

            Object.keys(layers).some(key => {
                if (Object.prototype.hasOwnProperty.call(layers, key)) {
                    const layer = layers[key];

                    const coords = layer.toGeoJSON().geometry.coordinates;
                    if (coords[1] === lat && coords[0] === lng) {
                        matchingLayer = layer;

                        return true;
                    }
                }

                return false;
            });

            if (matchingLayer) {
                feature.properties.radius = matchingLayer.getRadius();
            }
        });

        return JSON.stringify(geoJson);
    }

    switchAlertsConfigurationToHistoryMode(mode, callback) {
        this._mode = mode;

        const isHistoryPlaybackMode = this._mode === 'GPS-HISTORY-PLAYBACK-MODE';

        this._elements.map.dataset.mapMode = this._mode;

        if (isHistoryPlaybackMode) {
            this._elements.map.dataset.historyLoaded = false;
            this.addCurrentPositionMarker(callback);
        }

        Object.entries(this.alertsGPSConfigurationShapesGroup._layers).forEach(([key, layer]) => {
            layer.getElement().style.display = isHistoryPlaybackMode ? 'none' : 'block';
        });

        Object.entries(this.alertsGPSConfigurationLabelsGroup._layers).forEach(([key, layer]) => {
            layer.getElement().style.display = isHistoryPlaybackMode ? 'none' : 'block';
        });

        if (isHistoryPlaybackMode) {
            document.getElementById('js-close-replay').classList.remove('close-replay--hidden');
        } else {
            document.getElementById('js-close-replay').classList.add('close-replay--hidden');
        }

        if (document.querySelector('.leaflet-control.leaflet-timeline-control')) {
            document.querySelector('.leaflet-control.leaflet-timeline-control').style.display = isHistoryPlaybackMode
                ? 'block'
                : 'none';
        }

        document.querySelector('.leaflet-draw.leaflet-control').style.display = isHistoryPlaybackMode
            ? 'none'
            : 'block';

        this._elements.buttons.container.style.display = isHistoryPlaybackMode ? 'none' : 'block';

        if (!isHistoryPlaybackMode) {
            this.userPositionsHistoryGroup.clearLayers();
            this._centerMap('alertsGPSConfigurationShapesGroup');
        }
    }

    initTimeLine(start, end) {
        const data = {
            type: 'FeatureCollection',
            features: []
        };

        let lastPositionDateTime;

        let minimumDate;
        let maximumDate;

        this._gpsService.getPositions(start, end).then(result => {
            if (result.length) {
                const moments = result.map(position => moment(position.createdAt));

                minimumDate = moment.min(moments);
                maximumDate = moment.max(moments);

                result.forEach((position, index) => {
                    if (index === 0) {
                        lastPositionDateTime = moment(position.createdAt);
                    } else {
                        if (moment(position.createdAt) < moment(lastPositionDateTime).add(5, 'minutes')) {
                            return;
                        }

                        data.features[data.features.length - 1].properties.end = position.createdAt;
                    }

                    lastPositionDateTime = moment(position.createdAt);

                    data.features.push({
                        type: 'Feature',
                        properties: {
                            start: position.createdAt
                            // end: Added programmatically
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [position.longitude, position.latitude]
                        }
                    });
                });

                data.features[data.features.length - 1].properties.end =
                    data.features[data.features.length - 1].properties.start;

                Array.from(document.querySelectorAll('.leaflet-timeline-control')).forEach(element => {
                    element.remove();
                });

                this.lastUserPositionGroup.clearLayers();
                this.userPositionsHistoryGroup.clearLayers();

                const duration = moment.duration(maximumDate.diff(minimumDate));
                const hours = parseInt(duration.asHours(), 10);

                this.timelineControl = L.timelineSliderControl({
                    steps: hours,
                    duration: hours * 1000,
                    formatOutput(date) {
                        return moment(date).format('DD/MM/YYYY - HH:mm');
                    }
                });
                this.timelineControl.addTo(this.map);

                this._playGPSPositionsHistory(data);
            } else {
                Array.from(document.querySelectorAll('.leaflet-timeline-control')).forEach(element => {
                    element.remove();
                });

                this.userPositionsHistoryGroup.clearLayers();

                this._notificationService.notify(
                    this._translationService.translateString('no_data_for_given_period'),
                    'warning'
                );
            }
        });
    }

    validateDrawings() {
        if (this.controlDraw._toolbars.draw._modes.circle) {
            this.controlDraw._toolbars.draw._modes.circle.handler.disable();
        }

        this.controlDraw._toolbars.edit._modes.edit.handler.disable();
        this.controlDraw._toolbars.edit._modes.remove.handler.disable();
    }

    /**
     * @todo : Debug to remove
     */
    debugLayers() {
        console.log('map', this.map._layers);
        console.log('alertsGPSConfigurationShapesGroup', this.alertsGPSConfigurationShapesGroup._layers);
        console.log('alertsGPSConfigurationLabelsGroup', this.alertsGPSConfigurationLabelsGroup._layers);
        console.log('lastUserPositionGroup', this.lastUserPositionGroup._layers);
        console.log('userPositionsHistoryGroup', this.userPositionsHistoryGroup._layers);
        console.log('controlDraw', this.controlDraw._layers);
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
                            this._initialShapes += 1;
                            handler = this.controlDraw._toolbars.draw._modes.circle.handler;

                            this.circle = new L.Circle(latLng, feature.properties.radius, {
                                color: this._colors.circle.view,
                                weight: 2
                            });

                            this.circle.feature = feature;

                            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(handler, this.circle);
                        } else {
                            this._initialShapes += 1;

                            handler = this.controlDraw._toolbars.draw._modes.marker.handler;

                            const layer = new L.Marker(latLng, handler.options);

                            layer.feature = feature;

                            L.Draw.Feature.prototype._fireCreatedEvent.call(handler, layer);
                        }
                    }
                }
            });

            const labelsAreValid = this._checkLabelsAreValid();

            this._toggleLabelsValidStyles(labelsAreValid);
            this._toggleButtonsState(labelsAreValid);

            this._centerMap('alertsGPSConfigurationShapesGroup');
        }
    }

    _deleteAllLayers() {
        this.alertsGPSConfigurationShapesGroup.clearLayers();
        this.alertsGPSConfigurationLabelsGroup.clearLayers();
    }

    _disableEditMode() {
        Object.keys(this.controlDraw._toolbars).forEach(key => {
            if (
                Object.prototype.hasOwnProperty.call(this.controlDraw._toolbars, key) &&
                this.controlDraw._toolbars[key] instanceof L.EditToolbar
            ) {
                this.controlDraw._toolbars[key].disable();
            }
        });
    }

    _guessZoneIndex() {
        const labelsArray = [];

        document.querySelectorAll('[id^="js-map__custom-zone-label-"]').forEach(el => {
            const zoneNumber = el.value.toLowerCase().match(/\d+/);
            if (zoneNumber) {
                labelsArray.push(parseInt(zoneNumber[0], 10));
            }
        });

        labelsArray.push(0);
        labelsArray.sort();

        const [zoneMin, zoneMax] = [Math.min(...labelsArray), Math.max(...labelsArray)];
        const missingZonesIndexes = Array.from(Array(zoneMax - zoneMin), (value, index) => index + zoneMin).filter(
            index => !labelsArray.includes(index)
        );

        if (missingZonesIndexes[0]) {
            return missingZonesIndexes[0];
        }

        return this.alertsGPSConfigurationShapesGroup.getLayers().length;
    }

    _initPopup(layer) {
        const id = this.alertsGPSConfigurationShapesGroup.getLayerId(layer);
        let { label } = layer.feature.properties;
        if (!label) {
            label = this._translationService.translateString('zone', { index: this._guessZoneIndex() });
        }

        const popup = new L.popup({
            autoPan: false,
            closeButton: false,
            autoClose: false,
            closeOnClick: false,
            closeOnEscapeKey: false
        });

        popup.setContent(this._createPopUpContent(id, label));
        popup.setLatLng(layer.getLatLng());

        layer.bindPopup(popup);
        layer.off('click', this.openPopup);

        popup.addTo(this.alertsGPSConfigurationLabelsGroup);
    }

    _disableEditIfMaxNumberOfCircleslReached() {
        if (this.alertsGPSConfigurationShapesGroup.getLayers().length >= this._MAX_NUMBER_OF_CIRCLES) {
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
            circle: bool,
            shapeOptions: {
                color: this._colors.circle.view
            }
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

    _centerMap(layer) {
        if (!(Object.keys(this[layer].getBounds()).length === 0 && this[layer].getBounds().constructor === Object)) {
            this.map.fitBounds(this[layer].getBounds());
        }
    }

    _regenerateTooltips() {
        this.map.eachLayer(layer => {
            if (layer.feature && layer.feature.properties && layer.feature.properties.drawtype) {
                if (layer.feature.properties.drawtype === 'circle') {
                    this._labelArea(this.alertsGPSConfigurationShapesGroup.getLayerId(layer), false, false);
                }
            }
        });
    }

    _recoverStateBeforeDeletion() {
        this.map.eachLayer(layer => {
            if (layer.feature && layer.feature.properties && layer.feature.properties.drawtype) {
                if (layer.feature.properties.drawtype === 'circle') {
                    const id = this.alertsGPSConfigurationShapesGroup.getLayerId(layer);
                    if (!document.getElementById(`js-map__custom-zone-label-${id}`)) {
                        try {
                            layer.feature.properties.label = layer._popup._content
                                .split('\n')
                                .filter(v => v.indexOf('value="') > -1)[0]
                                .trim()
                                .replace('value="', '')
                                .replace(/"$/, '');

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
        const label = document.getElementById(`js-map__custom-zone-label-${id}`).value;
        const layer = this.alertsGPSConfigurationShapesGroup.getLayer(id);

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
            radiusInKm = this.alertsGPSConfigurationShapesGroup.getLayer(id).getRadius() / 1000;
        }

        if (radiusInKm < 1) {
            radiusInKm *= 1000;
            radiusInKm = `${radiusInKm.toFixed(0)} m`;
        } else {
            radiusInKm = `${radiusInKm.toFixed(2)} km`;
        }

        return `
            <input
                id="js-map__custom-zone-label-${id}"
                class="map__custom-zone-label"
                type="text"
                value="${label}"
                required
                autocomplete="off"
                maxlength="10"
                onkeyup="mapServiceInstance._onKeyUp(event);"
                onfocusout="mapServiceInstance._labelArea(${id}, ${distance}, true);"
            >
            <div id="js-map__custom-zone-distance-${id}" class="map__custom-zone-distance">${radiusInKm}</div>
        `;
    }

    _getDuplicatedLabels() {
        const labelsArray = [];
        document.querySelectorAll('[id^="js-map__custom-zone-label-"]').forEach(el => {
            labelsArray.push(el.value.toLowerCase());
        });

        const duplicatedLabelsArray = labelsArray.reduce((accumulator, currentValue, index, array) => {
            if (array.indexOf(currentValue) !== index && !accumulator.includes(currentValue.toLowerCase())) {
                accumulator.push(currentValue.toLowerCase());
            }

            return accumulator;
        }, []);

        return duplicatedLabelsArray;
    }

    _checkLabelsAreValid() {
        const condDuplicated = this._getDuplicatedLabels().length === 0;

        let condNotEmpty = true;
        document.querySelectorAll('[id^="js-map__custom-zone-label-"]').forEach(el => {
            if (el.value === '') {
                condNotEmpty = false;
            }
        });

        // @todo : Can do with extra check on 10 chars max length (currently checked via HTML input rule)

        return condNotEmpty && condDuplicated;
    }

    _toggleLabelsValidStyles(isValid) {
        if (isValid) {
            document
                .querySelectorAll('[id^="js-map__custom-zone-label-"].map__custom-zone-label--not-valid')
                .forEach(el => {
                    el.classList.remove('map__custom-zone-label--not-valid');
                });
        } else {
            const duplicatedLabelsArray = this._getDuplicatedLabels();

            document.querySelectorAll('[id^="js-map__custom-zone-label-"]').forEach(el => {
                if (duplicatedLabelsArray.includes(el.value.toLowerCase()) || el.value === '') {
                    el.classList.add('map__custom-zone-label--not-valid');
                } else {
                    el.classList.remove('map__custom-zone-label--not-valid');
                }
            });
        }
    }

    _toggleButtonsState(isValid) {
        const buttons = document.querySelectorAll('.app-map__button');
        if (isValid) {
            buttons.forEach(button => {
                button.classList.remove('app-map__button--disabled');
            });
        } else {
            buttons.forEach(button => {
                button.classList.add('app-map__button--disabled');
            });
        }
    }

    _leafLetConfigOverrides() {
        L.Draw.Circle = L.Draw.Circle.extend({
            options: {
                shapeOptions: {
                    color: this._colors.circle.view,
                    weight: 2
                }
            }
        });
    }

    _playGPSPositionsHistory(positionsHistoryData) {
        this.timeline = L.timeline(positionsHistoryData, {
            pointToLayer(data, latlng) {
                const divIcon = L.divIcon({
                    className: 'user',
                    html: `
<i class="user__icon fas fa-portrait"></i>
<div class="user__label">${moment(data.properties.start).format('DD/MM/YYYY - HH:mm')}</div>
`,
                    iconSize: [30, 42],
                    iconAnchor: [15, 42]
                });

                return L.marker(latlng, {
                    icon: divIcon
                });
            }
        });

        this.timelineControl.addTimelines(this.timeline);
        this.timeline.addTo(this.userPositionsHistoryGroup);

        document.querySelector('.leaflet-timeline-control .play').click();

        this.timeline.on('change', e => {
            try {
                this._centerMap('userPositionsHistoryGroup');
            } catch (exception) {}
        });

        this._elements.map.dataset.historyLoaded = true;
    }

    // --
    // Events handler
    // --------------------
    _emitEvent(type) {
        if (this._checkLabelsAreValid()) {
            this._toggleLabelsValidStyles(true);
            this._toggleButtonsState(true);

            document.dispatchEvent(new Event(type));
        } else {
            this._toggleLabelsValidStyles(false);
            this._toggleButtonsState(false);

            this._notificationService.notify(
                this._translationService.translateString('zones_validation_failure'),
                'danger'
            );
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

        if (this._checkLabelsAreValid()) {
            this._toggleLabelsValidStyles(true);
        } else {
            this._toggleLabelsValidStyles(false);
        }
    }

    _drawCreatedEvent(e) {
        this.alertsGPSConfigurationShapesGroup.addLayer(e.layer);

        e.layer.feature = e.layer.feature || {};
        e.layer.feature.properties = e.layer.feature.properties || {};
        e.layer.feature.type = 'Feature';

        this._setFeatureProperties(e.layer);

        this._disableEditIfMaxNumberOfCircleslReached();

        this._initPopup(
            this.alertsGPSConfigurationShapesGroup.getLayers()[
                this.alertsGPSConfigurationShapesGroup.getLayers().length - 1
            ]
        );

        if (this._initialShapes > 0) {
            this._initialShapes -= 1;
        } else {
            this._emitEvent('mapEdited');
        }
    }

    _drawEditedResizeEvent(e) {
        this._labelArea(e.layer._leaflet_id, e.layer.getRadius(), false);
    }

    _drawEditedEvent(e) {
        e.layers.eachLayer(layer => {
            this._setFeatureProperties.bind(this, layer);
        });

        this._emitEvent('mapEdited');
    }

    _drawDeletedEvent() {
        if (Object.keys(this.alertsGPSConfigurationShapesGroup._layers).length < this._MAX_NUMBER_OF_CIRCLES) {
            this.controlDraw.setDrawingOptions({
                circle: true,
                shapeOptions: {
                    color: this._colors.circle.view
                }
            });
            this.map.removeControl(this.controlDraw);
            this.map.addControl(this.controlDraw);
        }

        this._emitEvent('mapEdited');
    }

    _drawEditStopEvent() {
        this._regenerateTooltips();
    }

    _drawDeleteStopEvent() {
        this._recoverStateBeforeDeletion();
    }

    // _drawToolbarClosedEvent(e) {
    //     this._regenerateTooltips();
    // }

    _debugEvent(e) {
        console.log(`[debug] : Event : ${e.type}`);

        switch (e.type) {
            // case 'draw:editstop':
            // case 'draw:deletestop':
            case 'draw:toolbarclosed':
                // setTimeout(() => {
                //     this._regenerateTooltips();
                //     console.log('foo');
                // }, 1000)
                break;
            default:
                break;
        }
    }
}

export default MapService;
