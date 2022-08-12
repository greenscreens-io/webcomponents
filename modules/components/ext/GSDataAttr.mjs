/*
 * © Green Screens Ltd., 2016. - 2022.
 */

/**
 * A module loading GSDataAttr class
 * @module components/ext/GSDataAttr
 */

import GSID from "../../base/GSID.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSDOMObserver from '../../base/GSDOMObserver.mjs';
import GSListeners from "../../base/GSListeners.mjs";

/**
 * Process Bootstrap data-bs-* attributes
 * toggle="offcanvas|collapse|dropdown|button|tab|pill|popover|tooltip|modal" 
 * dismiss="offcanvas|modal|alert"
 * 
 * TODO : trigger events to document.body
 * @class
 */
export default class GSDataAttr {

    static #dismissCSS = 'data-bs-dismiss';
    static #toggleCSS = 'data-bs-toggle';
    static #targetCSS = 'data-bs-target';

    static #toggleValues = "offcanvas|collapse|dropdown|button|tab|pill|popover|tooltip|modal";
    static #dismissValues = "offcanvas|modal|alert";

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
        if (GSUtil.isGSElement(el)) return false;
        if (!GSUtil.isHTMLElement(el)) return false;
        if (GSDataAttr.#isCollapsible(el)) el.classList.add('collapsible');
        return el.hasAttribute(GSDataAttr.#dismissCSS) || el.hasAttribute(GSDataAttr.#toggleCSS);
    }

    /**
     * Function to attach to the element
     * @param {HTMLElement} el 
     */
    static #onMonitorResult(el) {
        el.id = el.id || GSID.id;
        GSListeners.attachEvent(el, el, 'click', GSDataAttr.#onClick.bind(el));
    }

    /**
     * Callback to element removal observer
     * @param {HTMLElement} el 
     */    
    static #onMonitorRemove(el) {
        GSListeners.deattachListeners(el);
    }

    /**
     * Function to find data-bs- attributes walking up the treee
     * @param {HTMLElement} el 
     * @returns {HTMLElement}
     */    
    static #toClicker(el) {
        if (!el) return;
        if (el.hasAttribute(GSDataAttr.#toggleCSS)) return el;
        if (el.hasAttribute(GSDataAttr.#dismissCSS)) return el;
        return GSDataAttr.#toClicker(el.parentElement);
    }

    /**
     * Callback to element clic kevennt
     * @param {Event} e
     */        
    static #onClick(e) {
        const el = GSDataAttr.#toClicker(e.target);
        const dismiss = GSDataAttr.getDismiss(el);
        const toggle = GSDataAttr.#getToggle(el);
        const target = GSDataAttr.getTarget(el);
        GSDataAttr.#onToggle(el, target, toggle);
        GSDataAttr.#onDismiss(el, target, dismiss);
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
                if (!target) return {list:[el], comps:[]};
                break;
            case "collapse":
                break;
            case "dropdown":
                break;
            case "modal":
                break;
            case "offcanvas":
                break;
            case "pill":
                break;
            case "popover":
                break;
            case "tab":
                break;
            case "tooltip":
                break;
        }

        let gs = GSComponents.findAll(`gs-${type}`);
        const css = target ? target : `.${type}`;
        if (target) {
            gs = gs.filter(el => el.matches(css));
        } else {
            el = el.closest(css);
            if (el) {
                const comps = gs.filter(c => c.self.firstElementChild === el);
                return {list: comps.length === 0 ? [el] : [], comps:comps};
            }
        }


        const allComps = GSComponents.queryAll(css);
        const allRoot = Array.from(document.querySelectorAll(css));
        
        // all not descendants of component
        const all = allComps.concat(allRoot).filter(el => gs.indexOf(el) < 0) .filter(el => gs.filter(c => c.self.firstElementChild === el).length === 0);
                
        return {list:Array.from(new Set(all)), comps:gs};
    }

    static #getByType(list, type) {
        return list.filter(el => GSDataAttr.#isType(el, type));
    }

    static #getHidden(list) {
        return list.filter(el => GSDataAttr.#isHidden(el));
    }

    static #getVisible(list, hidden) {
        return list.filter(el => hidden.indexOf(el) == -1);
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
        GSUtil.toggleClass(el, true, pos);
        GSUtil.toggleClass(el, false, neg);
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
        GSUtil.toggleClass(el, false, 'show');
        if (GSDataAttr.#faded(el)) await GSUtil.timeout(GSUtil.SPEED);
        el.remove();
    }

    static #remove(obj) {
        obj.list.forEach(el => GSDataAttr.#removeEl(el));
    }

    /**
     * Show or hide target based on type
     * @param {*} el caller 
     * @param {*} target css selector
     * @param {*} type type of target
     */
    static #onToggle(el, target, type) {
        
        if (!GSDataAttr.#isToggle(type)) return;
        
        const obj = GSDataAttr.#findTarget(el, target, type);
        
        obj.comps.filter(el => GSUtil.isFunction(el.toggle)).forEach(el => el.toggle());

        GSDataAttr.#onToggleBefore(el, target, type, obj);
        GSDataAttr.#toggle(obj, type);
        GSDataAttr.#onToggleAfter(el, target, type, obj);
    }

    static #onToggleBefore(el, target, type, obj) {
        return GSDataAttr.#onToggleHandler(el, target, type, obj, true);
    }

    static #onToggleAfter(el, target, type, obj) {
        return GSDataAttr.#onToggleHandler(el, target, type, obj, false);
    }

    static #onToggleHandler(el, target, type, obj, isBefore) {
        switch (type) {
            case "button":
                break;
            case "collapse":
                if(isBefore) {
                obj.list.filter(el => el.classList.contains('accordion-collapse')).forEach(el => {
                    Array.from(el.closest('.accordion').querySelectorAll('.accordion-collapse'))
                        .filter(itm => itm != el && GSUtil.getAttribute(itm, 'data-bs-parent'))
                        .forEach(itm => GSUtil.toggleClass(itm, false, 'show'));
                });
                } else {
                    GSUtil.toggleClass(el, null, 'collapsed');
                }
                break;
            case "dropdown":
                if (isBefore) {
                    obj.list = obj.list.map(o => o.querySelector('.dropdown-menu')).filter(o => o!= null);
                } else {
                    obj.list.forEach(o => o.classList.toggle('show'));
                    obj.list.filter(o=> o.classList.contains('show')).forEach(o => GSDataAttr.#hideExt(o));
                } 
                break;
            case "modal":
                break;
            case "offcanvas":
                break;
            case "pill":
                break;
            case "popover":
                break;
            case "tab":
                break;
            case "tooltip":
                break;
        }
    }

    static #hideExt(el) {
        GSUtil.once(el, null, 'mouseleave', (e) => el.classList.remove('show'));
    }

    /**
     * Dismiss target based on type
     * @param {*} el caller 
     * @param {*} target css selector
     * @param {*} type type of target
     */
    static #onDismiss(el, target, type) {
        
        if (!GSDataAttr.#isDismiss(type)) return;
        
        const obj = GSDataAttr.#findTarget(el, target, type);
        
        obj.comps.filter(el => GSUtil.isFunction(el.close)).forEach(el => el.close());
        obj.comps.filter(el => GSUtil.isFunction(el.dismiss)).forEach(el => el.dismiss());
        
        
        switch (type) {
            case "alert":
                GSDataAttr.#remove(obj, type);
                break;
            case "modal":
                GSDataAttr.#toggle(obj, type);
                break;
            case "offcanvas":
                GSDataAttr.#toggle(obj, type);
                break;
        }

    }

    static #isDismiss(val) {
        return val && GSDataAttr.#dismissValues.indexOf(val) > -1;
    }

    static #isToggle(val) {
        return val && GSDataAttr.#toggleValues.indexOf(val) > -1;
    }

    static #getDismiss(el) {
        return GSUtil.getAttribute(el, GSDataAttr.#dismissCSS);
    }

    static #getToggle(el) {
        return GSUtil.getAttribute(el, GSDataAttr.#toggleCSS);
    }

    /**
     * Return data-bs-target attribute value for element
     * @param {HTMLElement} el 
     * @returns {string}
     */
    static getTarget(el) {
        const tgt =  GSUtil.getAttribute(el, GSDataAttr.#targetCSS) || GSUtil.getAttribute(el, 'href');
        return tgt === '#' ? '' : tgt;
    }

    /**
     * Return dismiss css for element
     * @param {HTMLElement} el 
     * @returns {string}
     */    
    static getDismiss(el) {
        const val = GSDataAttr.#getDismiss(el);
        return GSDataAttr.#isDismiss(val) ? val : '';
    }

    /**
     * Return toggle css value for element
     * @param {HTMLElement} el 
     * @returns {string}
     */    
    static getToggle(el) {
        const val = GSDataAttr.#getToggle(el);
        return GSDataAttr.#isToggle(val) ? val : '';
    }

    /**
     * Return if element is dismissable
     * @param {HTMLElement} el 
     * @returns {boolean}
     */    
    static isDismiss(el) {
        return GSDataAttr.#isDismiss(GSDataAttr.#getDismiss(el));
    }

    /**
     * Return if element is toggable
     * @param {HTMLElement} el 
     * @returns {boolean}
     */        
    static isToggle(el) {
        return GSDataAttr.#isToggle(GSDataAttr.#getToggle(el));
    }

}
