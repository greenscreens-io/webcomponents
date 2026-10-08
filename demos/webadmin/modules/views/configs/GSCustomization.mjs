/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSCustomization class
 * @module views/GSCustomization
 */
import Utils from "../../utils/Utils.mjs";
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSCustomization extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-customization', GSCustomization);
        Object.seal(GSCustomization);
    }

    async getTemplate() {
        return super.getTemplate('//views/customizations.html');
    }

    async onLoad(e) {
        const me = this;
        if (e?.detail?.source?.shiftKey) await io.greenscreens.Scripts.reload();
        const o = DEMO ? DEMO : await io.greenscreens.Scripts.getScripts();
        me.header = o.data?.header;
        me.footer = o.data?.footer;
        me.ui = o.data?.ui;
    }

	async onViewRefresh() {
		return this.onLoad();
	}
		
    async onViewSave() {
        const me = this;
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Scripts.setScripts(me.header, me.footer, me.ui);
            Utils.inform(o.success, 'Data saved!');
        } catch (e) {
            Utils.handleError(e);
        }
    }

	set header(value = '') {
	    if (this.headerEl) this.headerEl.value = value;
	}

	set footer(value = '') {
	    if (this.footerEl) this.footerEl.value = value;
	}

	set ui(value = '') {
	    if (this.uiEl) this.uiEl.value = value;
	}
		
	get header() {
	    return this.headerEl?.value || '';
	}

	get footer() {
	    return this.footerEl?.value || '';
	}

	get ui() {
	    return this.uiEl?.value || '';
	}
		
    get headerEl() {
        return this.query('#header');
    }

    get footerEl() {
        return this.query('#footer');
    }

    get uiEl() {
        return this.query('#ui');
    }
}