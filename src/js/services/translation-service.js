import moment from 'moment';
import 'moment-timezone';

class TranslationService {
    constructor(language) {
        this._strings = {
            // --------------------
            // French
            // --------------------
            fr: {
                ADD_ZONE: 'Ajouter une zone.',
                ADD_ZONE_DESCRIPTION: 'Cliquez et faites glisser pour dessiner une zone de 100 mètres minimum.',
                CLICK_ZONE_TO_DELETE: 'Cliquez sur une zone pour la supprimer.',
                DELETE_ZONES: 'Supprimer des zones.',
                FAILURE: 'Échec',
                LAST_GPS_LOCATION: 'Dernière position',
                NO_ADDRESS_FOUND: 'Aucune adresse n’a été trouvée',
                NO_DATA_FOR_GIVEN_PERIOD: 'Il n’y a pas de données sur la période sélectionnée',
                RESET: 'Annuler',
                SAVE: 'Sauvegarder',
                SAVING: 'Enregistrement',
                SEARCH_ADDRESS: 'Rechercher une localité',
                SUCCESS: 'Succès',
                UPDATE_ZONES: 'Modifier les zones.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Visualisez la position du Click heure par heure.',
                ZONE: 'zone {{index}}',
                ZONE_MINIMUM_PERIMETER: 'Le périmètre de la zone doit être au minimum de 100 mètres.',
                ZONES_VALIDATION_FAILURE: 'Échec dans la validation des zones',
                ZOOM_IN: 'Zoomer',
                ZOOM_OUT: 'Dézoomer'
            },
            // --------------------
            // English
            // --------------------
            en: {
                ADD_ZONE: 'Add zone.',
                ADD_ZONE_DESCRIPTION: 'Click and drag to draw a minimum of 100 meters area.',
                CLICK_ZONE_TO_DELETE: 'Click a zone to delete it.',
                DELETE_ZONES: 'Remove areas.',
                FAILURE: 'Failure',
                LAST_GPS_LOCATION: 'Last location',
                NO_ADDRESS_FOUND: 'No address found',
                NO_DATA_FOR_GIVEN_PERIOD: 'There are no data on the selected period',
                RESET: 'Reset',
                SAVE: 'Save',
                SAVING: 'Saving',
                SEARCH_ADDRESS: 'Location Search',
                SUCCESS: 'Success',
                UPDATE_ZONES: 'Edit areas.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Visualize Click location hourly.',
                ZONE: 'zone {{index}}',
                ZONE_MINIMUM_PERIMETER: 'The perimeter of the area must be at least 100 meters.',
                ZONES_VALIDATION_FAILURE: 'Zones validation failure',
                ZOOM_IN: 'Zoom in',
                ZOOM_OUT: 'Zoom out'
            },
            // --------------------
            // Chinese
            // --------------------
            zh: {
                ADD_ZONE: '添加区域。',
                ADD_ZONE_DESCRIPTION: '单击并拖动以绘制至少100平方米的面积。',
                CLICK_ZONE_TO_DELETE: '单击某一区域将其删除。',
                DELETE_ZONES: '删除的区域。',
                FAILURE: '失败',
                LAST_GPS_LOCATION: '最后一个位置',
                NO_ADDRESS_FOUND: '没有找到地址',
                NO_DATA_FOR_GIVEN_PERIOD: '有选定的周期没有数据',
                RESET: '取消',
                SAVE: '保存',
                SAVING: '注册',
                SEARCH_ADDRESS: '定位搜索',
                SUCCESS: '成功',
                UPDATE_ZONES: '编辑区域。',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: '可视化点击的位置每小时。',
                ZONE: '区 {{index}}',
                ZONE_MINIMUM_PERIMETER: '该区域的周界必须至少为100米',
                ZONES_VALIDATION_FAILURE: '区验证失败',
                ZOOM_IN: '放大',
                ZOOM_OUT: '缩小'
            },
            // --------------------
            // Spanish
            // --------------------
            es: {
                ADD_ZONE: 'Añadir zona.',
                ADD_ZONE_DESCRIPTION: 'Haga clic y arrastre para dibujar un mínimo de área de 100 metros.',
                CLICK_ZONE_TO_DELETE: 'Haga clic en un área para eliminarlo.',
                DELETE_ZONES: 'áreas quitar.',
                FAILURE: 'Fracaso',
                LAST_GPS_LOCATION: 'Última posición',
                NO_ADDRESS_FOUND: 'Sin dirección encontrada',
                NO_DATA_FOR_GIVEN_PERIOD: 'No existen datos sobre el período seleccionado',
                RESET: 'Anular',
                SAVE: 'Guardar',
                SAVING: 'registro',
                SEARCH_ADDRESS: 'Buscar una localidad',
                SUCCESS: 'Éxito',
                UPDATE_ZONES: 'Áreas de edición.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Visualizar la posición de clic por hora.',
                ZONE: 'zona {{index}}',
                ZONE_MINIMUM_PERIMETER: 'El perímetro de la zona debe ser de al menos 100 metros.',
                ZONES_VALIDATION_FAILURE: 'Error de validación de las zonas',
                ZOOM_IN: 'Acercarse',
                ZOOM_OUT: 'Disminuir el zoom'
            },
            // --------------------
            // Slovak
            // --------------------
            sk: {
                ADD_ZONE: 'Pridať zone.',
                ADD_ZONE_DESCRIPTION: 'Kliknutím a ťahaním nakreslite minimálne 100 metrov plochy.',
                CLICK_ZONE_TO_DELETE: 'Tlačidlom myši na plochu, aby ho odstrániť.',
                DELETE_ZONES: 'Odstráňte oblastiach.',
                FAILURE: 'Zlyhanie',
                LAST_GPS_LOCATION: 'Poslednej pozície',
                NO_ADDRESS_FOUND: 'No adresa nebola nájdená',
                NO_DATA_FOR_GIVEN_PERIOD: 'Nie sú k dispozícii žiadne údaje o zvolenom období',
                RESET: 'Zrušiť',
                SAVE: 'Save',
                SAVING: 'Registrácia',
                SEARCH_ADDRESS: 'miesto Search',
                SUCCESS: 'Úspech',
                UPDATE_ZONES: 'Úprava oblastí.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Vizualizovať pozíciu Click každú hodinu.',
                ZONE: 'zóna {{index}}',
                ZONE_MINIMUM_PERIMETER: 'Daná oblasť musí byť najmenej 100 metrov.',
                ZONES_VALIDATION_FAILURE: 'Zlyhanie validácia zóny',
                ZOOM_IN: 'Priblížiť',
                ZOOM_OUT: 'Oddialiť'
            },
            // --------------------
            // Czech
            // --------------------
            cs: {
                ADD_ZONE: 'Přidat zone.',
                ADD_ZONE_DESCRIPTION: 'Kliknutím a tažením nakreslete minimálně 100 metrů plochy.',
                CLICK_ZONE_TO_DELETE: 'Tlačítkem myši na plochu, aby jej odstranit.',
                DELETE_ZONES: 'Odstraňte oblastech.',
                FAILURE: 'Selhání',
                LAST_GPS_LOCATION: 'Poslední pozice',
                NO_ADDRESS_FOUND: 'No adresa nebyla nalezena',
                NO_DATA_FOR_GIVEN_PERIOD: 'Nejsou k dispozici žádné údaje o zvoleném období',
                RESET: 'Zrušit',
                SAVE: 'Save',
                SAVING: 'Registrace',
                SEARCH_ADDRESS: 'Místo Search',
                SUCCESS: 'Úspěch',
                UPDATE_ZONES: 'Úprava oblastí.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Vizualizovat pozici Click každou hodinu.',
                ZONE: 'zóna  {{index}}',
                ZONE_MINIMUM_PERIMETER: 'Daná oblast musí být nejméně 100 metrů.',
                ZONES_VALIDATION_FAILURE: 'Selhání validace zóny',
                ZOOM_IN: 'Přiblížit',
                ZOOM_OUT: 'Oddálit'
            },
            // --------------------
            // Finnish
            // --------------------
            fi: {
                ADD_ZONE: 'Lisää vyöhyke.',
                ADD_ZONE_DESCRIPTION: 'Klikkaa ja vedä vetää vähintään 100 metrin alueen.',
                CLICK_ZONE_TO_DELETE: 'Klikkaa vyöhyke poistaa sen.',
                DELETE_ZONES: 'Poista alueilla.',
                FAILURE: 'Vika',
                LAST_GPS_LOCATION: 'Viimeinen sijaintipaikka',
                NO_ADDRESS_FOUND: 'Ei löytynyt osoitetietoja',
                NO_DATA_FOR_GIVEN_PERIOD: 'Ei ole tietoa valitsemansa',
                RESET: 'Nollaa',
                SAVE: 'Tallentaa',
                SAVING: 'Tallentaa',
                SEARCH_ADDRESS: 'Sijainti haku',
                SUCCESS: 'Menestys',
                UPDATE_ZONES: 'Edit alueilla.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Visualisoi Valitse sijainti tunneittain.',
                ZONE: 'vyöhyke {{index}}',
                ZONE_MINIMUM_PERIMETER: 'Kehä alueen on oltava vähintään 100 metriä.',
                ZONES_VALIDATION_FAILURE: 'Zones todennusvirhe',
                ZOOM_IN: 'Lähennä',
                ZOOM_OUT: 'Loitontaa'
            },
            // --------------------
            // German
            // --------------------
            de: {
                ADD_ZONE: 'In Zone.',
                ADD_ZONE_DESCRIPTION: 'Klicken und ziehen Sie ein Minimum von 100 Metern Fläche zu ziehen.',
                CLICK_ZONE_TO_DELETE: 'Klicken Sie auf eine Zone um es zu löschen.',
                DELETE_ZONES: 'Entfernen Bereiche.',
                FAILURE: 'Fehler',
                LAST_GPS_LOCATION: 'Letzter Standort',
                NO_ADDRESS_FOUND: 'Keine Adresse',
                NO_DATA_FOR_GIVEN_PERIOD: 'Es liegen keine Daten über den gewählten Zeitraum',
                RESET: 'Reset',
                SAVE: 'speichern',
                SAVING: 'Saving',
                SEARCH_ADDRESS: 'Standort Suche',
                SUCCESS: 'Erfolg',
                UPDATE_ZONES: 'Bearbeiten Bereiche.',
                VISUALIZE_THE_CLICK_LOCATION_HOURLY: 'Klicken Sie auf Standort Visualize stündlich.',
                ZONE: 'zone {{index}}',
                ZONE_MINIMUM_PERIMETER: 'Der Umfang der Fläche muss mindestens 100 meter betragen.',
                ZONES_VALIDATION_FAILURE: 'Zones Prüfungsfehler',
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
