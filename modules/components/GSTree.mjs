/*
 * Copyright (C) 2015, 2023 Green Screens Ltd.
 */

/**
 * A module loading GSTree class
 * @module components/GSTree
 */

import GSUtil from "../base/GSUtil.mjs";
import GSElement from "../base/GSElement.mjs";
import GSItem from "../base/GSItem.mjs";
import GSLoader from "../base/GSLoader.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSEvents from "../base/GSEvents.mjs";

/**
 * Renderer for bootstrap list group 
 * <gs-tree css="">
 *     <gs-item css="" action="" target="" toggle="" target="" dismiss="" title=""></gs-item>
 *     <gs-item css="" action="" target="" toggle="" target="" dismiss="" title="">
 *         <gs-item css="" action="" target="" toggle="" target="" dismiss="" title=""></gs-item>
 *     </gs-item>
 * </gs-list>
 * @class
 * @extends {GSElement}
 */
export default class GSTree extends GSElement {

    #selected = null;
    #events = null;

    static {
        customElements.define('gs-tree', GSTree);
        Object.seal(GSTree);
    }

    static get observedAttributes() {
        const attrs = ['data'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        GSItem.validate(this, this.tagName);
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get itemIcon() {
        return GSAttr.get(this, 'item-icon', 'bi bi-file-earmark');
    }

    set itemIcon(val = '') {
        return GSAttr.set(this, 'item-icon', val);
    }

    // 'bi bi-caret-down'
    get openIcon() {
        return GSAttr.get(this, 'open-icon', 'bi bi-folder2-open');
    }

    set openIcon(val = '') {
        return GSAttr.set(this, 'open-icon', val);
    }

    // 'bi bi-caret-right'
    get closeIcon() {
        return GSAttr.get(this, 'close-icon', 'bi bi-folder');
    }

    set closeIcon(val = '') {
        return GSAttr.set(this, 'close-icon', val);
    }

    get rootEl() {
        return this.query('.treeview');
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        if (name === 'data') return this.load(newValue);
    }

    connectedCallback() {
        const me = this;
        me.#events = {};
        me.#events.click = me.#onClick.bind(me);
        me.#events.keydown = me.#onKeyDown.bind(me);
        me.#events.keyup = me.#onKeyUp.bind(me);
        super.connectedCallback();
    }

    disconnectedCallback() {
        const me = this;
        const own = me.rootEl;
        GSEvents.unlisten(own, null, 'click', me.#events?.click);
        GSEvents.unlisten(own, null, 'keydown', me.#events?.keydown);
        GSEvents.unlisten(own, null, 'keyup', me.#events?.keyup);
        me.#events = null;
        me.#selected = null;
        super.disconnectedCallback();
    }

    async onBeforeReady() {
        await super.onBeforeReady();
        const me = this;
        const own = me.rootEl;
        GSEvents.listen(own, null, 'click', me.#events.click);
        GSEvents.listen(own, null, 'keydown', me.#events.keydown);
        GSEvents.listen(own, null, 'keyup', me.#events.keyup);
    }

    async getTemplate() {
        const me = this;
        const html = me.#render();
        return `
        <style>
        .treeview span.indent {
             margin-left: 10px;
             margin-right: 10px;
         }
        .treeview .list-group-item {
            cursor: pointer;
        }                    
        </style>        
        <div class="treeview ${me.css}" _tabindex="0">
            <ul class="list-group">
                ${html}
            </ul>
        </div>`;
    }

    #render() {
        const me = this;
        return GSItem.genericItems(me).map((el, idx) => me.#html(el, 0, idx)).join('');
    }

    #html(el, level = 0, idx = 0, pid = '', parent = '', css = '') {

        const me = this;
        const name = el.name || el.title;
        const path = `${parent}/${name}`
        const isFolder = el.childElementCount > 0;
        const isOpen = GSAttr.getAsBool(el, 'open', false);

        if (level === 0) {
            css = isFolder && !isOpen ? 'gs-hide' : '';
        }

        const nodeid = GSUtil.isStringEmpty(pid) ? idx : `${pid}.${idx}`;

        const html = [];

        html.push(`<li class="list-group-item ${level === 0 ? '' : css}" `);
        html.push(`data-folder="${isFolder}" data-open="${isOpen}" data-nodeid="${nodeid}"  `);
        html.push(`data-path="${path}"  data-name="${name}">`);
        html.push(me.#uiHtml(el, level));

        if (isFolder) {
            Array.from(el.children).forEach((ce, idx) => html.push(me.#html(ce, level + 1, idx, nodeid, path, css)));
        }

        html.push('</li>');
        return html.join('');
    }

    #uiHtml(el, level) {

        const me = this;
        const title = GSAttr.get(el, 'title');
        const isFolder = el.childElementCount > 0;
        const isOpen = GSAttr.getAsBool(el, 'open', false);

        const href = GSItem.getHref(el);
        const hreftgt = href && href !== '#' ? `target="${GSItem.getTarget(el)}"` : '';

        const dataAttrs = GSAttr.dataToString(el);
        const dataBS = GSItem.getAttrs(el);

        let itemIco = GSItem.getIcon(el, me.itemIcon);
        if (isFolder) itemIco = isOpen ? GSAttr.get(el, 'open-icon', me.openIcon) : GSAttr.get(el, 'close-icon', me.closeIcon);

        const html = [];
        while (level--) {
            html.push('<span class="indent"></span>');
        }

        html.push(`<i class="fs-5 ${itemIco}"></i>`);
        html.push(`<a href="${href}" ${hreftgt} ${dataBS} ${dataAttrs} class="ps-1">${title}</a>`);
        return html.join('');
    }

    #select(el, sts = false) {
        GSDOM.toggleClass(el || this.#selected, 'active', sts);
    }

    #update(el, e) {
        if (!el) return;
        const me = this;
        me.#select();
        me.#selected = el;
        me.#select(el, true);
        const a = me.#selected.querySelector('a');
        a?.focus();
        me.emit('select', me.#selected);
        const action = a?.dataset?.action;
        if (!action) return;
        const data = {type: 'tree', action:action, data:el, evt: e}
        GSEvents.sendDelayed(1, me, 'action', data);
    }

    #isFolder(el) {
        return (el || this.#selected)?.dataset.folder === 'true';
    }

    #isOpen(el) {
        return (el || this.#selected)?.dataset.open === 'true';
    }

    #toggleFolder(sts = false) {
        const me = this;
        if (!me.#isFolder()) return;
        requestAnimationFrame(() => {
            me.#selected.dataset.open = sts;
            const nid = me.#selected.dataset.nodeid;
            const pl = nid.split('\.').length;
            me.#toggleIcon(me.#selected, sts);
            let el = me.#selected.nextElementSibling;
            while (el) {
                const cid = el.dataset.nodeid;
                const isChild = cid && cid.indexOf(nid) === 0;
                if (!isChild) break;
                if (sts) {
                    const cl = cid.split('\.').length;
                    if (cl > pl + 1) {
                        el = el.nextElementSibling;
                        continue;    
                    }
    
                    if (pl + 1 != cl && sts) break;
                }
                GSDOM.toggleClass(el, 'gs-hide', !sts);
                if (!sts) el.dataset.open = sts;
                el = el.nextElementSibling;
            }
        });
        me.emit(sts ? 'open' : 'close', me.#selected);
    }

    #toggleIcon(el, expand) {
        const me = this;
        const isFolder = me.#isFolder(el);
        if (!isFolder) return;
        const iconEl = el.querySelector('i');
        if (!iconEl) return;
        const ico = expand ? me.openIcon : me.closeIcon;
        GSAttr.set(iconEl, 'class', `fs-5 ${ico}`);
    }

    #onClick(e) {
        const me = this;
        const name = 'list-group-item';
        const el = GSDOM.hasClass(e.target, name) ? e.target : e.target.closest('.' + name);
        me.#update(el, e);
        if (e.target.tagName !== 'I') return;
        const isOpen = me.#isOpen();
        me.#toggleFolder(!isOpen);
    }

    #onKeyUp(e) {
        const me = this;
        switch (e.code) {
            case 'Tab':
                me.#update(e.target.closest('li'));
                break;
        }
    }

    #onKeyDown(e) {
        const me = this;
        switch (e.code) {
            case 'ArrowUp':
                me.prev();
                break;
            case 'ArrowDown':
                me.next();
                break;
            case 'ArrowLeft':
                me.close();
                break;
            case 'ArrowRight':
                me.open();
                break;
            case 'Tab':
                me.#update(e.target.closest('li'));
                break;
        }
    }

    #parentNode(nodeid) {
        return nodeid.split('.').slice(0,-1).join('.');
    }

    #parent(el) {
        const me = this;
        el = el || me.#selected;
        let s = el.dataset.nodeid;
        s = me.#parentNode(s);
        return el.parentElement.querySelector(`li[data-nodeid="${s}"]`);
    }

    #next(el) {
        el = el?.nextElementSibling;
        while(el) {
            if (!el.classList.contains('gs-hide')) break;
            el = el.nextElementSibling;
        }
        return el;
    }

    #previous(el) {
        el = el?.previousElementSibling;
        while(el) {
            if (!el.classList.contains('gs-hide')) break;
            el = el.previousElementSibling;
        }        
        return el;
    }

    get level() {
        return this.#selected?.dataset.nodeid.split('.').length || -1;
    }

    get path() {
        return this.#selected?.dataset.path;
    }

    next() {
        const me = this;
        if (!me.#selected) return me.#update(me.query('li:first-of-type'));
        const el = me.#next(me.#selected);
        if (el) return me.#update(el);
        me.#selected = null;
        me.next() ;
    }

    prev() {
        const me = this;
        if (!me.#selected) return me.#update(me.query('li:last-of-type'));
        const el = me.#previous(me.#selected);
        if (el) return me.#update(el);
        me.#selected = null;
        me.prev() ;
    }

    /**
     * Open folder
     * TODO - path navigation
     */
    open(path) {
        const me = this;
        const isOpen = me.#isOpen();
        const isFolder = me.#isFolder();
        if (isOpen && isFolder) return me.next();
        me.#toggleFolder(true);
    }

    /**
     * Close folder
     * TODO - path navigation
     */
    close(path) {
        const me = this;
        const isFolder = me.#isFolder();
        const isOpen = me.#isOpen();
        if (!isFolder || !(isOpen && isFolder)) return me.#update(me.#parent());
        //if (!isOpen && isFolder) return me.prev();
        me.#toggleFolder(false);
    }

    /**
     * Load data from various sources
     * 
     * @param {JSON|func|url} val 
     * @async
     * @returns {Promise}
     */
    async load(val = '') {
        const data = await GSLoader.loadData(val);
        if (!GSUtil.isJsonType(data)) return;
        const me = this;
        // me.disconnectedCallback();
        me.innerHTML = '';

        let dom = GSDOM.fromJson(val);
        dom = Array.isArray(dom) ? dom : [dom];
        dom.forEach(el => GSDOM.appendChild(me, el) );

        me.repaint();
        return data;
    }

}

