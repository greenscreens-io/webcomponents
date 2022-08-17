/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSDate class
 * @module base/GSDate
 */

/**
 * Custom Date class to help handling calendar
 * @class
 */
 export default class GSDate extends Date {

    static DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    static MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    
    static DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    static MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    #monday_first = false;

    /**
     * Build array days/weeks for a month, starts with Sunday
     * @returns {Array<string>}
     */
    build() {
        const me = this;
        const last = me.last.getDate();
        const first = me.first.getDay();
        
        const shifter = me.#monday_first ? -2 : -1;
        const days = first === 0 ? [] : ' '.repeat(first + shifter).split(' ');
        let i = 1;
        while (i <= last) {
            days.push(i.toString());
            i++;
        }

        while (days.length % 7 != 0) days.push('');

        return days;
    }

    get year() {
        return this.getFullYear();
    }

    set year(val = 0) {
        this.setFullYear(val);
    }

    get month() {
        return this.getMonth();
    }

    set month(val = 0) {
        this.setMonth(val);
    }

    get day() {
        return this.getDate();
    }

    set day(val = 0) {
        this.setDate(val);
    }

    /**
     * First date of the month
     * @returns {Date}
     */
    get first() {
        return new GSDate(this.getFullYear(), this.getMonth(), 1);
    }

    /**
     * Last date of the month
     * @returns {Date}
     */    
    get last() {
        return new GSDate(this.getFullYear(), this.getMonth() + 1, 0);
    }

    get monthName() {
        return GSDate.getMonthName(this);
    }

    get dayName() {
        return GSDate.getDayName(this);
    }

    get isMondayFirst() {
        return this.#monday_first;
    }

    set mondayFirst(val = false) {
        return this.#monday_first = val === true;
    }

    static getMonthName(d) {
        return GSDate.MONTHS[ d.getMonth() ];
    }

    static getDayName(d) {        
        return GSDate.weekDays(d.isMondayFirst)[d.getDay()];
    }
    
    /**
     * Returns list of a week names
     * @param {*} rotate Should rotate Monday as first day of a week
     * @returns {Array<string>} 
     */
    static weekDays(rotate = false, short = false) {
        const list = short ? GSDate.DAYS_SHORT : GSDate.DAYS;
        return  rotate ? Array.from(list).slice(1).concat(list[0]) : list;
    }

}