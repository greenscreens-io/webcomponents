/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options


/**
 * A module rendering numeric value as curency format with specific langauge support
 * @module components/CurrencyFormat
 */
import { GSElement } from '../../GSElement.mjs';

/**
 * Render Year value
 * 
 * @class
 * @extends {HTMLElement}
 */
export class GSCurrencyFormat extends GSElement {

    static properties = {
        value: {},
        locale: {},
        currency: {},
    }

    renderUI() {
        return this.format;
    }

    get #options() {
        const me = this;
        return Object.apply(me.dataset, { style: 'currency', currency: me.currency });
    }

    get format() {
        const me = this;
        return new Intl.NumberFormat(me.locale, me.#options).format(me.value);
    }

    static {
        this.define('gs-currency-format');
    }
}
