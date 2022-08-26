import GSElement from "/modules/base/GSElement.mjs";
import GSLoader from "/modules/base/GSLoader.mjs";
import GSLog from "/modules/base/GSLog.mjs";
import GSDOM from "../../../modules/base/GSDOM.mjs";

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

	async getTemplate() {
		return '';
	}

	async inject() {
		const me = this;
		const data = await GSLoader.loadSafe(me.template);
		const el = GSDOM.parse(data, me.mime);
		GSDOM.addSibling(this, el);
	}

	async onReady() {
		try {
			const me = this;
			await me.inject();
			me.remove();
		} catch (e) {
			GSLog.error(null, e);
		}

	}

	static {
		customElements.define('gs-inject', GSInjectable);
		Object.seal(GSInjectable);
	}

}

