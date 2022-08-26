import GSElement from "/modules/base/GSElement.mjs";
import GSEvent from "/modules/base/GSEvent.mjs";
import GSAttr from "../../../modules/base/GSAttr.mjs";

class GSToolbar extends GSElement {

	get template() {
		return GSAttr.get(this, 'template', '//toolbar.html');
	}

	get topEl() {
		return this.findEl('div');
	}

	onReady() {
		const me = this;
		const el = me.topEl;
		me.attachEvent(el, 'click', me.onSelect);
	}

	onSelect(e) {
		const el = e.target.closest('a[data-view]');
		if (!el) return;
		GSEvent.send(this, 'gs-evt-view', el.getAttribute('data-view'));
	}

	static {
		customElements.define('gs-toolbar', GSToolbar);
		Object.seal(GSToolbar);
	}
}


