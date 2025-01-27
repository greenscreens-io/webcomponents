/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { html } from '../../../../modules/lib.mjs';
import { GSLoader } from '../../../../modules/base/GSLoader.mjs';
import { GSAsbtractDialog } from '../dialogs/GSAsbtractDialog.mjs';

/**
 * A module loading GSWorkstation class
 * @module dialogs/GSWorkstation
 */
export class GSWorkstation extends GSAsbtractDialog {

    static {
        this.define('gs-admin-dialog-workstation');
    }

    static css = 'fw-bold w-25 text-bg-secondary';

    static properties = {
        data: { state: true, type: Object },
    }

    #def = null;

    constructor() {
        super();        
        this.cssBody = 'NA';
        this.cancelable = false;
        this.title = 'Workstation details';
        this.#definition();
    }

    async #definition() {
        this.#def = await GSLoader.loadSafe('data/wks.json','GET', null,true);
        this.requestUpdate();
    }

    open(data) {
        const me = this;
        me.data = data;
        super.open();
    }
    
    renderTemplate() {
        return this.#render(this.data);
    }

    #render(data) {
        const me = this;
        return html`
        <div class="container p-2">
        <div class="row">
        <div class="col-xs-12">
        <table class="table border">                    
        <tbody>
        ${me.#rows(data)}
        </tbody>
        </table>
        </div>
        </div>
        </div>`;
    }
    
    #rows(data = []) {
        const me = this;
        return me.#def?.order.filter(v => data[v]).map(v => me.#row(data, v));
    }

    #row(data, key) {
        const me = this;
        return html`<tr><td class="${GSWorkstation.css}">${me.#def.data[key]}</td><td>${data[key] || ''}</td></td>`
    }
}