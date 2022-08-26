import GSElement from "/modules/base/GSElement.mjs";
import GSDOM from "/modules/base/GSDOM.mjs";
import GSAttr from "../../../modules/base/GSAttr.mjs";

class GSDialog extends GSElement {

	get template() {
		return GSAttr.get(this, 'template', '//dialog.html');
	}

	set title(val = '') {
		const el = this.findEl('.modal-title');
		if (el) el.innerHTML = val;
		const hd = this.findEl('.modal-header');
		val.length === 0 ? GSDOM.hide(hd) : GSDOM.show(hd);
	}

	set content(val = '') {
		const el = this.findEl('slot[name="body"]');
		if (el) el.innerHTML = val;
	}

	onReady() {
		const me = this;
		const btnok = me.findEl('.btn-primary');
		const btncl = me.findEl('.btn-secondary');

		me.attachEvent(btnok, 'click', me.onOk);
		me.attachEvent(btncl, 'click', me.onCancel);
	}

	onOk(e) {
		this.hide();
	}

	onCancel(e) {
		this.hide();
	}

	toggle(val = false) {
		const el = this.findEl('.modal');
		if (el) el.style.display = val ? 'block' : 'none';
	}

	showDialog(title = '', content = '') {
		const me = this;
		me.title = title;
		me.content = content;
		me.toggle(true);
	}

	hideDialog() {
		const me = this;
		me.toggle(false);
		me.content = '';
		me.title = '';
	}

	static {
		customElements.define('gs-dialog', GSDialog);
		Object.seal(GSDialog);
	}
}

