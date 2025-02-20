/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/*
 * Class handling UI error message popup
 */
export class Messages {

    static show(message) {
        if (!message) return;
        const dlg = this.dlgError;
        dlg.message = message;
        dlg.opened = true;
    }

    static get dlgError() {
        return GSDOM.query(document.body, '#error');
    }
}