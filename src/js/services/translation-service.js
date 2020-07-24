import moment from 'moment';
import 'moment-timezone';

class TranslationService {
    constructor(language) {
        this._strings = {
            // --------------------
            // French
            // --------------------
            fr: {
                RESET: 'Annuler',
                SAVE: 'Sauvegarder',
                ZONE: 'zone {{index}}',
                NO_DATA_FOR_GIVEN_PERIOD: 'Il n’y a pas de données sur la période sélectionnée',
                ZONE_MINIMUM_PERIMETER: 'Le périmètre de la zone doit être au minimum de 100 mètres.',
                SAVING: 'Enregistrement',
                SUCCESS: 'Succès',
                FAILURE: 'Échec',
                ZONES_VALIDATION_FAILURE: 'Échec dans la validation des zones',
                SEARCH_ADDRESS: 'Rechercher une localité',
                NO_ADDRESS_FOUND: 'Aucune adresse n’a été trouvée',
                LAST_GPS_LOCATION: 'Dernière position',
                CLICK_ZONE_TO_DELETE: 'Cliquez sur une zone pour la supprimer.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Visualisez la position du Click heure par heure.',
                ADD_ZONE: 'Ajouter une zone.',
                UPDATE_ZONES: 'Modifier les zones.',
                DELETE_ZONES: 'Supprimer des zones.',
                ZOOM_IN: 'Zoomer',
                ZOOM_OUT: 'Dézoomer'
            },
            // --------------------
            // English
            // --------------------
            en: {
                RESET: 'Reset',
                SAVE: 'Save',
                ZONE: 'zone {{index}}',
                NO_DATA_FOR_GIVEN_PERIOD: 'There are no data on the selected period',
                ZONE_MINIMUM_PERIMETER: 'The perimeter of the area must be at least 100 meters.',
                SAVING: 'Saving',
                SUCCESS: 'Success',
                FAILURE: 'Failure',
                ZONES_VALIDATION_FAILURE: 'Zones validation failure',
                SEARCH_ADDRESS: 'Location Search',
                NO_ADDRESS_FOUND: 'No address found',
                LAST_GPS_LOCATION: 'Last location',
                CLICK_ZONE_TO_DELETE: 'Click a zone to delete it.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Visualize Click location hourly.',
                ADD_ZONE: 'Add zone.',
                UPDATE_ZONES: 'Edit areas.',
                DELETE_ZONES: 'Remove areas.',
                ZOOM_IN: 'Zoom in',
                ZOOM_OUT: 'Zoom out'
            },
            // --------------------
            // Chinese
            // --------------------
            zh: {
                RESET: '取消',
                SAVE: '保存',
                ZONE: '区 {{index}}',
                NO_DATA_FOR_GIVEN_PERIOD: '有选定的周期没有数据',
                ZONE_MINIMUM_PERIMETER: '该区域的周界必须至少为100米',
                SAVING: '注册',
                SUCCESS: '成功',
                FAILURE: '失败',
                ZONES_VALIDATION_FAILURE: '区验证失败',
                SEARCH_ADDRESS: '定位搜索',
                NO_ADDRESS_FOUND: '没有找到地址',
                LAST_GPS_LOCATION: '最后一个位置',
                CLICK_ZONE_TO_DELETE: '单击某一区域将其删除。',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: '可视化点击的位置每小时。',
                ADD_ZONE: '添加区域。',
                UPDATE_ZONES: '编辑区域。',
                DELETE_ZONES: '删除的区域。',
                ZOOM_IN: '放大',
                ZOOM_OUT: '缩小'
            },
            // --------------------
            // Spanish
            // --------------------
            es: {
                RESET: 'Anular',
                SAVE: 'Guardar',
                ZONE: 'zona {{index}}',
                NO_DATA_FOR_GIVEN_PERIOD: 'No existen datos sobre el período seleccionado',
                ZONE_MINIMUM_PERIMETER: 'El perímetro de la zona debe ser de al menos 100 metros.',
                SAVING: 'registro',
                SUCCESS: 'Éxito',
                FAILURE: 'Fracaso',
                ZONES_VALIDATION_FAILURE: 'Error de validación de las zonas',
                SEARCH_ADDRESS: 'Buscar una localidad',
                NO_ADDRESS_FOUND: 'Sin dirección encontrada',
                LAST_GPS_LOCATION: 'Última posición',
                CLICK_ZONE_TO_DELETE: 'Haga clic en un área para eliminarlo.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Visualizar la posición de clic por hora.',
                ADD_ZONE: 'Añadir zona.',
                UPDATE_ZONES: 'Áreas de edición.',
                DELETE_ZONES: 'áreas quitar.',
                ZOOM_IN: 'Acercarse',
                ZOOM_OUT: 'Disminuir el zoom'
            },
            // --------------------
            // Slovak
            // --------------------
            sk: {
                RESET: 'Zrušiť',
                SAVE: 'Save',
                ZONE: 'zóna {{index}}',
                NO_DATA_FOR_GIVEN_PERIOD: 'Nie sú k dispozícii žiadne údaje o zvolenom období',
                ZONE_MINIMUM_PERIMETER: 'Daná oblasť musí byť najmenej 100 metrov.',
                SAVING: 'Registrácia',
                SUCCESS: 'Úspech',
                FAILURE: 'Zlyhanie',
                ZONES_VALIDATION_FAILURE: 'Zlyhanie validácia zóny',
                SEARCH_ADDRESS: 'miesto Search',
                NO_ADDRESS_FOUND: 'No adresa nebola nájdená',
                LAST_GPS_LOCATION: 'Poslednej pozície',
                CLICK_ZONE_TO_DELETE: 'Tlačidlom myši na plochu, aby ho odstrániť.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Vizualizovať pozíciu Click každú hodinu.',
                ADD_ZONE: 'Pridať zone.',
                UPDATE_ZONES: 'Úprava oblastí.',
                DELETE_ZONES: 'Odstráňte oblastiach.',
                ZOOM_IN: 'Priblížiť',
                ZOOM_OUT: 'Oddialiť'
            },
            // --------------------
            // Czech
            // --------------------
            cs: {
                RESET: 'Zrušit',
                SAVE: 'Save',
                ZONE: 'zóna  {{index}}',
                NO_DATA_FOR_GIVEN_PERIOD: 'Nejsou k dispozici žádné údaje o zvoleném období',
                ZONE_MINIMUM_PERIMETER: 'Daná oblast musí být nejméně 100 metrů.',
                SAVING: 'Registrace',
                SUCCESS: 'Úspěch',
                FAILURE: 'Selhání',
                ZONES_VALIDATION_FAILURE: 'Selhání validace zóny',
                SEARCH_ADDRESS: 'Místo Search',
                NO_ADDRESS_FOUND: 'No adresa nebyla nalezena',
                LAST_GPS_LOCATION: 'Poslední pozice',
                CLICK_ZONE_TO_DELETE: 'Tlačítkem myši na plochu, aby jej odstranit.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Vizualizovat pozici Click každou hodinu.',
                ADD_ZONE: 'Přidat zone.',
                UPDATE_ZONES: 'Úprava oblastí.',
                DELETE_ZONES: 'Odstraňte oblastech.',
                ZOOM_IN: 'Přiblížit',
                ZOOM_OUT: 'Oddálit'
            },
            // --------------------
            // Finnish
            // --------------------
            fi: {
                RESET: 'Nollaa',
                SAVE: 'Tallentaa',
                ZONE: 'vyöhyke {{index}}',
                NO_DATA_FOR_GIVEN_PERIOD: 'Ei ole tietoa valitsemansa',
                ZONE_MINIMUM_PERIMETER: 'Kehä alueen on oltava vähintään 100 metriä.',
                SAVING: 'Tallentaa',
                SUCCESS: 'Menestys',
                FAILURE: 'Vika',
                ZONES_VALIDATION_FAILURE: 'Zones todennusvirhe',
                SEARCH_ADDRESS: 'Sijainti haku',
                NO_ADDRESS_FOUND: 'Ei löytynyt osoitetietoja',
                LAST_GPS_LOCATION: 'Viimeinen sijaintipaikka',
                CLICK_ZONE_TO_DELETE: 'Klikkaa vyöhyke poistaa sen.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Visualisoi Valitse sijainti tunneittain.',
                ADD_ZONE: 'Lisää vyöhyke.',
                UPDATE_ZONES: 'Edit alueilla.',
                DELETE_ZONES: 'Poista alueilla.',
                ZOOM_IN: 'Lähennä',
                ZOOM_OUT: 'Loitontaa'
            },
            // --------------------
            // German
            // --------------------
            de: {
                RESET: 'Reset',
                SAVE: 'speichern',
                ZONE: 'zone {{index}}',
                NO_DATA_FOR_GIVEN_PERIOD: 'Es liegen keine Daten über den gewählten Zeitraum',
                ZONE_MINIMUM_PERIMETER: 'Der Umfang der Fläche muss mindestens 100 meter betragen.',
                SAVING: 'Saving',
                SUCCESS: 'Erfolg',
                FAILURE: 'Fehler',
                ZONES_VALIDATION_FAILURE: 'Zones Prüfungsfehler',
                SEARCH_ADDRESS: 'Standort Suche',
                NO_ADDRESS_FOUND: 'Keine Adresse',
                LAST_GPS_LOCATION: 'Letzter Standort',
                CLICK_ZONE_TO_DELETE: 'Klicken Sie auf eine Zone um es zu löschen.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Klicken Sie auf Standort Visualize stündlich.',
                ADD_ZONE: 'In Zone.',
                UPDATE_ZONES: 'Bearbeiten Bereiche.',
                DELETE_ZONES: 'Entfernen Bereiche.',
                ZOOM_IN: 'Hineinzoomen',
                ZOOM_OUT: 'Rauszoomen'
            }
        };

        if (!this._validateLanguage(language)) {
            this._language = 'fr';
        } else {
            this._language = language;
        }

        moment.locale(this._language);
    }

    translateInterface() {
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this._strings[this._language][el.dataset.i18nPlaceholder];
        });

        document.querySelectorAll('[data-i18n-text]').forEach(el => {
            el.textContent = this._strings[this._language][el.dataset.i18nText];
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this._strings[this._language][el.dataset.i18nTitle];
        });
    }

    translateString(str, params) {
        let result = this._strings[this._language][str];

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                result = result.split(`{{${key}}}`).join(value);
            });
        }

        return result;
    }

    _validateLanguage(language) {
        return ['fr', 'en', 'zh', 'es', 'sk', 'cs', 'fi', 'de'].includes(language);
    }
}

export default TranslationService;
