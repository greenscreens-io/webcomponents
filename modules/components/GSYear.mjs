/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module rendering current year on a page
 * @module components/GSYear
 */

/**
 * Render Year value
 * 
 * @class
 * @extends {HTMLElement}
 */
export default class GSYear extends HTMLElement {

    connectedCallback() {
        this.innerHTML = new Date().getFullYear();
    }

    static {
        customElements.define('gs-year', GSYear);
    }
}