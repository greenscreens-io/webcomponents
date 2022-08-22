/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSCalendar class
 * @module components/GSCalendar
 */

import GSComponents from '../base/GSComponents.mjs';
import GSDate from '../base/GSDate.mjs';
import GSElement from '../base/GSElement.mjs'
import GSEvent from '../base/GSEvent.mjs';
import GSUtil from '../base/GSUtil.mjs';

/**
 * Generator for month selector panel
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSCalendar extends GSElement {

    #date = null;

    static {
        customElements.define('gs-calendar', GSCalendar);
    }

    constructor() {
        super();
        this.#date = new GSDate();
    }

    attributeChanged(name = '', oldVal = '', newVal = '') {
        const me = this;
        if (name === 'date') {
            me.#date = new GSDate(newVal);
            me.#update();
        }
        if (name === 'format') {
            me.#date.format = newVal;
        }
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    onReady() {
        const me = this;
        me.#update();
        me.attachEvent(me.findEl('.header'), 'click', me.#onArrow.bind(me));
        me.attachEvent(me.findEl('div'), 'click', me.#onDay.bind(me));
        me.attachEvent(me.yearEl, 'change', me.#onYear.bind(me));
        me.attachEvent(me.monthEl, 'change', me.#onMonth.bind(me));
        super.onReady();
    }

    async getTemplate(val = '') {
        return this.#toHTML();
    }

    get date() {
        return GSUtil.getAttribute(this, 'date', this.#date.toISOString());
    }

    set date(val = '') {
        GSUtil.setAttribute(this, 'date', val);
    }

    get target() {
        return GSUtil.getAttribute(this, 'target');
    }

    set target(val = '') {
        GSUtil.setAttribute(this, 'target', val);
    }

    get format() {
        return GSUtil.getAttribute(this, 'format');
    }

    set format(val = '') {
        GSUtil.setAttribute(this, 'format', val);
    }

    get locale() {
        return GSUtil.getAttribute(this, 'locale', GSUtil.locale);
    }

    set locale(val = '') {
        GSUtil.setAttribute(this, 'locale', val);
    }

    get css() {
        return GSUtil.getAttribute(this, 'css');
    }

    set css(val = '') {
        GSUtil.setAttribute(this, 'css', val);
    }

    get cssHeader() {
        return GSUtil.getAttribute(this, 'css-header');
    }

    set cssHeader(val = '') {
        GSUtil.setAttribute(this, 'css-header', val);
    }

    get cssMonth() {
        return GSUtil.getAttribute(this, 'css-month', 'form-control fs-3 fw-bold border-0 text-center m-1 p-0');
    }

    set cssMonth(val = '') {
        GSUtil.setAttribute(this, 'css-month', val);
    }

    get cssYear() {
        return GSUtil.getAttribute(this, 'css-year', 'form-control fs-5 fw-bold border-0 text-center m-1 p-0');
    }

    set cssYear(val = '') {
        GSUtil.setAttribute(this, 'css-year', val);
    }

    get cssNav() {
        return GSUtil.getAttribute(this, 'css-nav', 'btn-light');
    }

    set cssNav(val = '') {
        GSUtil.setAttribute(this, 'css-nav', val);
    }

    get cssWeeks() {
        return GSUtil.getAttribute(this, 'css-weeks', 'fw-bold text-bg-dark');
    }

    set cssWeeks(val = '') {
        GSUtil.setAttribute(this, 'css-weeks', val);
    }

    get cssDays() {
        return GSUtil.getAttribute(this, 'css-days');
    }

    set cssDays(val = '') {
        GSUtil.setAttribute(this, 'css-days', val);
    }

    get cssSelected() {
        return GSUtil.getAttribute(this, 'css-selected', 'btn-primary');
    }

    set cssSelected(val = '') {
        GSUtil.setAttribute(this, 'css-selected', val);
    }

    get cssToday() {
        return GSUtil.getAttribute(this, 'css-today', 'btn-secondary');
    }

    set cssToday(val = '') {
        GSUtil.setAttribute(this, 'css-today', val);
    }

    get monthEl() {
        return this.findEl('.month');
    }

    get yearEl() {
        return this.findEl('.year');
    }

    get prevEl() {
        return this.findEl('.prev');
    }

    get nextEl() {
        return this.findEl('.next');
    }

    get arrowsEl() {
        return this.findEl('.arrow');
    }

    get arrowNext() {
        return GSUtil.getAttribute(this, 'arrow-next', '&#10095;');
    }

    set arrowNext(val) {
        return GSUtil.setAttribute(this, 'arrow-next', val);
    }

    get arrowPrev() {
        return GSUtil.getAttribute(this, 'arrow-prev', '&#10094;');
    }

    set arrowPrev(val) {
        return GSUtil.setAttribute(this, 'arrow-prev', val);
    }

    get minYear() {
        return GSUtil.getAttributeAsNum(this, 'year-min', '1900');
    }

    set minYear(val) {
        return GSUtil.setAttributeAsNum(this, 'year-min', val);
    }

    get maxYear() {
        return GSUtil.getAttributeAsNum(this, 'year-max', '2100');
    }

    set maxYear(val) {
        return GSUtil.setAttributeAsNum(this, 'year-max', val);
    }

    formatted(date) {
        const me = this;
        return (date || me.#date).toFormat(me.format, me.locale);
    }

    #onYear(e) {
        const me = this;
        me.#date.year = me.yearEl.value;
        me.#update();
    }

    #onMonth(e) {
        const me = this;
        me.#date.month = me.monthEl.selectedIndex;
        me.#update();
    }

    #onDay(e) {
        const me = this;
        const btn = e.path[0];
        if (!GSUtil.hasClass(btn, 'day')) return;
        const day = GSUtil.asNum(btn.innerText.trim());
        requestAnimationFrame(()=> {
            me.findAll('.day').forEach(el => GSUtil.toggleClass(el, false, me.cssSelected));
            GSUtil.toggleClass(btn, true, me.cssSelected);
        });
        const date = new GSDate(me.#date);
        date.day = day;
        GSEvent.send(me, 'date', {type:'calendar', date:date, val : me.formatted(date)}, true, true);
        me.#updateTarget(date);
    }

    #onArrow(e) {
        const me = this;
        const btn = e.path[0];
        if (!GSUtil.hasClass(btn, 'arrow')) return;
        btn.blur();
        const isPrev = GSUtil.hasClass(btn, 'prev');
        isPrev ? me.#date.month-- : me.#date.month++;
        me.#update();
    }

    #updateTarget(date) {
        const me = this;
        if (!me.target) return;
        const tgt = GSComponents.query(me.target) || document.body.querySelector(me.target);
        if (!tgt) return;

        if (tgt instanceof HTMLInputElement) {
            if (tgt.type === 'date') return tgt.valueAsDate = date;
            return tgt.value = me.formatted(date);
        }
        tgt.innerHTML = me.formatted(date);
    }

    #update() {
        const me = this;        
        me.findAll('.days').forEach(el => el.remove());
        me.findEl('.weeks').insertAdjacentHTML('afterend', me.#daysHTML());
        me.monthEl.selectedIndex = me.#date.month;
        me.yearEl.value = me.#date.getFullYear();
    }

    #isToday(v, date) {
        const me = this;
        return v && GSUtil.asNum(v) === me.#date.day && date.month === me.#date.month && me.#date.year === date.year;
    }

    #daysHTML() {
        const me = this;
        const today = new GSDate();
        const list = me.#date.build();
        const html = list
            .map(v =>  {
                const d = v ? `<a href="#" class="btn ${ me.#isToday(v, today) ? me.cssToday : '' } day">${v}</a>` : ''
                return `<div class="col p-0">${d}</div>`;
            })
            .map((v ,i) => {
                if (i === 0) return `<div class="row days">${v}`;
                const isBreak = i % 7 == 0;                            
                return isBreak ? `</div><div class="row days">${v}` : v;
            });
            html.push('</div>');
            return html.join('');
    }


    #monthsHTML() {
        const me = this;
        const current = me.#date.monthName;
        const list = GSDate.MONTHS.map((v, i) => {
           const sel = current == v ? 'selected' : '';
           return `<option value="${i}" ${sel}>${v}</option>` ;
        }).join('\n');
        return `<select class="month ${me.cssMonth}" value="${current}">
                    ${list}
                </select>`;
    }

    #yearHTML() {
        const me = this;
        return `<input class="year ${me.cssYear}" value="${me.#date.getFullYear()}" type="number" min="${me.minYear}" max="${me.maxYear}">`;
    }

    #toHTML() {
        const me = this;
        const date = me.#date;
        const week = GSDate.weekDays(date.isMondayFirst, true).map(v => `<div class="col">${v}</div>`).join('');
        const months = me.#monthsHTML();
        const year = me.#yearHTML();

        return `<style>
                .year::-webkit-outer-spin-button,
                .year::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }                
                .year {
                  -moz-appearance: textfield;
                }                
                </style>
                <div class="container-fluid text-center ${me.css}">
                <div class="row align-items-center ${me.cssHeader} header">
                    <div class="col-auto">
                        <a href="#" class="btn ${me.cssNav} arrow prev">${me.arrowPrev}</a>
                    </div>
                    <div class="col"></div>
                    <div class="col-auto">
                        ${months}
                        ${year}
                    </div>
                    <div class="col"></div>
                    <div class="col-auto">
                        <a href="#" class="btn ${me.cssNav} arrow next">${me.arrowNext}</a>
                    </div>
                </div>
                <div class="row weeks ${me.cssWeeks}">${week}</div>                
            </div>`.replace(/\n/g,'');
    }
}