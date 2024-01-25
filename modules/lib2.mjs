// vanilla-lit 

const litUrl = globalThis.GS_LIT_URL || '/bootstrap-lit/assets/lib/vanilla-lit-all.min.js';
const litModule = await import(litUrl);

// small helper to print this exports (or any other module); use it when upgrading to a new Lit version to regenerte export list below
export const printModuleExports = (module) => console.log(Object.keys(module || litModule).map(v => `export const ${v} = litModule.${v};`).join('\n'));

export const AsyncDirective = litModule.AsyncDirective;
export const AsyncReplaceDirective = litModule.AsyncReplaceDirective;
export const AttributeConverter = litModule.AttributeConverter;
export const AttributePart = litModule.AttributePart;
export const BasePart = litModule.BasePart;
export const BooleanAttributePart = litModule.BooleanAttributePart;
export const CSS = litModule.CSS;
export const CSSResult = litModule.CSSResult;
export const ChildPart = litModule.ChildPart;
export const ContextConsumer = litModule.ContextConsumer;
export const ContextProvider = litModule.ContextProvider;
export const ContextProviderEvent = litModule.ContextProviderEvent;
export const ContextRequestEvent = litModule.ContextRequestEvent;
export const ContextRoot = litModule.ContextRoot;
export const Directive = litModule.Directive;
export const DynamicHTML = litModule.DynamicHTML;
export const ENABLE_EXTRA_SECURITY_HOOKS = litModule.ENABLE_EXTRA_SECURITY_HOOKS;
export const ElementPart = litModule.ElementPart;
export const EventPart = litModule.EventPart;
export const PartType = litModule.PartType;
export const Pauser = litModule.Pauser;
export const PropertyPart = litModule.PropertyPart;
export const PseudoWeakRef = litModule.PseudoWeakRef;
export const ReactiveComponent = litModule.ReactiveComponent;
export const ReactiveController = litModule.ReactiveController;
export const ReactiveControllerHost = litModule.ReactiveControllerHost;
export const ReactiveElement = litModule.ReactiveElement;
export const ResultType = litModule.ResultType;
export const StaticHTML = litModule.StaticHTML;
export const Task = litModule.Task;
export const TaskStatus = litModule.TaskStatus;
export const Template = litModule.Template;
export const TemplateInstance = litModule.TemplateInstance;
export const UnsafeHTMLDirective = litModule.UnsafeHTMLDirective;
export const UntilDirective = litModule.UntilDirective;
export const ValueNotifier = litModule.ValueNotifier;
export const asyncAppend = litModule.asyncAppend;
export const asyncReplace = litModule.asyncReplace;
export const boundAttributeSuffix = litModule.boundAttributeSuffix;
export const cache = litModule.cache;
export const choose = litModule.choose;
export const classMap = litModule.classMap;
export const clearPart = litModule.clearPart;
export const constructionToken = litModule.constructionToken;
export const createMarker = litModule.createMarker;
export const createRef = litModule.createRef;
export const createSanitizer = litModule.createSanitizer;
export const deepArrayEquals = litModule.deepArrayEquals;
export const deepEquals = litModule.deepEquals;
export const directive = litModule.directive;
export const directiveSymbol = litModule.directiveSymbol;
export const forAwaitOf = litModule.forAwaitOf;
export const getCommittedValue = litModule.getCommittedValue;
export const getDirectiveClass = litModule.getDirectiveClass;
export const getTemplateHtml = litModule.getTemplateHtml;
export const guard = litModule.guard;
export const ifDefined = litModule.ifDefined;
export const initialState = litModule.initialState;
export const insertPart = litModule.insertPart;
export const isArray = litModule.isArray;
export const isCompiledTemplateResult = litModule.isCompiledTemplateResult;
export const isDirectiveResult = litModule.isDirectiveResult;
export const isIterable = litModule.isIterable;
export const isNoOp = litModule.isNoOp;
export const isPrimitive = litModule.isPrimitive;
export const isSingleExpression = litModule.isSingleExpression;
export const isTemplateResult = litModule.isTemplateResult;
export const join = litModule.join;
export const keyed = litModule.keyed;
export const live = litModule.live;
export const map = litModule.map;
export const marker = litModule.marker;
export const markerMatch = litModule.markerMatch;
export const noChange = litModule.noChange;
export const nodeMarker = litModule.nodeMarker;
export const nothing = litModule.nothing;
export const notifySymbol = litModule.notifySymbol;
export const partSymbol = litModule.partSymbol;
export const range = litModule.range;
export const rawTextElement = litModule.rawTextElement;
export const ref = litModule.ref;
export const removePart = litModule.removePart;
export const repeat = litModule.repeat;
export const sanityze = litModule.sanityze;
export const setChildPartValue = litModule.setChildPartValue;
export const setCommittedValue = litModule.setCommittedValue;
export const setSanitizer = litModule.setSanitizer;
export const shallowArrayEquals = litModule.shallowArrayEquals;
export const styleMap = litModule.styleMap;
export const supportsAdoptingStyleSheets = litModule.supportsAdoptingStyleSheets;
export const symbolResult = litModule.symbolResult;
export const templateContent = litModule.templateContent;
export const trustFromTemplateString = litModule.trustFromTemplateString;
export const typeSymbol = litModule.typeSymbol;
export const unsafeHTML = litModule.unsafeHTML;
export const unsafeSVG = litModule.unsafeSVG;
export const until = litModule.until;
export const walker = litModule.walker;
export const when = litModule.when;

//------------------------ Lit compatibility
export const LitElement = litModule.LitElement;

export const html = litModule.html;
export const svg = litModule.svg;
export const render = litModule.render;

export const staticHtml = litModule.html;
export const staticSvg = litModule.svg;

export const unsafeStatic = litModule.unsafeStatic
export const withStatic = litModule.withStatic;
export const literal = litModule.literal;

export const css =  litModule.css;
export const unsafeCSS = litModule.unsafeCSS;
export const adoptStyles = litModule.adoptStyles;

export const notEqual = litModule.notEqual;

//--------------------- Not added 

export const TemplateResultType = litModule.TemplateResultType;
export const _$LE = litModule._$LE;
export const _$LH = litModule._$LH;
export const defaultConverter = litModule.defaultConverter;
export const isServer = litModule.isServer;