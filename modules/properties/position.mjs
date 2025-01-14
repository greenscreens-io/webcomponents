/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

export class PositionTypes {

    static values = ['absolute', 'fixed', 'relative', 'sticky', 'static'];

    static includes(val) {
        return PositionTypes.values.includes(val);
    }
}


export const position = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && PositionTypes.includes(newVal);
    }

};