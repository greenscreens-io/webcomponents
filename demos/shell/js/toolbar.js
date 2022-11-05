import {GSEvent, GSAttr, GSElement} from "/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js";

class GSToolbar extends GSElement {

	get template() {
		return GSAttr.get(this, 'template', '//toolbar.html');
	}

	get topEl() {
		return this.query('div');
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


