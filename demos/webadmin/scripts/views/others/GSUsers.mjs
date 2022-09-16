/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSUsers class
 * @module views/GSUsers
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSUsers extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-users', GSUsers);
        Object.seal(GSUsers);
    }

    async getTemplate() {
        return super.getTemplate('//views/users.html');
    }

}