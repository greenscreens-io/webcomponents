
import { notEqual, defaultConverter } from '../../lib.mjs';


const defaultPropertyDeclaration = {
    attribute: true,
    reflect: false,
    type: String,
    converter: defaultConverter,
    hasChanged: notEqual,
}

const attributeToPropertyMap = Symbol();
const prepare = Symbol();
const elementProperties = Symbol();
const finalize = Symbol();
const finalized = Symbol();

const prepareFn = function () {
    const me = this;
    if (Object.getOwnPropertySymbols(me).includes(elementProperties)) return;
    const superCtor = Object.getPrototypeOf(me);
    if (typeof superCtor[finalize] === 'function') superCtor[finalize]();
    me[elementProperties] = new Map(superCtor[elementProperties]);
}

const attributeNameForProperty = (name, options) => {
    const attribute = options.attribute;
    return attribute === false
        ? undefined
        : typeof attribute === 'string'
            ? attribute
            : typeof name === 'string'
                ? name.toLowerCase()
                : undefined;
}

/**
 * Reactivity for HTMLInputElement based on Google ltd. Lit ReactiveElement
 */
export class ReactiveInput extends HTMLInputElement {

    // user defiend 
    static properties = {};
    
    static [finalized] = false;

    #reflectingProperties = undefined;
    #instanceProperties = undefined;

    #controllers = undefined;
    #updatePromise = undefined;
    #changedProperties = undefined;
    #reflectingProperty = undefined;

    #hasUpdated = false;
    #isUpdatePending = false;

    #isConnected = false;

    /**
     * Returns a list of attributes corresponding to the registered properties.
    */
    static get observedAttributes() {
        Object.defineProperty(ReactiveInput.__proto__, prepare, { value: prepareFn });
        const me = this;
        me[finalize]();
        return me[attributeToPropertyMap] && [...me[attributeToPropertyMap].keys()];
    }

    static addInitializer(initializer) {
        const me = this;
        me[prepare]();
        me.initializers ??= [].push(initializer);
    }

    static [finalize]() {
        const me = this;
        //if (Object.hasOwn(me, 'finalized')) return;
        if (me[finalized] === true) return;
        me[finalized] = true;
        me[prepare]();

        if (Object.hasOwn(me, 'properties')) {
            const props = me.properties;
            const propKeys = [
                ...Object.getOwnPropertyNames(props),
                ...Object.getOwnPropertySymbols(props),
            ];
            for (const p of propKeys) {
                me.createProperty(p, props[p]);
            }
        }

        // Create the attribute-to-property map
        me[attributeToPropertyMap] = new Map();
        for (const [p, options] of me[elementProperties]) {
            const attr = attributeNameForProperty(p, options);
            if (attr !== undefined) {
                me[attributeToPropertyMap].set(attr, p);
            }
        }

    }

    static createProperty(name, options) {
        const me = this;
        if (options.state) options.attribute = false;
        me[prepare]();
        me[elementProperties].set(name, options);
        if (!options.noAccessor) {
            const key = Symbol();
            const descriptor = me.getPropertyDescriptor(name, key, options);
            if (descriptor !== undefined) {
                Object.defineProperty(me.prototype, name, descriptor);
            }
        }
    }

    static getPropertyDescriptor(name, key, options) {
        const { get, set } = Object.getOwnPropertyDescriptor(this.prototype, name) ?? {
            get() {
                return this[key];
            },
            set(v) {
                this[key] = v;
            },
        }
        return {
            get() {
                return get?.call(this);
            },
            set(value) {
                const me = this;
                const oldValue = get?.call(me);
                set?.call(me, value);
                me.requestUpdate(name, oldValue, options);
            },
            configurable: true,
            enumerable: true,
        }
    }

    static getPropertyOptions(name) {
        return this[elementProperties].get(name) ?? defaultPropertyDeclaration;
    }

    constructor() {
        super();
        this.#initialize();
    }

    connectedCallback() {
        const me = this;
        me.enableUpdating(true);
        me.#controllers?.forEach((c) => c.hostConnected?.());
        me.#isConnected = true;
    }

    disconnectedCallback() {
        this.#isConnected = false;
        this.#controllers?.forEach((c) => c.hostDisconnected?.());
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.#attributeToProperty(name, newValue);
    }

    // ******************************
    // PUBLIC GETTERS
    // ******************************

    get hasUpdated() { return this.#hasUpdated; }
    get isUpdatePending() { return this.#isUpdatePending; }
    get renderRoot() { return this; }

    // ******************************
    // PROTECTED FUNCTIONS 
    // ******************************

    addController(controller) {
        // if (!(controller instanceof ReactiveController)) throw new Error('Argument not instance of ReactiveController');
        const me = this;
        (me.#controllers ??= new Set()).add(controller);
        if (me.#isConnected) {
            controller.hostConnected?.();
        }
    }

    removeController(controller) {
        this.#controllers?.delete(controller);
    }

    createRenderRoot() {
        return this;
    }

    enableUpdating(requestedUpdate) { }

    firstUpdated(changedProperties) { }

    updated(changedProperties) { }

    getUpdateComplete() { return this.#updatePromise; }

    scheduleUpdate() { return this.performUpdate(); }

    shouldUpdate(changedProperties) { return true; }

    willUpdate(changedProperties) { }

    update(changedProperties) {
        const me = this;
        // The forEach() expression will only run when when #reflectingProperties is
        // defined, and it returns undefined, setting #reflectingProperties to undefined
        me.#reflectingProperties &&= me.#reflectingProperties.forEach((p) => me.#propertyToAttribute(p, this[p]));
        me.#markUpdated();
    }

    get updateComplete() {
        return this.getUpdateComplete();
    }

    requestUpdate(name, oldValue, options) {
        const me = this;
        if (name !== undefined) {
            options ??= (me.constructor).getPropertyOptions(name);
            const hasChanged = options.hasChanged ?? notEqual;
            const newValue = me[name];
            if (hasChanged(newValue, oldValue)) {
                me.#changeProperty(name, oldValue, options);
            } else {
                return;
            }
        }
        if (me.#isUpdatePending === false) {
            me.#updatePromise = me.#enqueueUpdate();
        }
    }

    performUpdate() {

        const me = this;
        if (!me.#isUpdatePending) return;

        if (!me.#hasUpdated) {

            // Mixin instance properties once, if they exist.
            if (me.#instanceProperties) {
                for (const [p, value] of me.#instanceProperties) {
                    this[p] = value;
                }
                me.#instanceProperties = undefined;
            }

            const elementProps = me.constructor[elementProperties];
            if (elementProps.size > 0) {
                for (const [p, options] of elementProps) {
                    if (
                        options.wrapped === true &&
                        !me.#changedProperties.has(p) &&
                        me[p] !== undefined
                    ) {
                        me.#changeProperty(p, this[p], options);
                    }
                }
            }
        }

        let shouldUpdate = false;
        const changedProperties = me.#changedProperties;
        try {
            shouldUpdate = me.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                me.willUpdate(changedProperties);
                me.#controllers?.forEach((c) => c.hostUpdate?.());
                me.update(changedProperties);
            } else {
                me.#markUpdated();
            }
        } catch (e) {
            shouldUpdate = false;
            me.#markUpdated();
            throw e;
        }

        if (shouldUpdate) {
            me.#didUpdate(changedProperties);
        }
    }

    // ******************************
    // PRIVATE FUNCTIONS 
    // ******************************

    #didUpdate(changedProperties) {
        const me = this;
        me.#controllers?.forEach((c) => c.hostUpdated?.());
        if (!me.#hasUpdated) {
            me.#hasUpdated = true;
            me.firstUpdated(changedProperties);
        }
        me.updated(changedProperties);
    }

    #markUpdated() {
        const me = this;
        me.#changedProperties = new Map();
        me.#isUpdatePending = false;
    }

    async #enqueueUpdate() {
        const me = this;
        me.#isUpdatePending = true;
        try {
            await me.#updatePromise;
        } catch (e) {
            Promise.reject(e);
        }
        const result = me.scheduleUpdate();

        if (result != null) {
            await result;
        }
        return !me.#isUpdatePending;
    }

    #changeProperty(name, oldValue, options) {
        const me = this;
        if (!me.#changedProperties.has(name)) {
            me.#changedProperties.set(name, oldValue);
        }

        if (options.reflect === true && me.#reflectingProperty !== name) {
            (me.#reflectingProperties ??= new Set()).add(name);
        }
    }

    #attributeToProperty(name, value) {
        const me = this;
        const ctor = me.constructor;
        const propName = (ctor[attributeToPropertyMap]).get(name);
        if (propName !== undefined && me.#reflectingProperty !== propName) {
            const options = ctor.getPropertyOptions(propName);
            const converter =
                typeof options.converter === 'function'
                    ? { fromAttribute: options.converter }
                    : options.converter?.fromAttribute !== undefined
                        ? options.converter
                        : defaultConverter;
            // mark state reflecting
            me.#reflectingProperty = propName;
            me[propName] = converter?.fromAttribute(value, options.type);
            // mark state not reflecting
            me.#reflectingProperty = null;
        }
    }

    #propertyToAttribute(name, value) {
        const me = this;
        const elementProps = me.constructor[elementProperties];
        const options = elementProps?.get(name);
        const attr = attributeNameForProperty(name, options);
        if (attr !== undefined && options.reflect === true) {
            const converter =
                (options.converter)?.toAttribute !==
                    undefined
                    ? (options.converter)
                    : defaultConverter;
            const attrValue = converter?.toAttribute(value, options.type);

            me.#reflectingProperty = name;
            if (attrValue == null) {
                me.removeAttribute(attr);
            } else {
                me.setAttribute(attr, attrValue);
            }
            // mark state not reflecting
            me.#reflectingProperty = null;
        }
    }

    #saveInstanceProperties() {
        const me = this;
        const instanceProperties = new Map();
        const elementProps = me.constructor[elementProperties];
        for (const p of elementProps.keys()) {
            if (Object.hasOwn(me, p)) {
                instanceProperties.set(p, me[p]);
                delete me[p];
            }
        }
        if (instanceProperties.size > 0) {
            me.#instanceProperties = instanceProperties;
        }
    }

    #initialize() {
        const me = this;
        me.#updatePromise = new Promise((res) => me.enableUpdating = res);
        me.#changedProperties = new Map();
        me.#saveInstanceProperties();
        me.requestUpdate();
    }
}
