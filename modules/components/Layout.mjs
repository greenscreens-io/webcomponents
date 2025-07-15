/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSLayout class
 * @module components/GSLayoutElement
 */

import { classMap, html, ifDefined, templateContent } from '../lib.mjs';
import { orientation, OrientationTypes } from '../properties/orientation.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { GSDOM } from '../base/GSDOM.mjs';

/**
 * Renderer for panel layout 
 * @class
 * @extends {Component}
 */
export class GSLayoutElement extends GSElement {

    static properties = {
        type: { ...orientation }
    }

    // GS-ITEM attributes mapping
    static options = {
        id : {},
        type: {},
        min: { type: Number },
        max: { type: Number },
        size: { type: Number },
        resizable: { type: Boolean },
        autofit: { type: Boolean },
        vPos: { attribute: 'h-pos' },
        hPos: { attribute: 'v-pos' },
    }

    constructor() {
        super();
        const me = this;
        me.autofit = true;  
        me.#items(me).map((el, idx, els) => me.#dyncss(el, idx, els, 0));
    }

    connectedCallback() {
        super.connectedCallback();
        if ( this.autofit && GSDOM.root(this) === document.body) document.body.classList.add('vh-100');
    }

    renderUI() {
        const me = this;
        const list = me.#items(me).map((el, idx, els) => me.#build(el, idx, els));
        return html`<div  dir="${ifDefined(me.direction)}" class="d-flex flex-fill w-100 h-100 ${classMap(me.renderClass())}">${list}</div>`;
    }

    renderClass() {
        const me = this;
        const horizontal = OrientationTypes.isHorizontal(me.type);
        return {
            ...super.renderClass(),
            'flex-column': horizontal
        }
    }

    /**
     * Proxify GS-ITEM elements to easily read attributes
     */
    #items(root) {
        return GSItem.collect(root).map(el => GSAttr.proxify(el, GSLayoutElement.options));
    }

    #resizable(el) {
        return el.size > 0 || el.min > 0 || el.max > 0 || el.resizable;
    }

    #dyncss(el, idx, els, lev = 0) {
        const me = this;
        me.#items(el.self).map((it, idx, items) => me.#dyncss(it, idx, items, lev+1));
        if(me.#resizable(el)) me.dynamicStyle(`gsd-${lev}-${idx}`);
    }

    #build(el, idx, els, lev = 0) {

        const me = this;
        const type = el.self.parentElement.type || 'vertical';

        const list = me.#items(el.self).map((it, idx, items) => me.#build(it, idx, items, lev+1));
        
        const min = el.min;
        const max = el.max;
        const template = el.template;
        const tplEl = me.#elementTemplate(el);

        const tc = `#${tplEl?.id}` !== template;

        const dir = el.type || type || 'vertical';
        const horizontal = OrientationTypes.isHorizontal(dir);
        
        const col = list.length > 0 && horizontal ? 'flex-column' : '';

        const did = `gsd-${lev}-${idx}`;
        const css = me.#panelCSS(el, col, did);
        const style = me.#panelStyle(el, horizontal);
        me.dynamicStyle(did, style);

        const slot = el.name ? html`<slot name="${el.name}"></slot>` : '';
        const src = html`<div id="${ifDefined(el.id)}" class="d-flex ${classMap(css)}">
            ${list}
            ${templateContent(tplEl)}
            ${template && tc ? html`<gs-template flat src="${template}"></gs-template>` : ''}
            ${slot}
            </div>`;
            // ${tc ? me.renderTemplate() : ''}
            

        if (!el.resizable) return src;

        const resize = (idx === els.length - 1) ? 'end' : 'start';
        const splitter = me.#splitter(min, max, type, resize);

        if (idx === els.length - 1) return [splitter , src];
        return [src, splitter];
    }
    
    #elementTemplate(el) {
        const tplEl = el.self.firstElementChild;
        return  GSDOM.isTemplateElement(tplEl) ? tplEl : undefined;
    }

    #panelCSS(el, col, did) {

        const resizable = this.#resizable(el);
        const grow = resizable ? '' : 'flex-grow-1';

        let vpos = el.vPos;
        let hpos = el.hPos;

        hpos = hpos ? `align-items-${hpos}` : '';
        vpos = vpos ? `justify-content-${vpos}` : '';

        const css = this.mapCSS(el.css, {
            [did] : resizable,
            [col] : col,
            [grow] : grow,
            [hpos] : hpos,
            [vpos] : vpos
        });
    
        return css;        
    }

    #panelStyle(el, horizontal) {
        const min = el.size || el.min;
        const max = el.max || el.size;
        const style = {};
        if (horizontal) {
            style['min-height'] = min > 0 ? `${min}px` : undefined;
            style['max-height'] = max > 0 ? `${max}px` : undefined;
        } else {
            style['min-width'] = min > 0 ? `${min}px` : undefined;
            style['max-width'] = max > 0 ? `${max}px` : undefined;
        }
        return style;        
    }

    #splitter(min, max, dir, resize) {
        return html`<gs-splitter split="${dir}" resize="${resize}" min="${min}" max="${max}"></gs-splitter>`;
    }

    static {
        this.define('gs-layout');
    }
}
