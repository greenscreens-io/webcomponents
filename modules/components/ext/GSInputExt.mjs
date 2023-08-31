/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSInputExt class
 * @module components/ext/GSInputExt
 */

import GSID from "../../base/GSID.mjs";
import GSEvents from "../../base/GSEvents.mjs";
import GSComponents from "../../base/GSComponents.mjs";
import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSCSSMap from "../../base/GSCSSMap.mjs";
import GSDOMObserver from "../../base/GSDOMObserver.mjs";

/**
 * Add custom field processing
 * <input is="gs-ext-input">
 * @class
 * @extends {HTMLInputElement}
 */
export default class GSInputExt extends HTMLInputElement {

    static #wordop = ['KeyC', 'KeyV', 'KeyX', 'KeyA'];
    static #copycut = ['KeyC', 'KeyX'];
    static #special = '.^$*+?()[]{}\|';

    static #maskType = {
        n: /[0-9]/g,
        x: /[0-9a-fA-F]/g,
        y: /[0-9]/g,
        m: /[0-9]/g,
        d: /[0-9]/g,
        '#': /[a-zA-Z]/g,
        '*': /[0-9a-zA-Z]/g,
        '_': /./g
    };

    #revealing = false;
    #masks = [];

    static {
        customElements.define('gs-ext-input', GSInputExt, { extends: 'input' });
        Object.seal(GSInputExt);
        GSDOMObserver.registerFilter(GSInputExt.#onMonitorFilter, GSInputExt.#onMonitorResult);
    }

    static #onMonitorFilter(el) {
        return GSDOM.isFormElement(el);
    }

    static #onMonitorResult(el) {
        GSEvents.send(el, 'form-field', el, true, true, true);
    }

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['mask', 'pattern'];
    }

    connectedCallback() {
        const me = this;
        GSID.setIf(me);
        if (me.placeholder.length === 0) {
            if (me.mask) me.placeholder = me.mask;
        }
        me.#toPattern();
        me.#attachEvents();
        GSComponents.store(me);
        if (me.autofocus) me.focus();
        setTimeout(me.#onDataChange.bind(me), 250);
    }

    disconnectedCallback() {
        const me = this;
        me.#masks = [];
        GSComponents.remove(me);
        GSEvents.deattachListeners(me);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'mask' || name === 'pattern') this.#toPattern();
    }

    get owner() {
        const own = GSComponents.getOwner(this);
        return GSDOM.unwrap(own);
    }

    get list() {
        const me = this;
        const list = GSAttr.get(me, 'list');
        return GSDOM.getByID(me.owner, list);
    }

    get filter() {
        const me = this;
        const filter = GSAttr.get(me, 'data-filter');
        return GSDOM.getByID(me.owner, filter);
    }

    get mask() {
        return GSAttr.get(this, 'mask', '');
    }

    get strict() {
        return GSAttr.get(this, 'strict', '');
    }

    get optimized() {
        const me = this;
        const chars = me.mask.split('');

        const masks = [];
        let cnt = 0;
        chars.forEach((v, i) => {
            if (masks[masks.length - 1] === v) return cnt++;
            if (cnt > 0) masks.push(`{${++cnt}}`);
            cnt = 0;
            if (GSInputExt.#special.indexOf(v) > -1) masks.push('\\');
            masks.push(v);
        });
        if (cnt > 0) masks.push(`{${++cnt}}`);

        return masks.join('');
    }

    get autocopy() {
        return this.hasAttribute('autocopy');
    }

    get autoselect() {
        return this.hasAttribute('autoselect');
    }

    /**
     * Allow password field reveal
     */
    get reveal() {
        return this.hasAttribute('reveal');
    }

    #toPattern() {
        const me = this;
        if (me.pattern.length > 0) return;
        if (me.mask.length === 0) return;

        const chars = me.mask.split('');
        const masks = ['^'];

        let cnt = 0;
        chars.forEach((v, i) => {
            const m = GSInputExt.#maskType[v.toLowerCase()];
            if (!m) {
                if (cnt > 0) masks.push(`{${++cnt}}`);
                cnt = 0;
                if (GSInputExt.#special.indexOf(v) > -1) masks.push('\\');
                return masks.push(v);
            }

            chars[i] = new RegExp(m, 'g');

            if (masks.length === 0) return masks.push(m.source);

            if (masks[masks.length - 1] === m.source) return cnt++;

            if (cnt > 0) masks.push(`{${++cnt}}`);
            cnt = 0;
            masks.push(m.source);
        });
        if (cnt > 0) masks.push(`{${++cnt}}`);
        masks.push('$');

        me.#masks = chars;
        me.pattern = masks.join('');
        me.maxLength = me.mask.length;
    }

    #attachEvents() {
        const me = this;
        GSEvents.attach(me, me, 'keydown', me.#onKeyDown.bind(me));
        GSEvents.attach(me, me, 'keyup', me.#onKeyUp.bind(me));
        GSEvents.attach(me, me, 'keypress', me.#onKeyPress.bind(me));
        GSEvents.attach(me, me, 'input', me.#onInput.bind(me));
        GSEvents.attach(me, me, 'change', me.#onChange.bind(me));
        GSEvents.attach(me, me, 'paste', me.#onPaste.bind(me));
        GSEvents.attach(me, me, 'blur', me.#onBlur.bind(me));
        GSEvents.attach(me, me, 'click', me.#onClick.bind(me));
        requestAnimationFrame(() => {
            const list = me.list;
            if (!list) return;
            GSEvents.attach(me, me, 'change', me.#onDataChange.bind(me));
            GSEvents.attach(me, me.filter, 'change', me.#onMonitor.bind(me));
        });
    }

    #togleEl(el, key = '', value = '') {
        const data = GSAttr.get(el, `data-${key}`, '').split(/[,;;]/);
        const isMatch = value.length > 0 && data.includes(value);
        const frmel = GSDOM.isFormElement(el) || GSDOM.isButtonElement(el);
        if (frmel) {
            GSAttr.toggle(el, 'disabled', !isMatch);
        } else {
            isMatch ? GSDOM.show(el) : GSDOM.hide(el);
        }
        GSDOM.queryAll(el.closest('form'), 'input,textarea,select').forEach(el => GSAttr.set(el, 'data-ignore', isMatch ? null : true));
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
        let opt = GSDOM.query(me.list, `option[value="${me.value}"]`);
        let clean = false;
        if (!opt) {
            opt = me.list?.querySelector('option');
            clean = true;
        }

        const obj = opt?.dataset ||{};
        Object.entries(obj).forEach(p => {
            const val = clean ? '' : p[1];
            const key = p[0];
            me.setAttribute(`data-${key}`, p[1]);
            if (key === 'id' || key === 'group') return;

            const filter = `[data-${key}]:not([data-${key}=""]`;
            const els = Array.from(GSDOM.queryAll(own, filter));
            els.filter(el => el.tagName !== 'OPTION')
                .filter(el => el !== me)
                .filter(el => GSAttr.get(el, 'list').length === 0)
                .forEach(el => me.#togleEl(el, key, val))
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
        GSDOM.queryAll(list, 'option').forEach(el => GSAttr.set(el, 'disabled', true));
        const filter = dataGroup ? `option[data-group="${dataGroup}"]` : `option[data-id="${e.target.value}"]`;
        GSDOM.queryAll(list, filter).forEach(el => GSAttr.set(el, 'disabled'));
    }

    #onClick(e) {
        const me = this;
        if (me.autocopy) navigator.clipboard.writeText(me.value);
        if (me.autoselect) me.select();
    }

    #onBlur(e) {
        const me = this;
        if (me.mask && me.value === me.mask) me.value = '';
        if (me.required || !me.checkValidity()) me.reportValidity();
        if (!me.isInList()) GSEvents.send(me, 'strict', { ok: false, source: e });
    }

    #onPaste(e) {
        GSEvents.prevent(e);
        const val = e.clipboardData.getData('text');
        const me = this;
        me.value = me.formatMask(val);
    }

    #isReveal(e) {
        return this.reveal && e.key === 'Shift' && e.altKey && e.shiftKey && this.type === 'password';
    }

    #onKeyUp(e) {
        const me = this;
        if (e.key === 'Shift' && me.#revealing) {
            me.type = 'password';
        }
    }

    #onKeyDown(e) {

        const me = this;

        /* interfere with gsformext
        if (e.key === 'Enter') {
            GSEvents.send(me, 'action', { type: 'input', source: e }, true, false, true);
            return;
        }
        */

        if (me.#isReveal(e)) {
            me.#revealing = true;
            me.type = 'text';
        }

        if (e.code === 'Tab') return;

        if (!me.mask) return;

        if (e.ctrlKey) {
            const wordop = GSInputExt.#wordop.indexOf(e.code) > -1;
            const copycut = GSInputExt.#copycut.indexOf(e.code) > -1;
            // if ctrl+[c,a,x,v] operation
            if (wordop) {
                // if ctrl+[c,x] operation and invalid, prevent
                if (copycut && !me.checkValidity()) {
                    me.reportValidity();
                    return GSEvents.prevent(e);
                }
                return;
            } 
        }

        const tmp = me.value.split('');
        let pos1 = me.selectionStart;
        let pos2 = me.selectionEnd;
        let handle = false;
        let pos = pos1;

        if (e.code === 'Delete') {
            if(pos2 === tmp.length) return;
            handle = true;
            while(pos <= pos2) {
                tmp[pos] = me.mask[pos];
                pos++;
            }
            pos = pos1;
        }

        if (e.code === 'Backspace') {
            if(pos1 === 0) return;
            handle = true;
            while(pos2 >= pos1) {
                pos2--;
                if (pos2 >=0) tmp[pos2] = me.mask[pos2];
            }
            pos = pos1-1;            
        }

        if (!handle) return;

        me.value = me.formatMask(tmp.join(''));
        me.setSelectionRange(pos, pos);
        return GSEvents.prevent(e);

    }

    #onKeyPress(e) {
        const me = this;
        if (!me.mask) return;

        const tmp = me.value.split('');
        let pos1 = me.selectionStart;
        let pos2 = me.selectionEnd;

        const mask = me.#masks[pos1];

        if (mask instanceof RegExp) {
            mask.lastIndex = 0;
            if (!mask.test(e.key)) {
                GSEvents.prevent(e);
                return false;
            }
            tmp[pos1] = e.key;
        } else {
            tmp[pos1] = me.mask[pos1];    
        }


        while(pos2 > pos1) {
            tmp[pos2] = me.mask[pos2];
            pos2--;
        }

        me.value = me.formatMask(tmp.join(''));
        me.setSelectionRange(pos1 + 1, pos1 + 1);
        GSEvents.prevent(e);
    }

    #onChange(e) {
        const me = this;
        if (me.type !== 'range') return;
        me.title = me.value;
    }

    #onInput(e) {
        const me = this;
        if (me.type === 'number') return me.#onNumberInput(e);
        if (me.mask) return; //  me.#onMaskInput(me.value);
        if (me.type === 'text') return me.#onTextInput(e);
    }

    #onNumberInput(e) {
        const me = this;
        if (me.maxLength > 0 && me.value.length > me.maxLength) {
            me.value = me.value.substring(0, me.maxLength);
        }
    }

    #onTextInput(e) {
        const me = this;

        me.value = me.#updateText(me.value);

        /*
        if (!me.checkValidity()) {
            me.reportValidity();
        }
        */
    }

    formatMask(value = '') {
        const me = this;
        if (!me.mask) return value;
        
        const chars = value.split('');

        const tmp = [];

        let pos = 0;
        let valid = false;

        me.mask.split('').every((v, i) => {
            const vld = me.#masks[i];

            if (GSUtil.isString(vld)) {
                tmp.push(vld);
                if (chars[0] === vld) chars.shift();
                if (valid) pos++;
            }

            if (vld instanceof RegExp) {
                vld.lastIndex = 0;
                const c = chars.shift();
                valid = c && vld.test(c);
                tmp.push(valid ? c : v);
                if (valid) pos++;
            }

            return true;
        });

        return me.#updateText(tmp.join(''));
    }

    #updateText(value = '') {
        const map = GSCSSMap.styleValue(this, 'text-transform');
        if (map) value = GSUtil.textTransform(map.value, value);
        return value;
    }
}
