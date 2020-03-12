import tippy from 'tippy.js';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet.timeline';
import drawLocales from 'leaflet-draw-locales';
import moment from 'moment';
import 'moment-timezone';

class MapService {
    constructor(
        apiService,
        notificationService,
        translationService,
        locale,
        screenSize,
        distributorColor,
        isDevEnvironment
    ) {
        this._initializeVariables(distributorColor, isDevEnvironment);

        // List here : https://github.com/DenisCarriere/Leaflet.draw.locales
        if (['en', 'fr', 'es', 'sk', 'cs', 'zh'].includes(locale)) {
            drawLocales(locale);
        }

        this._apiService = apiService;
        this._notificationService = notificationService;
        this._translationService = translationService;

        this._screenSize = screenSize;

        this._overridesLeafLetConfiguration();
    }

    // --------------------
    // Public
    // --------------------
    generateMap(el, geoJSON) {
        const mapAsImage = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            noWrap: true
        });

        this._map = L.map(el, {
            center: [this._FRANCE_CENTERED.lat, this._FRANCE_CENTERED.lng],
            zoom: this._FRANCE_CENTERED.zoom,
            zoomControl: false,
            layers: [mapAsImage]
        });

        this._alertsGPSConfigurationShapesGroup = new L.FeatureGroup();
        this._alertsGPSConfigurationShapesGroup.addTo(this._map);

        this._alertsGPSConfigurationLabelsGroup = new L.FeatureGroup();
        this._alertsGPSConfigurationLabelsGroup.addTo(this._map);

        this._lastUserPositionGroup = new L.FeatureGroup();
        this._lastUserPositionGroup.addTo(this._map);

        this._userPositionsHistoryGroup = new L.FeatureGroup();
        this._userPositionsHistoryGroup.addTo(this._map);

        this._addressSearchGroup = new L.FeatureGroup();
        this._addressSearchGroup.addTo(this._map);

        this._controlDraw = new L.Control.Draw({
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
                featureGroup: this._alertsGPSConfigurationShapesGroup,
                edit: {
                    selectedPathOptions: {
                        color: this._colors.circle.view,
                        fillColor: this._colors.circle.view
                    }
                }
            }
        });
        this._controlDraw.addTo(this._map);

        this._map.addControl(
            L.control.zoom({
                zoomInTitle: this._translationService.translateString('ZOOM_IN'),
                zoomOutTitle: this._translationService.translateString('ZOOM_OUT'),
                position: 'bottomleft'
            })
        );

        this._initEventListeners();

        if (geoJSON) {
            this._originalGeoJson = geoJSON;
            this._importGeoJSON(geoJSON);
        }

        this._generateTooltips();
    }

    exportGeoJSON() {
        const geoJson = this._alertsGPSConfigurationShapesGroup.toGeoJSON();
        const layers = this._alertsGPSConfigurationShapesGroup._layers;

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

    resetMapToOriginalStage() {
        this._disableEditMode();
        this._deleteAllLayers();

        Array.from(document.querySelectorAll(this._elements.selectors.inputTextLabels)).forEach(element => {
            element.remove();
        });

        this._importGeoJSON(this._originalGeoJson);
    }

    backupOriginalGeoJson() {
        this._originalGeoJson = this.exportGeoJSON();
    }

    switchMode(mode, callback) {
        this._lastUserPositionGroup.clearLayers();
        this._addressSearchGroup.clearLayers();

        this._mode = mode;

        const isHistoryPlaybackMode = this._mode === 'GPS-HISTORY-PLAYBACK-MODE';

        this._elements.app.dataset.mapMode = this._mode;

        if (isHistoryPlaybackMode) {
            this._elements.map.dataset.historyLoaded = false;
            this._addLastKnownUserGPSLocation(callback);
        } else if (callback && typeof callback === 'function') {
            callback();
        }

        Object.entries(this._alertsGPSConfigurationShapesGroup._layers).forEach(([key, layer]) => {
            layer.getElement().style.display = isHistoryPlaybackMode ? 'none' : 'block';
        });

        Object.entries(this._alertsGPSConfigurationLabelsGroup._layers).forEach(([key, layer]) => {
            layer.getElement().style.display = isHistoryPlaybackMode ? 'none' : 'block';
        });

        if (!isHistoryPlaybackMode) {
            Array.from(document.querySelectorAll('.leaflet-timeline-control')).forEach(element => {
                element.remove();
            });

            this._userPositionsHistoryGroup.clearLayers();
            this._centerMapFromProvidedLayer('_alertsGPSConfigurationShapesGroup');
        }
    }

    playGPSHistory(start, end) {
        const data = {
            type: 'FeatureCollection',
            features: []
        };

        let lastPositionDateTime;

        let minimumDate;
        let maximumDate;

        this._apiService.getPositions(start, end).then(result => {
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

                this._lastUserPositionGroup.clearLayers();
                this._userPositionsHistoryGroup.clearLayers();

                const duration = moment.duration(maximumDate.diff(minimumDate));
                const hours = parseInt(duration.asHours(), 10);

                this._timelineControl = L.timelineSliderControl({
                    steps: hours,
                    duration: hours * 1000,
                    formatOutput(date) {
                        return moment(date).format('DD/MM/YYYY - HH:mm');
                    }
                });
                this._timelineControl.addTo(this._map);

                this._addTimelineElementAndEvents(data);
            } else {
                Array.from(document.querySelectorAll('.leaflet-timeline-control')).forEach(element => {
                    element.remove();
                });

                this._userPositionsHistoryGroup.clearLayers();

                this._notificationService.notify(
                    this._translationService.translateString('NO_DATA_FOR_GIVEN_PERIOD'),
                    'warning',
                    7000
                );
            }
        });
    }

    checkNumberOfCirclesAndEnableDisableNewAdditions() {
        if (Object.keys(this._alertsGPSConfigurationShapesGroup._layers).length < this._MAX_NUMBER_OF_CIRCLES) {
            this._controlDraw.setDrawingOptions({
                circle: true,
                shapeOptions: {
                    color: this._colors.circle.view
                }
            });
            this._map.removeControl(this._controlDraw);
            this._map.addControl(this._controlDraw);
        }

        if (this._controlDraw._toolbars.draw._modes.circle) {
            this._controlDraw._toolbars.draw._modes.circle.handler.disable();
        }

        this._controlDraw._toolbars.edit._modes.edit.handler.disable();
        this._controlDraw._toolbars.edit._modes.remove.handler.disable();

        this._generateTooltips();
    }

    zoomAtCoordinates(latitude, longitude) {
        this._addressSearchGroup.clearLayers();
        this._map.panTo(new L.LatLng(latitude, longitude));

        const pinPositionMarkerIcon = new L.marker([latitude, longitude], {
            icon: L.divIcon({
                className: 'pointer-map-pin',
                html: `<i class="pointer-map-pin__icon fas fa-map-pin"></i>`,
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            })
        });

        pinPositionMarkerIcon.addTo(this._addressSearchGroup);
        this._centerMapFromProvidedLayer('_addressSearchGroup');
    }

    isMapFormStateDirty() {
        return this._originalGeoJson !== this.exportGeoJSON();
    }

    // --------------------
    // Privates
    // --------------------
    // --
    // Methods
    // --------------------
    _initializeVariables(distributorColor, isDevEnvironment) {
        this._elements = {
            app: document.getElementById('js-app-map'),
            map: document.getElementById('js-map'),
            buttons: {
                container: document.getElementById('js-app-map__buttons-container')
            },
            selectors: {
                inputTextLabels: '[id^="js-map__custom-zone-label-"]'
            }
        };

        this._isDevEnvironment = isDevEnvironment;

        this._DRAWING_MODE = false;
        this._mode = this._elements.app.dataset.mapMode;

        this._MAX_NUMBER_OF_CIRCLES = 10;
        this._initialShapes = 0;

        this._FRANCE_CENTERED = {
            lat: 46.92,
            lng: 2.68,
            zoom: 6
        };

        this._colors = {
            circle: {
                view: distributorColor
            }
        };

        window.sad = window.sad || {};
        window.sad.mapServiceInstance = this;
    }

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
                            handler = this._controlDraw._toolbars.draw._modes.circle.handler;

                            this.circle = new L.Circle(latLng, feature.properties.radius, {
                                color: this._colors.circle.view,
                                weight: 2
                            });

                            this.circle.feature = feature;

                            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(handler, this.circle);
                        } else if (this._controlDraw._toolbars.draw._modes.marker) {
                            this._initialShapes += 1;

                            handler = this._controlDraw._toolbars.draw._modes.marker.handler;

                            const layer = new L.Marker(latLng, handler.options);

                            layer.feature = feature;

                            L.Draw.Feature.prototype._fireCreatedEvent.call(handler, layer);
                        }
                    }
                }
            });

            const labelsAreValid = this._checkLabelsAreValid();

            this._addLabelsValidOrNotStates(labelsAreValid);
            this._addRemoveSaveResetButtonsDisabledState(labelsAreValid);

            this._centerMapFromProvidedLayer('_alertsGPSConfigurationShapesGroup');
        }
    }

    _deleteAllLayers() {
        this._alertsGPSConfigurationShapesGroup.clearLayers();
        this._alertsGPSConfigurationLabelsGroup.clearLayers();
    }

    _disableEditMode() {
        Object.keys(this._controlDraw._toolbars).forEach(key => {
            if (
                Object.prototype.hasOwnProperty.call(this._controlDraw._toolbars, key) &&
                this._controlDraw._toolbars[key] instanceof L.EditToolbar
            ) {
                this._controlDraw._toolbars[key].disable();
            }
        });

        this._generateTooltips();
    }

    _generateTooltips() {
        if (this._screenSize === 'BIG_SCREEN') {
            this._elements.app.querySelectorAll('[title]:not([data-is-tooltip="true"])').forEach((el, i) => {
                el.dataset.isTooltip = true;

                tippy(el, {
                    appendTo: this._elements.app,
                    content: el.title
                });
            });
        }
    }

    _zoomOnClickedZoneEvent(event) {
        Object.entries(this._alertsGPSConfigurationShapesGroup._layers).some(([key, circleLayer]) => {
            const clickedLatLng = new L.LatLng(event.latlng.lat, event.latlng.lng);
            if (Math.abs(circleLayer.getLatLng().distanceTo(clickedLatLng)) <= circleLayer.getRadius()) {
                this._map.fitBounds(circleLayer.getBounds());

                return true;
            }

            return false;
        });
    }

    _createZoneFromClickEvent(event) {
        const { handler } = this._controlDraw._toolbars.draw._modes.circle;
        const zoomLevel = this._map.getZoom();

        let radius = 1000;
        switch (true) {
            case zoomLevel >= 17:
                radius = 100;
                break;

            case zoomLevel >= 15:
                radius = 500;
                break;

            case zoomLevel >= 12:
                radius = 1000;
                break;

            case zoomLevel >= 10:
                radius = 10000;
                break;

            case zoomLevel <= 9:
                radius = 50000;
                break;

            default:
                break;
        }

        const circle = new L.Circle(event.latlng, radius, {
            color: this._colors.circle.view,
            weight: 2
        });

        circle.feature = {
            properties: {
                radius: 1000,
                drawtype: 'circle',
                label: this._translationService.translateString('ZONE', {
                    index: this._alertsGPSConfigurationShapesGroup.getLayers().length + 1
                })
            },
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: event.latlng
            }
        };

        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(handler, circle);
    }

    _createZoneFromLayer(layer) {
        const id = this._alertsGPSConfigurationShapesGroup.getLayerId(layer);
        let { label } = layer.feature.properties;
        if (!label) {
            label = this._translationService.translateString('ZONE', {
                index: this._alertsGPSConfigurationShapesGroup.getLayers().length
            });
        }

        const popup = new L.popup({
            autoPan: false,
            closeButton: false,
            autoClose: false,
            closeOnClick: false,
            closeOnEscapeKey: false
        });

        popup.setContent(this._createHTMLInputWithKmRadius(id, label));
        popup.setLatLng(layer.getLatLng());

        layer.bindPopup(popup);
        layer.off('click', this.openPopup);

        popup.addTo(this._alertsGPSConfigurationLabelsGroup);
    }

    _disableEdit() {
        this._toggleEdit(false);
    }

    _enableEdit() {
        this._toggleEdit(true);
    }

    _toggleEdit(bool) {
        this._controlDraw.setDrawingOptions({
            circle: bool,
            shapeOptions: {
                color: this._colors.circle.view
            }
        });

        this._map.removeControl(this._controlDraw);
        this._map.addControl(this._controlDraw);
    }

    _addLayerPropertiesSuchAsTypeAndRadius(layer) {
        if (layer instanceof L.Circle) {
            layer.feature.properties.radius = layer.getRadius();
            layer.feature.properties.drawtype = L.Draw.Circle.TYPE;
        }
        if (layer instanceof L.Marker) {
            layer.feature.properties.drawtype = L.Draw.Marker.TYPE;
        }
    }

    _centerMapFromProvidedLayer(layer) {
        if (!(Object.keys(this[layer].getBounds()).length === 0 && this[layer].getBounds().constructor === Object)) {
            this._map.fitBounds(this[layer].getBounds());
        }
    }

    _regenerateZones() {
        this._map.eachLayer(layer => {
            if (layer.feature && layer.feature.properties && layer.feature.properties.drawtype) {
                if (layer.feature.properties.drawtype === 'circle') {
                    this._addLabelAndDistanceToCircle(
                        this._alertsGPSConfigurationShapesGroup.getLayerId(layer),
                        false,
                        false
                    );
                }
            }
        });
    }

    _recoverStateBeforeDeletion() {
        this._map.eachLayer(layer => {
            if (layer.feature && layer.feature.properties && layer.feature.properties.drawtype) {
                if (layer.feature.properties.drawtype === 'circle') {
                    const id = this._alertsGPSConfigurationShapesGroup.getLayerId(layer);
                    if (!document.getElementById(`js-map__custom-zone-label-${id}`)) {
                        try {
                            layer.feature.properties.label = layer._popup._content
                                .split('\n')
                                .filter(v => v.indexOf('value="') > -1)[0]
                                .trim()
                                .replace('value="', '')
                                .replace(/"$/, '');

                            this._createZoneFromLayer(layer);
                        } catch (e) {
                            layer.remove();
                        }
                    }
                }
            }
        });
    }

    _addLabelAndDistanceToCircle(id, distance, save) {
        const label = document.getElementById(`js-map__custom-zone-label-${id}`).value;
        const layer = this._alertsGPSConfigurationShapesGroup.getLayer(id);

        layer.feature.properties.label = label;
        layer.setPopupContent(this._createHTMLInputWithKmRadius(id, label, distance));

        if (save) {
            this._emitEvent('mapEdited');
        }
    }

    _createHTMLInputWithKmRadius(id, label, distance) {
        let radiusInKm;
        if (distance) {
            radiusInKm = distance / 1000;
        } else {
            radiusInKm = this._alertsGPSConfigurationShapesGroup.getLayer(id).getRadius() / 1000;
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
                onkeyup="window.sad.mapServiceInstance._labelOnKeyUpEvent(event);"
                onfocusout="window.sad.mapServiceInstance._addLabelAndDistanceToCircle(${id}, ${distance}, true);"
            >
            <div id="js-map__custom-zone-distance-${id}" class="map__custom-zone-distance">${radiusInKm}</div>
        `;
    }

    _getArrayOfDuplicatedLabels() {
        const labelsArray = [];
        document.querySelectorAll(this._elements.selectors.inputTextLabels).forEach(el => {
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
        const condDuplicated = this._getArrayOfDuplicatedLabels().length === 0;

        let condNotEmpty = true;
        let condMaxLength = true;

        document.querySelectorAll(this._elements.selectors.inputTextLabels).forEach(el => {
            if (el.value === '') {
                condNotEmpty = false;
            }
            if (el.length > 10) {
                condMaxLength = false;
            }
        });

        return condNotEmpty && condMaxLength && condDuplicated;
    }

    _addLabelsValidOrNotStates(isValid) {
        if (isValid) {
            document
                .querySelectorAll('[id^="js-map__custom-zone-label-"].map__custom-zone-label--not-valid')
                .forEach(el => {
                    el.classList.remove('map__custom-zone-label--not-valid');
                });
        } else {
            const duplicatedLabelsArray = this._getArrayOfDuplicatedLabels();

            document.querySelectorAll(this._elements.selectors.inputTextLabels).forEach(el => {
                if (duplicatedLabelsArray.includes(el.value.toLowerCase()) || el.value === '') {
                    el.classList.add('map__custom-zone-label--not-valid');
                } else {
                    el.classList.remove('map__custom-zone-label--not-valid');
                }
            });
        }
    }

    _addLastKnownUserGPSLocation(callback) {
        this._apiService.getLastPosition().then(result => {
            if (!(result.latitude && result.longitude && result.createdAt)) {
                return;
            }

            this._map.panTo(new L.LatLng(result.latitude, result.longitude));

            const lastUserPositionMarker = new L.marker([result.latitude, result.longitude], {
                icon: L.divIcon({
                    className: 'pointer-user',
                    html: `
                        <i class="pointer-user__icon fas fa-portrait"></i>
                        <div class="pointer-user__label">
                            <div class="pointer-user__date">${moment(result.createdAt).format(
                                'DD/MM/YYYY - HH:mm'
                            )}</div>
                            <div class="pointer-user__description">
                                <span class="pointer-user__pulsing-icon"></span>
                                ${this._translationService.translateString('LAST_GPS_LOCATION')}
                            </div>
                        </div>
                    `,
                    iconSize: [30, 42],
                    iconAnchor: [15, 42]
                })
            });

            this._lastUserPositionGroup.clearLayers();
            lastUserPositionMarker.addTo(this._lastUserPositionGroup);
            this._centerMapFromProvidedLayer('_lastUserPositionGroup');

            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }

    _addRemoveSaveResetButtonsDisabledState(isEnabled) {
        const buttons = document.querySelectorAll('.app-map__button');
        if (isEnabled) {
            buttons.forEach(button => {
                button.classList.remove('app-map__button--disabled');
            });
        } else {
            buttons.forEach(button => {
                button.classList.add('app-map__button--disabled');
            });
        }
    }

    _overridesLeafLetConfiguration() {
        L.Draw.Circle = L.Draw.Circle.extend({
            options: {
                shapeOptions: {
                    color: this._colors.circle.view,
                    weight: 2
                }
            }
        });

        this._customizeApplicationTextualContent();
    }

    _customizeApplicationTextualContent() {
        L.drawLocal.edit.handlers.remove.tooltip.text = this._translationService.translateString(
            'CLICK_ZONE_TO_DELETE'
        );

        L.drawLocal.edit.toolbar.buttons.edit = this._translationService.translateString('UPDATE_ZONES');
        L.drawLocal.edit.toolbar.buttons.remove = this._translationService.translateString('DELETE_ZONES');
        L.drawLocal.draw.toolbar.buttons.circle = this._translationService.translateString('ADD_ZONE');
    }

    _addTimelineElementAndEvents(positionsHistoryData) {
        this._timeline = L.timeline(positionsHistoryData, {
            pointToLayer(data, latlng) {
                const divIcon = L.divIcon({
                    className: 'pointer-user',
                    html: `
                        <i class="pointer-user__icon fas fa-portrait"></i>
                        <div class="pointer-user__label">${moment(data.properties.start).format(
                            'DD/MM/YYYY - HH:mm'
                        )}</div>
                    `,
                    iconSize: [30, 42],
                    iconAnchor: [15, 42]
                });

                return L.marker(latlng, {
                    icon: divIcon
                });
            }
        });

        this._timelineControl.addTimelines(this._timeline);
        this._timeline.addTo(this._userPositionsHistoryGroup);

        document.querySelector('.leaflet-timeline-control .play').click();

        this._timeline.on('change', e => {
            try {
                this._centerMapFromProvidedLayer('_userPositionsHistoryGroup');
            } catch (exception) {}
        });

        this._elements.map.dataset.historyLoaded = true;
    }

    _debugLayers() {
        console.log('map', this._map._layers);
        console.log('alertsGPSConfigurationShapesGroup', this._alertsGPSConfigurationShapesGroup._layers);
        console.log('alertsGPSConfigurationLabelsGroup', this._alertsGPSConfigurationLabelsGroup._layers);
        console.log('lastUserPositionGroup', this._lastUserPositionGroup._layers);
        console.log('userPositionsHistoryGroup', this._userPositionsHistoryGroup._layers);
        console.log('controlDraw', this._controlDraw._layers);
    }

    // --
    // Events handler
    // --------------------
    _emitEvent(type) {
        if (this._checkLabelsAreValid()) {
            this._addLabelsValidOrNotStates(true);
            this._addRemoveSaveResetButtonsDisabledState(true);

            document.dispatchEvent(new Event(type));
        } else {
            this._addLabelsValidOrNotStates(false);
            this._addRemoveSaveResetButtonsDisabledState(false);

            this._notificationService.notify(
                this._translationService.translateString('ZONES_VALIDATION_FAILURE'),
                'danger'
            );
        }
    }

    _initEventListeners() {
        // Events listeners
        this._map.on('click', e => {
            if (this._DRAWING_MODE) {
                // This is a request from the marketing to be able to click and create zone rather than the default
                // behavior (click and drag) that Leaflet.Draw provides
                this._createZoneFromClickEvent(e);
            } else {
                this._zoomOnClickedZoneEvent(e);
            }
        });

        this._map.on(L.Draw.Event.CREATED, this._drawCreatedEvent.bind(this));

        this._map.on(L.Draw.Event.EDITED, this._drawEditedEvent.bind(this));

        this._map.on(L.Draw.Event.DELETED, this._drawDeletedEvent.bind(this));

        this._map.on(L.Draw.Event.EDITRESIZE, this._drawEditedResizeEvent.bind(this));

        this._map.on(L.Draw.Event.EDITSTOP, this._drawEditStopEvent.bind(this));

        this._map.on(L.Draw.Event.DELETESTOP, this._drawDeleteStopEvent.bind(this));

        this._map.on(L.Draw.Event.DRAWSTART, this._drawDrawStart.bind(this));

        this._map.on(L.Draw.Event.DRAWSTOP, this._drawDrawStop.bind(this));

        this._map.on(L.Draw.Event.TOOLBARCLOSED, this._drawDrawToolBarClosed.bind(this));

        // Events debugging
        if (this._isDevEnvironment) {
            // Events already associated
            this._map.on(L.Draw.Event.CREATED, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.EDITED, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.DELETED, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.EDITRESIZE, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.EDITSTOP, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.DELETESTOP, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.TOOLBARCLOSED, this._debugEvent.bind(this));
            // No associated events
            this._map.on(L.Draw.Event.DRAWSTART, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.DRAWSTOP, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.DRAWVERTEX, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.EDITSTART, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.EDITMOVE, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.EDITVERTEX, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.DELETESTART, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.DELETESTOP, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.TOOLBAROPENED, this._debugEvent.bind(this));
            this._map.on(L.Draw.Event.MARKERCONTEXT, this._debugEvent.bind(this));
        }
    }

    _labelOnKeyUpEvent(event) {
        if (event.keyCode === 13) {
            if (document && document.activeElement) {
                document.activeElement.blur();
            }
        }

        if (this._checkLabelsAreValid()) {
            this._addLabelsValidOrNotStates(true);
        } else {
            this._addLabelsValidOrNotStates(false);
        }
    }

    _drawCreatedEvent(e) {
        this._DRAWING_MODE = false;
        this._alertsGPSConfigurationShapesGroup.addLayer(e.layer);

        e.layer.feature = e.layer.feature || {};
        e.layer.feature.properties = e.layer.feature.properties || {};
        e.layer.feature.type = 'Feature';

        if (e.layer.getRadius() < 10) {
            e.layer.setRadius(10);
        }

        this._addLayerPropertiesSuchAsTypeAndRadius(e.layer);

        if (this._alertsGPSConfigurationShapesGroup.getLayers().length >= this._MAX_NUMBER_OF_CIRCLES) {
            this._disableEdit();
        }

        this._createZoneFromLayer(
            this._alertsGPSConfigurationShapesGroup.getLayers()[
                this._alertsGPSConfigurationShapesGroup.getLayers().length - 1
            ]
        );

        if (this._initialShapes > 0) {
            this._initialShapes -= 1;
        } else {
            this._emitEvent('mapEdited');
        }
    }

    _drawEditedResizeEvent(e) {
        this._addLabelAndDistanceToCircle(e.layer._leaflet_id, e.layer.getRadius(), false);
    }

    _drawEditedEvent(e) {
        e.layers.eachLayer(layer => {
            this._addLayerPropertiesSuchAsTypeAndRadius.bind(this, layer);
        });

        this._emitEvent('mapEdited');
    }

    _drawDeletedEvent() {
        this.checkNumberOfCirclesAndEnableDisableNewAdditions();

        this._emitEvent('mapEdited');
    }

    _drawEditStopEvent() {
        this._regenerateZones();
    }

    _drawDeleteStopEvent() {
        this._recoverStateBeforeDeletion();
    }

    _drawDrawStart() {
        this._DRAWING_MODE = true;
    }

    _drawDrawStop() {
        this._addressSearchGroup.clearLayers();

        setTimeout(() => {
            this._DRAWING_MODE = false;
        }, 500);
    }

    _drawDrawToolBarClosed() {
        this._generateTooltips();
    }

    _debugEvent(e) {
        console.log(`[debug] : Event : ${e.type}`);

        switch (e.type) {
            default:
                break;
        }
    }
}

export default MapService;
