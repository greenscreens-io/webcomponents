/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

export class ButtonTypes {

    static values = ['button', 'reset', 'submit'];

    static is(val) {
        return ButtonTypes.values.includes(val);
    }

    static isReest(val) {
        return ButtonTypes.values.indexOf(val) === 1;
    }

    static isSubmit(val) {
        return ButtonTypes.values.indexOf(val) === 2;
    }
} 

export const buttonType = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && ButtonTypes.is(newVal);
    }

};