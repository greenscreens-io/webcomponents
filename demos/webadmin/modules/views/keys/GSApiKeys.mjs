/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSApiKeys class
 * @module views/GSApiKeys
 */
import BaseViewUI from '../BaseViewUI.mjs';

export default class GSApiKeys extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-apikeys', GSApiKeys);
        Object.seal(GSApiKeys);
    }

    onReady() {
        super.onReady();
        this.modal?.large();
    }
	
	convertToDateTimeLocalString (date) {
	  const year = date.getFullYear();
	  const month = (date.getMonth() + 1).toString().padStart(2, "0");
	  const day = date.getDate().toString().padStart(2, "0");
	  const hours = date.getHours().toString().padStart(2, "0");
	  const minutes = date.getMinutes().toString().padStart(2, "0");
	  return `${year}-${month}-${day}T${hours}:${minutes}`;
	}	

    async getTemplate() {
        return super.getTemplate('//views/keys-api.html');
    }

	async onDetails(data) {
		const clone = { ...data };
		if (data.expiration > 0) {
			clone.expiration = this.convertToDateTimeLocalString (new Date(data.expiration));
		}
		return clone;
	}
		
    async onLoad(e) {
        const me = this;
        const filter = me.filter;
        if (e?.detail?.source?.shiftKey) await io.greenscreens.ApiKeys.reload();
        const o = DEMO ? DEMO : await io.greenscreens.ApiKeys.list(me.store.page - 1, me.store.limit, filter);
        return o.data;
    }

    async onCreate(data, form) {
		data.expiration = form?.expiration?.valueAsNumber || '';
        const o = DEMO ? DEMO : await io.greenscreens.ApiKeys.add(data);
        return o.success;
    }

    async onUpdate(data, form) {
		data.expiration = form?.expiration?.valueAsNumber || '';
        const o = DEMO ? DEMO : await io.greenscreens.ApiKeys.update(data.id, data);
        return o.success;
    }

    async onRemove(data) {
        const o = DEMO ? DEMO : await io.greenscreens.ApiKeys.remove(data.id);
        return o.success;
    }

	async onViewCopy(e) {
		const data = e.detail.data[0];
	    await navigator.clipboard.writeText(data?.key || '');
	    return true;
	}

    async onViewToggle(e) {
        const data = e.detail.data[0];
        if (!data) return Utils.inform(false, 'Record not selected!');
        data.active = !data.active;
        const me = this;
        await me.onUpdate(data);
        await me.onViewRefresh();
    }
}