import { Directive, directive, nothing } from "../lib.mjs";

const definition = {
    'action': 'gsAction',
    'anchor': 'gsAnchor',
    'attribute': 'gsAttribute',
    'call': 'gsCall',
    'exec': 'gsExec',
    'inject': 'gsInject',
    'property': 'gsProperty',
    'swap': 'gsSwap',
    'target': 'gsTarget',
    'template': 'gsTemplate',
    'toggle': 'gsToggle',
    'trigger': 'gsTrigger',
    'value': 'gsValue'
}

const template = {
    'gsAction': undefined,
    'gsAnchor': undefined,
    'gsAttribute': undefined,
    'gsCall': undefined,
    'gsExec': undefined,
    'gsInject': undefined,
    'gsProperty': undefined,
    'gsSwap': undefined,
    'gsTarget': undefined,
    'gsTemplate': undefined,
    'gsToggle': undefined,
    'gsTrigger': undefined,
    'gsValue': undefined
}

class DatasetDirective extends Directive {

    render(obj) {
        console.log(obj);
        return nothing;
    }

    update(part, [obj, flat = true]) {

        if (!obj) return nothing;

        const dataset = part.element.dataset;
        const srcset = obj.dataset || obj;
        const isDataset = srcset instanceof DOMStringMap;

        if (isDataset) {
            Object.assign(dataset, srcset);
        } 
        
        if (flat) this.#remap(dataset, obj);

        return nothing;
    }

    #remap(dataset, obj) {
        const opt = Object.assign({}, template);
        const list = Object.entries(obj).filter(v => Object.hasOwn(definition, v[0]));
        if (list.length > 0) {
            list.forEach(kv => opt[definition[kv[0]]] = kv[1]);
            Object.assign(dataset, opt);
        }
    }
}

export const dataset = directive(DatasetDirective);
