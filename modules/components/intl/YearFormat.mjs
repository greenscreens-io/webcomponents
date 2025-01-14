/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module rendering current year on a page
 * @module components/YearFormat
 */
import { GSElement } from '../../GSElement.mjs';

/**
 * Render Year value
 * 
 * @class
 * @extends {HTMLElement}
 */
export class GSYearFormat extends GSElement {

    static properties = {
        offset: {type :Number},
    }

    constructor() {
        super();
        this.offset = 0;
    }

    renderUI() {
        return this.value;
    }

    get value() {
        return this.current + this.offset;
    }

    get current() {
        return new Date().getFullYear();
    }

    static {
        this.define('gs-year-format');
    }
}
