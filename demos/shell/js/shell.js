/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from "../../../modules/GSElement.mjs";

class GSShell extends GSElement {

	constructor() {
		super();
		this.template = '//shell.html';
	}

	get sidebar() {
		return this.query('gs-sidebar', true);
	}

	get toolbar() {
		return this.query('gs-toolbar', true);
	}

	get content() {
		return this.query('slot[name="content"]', true);
	}

	get dialog() {
		return this.query('gs-dialog', true);
	}

    renderUI() {
        return this.renderTemplate();
    }

	templateInjected() {
		const me = this;
		me.attachEvent(me.sidebar, 'gs-evt-view', me.onView.bind(me));
		me.attachEvent(me.toolbar, 'gs-evt-view', me.onView.bind(me));
	}

	onView(e) {
		const el = this.content;
		el.innerHTML = e.detail;
	}

	static {
		GSElement.define('gs-shell', GSShell);
	}
}


