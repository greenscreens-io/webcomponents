# [WebComponents](https://webcomponents.greenscreens.ltd/) for [Bootstrap 5.2.0+](https://getbootstrap.com/)

# Development v1.8.1 (22.09.2023.)
 - Fix - Firefox context menu event detection issue
 - Fix - property set typo fix for GSCenter
 - Fix - GSDOM.getByID argument passing
 - GSContext add altctx attribute to allow open system context menu while pressing shift key
 - GSDOM fromJSON to GS-ITEM conversion improvements
 - GSElement add 'repaint' function to completely rerender component
 - GSFunctions dynamic parameters support added
 - GSOffcanvas fix event bindings 
 - GSSplitter ass double click to auto-resize if min/max set
 - GSTouch renamed to GSGesture
 - GSData Object named path support added
 - GSDOM added form fields named path JSON import export
 - GSDOM added seelct-multiple to JSON support
 - GSFormExt - reading/writing named paths for JSON data
 - Added GSOverlay - render SVG overlay around target element
 - Added code comments

# Release v1.8.0 (01.09.2023.)
 - GSDialog forward open/close data
 - GSDialog added reset function (reset form and tab)
 - GSDialog alllow deregister \'change\' event monitoring form validity
 - GSEvent add abortable to "once", "on", "listen", "wait" functions
 - GSEvents add abortable to "once", "on", "listen", "wait" function
 - GSEvents add timeout id to sendDelayed function 
 - GSFormExt add integration with GSReadWrite
 - GSFormExt auto convert standard form to GSFormExt
 - GSFormExt improve form element initialization handling
 - GSFormExt add native ID getter override to fix id to field named id mapping
 - GSFormExt add native function "elements" override with shadow dom support for elemnt retrieval
 - GSFormGroup type radio improvement
 - GSInputExt add initialization notification events 
 - GSInputExt masked input handling improved
 - GSFunction add call once wraper for FIFO / LIFO
 - GSModal added reset function (reset form and tab)
 - GSStore add integration with GSReadWrite
 - GSStore add LIFO data read
 - GSTab added tab index and pagination support
 - GSTable added sorters and filter property; 
 - GSTable improved initial auto sort/filter
 - GSToast improvements
 - GSUtil add abortable timeout
 - GSUtil refactored waitAnimationFrame to GSEvents
 - Add user specified attributes; data-attr for injection targets
 - Added GSAbortController with timeout support
 - Added GSPromise wrapper with GSAbortController support
 - Added GSAbstractReadWrite data handler
 - Added GSReadWrite data handler
 - Added GSReadWriteRegistry of data handlers
 - Added data-gs-ignore attribute to prevent automatic element conversion
 - Fix input type radio JSON import/export
 - Add demo for dynamic forms
 - Update WebAdmin demo
 - Update manuals for new classes

# Release v1.7.1 (15.08.2023.)
 - GSPopup improvement
 - GSPopover improvement
 - GSPopover add templates support
 - GSPopover add slot content support
 - GSTouch added long press event
 - GSOffcanvas swipe fingers
 - GSOffcanvas swipe open/close events
 - GSDialog ok button enable/disable on form validity change
 - GSFormExt isValid only for visible fields fix
 
# Release  v1.7.0 (22.07.2023.)
 - GSMarkdown url fix
 - code cleanup for setting up ID
 - code cleanup for requestAnimation usage
 - Logging code cleanup
 - Update demos for new action handlers
 - Add external modules flag control

 - GSDialog null pointer issue fix
 - GSDialog added enable/disable input elements and form
 - GSFormExt added enable/disable input elements and form
 - GSModal added enable/disable input elements and form
 - GSFunction calls improvements
 - GSNotification method name collision fix
 - GSOffcanvas height
 - GSOffcanvas added max=auto support
 - GSOffcanvas attributes update
 - GSOffcanvas mouse events improvements
 - GSTouch added to support swipe events
 - GSTree action event add; improve general action events triggering
 - GSUtil disable Input owner fix

# Release  v1.6.0 (28.06.2023.)
 - Fix recursive action event calls
 - GSMenu popup offset calculation added
 - GSDialog improved action event processing
 - GSMenu improved action event processing 
 - GSFormExt improved action event processing 
 - GSEvents added generic action listener to call dynamically attached class methods 
 - Renaming bootstrap, version removed
 - GSTable added column sorting arrows CSS
 - GSColumn add general column css atribute retrieval from parent gs-header
 - GSAlert added pause on mouseover for billboard mode
 - GSChart fix, demo fix
 - GSFormGroup fix css
 - GSHighlight added content append flag
 - GSInputExt added enter action
 - GSInputExt added autofocus
 - GSContext add custom anchor support; to allof context in dialogs
 - GSDialog - autohide footer if no buttons availables
 - GSDialog added ESC close when buttons not enabled
 - GSModal - autohide footer if no buttons available
 - GSModal added ESC close when buttons not enabled
 - Extra components improved controls auto-loading external libs
 - Demo build scripts improved

# Release v1.5.0 (15.06.2023.) 
 - Update to Bootstrap 5.3.0
 - Added GSCopyright component
 - Added GSTree component
 - Added billboard feature to GSAlert
 - Addd IPP SPA demo app
 - GSHighlight improvements
 - GSMenu & GSContext event handling improvement
 - GSMenu fix positioning

# Release v1.4.2 (21.05.2023.) 
 - Added unstyle Attribute to prevent GS style to shadowed component
 - Added GSMarkdown (gs-markdown) component

# Release v1.4.1 (02.05.2023.) 
 - Fix GSDialog stack
 - Updated Bootstrap Icons
 - GSNotificaton fix for native toast; added delay flag
 - GSData bool sort fix
 - Added multiple regex validation to GSFormGroup
 - Code cleanup
 - GSCacheStyles cleanup
 - Typo fix, update information
 - SPA Demo, UI updates
 - SPA Demo added Kerberos dialog 
 - SPA Demo added Migrate dialog 

# Release v1.4.0 (06.04.2023.) 
 - Added CSP compatible dynamic styles
 - GSElement dynamic styles; CSP compatible
 - Added GSSteps component 
 - Build script update
 - Fix css interval loader
 - Fix GSDataAttr css style match
 - Fix GSMenu delayed event
 - Fix GSDialog css template location

# Release v1.3.0 (01.03.2023.) 
 - Add GSElement proxied html wrap control
 - Add GSElement proxied target search parent.child
 - Add GSAttr flatten for attribute clonning
 - Add GSSteps/GSStep component for wizzard panels
 - Add buttons live update for GSModal  
 - Add buttons live update for GSDialog
 - Fix GSMenu close handling fix to prevent double call
 - Fix GSCSSMap.asNum for Firefox; add modules type to Rollup build
 - Bootstrap CSS update to the latest version 5.2.3

# Release v1.2.1 (30.01.2023.) 
 - Bootstrap update to 5.2.3
 - Add password reveal shortcut
 - GSDialog ESC key fix
 - GSDropdown event data handling fix
 - GSFormGroup attributes fix
 - GSMenu item title support added
 - GSNotification placement fix
 - GSTable size autofit added

# Release v1.2.0 (17.11.2022.)

- Added GSAccessibility class for keyboard navigation support
- Added GSUListExt extension to UL/LL for menu keyboard navigation
- Added GSMenu class - generic menu handler
- Aded GSDialog class for native "dialog support"
- Added GSContext, GSDropdown groupped selection

__Improvements and fixes__

- Refactor GSDropdown and GSContext menus
- GSContext event matching
- GSOffcanvas "visible" atribute changed to "expanded"
- GSNotification support for top level native dialogs
- GSNotification position update
- GSContext, GSDropdown default self action trigger
- Improved Firefox support
- Added 2 build variants for "rollup" tool - modeles and standard
- Bug fixes
- Demo updates
- Documentation updates
- Bootstrap CSS updated to 5.2.2

<br><hr>

&copy; Green Screens Ltd. 2016 - 2023
 