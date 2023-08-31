/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSFilter class
 * @module dialogs/GSFilter
 */
import GSAsbtractDialog from './GSAsbtractDialog.mjs';

export default class GSFilter extends GSAsbtractDialog {

    //"((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\.?\\b){4}";
    /*
    static #IP = "((([0-9]{1,2})|(1[0-9]{2,2})|(2[0-4][0-9])|(25[0-5])|\\*)\\.){3}(([0-9]{1,2})|(1[0-9]{2,2})|(2[0-4][0-9])|(25[0-5])|\\*)";
    static #MASK = [`^${GSFilter.#IP}$`, `^${GSFilter.#IP}/[0-9]{1,2}$`, `^${GSFilter.#IP}-${GSFilter.#IP}$`];
    */
    static #SEG = "(?:(?:[0-9]{1,2})|(?:1[0-9]{2,2})|(?:2[0-4][0-9])|(?:25[0-5])|\\*)";
    static #CDIR = "(?:/[1-9]{1,2})";
    static #IP = `(${GSFilter.#SEG}\\.){3}${GSFilter.#SEG}`; 
    static #SEGM = `${GSFilter.#SEG}(?:\-${GSFilter.#SEG})?`;
    static #IPM = `(${GSFilter.#SEGM}\\.){3}${GSFilter.#SEGM}`;
    static #MASK = [`^${GSFilter.#IP}$`, `^${GSFilter.#IP}${GSFilter.#CDIR}$`, `^${GSFilter.#IPM}$`];


    static {
        customElements.define('gs-admin-dialog-filter', GSFilter);
        Object.seal(GSFilter);
    }

    onReady() {
        super.onReady();
        const me = this;
        me.large();
        me.attachEvent(me, 'change', me.#onChange.bind(me));
    }

    get dialogTemplate() {
        return '//forms/filter-ip.html';
    }

    get dialogTitle() {
        return 'IP Filter';
    }

    get typeField() {
        return this.query('select[name=type]');
    }

    get valueField() {
        return this.query('input[name=value]');
    }

    #onChange(e) {
        const me = this;
        me.valueField.pattern = GSFilter.#MASK[me.typeField.value];
    }   

    async onOpen(data) {
        const me = this;
        if (me.valueField) me.valueField.pattern = GSFilter.#MASK[me.form.data?.type];
        super.onOpen(data);
    }

}