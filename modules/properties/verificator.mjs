/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

export const notEmpty = (newVal, oldVal) => newVal !== oldVal && newVal;
export const numGT0 = (newVal, oldVal) => newVal !== oldVal && Number(newVal) > 0;
export const numGE0 = (newVal, oldVal) => newVal !== oldVal && Number(newVal) >= 0;
export const numLT0 = (newVal, oldVal) => newVal !== oldVal && Number(newVal) < 0;
export const numLE0 = (newVal, oldVal) => newVal !== oldVal && Number(newVal) <= 0;
