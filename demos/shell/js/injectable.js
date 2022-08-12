import GSElement from "/modules/base/GSElement.mjs";
import GSUtil from "/modules/base/GSUtil.mjs";
import GSLog from "/modules/base/GSLog.mjs";

class GSInjectable extends GSElement {

	get mime() {
		const ext = this.template.split('.').reverse().shift();
		switch (ext) {
			case 'html' :
			case 'htm' :
				return "text/html";
			case 'css' :
				return "text/css";
			case 'js' :
				return "text/javascript";				
			case 'svg' :
				return "image/svg+xml";
		}
		return "text/plain";
	}

	async getTemplate() {
		return '';
	}

	async inject() {
		const me = this;
		const data = await GSUtil.loadSafe(me.template);
		const el = GSUtil.parse(data, me.mime);
		GSUtil.addSibling(this, el);
	}

  async onReady() {
	try {
		const me = this;
		await me.inject();
		me.remove();
	} catch(e) {
		GSLog.error(null, e);
	} 
		
  }
}

customElements.define('gs-inject', GSInjectable);