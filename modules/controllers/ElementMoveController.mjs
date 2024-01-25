/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * Controller for elment move events, properly handling mouse events.
 */
export class ElementMoveController {

  #host;
  #element;
  #attached = false;

  #cursorX = 0;
  #cursorY = 0;

  #mouseUpCallback;
  #mouseDownCallback;
  #mouseMoveCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    host.addController(me);
    me.#mouseUpCallback = me.#onMouseUp.bind(me);
    me.#mouseDownCallback = me.#onMouseDown.bind(me);
    me.#mouseMoveCallback = me.#onMouseMove.bind(me);
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host = null;
  }

  attach(element) {
    const me = this;
    if (!me.#attached) {
      me.#element = element;
      me.#attached = true;
      me.#host.attachEvent(me.#element, 'mousedown', me.#mouseDownCallback);
    }
  }

  reset() {
    const me = this;
    me.#cursorX = 0;
    me.#cursorY = 0;
    me.#host.removeEvent(document, 'mouseup', me.#mouseUpCallback);
    me.#host.removeEvent(document, 'mousemove', me.#mouseMoveCallback);
  }

  /**
  * Call host onStartMove function
  * @param {MouseEvent} e 
  */
  #onMouseDown(e) {
    const me = this;
    me.#host.prevent(e);
    me.#cursorX = e.clientX;
    me.#cursorY = e.clientY;
    me.#host.onStartMove?.(e, me.#cursorX, me.#cursorY);
    me.#host.attachEvent(document, 'mouseup', me.#mouseUpCallback, true);
    me.#host.attachEvent(document, 'mousemove', me.#mouseMoveCallback);
  }

  /**
   * Remove mousemove listener and call host onEndMove function
   * @param {MouseEvent} e 
   */
  #onMouseUp(e) {
    const me = this;
    me.#host.prevent(e);
    me.#host.removeEvent(document, 'mousemove', me.#mouseMoveCallback);
    return me.#host.onEndMove?.(e, me.#cursorX, me.#cursorY);
  }

  /**
   * Call host onMouseMove function
   * @param {MouseEvent} e 
   */
  #onMouseMove(e) {
    const me = this;
    me.#host.prevent(e);

    me.#host.onMouseMove?.(e, me.#cursorX, me.#cursorY);

    if (me.#cursorX < e.clientX) {
      me.#host.onCursorRight?.(e, me.#cursorX, me.#cursorY);
    } else if (me.#cursorX > e.clientX) {
      me.#host.onCursorLeft?.(e, me.#cursorX, me.#cursorY);
    }

    if (me.#cursorY < e.clientY) {
      me.#host.onCursorUp?.(e, me.#cursorX, me.#cursorY);
    } else if (me.#cursorY > e.clientY) {
      me.#host.onCursorDown?.(e, me.#cursorX, me.#cursorY);
    }

    me.#cursorX = e.clientX;
    me.#cursorY = e.clientY;

  }

}  