/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSLayout class
 * @module components/GSLayoutElement
 */

import { classMap, createRef, css, html, ref } from '../lib.mjs';
import { color, placement, PlacementTypes, notEmpty, numGT0 } from '../properties/index.mjs';
import { GSElement } from '../GSElement.mjs';

/**
 * Renderer for panel layout 
 * @class
 * @extends {Component}
 */
export class GSSplitPanelElement extends GSElement {

    static styles = css`
    :host{
        --gs-width : inherited;
        --gs-height : inherited;
        --gs-min-width: inherited;
        --gs-max-width: inherited;
        --gs-min-height: inherited;
        --gs-max-height: inherited;
    }
    .gs-size {
        width : var(--gs-width) !important;
        height : var(--gs-height) !important;
     }
     .gs-minimax {
        min-width : var(--gs-min-width) !important;
        max-width : var(--gs-max-width) !important;
        min-height : var(--gs-min-height) !important;
        max-height : var(--gs-max-height) !important;       
      }
      div:first-of-type{!important;max-height: 100%;}`;

    static properties = {
        resize: { ...placement, hasChanged: notEmpty },
        width: { type: Number, hasChanged: numGT0 },
        height: { type: Number, hasChanged: numGT0 },
        horizontal: { type: Boolean },
        border: { type: Boolean },
        shadow: { type: Boolean },
        fixed: { type: Boolean },
        min: { type: Number },
        max: { type: Number },
        color: { ...color },
    }

    #refEl = createRef();

    constructor() {
        super();
        this.type = 'vertical';
        this.resize = 'start';
    }

    renderUI() {
        const me = this;
        const isBefore = PlacementTypes.isBefore(me.resize);
        return html`<div ${ref(me.#refEl)} class="${classMap(me.renderClass())}">
        <div class="d-flex ${isBefore ? 'gs-minimax' : 'flex-fill'} overflow-hidden"><slot name="before"></slot></div>
        ${me.fixed ? '' : me.#splitter}
        <div class="d-flex ${isBefore ? 'flex-fill' : 'gs-minimax'} overflow-hidden"><slot name="after"></slot></div>
        </div>`;
    }

    renderClass() {
        const me = this;
        return {
            ...super.renderClass(),
            'd-flex': true,
            'vh-100': false,
            'flex-grow-1': true,
            'flex-fill': true,
            'flex-column': me.horizontal,
            'gs-size': me.height || me.width,
            'shadow-sm': me.shadow,
            'border': me.border,
            [`text-bg-${me.color}`]: me.color,
        }
    }

    updated() {
        const me = this;
        const width = me.#toStyle(me.width);
        const height = me.#toStyle(me.height);
        const min = me.#toStyle(me.min);
        const max = me.#toStyle(me.max);

        me.#setStyle('--gs-width', width);
        me.#setStyle('--gs-height', height);
        me.#setStyle('--gs-min-height', min);
        me.#setStyle('--gs-max-height', max);
        me.#setStyle('--gs-min-width', min);
        me.#setStyle('--gs-max-width', max);
    }

    #setStyle(name, val) {
        this.#refEl.value.style.setProperty(name, val);
    }

    #toStyle(val) {
        return val ? `${val}px` : 'inherited';
    }

    get #splitter() {
        return html`<gs-splitter split="${this.#splitType}" resize="${this.resize}"></gs-splitter>`;
    }

    get #splitType() {
        return this.horizontal ? 'horizontal' : 'vertical';
    }

    static {
        this.define('gs-split-panel');
    }
}
