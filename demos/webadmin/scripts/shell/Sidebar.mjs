/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading Shell Sidebar class
 * @module shell
 */
import GSElement from "../../../../modules/base/GSElement.mjs";

/**
 * Class representing UI shell sidebar
 * @class
 * @extends {GSElement}
 */
export default class SidebarUI extends GSElement {

    static {
        customElements.define('gs-admin-shell-sidebar', SidebarUI);
        Object.seal(SidebarUI);
    }

    async getTemplate() {
        return super.getTemplate('//shell/sidebar.html');
    }

    onReady() {
        super.onReady();

    }

}
