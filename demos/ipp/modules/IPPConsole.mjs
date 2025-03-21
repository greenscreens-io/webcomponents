/*
* Copyright (C) 2015, 2024 Green Screens Ltd.
*/

/**
 * A module loading IPPConsole class
 * 
 * @module ipp/IPPConsole
 */
import { GSElement } from "../../../modules/GSElement.mjs";

/**
 * IPPJobs UI lists printer jobs and allows job manupulation actions
 */
export class IPPConsole extends GSElement {

    constructor() {
        super();
        this.template = '//ipp-console.html';
    }
    
    renderUI() {
        return this.renderTemplate();
    }    

    log(data = '') {
        this.#console.content = JSON.stringify(data, '', 4);
    }

    get #console() {
        return this.query('gs-highlight', true);
    }

    static {
        GSElement.define('gs-ipp-console', IPPConsole);
    }

}