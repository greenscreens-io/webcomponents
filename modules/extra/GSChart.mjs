/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSChart class
 * @module components/GSChart
 */

import { Chart, registerables } from '../../assets/chart/chart.mjs';
Chart.register(...registerables);

import GSElement from "../base/GSElement.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSLoader from '../base/GSLoader.mjs';
import GSItem from '../base/GSItem.mjs';

/**
 * Code editor based on ChartJS Library
 * https://www.chartjs.org/docs/latest/
 * 
 * <gs-chart css=""></gs-chart>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSChart extends GSElement {

    #chart = null;

    static {
        customElements.define('gs-chart', GSChart);
        Object.seal(GSChart);
    }

    static get observedAttributes() {
        const attrs = ['width', 'height'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();

    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        me.resize(me.width, me.height);

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        const me = this;
        if (me.#chart) me.#chart.destroy();
        me.#chart = null;
    }

    async getTemplate(val = '') {
        const me = this;
        if (me.width && me.height) {
            //return `<div style="width:${me.width}px;height:${me.height}px;"><canvas width="${me.width}" height="${me.height}" class="${me.css}"></canvas></div>`;
            return `<canvas width="${me.width}" height="${me.height}" class="${me.css}"></canvas>`;
        }
        return `<canvas class="${me.css}"></canvas>`;
    }

    onReady() {
        const me = this;
        super.onReady();
        me.#render();
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get width() {
        return GSAttr.getAsNum(this, 'width', 0);
    }

    set width(val = '') {
        return GSAttr.setAsNum(this, 'width', val);
    }

    get height() {
        return GSAttr.getAsNum(this, 'height', 0);
    }

    set height(val = '') {
        return GSAttr.setAsNum(this, 'height', val);
    }

    /**
     * URL of chart JSON data
     */
    get data() {
        return GSAttr.get(this, 'data');
    }

    set data(val = '') {
        return GSAttr.get(this, 'data', val);
    }

    /**
     * URL of chart options JSON data
     */
    get options() {
        return GSAttr.get(this, 'options');
    }

    set options(val = '') {
        return GSAttr.get(this, 'options', val);
    }

    get canvas() {
        return this.query('canvas');
    }

    // https://www.chartjs.org/docs/latest/developers/api.html

    reset() {
        const me = this;
        if (me.#chart) me.#chart.reset();
    }

    render() {
        const me = this;
        if (me.#chart) me.#chart.render();
    }

    update(val) {
        const me = this;
        if (me.#chart) me.#chart.update(val);
    }

    stop() {
        const me = this;
        if (me.#chart) me.#chart.stop();
    }

    clear() {
        const me = this;
        if (me.#chart) me.#chart.clear();
    }

    resize(x, y) {
        const me = this;
        if (me.#chart) {
            requestAnimationFrame(() =>{
                const div = me.query('div');
                if (div) {
                    div.style.width = `${x}px`;
                    div.style.height = `${y}px`;
                }
                me.#chart.resize(x, y);
            });
        }
    }

    toBase64Image(type = "image/png", quality = 1) {
        const me = this;
        if (me.#chart) return me.#chart.toBase64Image(type, quality);
    }

    // internal functions to render JSON from gs-items elements

    async #render() {
        
        const me = this;
        
        const options = await GSLoader.loadSafe(me.options, 'GET', null, true, {});
        const data = await GSLoader.loadSafe(me.data, 'GET', null, true, []);
        
        const el = me.querySelector('gs-item[group="options"]');        
        const opt = Object.assign(options, GSItem.toJson(el));

        const sets = opt.data.datasets;
        sets.forEach((o, i) => {
            o.data = sets.length === 1 ? data : data[i] || [];
        });

        const ctx = me.canvas.getContext('2d');
        me.#chart = new Chart(ctx, opt);
    }

}