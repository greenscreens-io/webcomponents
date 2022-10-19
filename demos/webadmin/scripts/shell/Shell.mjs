/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading BaseUI class
 * @module shell
 */
 import GSElement from "../../../../modules/base/GSElement.mjs";
  
 /**
  * Class representing UI Shell
  * @class
  * @extends {GSElement}
  */
 export default class ShellUI extends GSElement {
 
    static {
        customElements.define('gs-admin-shell', ShellUI);
        Object.seal(ShellUI);
    }

    async getTemplate() {
        return super.getTemplate('//shell.html');
    }

    onReady() {
        super.onReady();

    }

}
 