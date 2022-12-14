import GSAttr from "../../../modules/base/GSAttr.mjs";
import GSElement from "../../../modules/base/GSElement.mjs";

class GSShell extends GSElement {

	get template() {
		return GSAttr.get(this, 'template', '//shell.html');
	}

	get sidebar() {
		return this.query('gs-sidebar');
	}

	get toolbar() {
		return this.query('gs-toolbar');
	}

	get content() {
		return this.query('slot[name="content"]');
	}

	get dialog() {
		return this.query('gs-dialog');
	}

	onReady() {
		const me = this;
		me.attachEvent(me.sidebar, 'gs-evt-view', me.onView.bind(me));
		me.attachEvent(me.toolbar, 'gs-evt-view', me.onView.bind(me));
	}

	onView(e) {
		const el = this.content;
		el.innerHTML = e.detail;
	}

	static {
		customElements.define('gs-shell', GSShell);
		Object.seal(GSShell);
	}
}


