/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */


export const InputTypes = ['checkbox', 'radio', 'switch', 'number', 'range', 'text', 'passsword', 'email', 'url', 'file'];

export const inputType = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && InputTypes.includes(newVal);
    }

};