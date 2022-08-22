/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSInput class
 * @module components/ext/GSInput
 */

import GSID from "../../base/GSID.mjs";
import GSEvent from "../../base/GSEvent.mjs";
import GSComponents from "../../base/GSComponents.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";

/**
 * Add custom field processing
 * <input is="gs-input">
 * @class
 * @extends {HTMLInputElement}
 */
export default class GSInput extends HTMLInputElement {

    static #special = ".^$*+-?()[]{}\|—/";
    static #maskType = {
        y: '[0-9]', m: '[0-9]', d: '[0-9]',
        Y: '[0-9]', M: '[0-9]', D: '[0-9]',
        9: '[0-9]', '#': '[0-9]',
        x: '[a-zA-Z]', X: '[a-zA-Z]',
        _: '[0-9]'
    };

    #masks = [];

    static {
        customElements.define('gs-input', GSInput, { extends: 'input' });
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['mask'];
    }

    connectedCallback() {
        const me = this;
        if (!me.id) me.setAttribute('id', GSID.id);
        if (me.placeholder.length === 0) {
            if (me.mask) me.placeholder = me.mask;
        }
        me.#toPattern();
        me.#attachEvents();
        GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        GSComponents.remove(me);
        GSEvent.deattachListeners(me);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //console.log(`name:${name}, oldValue:${oldValue}, newValue:${newValue}`);
        if (name === 'mask') this.#toPattern();
    }

    get owner() {
        const own = GSComponents.getOwner(this);
        return GSDOM.unwrap(own);
    }

    get list() {
        const me = this;
        const list = GSAttr.get(me, 'list');
        return GSDOM.getEl(list, me.owner);
    }

    get filter() {
        const me = this;
        const filter = GSAttr.get(me, 'data-filter');
        return GSDOM.getEl(filter, me.owner);
    }

    get mask() {
        return GSAttr.get(this, 'mask', '');
    }

    get strict() {
        return GSAttr.get(this, 'strict', '');
    }

    #toPattern() {
        const me = this;
        if (me.mask.length === 0) return;
        const chars = me.mask.split('');
        const masks = [];

        me.#masks = [];

        chars.forEach(v => {
            if (GSInput.#special.indexOf(v) > -1) {
                me.#masks.push(v);
                masks.push(`\${v}`);
                return;
            }

            const m = GSInput.#maskType[v];
            if (m) {
                me.#masks.push(new RegExp(m, 'g'));
                masks.push(m);
                return;
            }
        });

        me.pattern = masks.join('');
    }

    #attachEvents() {
        const me = this;
        GSEvent.attach(me, me, 'input', me.#onInput.bind(me));
        GSEvent.attach(me, me, 'blur', me.#onBlur.bind(me));
        requestAnimationFrame(() => {
            const list = me.list;
            if (!list) return;
            GSEvent.attach(me, me, 'change', me.#onDataChange.bind(me));
            GSEvent.attach(me, me.filter, 'change', me.#onMonitor.bind(me));
        });
    }

    #togleEl(el, key = '', value = '') {
        const data = GSAttr.get(el, `data-${key}`, '').split(/[,;;]/);
        const isMatch = value.length > 0 && data.indexOf(value) > -1;
        isMatch ? GSDOM.show(el) : GSDOM.hide(el);
        GSDOM.findAll('input,textarea,select', el).forEach(el => GSAttr.set(el, 'data-ignore', isMatch ? null : true));
    }

    isInList() {
        const me = this;
        const list = me.list;
        if (!list) return true;
        if (!me.strict) return true;
        if (!list.querySelector('option')) return true;
        const opt = list.querySelector(`option[value="${me.value}"]`);
        return opt != null;
    }

    /**
     * Monitor data list change to filter other elements visibilty
     * @param {*} e 
     */
    #onDataChange(e) {
        const me = this;
        const own = me.owner;
        let opt = GSDOM.findEl(`option[value="${me.value}"]`, me.list);
        let clean = false;
        if (!opt) {
            opt = me.list.querySelector('option');
            clean = true;
        }

        const obj = GSAttr.getData(opt);

        Object.entries(obj).forEach(p => {
            const val = clean ? '' : p[1];
            const key = p[0];
            me.setAttribute(`data-${key}`, p[1]);
            if (key === 'id' || key === 'group') return;

            const filter = `[data-${key}]:not([data-${key}=""]`;
            const els = Array.from(GSDOM.findAll(filter, own));
            els.filter(el => el.tagName !== 'OPTION')
                .filter(el => GSAttr.get(el, 'list', null) == null).forEach(el => me.#togleEl(el, key, val))
        });
    }

    /**
     * Monitor parent field change for list filter 
     * @param {*} e 
     */
    #onMonitor(e) {
        const me = this;
        const list = me.list;
        me.value = '';
        const dataGroup = GSAttr.get(me.filter, 'data-group');
        GSDOM.findAll('option', list).forEach(el => GSAttr.set(el, 'disabled', true));
        const filter = dataGroup ? `option[data-group="${dataGroup}"]` : `option[data-id="${e.target.value}"]`;
        GSDOM.findAll(filter, list).forEach(el => GSAttr.set(el, 'disabled'));
    }

    #onBlur(e) {
        const me = this;
        me.reportValidity();
        if (!me.isInList()) GSEvent.send(me, 'strict', { ok: false, source: e });
    }

    #onInput(e) {
        const me = this;
        if (me.type === 'number') return me.#onNumberInput(e);
        if (me.mask) return me.#onMaskInput(e);
        if (me.type === 'text') return me.#onTextInput(e);
    }

    #onNumberInput(e) {
        const me = this;
        if (me.value.length > me.maxLength) {
            me.value = me.value.substring(0, me.maxLength);
        }
    }

    #onTextInput(e) {
        const me = this;

        if (!me.checkValidity()) {
            me.reportValidity();
            // if (me.pattern) me.value = me.#regexExtract(me.pattern, me.value);
        }
    }

    #onMaskInput(e) {
        const me = this;
        const chars = me.value.split('').slice(0, me.#masks.length);

        chars.forEach((v, i) => {
            const vld = me.#masks[i];
            if (typeof vld === 'string') return chars[i] = vld;
            if (vld instanceof RegExp) {
                vld.lastIndex = 0;
                if (!vld.test(v)) chars[i] = '';
                return;
            }
            chars[i] = '';
        });
        me.value = chars.join('');

    }

}
