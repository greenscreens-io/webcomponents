# [WebComponents](https://webcomponents.greenscreens.ltd/).

# Release v2.2.2 FINAL (23.02.2026.)
 - GSDialog - new callbacks and events for open/close
 - GSDialog - callback handlers suppport addded
 - GSForm - callback handlers suppport addded
 - GSFormElement - field callback handler improved
 - GSButtonElement - field callback handler improved
 - PropagateController -new controller to link fields and forms

# Release v2.2.1 FINAL (23.02.2026.)
 - GSUtil - fix isJson method detection
 - GSElement - added templateInjected to callbacks
 - GSDialog improvements, added afterOpen and afterClose methods
 - GSButton form double submit fix
 - GSForm added autosubmit on enter
 - GSForm template injection fix
 - ValidityController added autosubmit support
 - Demo "extension" cleanup
 - Demo "webadmin" cleanup
 
# Release v2.2.0 FINAL (01.02.2026.)
 - Manual updated
 - GSEvents extended to support event capture
 - GSElement updated for event capture flag
 - GSAttributeHandler - attribute toggling added button toggling flag
 - GSDOM - remove event dispatch on field data reset
 - GSEvents - added event redispatch function
 - GSButton - added toggling flag  
 - GSFormGroup - added toggling flag for select element  
 - GSDialog - added form validation event support
 - GSForm - code cleanup
 - EventsMixin - updated to support event capture
 - ControllerHandler - added form validation event support
 - ComboController - added data-gsf-* flags to set field attributes basd on selection
 - CopySelectController - added global form flag support
 - ValidityController - added global form flag support
 - FormController - added event sinkhole for validation event
 - GSExtSelectElement - added toggling support
 - GSExtInputElement - added global form flags support
 - GSExtButtonElement - improved form validity behaviour
 - Demos updated and improved

# Release v2.1.3 FINAL (28.01.2026.)
 - Fix GSDate - calendar padding calculation
 - Fix GSCalendar - month switch on navigate
 - Fix AdoptedStyleSheet duplicates
 - Fix ServiceWorker class naming typo
 - Fix TemplateController cacheed template
 - Manual GSSpinner manual update

# Release v2.1.2 FINAL (09.01.2026.)
 - Fix Paginator cusrsor select

# Release v2.1.1 FINAL (10.11.2025.)
 - Fix Cache worker

# Release v2.1.0 FINAL (30.09.2025.)
 - Apply beta chenges into final release
 - Fix TemplateController callbacks
 - Improvement - GSElement rendering when using "hide" attribute

# Release v2.1.0 BETA (01.08.2025.)
 - Experimental AI support for browser AI API (WiP) 
 - GSRouter self-inject if target not specified in JSON definition
 - GSFunction added debounce for button clicks and form inputs

# Release v2.1.0 BETA (28.07.2025.)

- Many form/field improvements in handling data and events. 
- Web Admin demo template fixes
- Manual updates
- Tab component updates, renamed gs-tab to gs-tab-header
- ListItem component fixes
- added build support / config with Rolldown

NOTE: Changes are temporary, browsers do not support form associated elements within multiple shadow DOM levels.
Incoming Chrome and Edge v140 or newer should bring such support. Code will be updated accordingly as soon as browsers release the fix.

# Release v2.0.0 BETA (10.01.2025.)

- Migrated to Lit Elements 3.0

<br><hr>

&copy; Green Screens Ltd. 2016 - 2025
 