import moment from 'moment';
import 'moment-timezone';

class TranslationService {
    _strings = {
        fr: {
            RESET: 'Annuler',
            SAVE: 'Sauvegarder',
            ZONE: 'zone {{index}}',
            NO_DATA_FOR_GIVEN_PERIOD: 'Il n’y a pas de données sur la période sélectionnée',
            SAVING: 'Enregistrement',
            SUCCESS: 'Succès',
            FAILURE: 'Échec',
            ZONES_VALIDATION_FAILURE: 'Échec dans la validation des zones',
            SEARCH_ADDRESS: 'Rechercher une localité',
            NO_ADDRESS_FOUND: 'Aucune adresse n’a été trouvée'
        },
        en: {
            RESET: 'Reset',
            SAVE: 'Save',
            ZONE: 'zone {{index}}',
            NO_DATA_FOR_GIVEN_PERIOD: 'There are no data on the selected period',
            SAVING: 'Saving',
            SUCCESS: 'Success',
            FAILURE: 'Failure',
            ZONES_VALIDATION_FAILURE: 'Zones validation failure',
            SEARCH_ADDRESS: 'Location Search',
            NO_ADDRESS_FOUND: 'No address found'
        },
        es: {
            RESET: 'Anular',
            SAVE: 'Guardar',
            ZONE: 'zona {{index}}',
            NO_DATA_FOR_GIVEN_PERIOD: 'No existen datos sobre el período seleccionado',
            SAVING: 'registro',
            SUCCESS: 'Éxito',
            FAILURE: 'Fracaso',
            ZONES_VALIDATION_FAILURE: 'Error de validación de las zonas',
            SEARCH_ADDRESS: 'Buscar una localidad',
            NO_ADDRESS_FOUND: 'Sin dirección encontrada'
        },
        sk: {
            RESET: 'Zrušiť',
            SAVE: 'Save',
            ZONE: 'zóna {{index}}',
            NO_DATA_FOR_GIVEN_PERIOD: 'Nie sú k dispozícii žiadne údaje o zvolenom období',
            SAVING: 'Registrácia',
            SUCCESS: 'Úspech',
            FAILURE: 'Zlyhanie',
            ZONES_VALIDATION_FAILURE: 'Zlyhanie validácia zóny',
            SEARCH_ADDRESS: 'miesto Search',
            NO_ADDRESS_FOUND: 'No adresa nebola nájdená'
        },
        cs: {
            RESET: 'Zrušit',
            SAVE: 'Save',
            ZONE: 'zóna  {{index}}',
            NO_DATA_FOR_GIVEN_PERIOD: 'Nejsou k dispozici žádné údaje o zvoleném období',
            SAVING: 'Registrace',
            SUCCESS: 'Úspěch',
            FAILURE: 'Selhání',
            ZONES_VALIDATION_FAILURE: 'Selhání validace zóny',
            SEARCH_ADDRESS: 'Místo Search',
            NO_ADDRESS_FOUND: 'No adresa nebyla nalezena'
        },
        zh: {
            RESET: '取消',
            SAVE: '保存',
            ZONE: '区 {{index}}',
            NO_DATA_FOR_GIVEN_PERIOD: '有选定的周期没有数据',
            SAVING: '注册',
            SUCCESS: '成功',
            FAILURE: '失败',
            ZONES_VALIDATION_FAILURE: '区验证失败',
            SEARCH_ADDRESS: '定位搜索',
            NO_ADDRESS_FOUND: '没有找到地址'
        }
    };

    constructor(language) {
        if (!this._validateLanguage(language)) {
            this._language = 'fr';
        } else {
            this._language = language;
        }

        moment.locale(this.language);
    }

    translateInterface() {
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this._strings[this._language][el.dataset.i18nPlaceholder];
        });

        document.querySelectorAll('[data-i18n-text]').forEach(el => {
            el.textContent = this._strings[this._language][el.dataset.i18nText];
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
        return ['en', 'fr', 'es', 'sk', 'cs', 'zh'].includes(language);
    }
}

export default TranslationService;
