/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSWorkstation class
 * @module dialogs/GSWorkstation
 */
import {GSLoader} from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';
import GSAdminDialog from './GSAdminDialog.mjs';

export default class GSWorkstation extends GSAdminDialog {

    static {
        customElements.define('gs-admin-dialog-workstation', GSWorkstation);
        Object.seal(GSWorkstation);
    }

    #def = null;

    connectedCallback() {
        const me = this;
        me.cssBody = 'NA';
        super.connectedCallback();
    }

    get dialogTemplate() {
        return null;
    }

    get dialogTitle() {
        return 'Workstation Info';
    }

    async onReady() {
        super.onReady();
        this.#def = await GSLoader.loadSafe('data/wks.json','GET',null,true);
    }

    open(data) {
        const me = this;
        const css = 'fw-bold w-25 text-bg-secondary';
        const html = ['<div class="container p-2"><div class="row"><div class="col-xs-12"><table class="table border"><tbody>'];
        const body = me.#def.order.filter(v => me.#def.data[v])
            .map(v => `<tr><td class="${css}">${me.#def.data[v]}</td><td>${data[v] || ''}</td></td>`).join('');
        html.push(body);
        html.push('</tbody></table></div></div></div>');
        me.body = html.join('');
        super.open();
    }

}