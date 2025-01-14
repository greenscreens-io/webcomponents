/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

export class OrientationTypes {

    static values =  ['', 'horizontal', 'vertical', 'portrait', 'landscape'];

    static includes(val) {
        return OrientationTypes.values.includes(val);
    }

    static isVertical(val) {
        const idx = OrientationTypes.values.indexOf(val)
        return idx === 2 || idx === 3;
    }

    static isHorizontal(val) {
        const idx = OrientationTypes.values.indexOf(val)
        return idx === 1 || idx === 4;
    }

}

export const orientation = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && OrientationTypes.includes(newVal);
    }

};