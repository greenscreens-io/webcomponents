/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

export const ProtocolTypes = ['', 'http', 'https'];

export const protocol = {
    hasChanged(newVal, oldVal) {
        return newVal !== oldVal && ProtocolTypes.includes(newVal);
    }

};