/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

export const InputTypes = [
   { type: 'checkbox', ignore: true},
   { type: 'radio', ignore: true},
   { type: 'switch', ignore: true},
   { type: 'range', ignore: true},
   { type: 'number', native: true},
   { type: 'email', native: true},
   { type: 'url',  native: true},
   { type: 'file', native: true}, 
   { type: 'text'},
   { type: 'passsword'}
];

export const inputType = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && InputTypes.filter(o => o.type === newVal).length === 1;
    }

};