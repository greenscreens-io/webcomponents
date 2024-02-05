/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import { GSElement } from "../../../modules/GSElement.mjs";
import { GSLoader } from "../../../modules/base/GSLoader.mjs";
import { GSLog } from "../../../modules/base/GSLog.mjs";
import { GSDOM } from "../../../modules/base/GSDOM.mjs";

class GSInjectable extends GSElement {

	get mime() {
		const ext = this.template.split('.').reverse().shift();
		switch (ext) {
			case 'html':
			case 'htm':
				return "text/html";
			case 'css':
				return "text/css";
			case 'js':
				return "text/javascript";
			case 'svg':
				return "image/svg+xml";
		}
		return "text/plain";
	}

	async inject() {
		const me = this;
		const data = await GSLoader.loadSafe(me.template);
		const el = GSDOM.parse(data, me.mime);
		GSDOM.addSibling(this, el);
	}

	async firstUpdated() {
		super.firstUpdated();
		try {
			const me = this;
			await me.inject();
			me.remove();
		} catch (e) {
			GSLog.error(null, e);
		}

	}

	static {
		GSElement.define('gs-inject', GSInjectable);
	}

}

