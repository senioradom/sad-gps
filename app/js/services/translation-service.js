import moment from 'moment';
import 'moment-timezone';

class TranslationService {
    _strings = {
        fr: {
            reset: 'Annuler',
            save: 'Sauvegarder',
            zone: 'zone {{index}}',
            no_data_for_given_period: 'Il n’y a pas de données sur la période sélectionnée',
            saving: 'Enregistrement',
            success: 'Succès',
            failure: 'Échec',
            zones_validation_failure: 'Échec dans la validation des zones'
        },
        en: {
            reset: 'Reset',
            save: 'Save',
            zone: 'zone {{index}}',
            no_data_for_given_period: 'There are no data on the selected period',
            saving: 'Saving',
            success: 'Success',
            failure: 'Failure',
            zones_validation_failure: 'Zones validation failure'
        },
        es: {
            reset: 'Anular',
            save: 'Guardar',
            zone: 'zona {{index}}',
            no_data_for_given_period: 'No existen datos sobre el período seleccionado',
            saving: 'registro',
            success: 'Éxito',
            failure: 'Fracaso',
            zones_validation_failure: 'Error de validación de las zonas'
        },
        sk: {
            reset: 'Zrušiť',
            save: 'Save',
            zone: 'zóna {{index}}',
            no_data_for_given_period: 'Nie sú k dispozícii žiadne údaje o zvolenom období',
            saving: 'Registrácia',
            success: 'Úspech',
            failure: 'Zlyhanie',
            zones_validation_failure: 'Zlyhanie validácia zóny'
        },
        cs: {
            reset: 'Zrušit',
            save: 'Save',
            zone: 'zóna  {{index}}',
            no_data_for_given_period: 'Nejsou k dispozici žádné údaje o zvoleném období',
            saving: 'Registrace',
            success: 'Úspěch',
            failure: 'Selhání',
            zones_validation_failure: 'Selhání validace zóny'
        },
        zh: {
            reset: '取消',
            save: '保存',
            zone: '区 {{index}}',
            no_data_for_given_period: '有选定的周期没有数据',
            saving: '注册',
            success: '成功',
            failure: '失败',
            zones_validation_failure: '区验证失败'
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
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this._strings[this._language][el.dataset.i18n];
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
