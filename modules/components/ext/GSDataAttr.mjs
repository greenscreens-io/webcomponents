/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDataAttr class
 * @module components/ext/GSDataAttr
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSDOMObserver from '../../base/GSDOMObserver.mjs';
import GSEvent from "../../base/GSEvent.mjs";
import GSFunction from "../../base/GSFunction.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSAttr from "../../base/GSAttr.mjs";

/**
 * Process Bootstrap data-bs-* attributes
 * toggle="offcanvas|collapse|dropdown|button|tab|pill|popover|modal|popup" 
 * dismiss="offcanvas|modal|alert|popup"
 * 
 * TODO : trigger events to document.body
 * @class
 */
export default class GSDataAttr {

    static #toggleValues = "offcanvas|collapse|dropdown|button|tab|pill|popover|modal|dialog|popup"; // tooltip|
    static #dismissValues = "offcanvas|modal|alert|popup|dialog";

    static {
        GSDOMObserver.registerFilter(GSDataAttr.#onMonitorFilter, GSDataAttr.#onMonitorResult);
        GSDOMObserver.registerFilter(GSDataAttr.#onMonitorFilter, GSDataAttr.#onMonitorRemove, true);
    }

    /**
     * Filter function for monitor observer
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static #onMonitorFilter(el) {
        if (GSDOM.isGSElement(el)) return false;
        if (!GSDOM.isHTMLElement(el)) return false;
        if (GSDataAttr.#isCollapsible(el)) el.classList.add('collapsible');
        return el.dataset.bsDismiss
            || el.dataset.bsToggle
            || el.dataset.inject;
    }

    /**
     * Function to attach to the element
     * @param {HTMLElement} el 
     */
    static #onMonitorResult(el) {
        el.id = el.id || GSID.id;
        GSEvent.attach(el, el, 'click', GSDataAttr.#onClick.bind(el));
    }

    /**
     * Callback to element removal observer
     * @param {HTMLElement} el 
     */
    static #onMonitorRemove(el) {
        GSEvent.deattachListeners(el);
    }

    /**
     * Function to find data-bs- attributes walking up the treee
     * @param {HTMLElement} el 
     * @returns {HTMLElement}
     */
    static #toClicker(el) {
        if (!el) return;
        if (el.dataset?.bsToggle) return el;
        if (el.dataset?.bsDismiss) return el;
        if (el.dataset?.inject) return el;
        return GSDataAttr.#toClicker(el.parentElement);
    }

    /**
     * Callback to element clic kevennt
     * @param {Event} e
     */
    static #onClick(e) {
        const el = GSDataAttr.#toClicker(e.target);
        const inject = el?.dataset?.inject;
        const dismiss = el?.dataset?.bsDismiss;
        const target = GSDataAttr.getTarget(el);
        const toggle = el?.dataset?.bsToggle;
        GSDataAttr.#onToggle(el, target, toggle);
        GSDataAttr.#onDismiss(el, target, dismiss);
        GSDataAttr.#onInject(el, target, inject);
    }

    /**
     * Search for target to toggle or dismiss
     * @param {HTMLHtmlElement} el 
     * @param {string} target 
     * @param {string} type 
     * @return {Object} List of GSComponentes and html elements matched  {comps : [], list []}
     */
    static #findTarget(el, target, type) {

        switch (type) {
            case "alert":
                break;
            case "button":
                if (!target) return { list: [el], comps: [] };
                break;
            case "collapse":
                break;
            case "dropdown":
                break;
            case "modal":
                break;
            case "dialog":
                break;                
            case "offcanvas":
                break;
            case "pill":
                break;
            case "popover":
                break;
            case "poup":
                break;
            case "tab":
                break;
            case "tooltip":
                return { list: [], comps: [] };
                break;
        }

        let gs = GSDOM.queryAll(document.documentElement, `gs-${type}`);
        const css = target ? target : `.${type}`;
        if (target) {
            gs = gs.filter(el => el.matches(css));
        } else {
            el = el.closest(css);
            if (el) {
                const comps = gs.filter(c => c.self.firstElementChild === el);
                return { list: comps.length === 0 ? [el] : [], comps: comps };
            }
        }

        const allComps = GSDOM.queryAll(document.documentElement, css);
        const allRoot = Array.from(document.querySelectorAll(css));

        // all not descendants of component
        const all = allComps.concat(allRoot).filter(el => gs.indexOf(el) < 0).filter(el => gs.filter(c => c.self.firstElementChild === el).length === 0);

        return { list: Array.from(new Set(all)), comps: gs };
    }

    static #getByType(list, type) {
        return list.filter(el => GSDataAttr.#isType(el, type));
    }

    static #getHidden(list) {
        return list.filter(el => GSDataAttr.#isHidden(el));
    }

    static #getVisible(list, hidden) {
        return list.filter(el => !hidden.includes(el));
    }

    static #isType(el, type) {
        return type.split(' ').filter(v => v.trim()).map(v => v === 'button' ? 'btn' : v).filter(t => el.classList.contains(t)).length > 0;
    }

    static #isHidden(el) {
        return (el.classList.contains('hide') || el.classList.contains('fade') || el.classList.contains('collapse')) && !el.classList.contains('show');
    }

    static #isCollapsible(el) {
        return el.classList.contains('collapse') && !el.classList.contains('accordion-collapse');
    }

    static #faded(el) {
        return el.classList.contains('fade');
    }

    static #switch(el, pos, neg) {
        GSDOM.toggleClass(el, pos, true);
        GSDOM.toggleClass(el, neg, false);
    }

    static #hide(el) {
        const css = GSDataAttr.#isCollapsible(el) ? '' : 'fade';
        GSDataAttr.#switch(el, css, 'show');
    }

    static #show(el) {
        const css = GSDataAttr.#isCollapsible(el) ? 'gsanim' : 'fade';
        GSDataAttr.#switch(el, 'show', css);
    }

    static #toggle(obj, type) {

        const list = GSDataAttr.#getByType(obj.list, type);

        const objsH = GSDataAttr.#getHidden(list);
        const objsV = GSDataAttr.#getVisible(list, objsH);

        objsV.forEach(el => GSDataAttr.#hide(el));
        objsH.forEach(el => GSDataAttr.#show(el));
    }

    static async #removeEl(el) {
        GSDOM.toggleClass(el, 'show', false);
        if (GSDataAttr.#faded(el)) await GSUtil.timeout(GSDOM.SPEED);
        el.remove();
    }

    static #remove(obj) {
        obj.list.forEach(el => GSDataAttr.#removeEl(el));
    }

    /**
    * Automatic template injection at given target
    * @param {*} source caller 
    * @param {*} target css selector
    * @param {*} type type of target
    */
    static #onInject(source, target, inject) {

        if (!inject) return;

        const isComp = inject.toLowerCase().startsWith('gs-');
        const list = GSDOM.queryAll(document.documentElement, target);
        const css = source?.dataset?.css || '';

        const html = isComp ? `<${inject}></${inject}>` : `<gs-template href="${inject}" class="${css}"></gs-template>`;

        list.forEach(el => GSDOM.setHTML(el, html));
    }

    /**
     * Show or hide target based on type
     * @param {*} source caller 
     * @param {*} target css selector
     * @param {*} type type of target
     */
    static #onToggle(source, target, type) {

        if (!GSDataAttr.#isToggle(type)) return;

        const obj = GSDataAttr.#findTarget(source, target, type);

        obj.comps.filter(el => GSFunction.isFunction(el.toggle)).forEach(el => el.toggle(source));

        GSDataAttr.#onToggleBefore(source, target, type, obj);
        GSDataAttr.#toggle(obj, type);
        GSDataAttr.#onToggleAfter(source, target, type, obj);
    }

    static #onToggleBefore(source, target, type, obj) {
        return GSDataAttr.#onToggleHandler(source, target, type, obj, true);
    }

    static #onToggleAfter(source, target, type, obj) {
        return GSDataAttr.#onToggleHandler(source, target, type, obj, false);
    }

    static #onToggleHandler(source, target, type, obj, isBefore) {
        switch (type) {
            case "button":
                break;
            case "collapse":
                if (isBefore) {
                    obj.list.filter(el => el.classList.contains('accordion-collapse')).forEach(el => {
                        Array.from(el.closest('.accordion').querySelectorAll('.accordion-collapse'))
                            .filter(itm => itm != el && GSAttr.get(itm, 'data-bs-parent'))
                            .forEach(itm => GSDOM.toggleClass(itm, 'show', false));
                    });
                } else {
                    GSDOM.toggleClass(source, 'collapsed', null);
                }
                break;
            case "dropdown":
                if (isBefore) {
                    obj.list = obj.list.map(o => o.querySelector('.dropdown-menu')).filter(o => o != null);
                } else {
                    obj.list.forEach(o => o.classList.toggle('show'));
                    obj.list.filter(o => o.classList.contains('show')).forEach(o => GSDataAttr.#hideExt(o));
                }
                break;
            case "modal":
                break;
            case "dialog":
                break;                
            case "offcanvas":
                break;
            case "pill":
                break;
            case "popover":
                break;
            case "popup":
                break;
            case "tab":
                break;
            case "tooltip":
                break;
        }
    }

    static #hideExt(source) {
        GSEvent.once(source, null, 'mouseleave', (e) => source.classList.remove('show'));
    }

    /**
     * Dismiss target based on type
     * @param {*} source caller 
     * @param {*} target css selector
     * @param {*} type type of target
     */
    static #onDismiss(source, target, type) {

        if (!GSDataAttr.#isDismiss(type)) return;

        const obj = GSDataAttr.#findTarget(source, target, type);

        obj.comps.filter(el => GSFunction.isFunction(el.close)).forEach(el => el.close());
        obj.comps.filter(el => GSFunction.isFunction(el.dismiss)).forEach(el => el.dismiss());


        switch (type) {
            case "alert":
                GSDataAttr.#remove(obj, type);
                break;
            case "modal":
            case "offcanvas":
            case "popup":
                GSDataAttr.#toggle(obj, type);
                break;
        }

    }

    static #isDismiss(val) {
        return val && GSDataAttr.#dismissValues.includes(val);
    }

    static #isToggle(val) {
        return val && GSDataAttr.#toggleValues.includes(val);
    }

    /**
     * Return data-bs-target attribute value for element
     * @param {HTMLElement} el 
     * @returns {string}
     */
    static getTarget(el) {
        const tgt = el?.dataset?.bsTarget || GSAttr.get(el, 'href');
        return tgt === '#' ? '' : tgt;
    }

    /**
     * Return dismiss css for element
     * @param {HTMLElement} el 
     * @returns {string}
     */
    static getDismiss(el) {
        return el?.dataset?.bsDismiss || '';
    }

    /**
     * Return toggle css value for element
     * @param {HTMLElement} el 
     * @returns {string}
     */
    static getToggle(el) {
        return el?.dataset?.bsToggle || '';
    }

    static getInject(el) {
        return el?.dataset?.inject || '';
    }

    /**
     * Return if element is dismissable
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static isDismiss(el) {
        return el?.dataset?.bsDismiss ? true : false;
    }

    /**
     * Return if element is toggable
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    static isToggle(el) {
        return el?.dataset?.bsToggle ? true : false;
    }

}

