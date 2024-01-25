/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * Required CSS Styles for WebCompoents, regardless Bootstrap CSS.
 */
export const gsstyles = `.z-10k{z-index:10000 !important;}
.gs-hide,gs-item{display:none !important;}
gs-popover,gs-tooltip{position:fixed;top:0px;left:0px;},
.d-contents{display:contents;}';
gs-button-group::part(.btn-group){box-shadow:rgba(72, 72, 72, 0.4) 0px 0.125rem 0.25rem;}
gs-group>gs-button::part(button) {box-shadow: none;}
gs-group>gs-button:not(:last-child)::part(button) {border-top-right-radius: 0;border-bottom-right-radius: 0;}
gs-group>gs-button:not(:first-child)::part(button) {margin-left: calc(var(--bs-border-width) * -5);border-top-left-radius: 0;border-bottom-left-radius: 0;}
gs-layout {width: 100%;height: 100%;}
gs-split-panel{flex: 1 1 auto !important;}
`;