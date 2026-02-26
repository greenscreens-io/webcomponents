/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

export class PlacementTypes {

    static values = ['center', 'left', 'right', 'start', 'end', 'top', 'bottom'];

    static includes(val) {
        return PlacementTypes.values.includes(val);
    }

    static isVertical(val) {
        return PlacementTypes.values.indexOf(val) > 4;
    }

    static isHorizontal(val) {
        const idx = PlacementTypes.values.indexOf(val)
        return idx > 0 && idx < 5;
    }

    static isCenter(val) {
        return PlacementTypes.values.indexOf(val) === 0;
    }

    static isBefore(val) {
        return ['left', 'start', 'top'].includes(val);
    }

    static isAfter(val) {
        return ['right', 'end', 'bottom'].includes(val);
    }
}


export const placement = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && PlacementTypes.includes(newVal);
    }

};