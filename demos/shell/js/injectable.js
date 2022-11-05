import { GSDOM, GSLog, GSLoader, GSElement } from "/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js";

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

