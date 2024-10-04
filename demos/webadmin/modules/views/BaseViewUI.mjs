/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading BaseUI class
 * @module BaseUI
 */

import { GSUtil, GSElement, GSEvents, GSAttr } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

import Utils from "../utils/Utils.mjs";

/**
 * BaseUI handles basic screen data view (used by other UI elements)
 * @class
 * @extends {GSElement}
 */
export default class BaseViewUI extends GSElement {

	constructor() {
		super();
		this.className = 'd-flex flex-fill';
	}

	onReady() {
		const me = this;
		super.onReady();
		//globalThis.GS_LOG_ACTION = true;
		GSEvents.monitorAction(me, 'view');

		requestAnimationFrame(async () => {
			if (!me.#table) return;
			await GSUtil.timeout(100);
			me.store.filter = me.#table.filters;
			me.store.sort = me.#table.sorters;
			me.onViewRefresh();
		});
	}

	/**
	 * Record key field
	 */
	get recID() {
		return 'id';
	}

	/**
	 * Table data filter
	 */
	get filter() {
		const flt = this.store?.filter || [];
		const obj = {};
		flt.forEach(o => obj[o.name] = o.value);
		return obj;
	}

	/**
	 * Table data store
	 */
	get store() {
		return this.#table?.store;
	}

	get #table() {
		return this.query('#table-main');
	}

	get form() {
		return this.modal?.form;
	}

    get waiter() {
        return Utils.waiter;
    }

	/**
	 * Record popup
	 */
	get modal() {
		return this.query('#modal-main');
	}

	/**
	 * Export table data
	 */
	async onViewExport() {
		const me = this;
		const name = me.tagName.toLowerCase();
		const data = me.store.data;
		GSUtil.export([JSON.stringify(data)], `${name}.json`);
	}

	/**
	 * Table record action - clone record
	 * @param {Event} e 
	 * @returns {Promise}
	 */
	async onViewClone(e) {

		const me = this;
		const data = e.detail.data[0];
		if (!data) return;

		const rec = Object.assign({}, data);

		try {

			const sts = await me.onClone(rec);
			if (!sts) throw new Error('Record not cloned!');

			// update locally to refresh ui
			me.store.setData(rec, true);
			Utils.notify.secondary('', 'Record cloned!', false, 2, 0);
			await me.onViewRefresh();
		} catch (e) {
			me.onError(e);
		}

	}

	/**
	 * Table record action - remove record
	 * @param {Event} e 
	 * @returns {Promise}
	 */
	async onViewRemove(e) {

		const me = this;
		const data = e.detail.data[0];
		if (!data) return;

		try {

			const sts = await me.onRemove(data);
			if (!sts) throw new Error('Record not removed!');

			// update locally to refresh ui
			const subset = me.store.data.filter(o => !o.hasOwnProperty(me.recID) || (o[me.recID] !== data[me.recID]));
			me.store.setData(subset);
			Utils.notify.danger('', 'Record removed!', false, 2, 0);

		} catch (e) {
			me.onError(e);
		}

	}

	/**
	 * Table record action - edit data
	 * @param {Event} e 
	 * @returns {Promise}
	 */
	async onViewDetails(e) {

		const me = this;
		const data = await me.onDetails(e.detail.data[0]);
		if (!data) return;

		let sts = false;
		const modal = me.modal;
		modal.open(data);
		const result = await modal.waitEvent('data');
		
		try {
			me.waiter.open();
			sts = await me.onUpdate(result.detail.data);
			if (!sts) throw new Error('Record not updated!');
			// update locally to refresh ui
			Object.assign(data, result.detail.data);
		} catch (e) {
			me.onError(e);
		} finally {
			me.waiter.close();
			modal.enable();
			if (sts) {
				modal.reset();
				await modal.close();
			}
		}

		if (sts) {		
			Utils.notify.warn('', 'Record updated!', false, 2, 0);
			await me.store.load();
			await me.onViewRefresh();
		} else {
			me.onViewDetails(e);
		}
	}

	/**
	 * Toolbar table action - create record
	 * @param {Event} e 
	 * @returns {Promise}
	 */
	async onViewCreate(e) {

		const me = this;

		let sts = false;
		const modal = me.modal;
		const tab = modal.query('GS-TAB');
		if (tab) tab.index = 0;
		modal.open();
		const result = await modal.waitEvent('data');

		try {
			me.waiter.open();
			sts = await me.onCreate(result.detail.data);
			if (!sts) throw new Error('Record not created!');

		} catch (e) {
			me.onError(e);
		} finally {
			me.waiter.close();
			modal.enable();
			if (sts) {		
				modal.reset();
				await modal.close();		
			}
		}

		if (sts) {		
			Utils.notify.warn('', 'Record created!', false, 2, 0);
			await me.store.load();
			await me.onViewRefresh();
		} else {
			me.onViewCreate(e);
		}
	}

	/**
	 * Toolbar table action - refresh data
	 * @param {Event} e 
	 */
	async onViewRefresh(e = {}) {
		// get data from extension and populate table;
		const me = this;

		if (!me.store) return;
		const data = await me.onLoad(e);

		try {
			me.waiter.open();
			if (Array.isArray(data) && data.length > 0) {
				me.store.setData(data);
				// me.store.firstPage();
			} else {
				await me.store.load();
			}
			if (e === true) me.#table.resize();
            if (e?.detail?.action === 'refresh') Utils.notify.info('', 'Data refreshed!', false, 2, 0);
		} catch (e) {
			me.onError(e);
		} finally {
			me.waiter.close();
		}

	}

	/**
	 * Toolbar table action - filter records
	 * @param {Event} val 
	 */
	onViewSearch(e) {
		const me = this;
		me.store.filter = e.detail.value;
		me.store.read();
	}

	/**
	 * Handle data before opening the modal form
	 * @param {*} data 
	 * @returns 
	 */
	async onDetails(data) {
		return data;
	}

	/**
	 * Generic function to be overriden by inherited class
	 * Used to handle new record received from popup form.
	 * @param {Object} data 
	 * @returns {boolean}
	 * @throws {Error}
	 */
	async onCreate(data) {
		return true;
	}

	/**
	 * Generic function to be overriden by inherited class
	 * Used to handle new record cloned from existing one.
	 * @param {Object} data 
	 * @returns {boolean}
	 * @throws {Error}
	 */
	async onClone(data) {
		return true;
	}

	/**
	 * Generic function to be overriden by inherited class
	 * Used to handle existing record change received from popup form.
	 * @param {Object} data 
	 * @returns {boolean}
	 * @throws {Error}
	 */
	async onUpdate(data) {
		return true;
	}

	/**
	 * Generic function to be overriden by inherited class
	 * Used to handle record removal received from table context menu option - remove.
	 * @param {Object} data 
	 * @returns {boolean}
	 * @throws {Error}
	 */
	async onRemove(data) {
		return true;
	}

	/**
	 * Called to load view data
	 * @returns {Array<Object>}
	 * @throws {Error}
	 */
	async onLoad(e) {
		return false;
	}

	onError(e) {
		Utils.handleError(e);
	}
}
