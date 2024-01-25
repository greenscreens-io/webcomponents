/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { unsafeHTML, classMap, html, ifDefined, css } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSDate } from '../base/GSDate.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { notEmpty, numGE0 } from '../properties/index.mjs';

export class GSCalendarElement extends GSElement {

  static style = css`.year::-webkit-outer-spin-button,.year::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;} .year {-moz-appearance: textfield;} .day:focus{font-weight: bold;}`

  static properties = {
    date: {},
    target: {},
    format: { hasChanged: notEmpty },
    year: { type: Number },
    month: { type: Number, hasChanged: numGE0 },
    day: { type: Number, hasChanged: numGE0 },
    arrovPrev: { attribute: 'arrow-prev' },
    arrowNext: { attribute: 'arrow-next' },
    cssDays: { attribute: 'css-days' },
    cssToday: { attribute: 'css-today' },
    cssWeeks: { attribute: 'css-weeks' },
    cssMonth: { attribute: 'css-month' },
    cssYear: { attribute: 'css-year' },
    cssNav: { attribute: 'css-nav' },
    cssHeader: { attribute: 'css-header' },
    cssSelected: { attribute: 'css-selected' },
    minYear: { attribute: 'year-min', type: Number },
    maxYear: { attribute: 'year-max', type: Number },
  }

  #date;

  constructor() {
    super();
    const me = this;
    me.#date = new GSDate();
    me.#date.locale = GSUtil.locale;
    me.locale = GSUtil.locale;
    me.day = me.#date.day;
    me.month = me.#date.month;
    me.year = me.#date.year;
    me.minYear = 1900;
    me.maxYear = 2100;
    me.arrowPrev = '&#10094;';
    me.arrowNext = '&#10095;';
    me.cssNav = 'btn-light';
    me.cssToday = 'btn-secondary';
    me.cssSelected = 'btn-primary';
    me.cssWeeks = 'fw-bold text-bg-dark';
    me.cssYear = 'form-control fs-5 fw-bold border-0 text-center m-1 p-0';
    me.cssMonth = 'form-control fs-3 fw-bold border-0 text-center m-1 p-0';
  }

  get date() {
    const me = this;
    //return this.#date.toISOString();
    return new Proxy(this.#date, {
      set(target, prop, value) {
        if (typeof target[prop] != 'function') {
          target[prop] = value;
          me.#update();
        }
        return true;
      },
      get(target, prop, receiver) {
        const value = target[prop];
        if (value instanceof Function) {
          return function (...args) {
            try {
              return value.apply(this === receiver ? target : this, args);
            } finally {
              me.#update();
            }
          };
        }
        return value;
      }
    });
  }

  previousMonth() {
    const me  =this;
    if (me.month == 0) {
      me.month = 11;
      me.year--;
    } else {
      me.month--;
    }
  }

  nextMonth() {
    const me  =this;
    if (me.month == 11) {
      me.month = 0;
      me.year++;
    } else {
      me.month++;
    } 
  }

  previousYear() {
    this.year--;
  }

  nextYear() {
    this.year++;
  }

  formatted(date) {
    const me = this;
    return (date || me.#date).format(me.format, me.locale);
  }

  updated() {
    const me = this;
    const date = new GSDate(me.#date);
    me.#updateTarget(date);
    me.emit('date', { type: 'calendar', date: date, val: me.formatted(date) }, true, true);
  }

  renderUI() {
    const me = this;
    me.#date.year = me.year;
    me.#date.month = me.month;
    me.#date.day = me.day;
    me.#date.locale = me.locale;

    const week = GSDate.dayList(true, me.locale).map(v => html`<div class="col">${v}</div>`);
    const months = me.#monthsHTML();
    const year = me.#yearHTML();

    return html`
          <div class="container-fluid text-center ${classMap(me.renderClass())}"
          dir="${ifDefined(me.direction)}"
          @keydown="${me.#onKey}"
          @click="${me.#onDay}">
          <div class="row align-items-center ${me.cssHeader} header">
              <div class="col-auto">
                  <a href="#" @click="${me.previousMonth}" class="btn ${me.cssNav} arrow prev">${unsafeHTML(me.arrowPrev)}</a>
              </div>
              <div class="col"></div>
              <div class="col-auto">
                  ${months}
                  ${year}
              </div>
              <div class="col"></div>
              <div class="col-auto">
                  <a href="#" @click="${me.nextMonth}" class="btn ${me.cssNav} arrow next">${unsafeHTML(me.arrowNext)}</a>
              </div>
          </div>
          <div class="row weeks ${me.cssWeeks}">${week}</div>
          ${unsafeHTML(me.#daysHTML())}
      </div>`;
  }

  #updateTarget(date) {
    const me = this;
    if (!me.target) return;
    const tgt = GSDOM.query(document.documentElement, me.target);
    if (!tgt) return;

    if (tgt instanceof HTMLInputElement) {
      if (tgt.type === 'date') return tgt.valueAsDate = date;
      return tgt.value = me.formatted(date);
    }
    GSDOM.setHTML(tgt, me.formatted(date));
  }

  #update() {
    const me = this;
    me.day = me.#date.day;
    me.month = me.#date.month;
    me.year = me.#date.year;
    me.locale = me.#date.locale;
  }

  #isToday(v, date) {
    const me = this;
    return v && GSUtil.asNum(v) === date.day && date.month === me.#date.month && me.#date.year === date.year;
  }

  #daysHTML() {
    const me = this;
    const today = new GSDate();
    today.locale = me.locale;
    const list = me.#date.build(me.locale);
    const result = list
      .map(v => {
        const c1 = me.#isToday(v, today) ? me.cssToday : '';
        const c2 = me.#isToday(v, me.#date) ? me.cssSelected : '';

        const d = v ? `<a tabindex="0" href="#" class="btn shadow-none ${c1} ${c2} day" data-day="${v}">${v}</a>` : ''
        return `<div class="col p-0">${d}</div>`;
      })
      .map((v, i) => {
        if (i === 0) return `<div class="row days">${v}`;
        const isBreak = i % 7 == 0;
        return isBreak ? `</div><div class="row days">${v}` : v;
      });
    result.push('</div>');
    return result.join('');
  }


  #monthsHTML() {
    const me = this;
    const current = me.#date.MMMM;
    const months = GSDate.monthList(false, me.locale);
    const list = months.map((v, i) => html`<option value="${i}" selected=${ifDefined(current == v ? true : undefined)}>${v}</option>`);
    //const list = GSDate.monthList(false, me.locale).map((v, i) => html`<option value="${i}" ${current == v ? 'selected' : ''}>${v}</option>`);
    return html`<select @change="${me.#onMonth}" name="month" class="month ${me.cssMonth}" value="${months.indexOf(current)}">${list}</select>`;
  }

  #yearHTML() {
    const me = this;
    return html`<input @change="${me.#onYear}" name="year" class="year ${me.cssYear}" value="${me.#date.getFullYear()}" type="number" min="${me.minYear}" max="${me.maxYear}">`;
  }

  #onDay(e) {
    GSEvents.prevent(e);
    if (!e.target.classList.contains('day')) return;
    this.day = GSUtil.asNum(e.target.dataset.day, this.day);
  }

  #onMonth(e) {
    this.month = e.target.selectedIndex;
  }

  #onYear(e) {
    this.year = e.target.value;
  }

  #onKey(e) {
    console.log(e);
  }

  static {
    this.define('gs-calendar');
  }

}