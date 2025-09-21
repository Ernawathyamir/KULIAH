// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  // `loadDynamicModule` is a JS function that takes two string names matching,
  //   in order, a wasm file produced by the dart2wasm compiler during dynamic
  //   module compilation and a corresponding js file produced by the same
  //   compilation. It should return a JS Array containing 2 elements. The first
  //   should be the bytes for the wasm module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The second
  //   should be the result of using the JS 'import' API on the js file path.
  async instantiate(additionalImports, {loadDeferredWasm, loadDynamicModule} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            _3: (o, t) => typeof o === t,
      _4: (o, c) => o instanceof c,
      _7: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._7(f,arguments.length,x0) }),
      _8: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._8(f,arguments.length,x0,x1) }),
      _36: () => new Array(),
      _37: x0 => new Array(x0),
      _39: x0 => x0.length,
      _41: (x0,x1) => x0[x1],
      _42: (x0,x1,x2) => { x0[x1] = x2 },
      _43: x0 => new Promise(x0),
      _45: (x0,x1,x2) => new DataView(x0,x1,x2),
      _47: x0 => new Int8Array(x0),
      _48: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _49: x0 => new Uint8Array(x0),
      _51: x0 => new Uint8ClampedArray(x0),
      _53: x0 => new Int16Array(x0),
      _55: x0 => new Uint16Array(x0),
      _57: x0 => new Int32Array(x0),
      _59: x0 => new Uint32Array(x0),
      _61: x0 => new Float32Array(x0),
      _63: x0 => new Float64Array(x0),
      _65: (x0,x1,x2) => x0.call(x1,x2),
      _70: (decoder, codeUnits) => decoder.decode(codeUnits),
      _71: () => new TextDecoder("utf-8", {fatal: true}),
      _72: () => new TextDecoder("utf-8", {fatal: false}),
      _73: (s) => +s,
      _74: x0 => new Uint8Array(x0),
      _75: (x0,x1,x2) => x0.set(x1,x2),
      _76: (x0,x1) => x0.transferFromImageBitmap(x1),
      _78: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._78(f,arguments.length,x0) }),
      _79: x0 => new window.FinalizationRegistry(x0),
      _80: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _81: (x0,x1) => x0.unregister(x1),
      _82: (x0,x1,x2) => x0.slice(x1,x2),
      _83: (x0,x1) => x0.decode(x1),
      _84: (x0,x1) => x0.segment(x1),
      _85: () => new TextDecoder(),
      _87: x0 => x0.click(),
      _88: x0 => x0.buffer,
      _89: x0 => x0.wasmMemory,
      _90: () => globalThis.window._flutter_skwasmInstance,
      _91: x0 => x0.rasterStartMilliseconds,
      _92: x0 => x0.rasterEndMilliseconds,
      _93: x0 => x0.imageBitmaps,
      _120: x0 => x0.remove(),
      _121: (x0,x1) => x0.append(x1),
      _122: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _123: (x0,x1) => x0.querySelector(x1),
      _125: (x0,x1) => x0.removeChild(x1),
      _203: x0 => x0.stopPropagation(),
      _204: x0 => x0.preventDefault(),
      _206: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _251: x0 => x0.unlock(),
      _252: x0 => x0.getReader(),
      _253: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _254: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _255: (x0,x1) => x0.item(x1),
      _256: x0 => x0.next(),
      _257: x0 => x0.now(),
      _258: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._258(f,arguments.length,x0) }),
      _259: (x0,x1) => x0.addListener(x1),
      _260: (x0,x1) => x0.removeListener(x1),
      _261: (x0,x1) => x0.matchMedia(x1),
      _262: (x0,x1) => x0.revokeObjectURL(x1),
      _263: x0 => x0.close(),
      _264: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      _265: x0 => new window.ImageDecoder(x0),
      _266: x0 => ({frameIndex: x0}),
      _267: (x0,x1) => x0.decode(x1),
      _268: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._268(f,arguments.length,x0) }),
      _269: (x0,x1) => x0.getModifierState(x1),
      _270: (x0,x1) => x0.removeProperty(x1),
      _271: (x0,x1) => x0.prepend(x1),
      _272: x0 => x0.disconnect(),
      _273: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._273(f,arguments.length,x0) }),
      _274: (x0,x1) => x0.getAttribute(x1),
      _275: (x0,x1) => x0.contains(x1),
      _276: x0 => x0.blur(),
      _277: x0 => x0.hasFocus(),
      _278: (x0,x1) => x0.hasAttribute(x1),
      _279: (x0,x1) => x0.getModifierState(x1),
      _280: (x0,x1) => x0.appendChild(x1),
      _281: (x0,x1) => x0.createTextNode(x1),
      _282: (x0,x1) => x0.removeAttribute(x1),
      _283: x0 => x0.getBoundingClientRect(),
      _284: (x0,x1) => x0.observe(x1),
      _285: x0 => x0.disconnect(),
      _286: (x0,x1) => x0.closest(x1),
      _708: () => globalThis.window.flutterConfiguration,
      _710: x0 => x0.assetBase,
      _716: x0 => x0.debugShowSemanticsNodes,
      _717: x0 => x0.hostElement,
      _718: x0 => x0.multiViewEnabled,
      _719: x0 => x0.nonce,
      _721: x0 => x0.fontFallbackBaseUrl,
      _731: x0 => x0.console,
      _732: x0 => x0.devicePixelRatio,
      _733: x0 => x0.document,
      _734: x0 => x0.history,
      _735: x0 => x0.innerHeight,
      _736: x0 => x0.innerWidth,
      _737: x0 => x0.location,
      _738: x0 => x0.navigator,
      _739: x0 => x0.visualViewport,
      _740: x0 => x0.performance,
      _742: x0 => x0.URL,
      _744: (x0,x1) => x0.getComputedStyle(x1),
      _745: x0 => x0.screen,
      _746: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._746(f,arguments.length,x0) }),
      _747: (x0,x1) => x0.requestAnimationFrame(x1),
      _752: (x0,x1) => x0.warn(x1),
      _754: (x0,x1) => x0.debug(x1),
      _755: x0 => globalThis.parseFloat(x0),
      _756: () => globalThis.window,
      _757: () => globalThis.Intl,
      _758: () => globalThis.Symbol,
      _759: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      _761: x0 => x0.clipboard,
      _762: x0 => x0.maxTouchPoints,
      _763: x0 => x0.vendor,
      _764: x0 => x0.language,
      _765: x0 => x0.platform,
      _766: x0 => x0.userAgent,
      _767: (x0,x1) => x0.vibrate(x1),
      _768: x0 => x0.languages,
      _769: x0 => x0.documentElement,
      _770: (x0,x1) => x0.querySelector(x1),
      _773: (x0,x1) => x0.createElement(x1),
      _776: (x0,x1) => x0.createEvent(x1),
      _777: x0 => x0.activeElement,
      _780: x0 => x0.head,
      _781: x0 => x0.body,
      _783: (x0,x1) => { x0.title = x1 },
      _786: x0 => x0.visibilityState,
      _787: () => globalThis.document,
      _788: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._788(f,arguments.length,x0) }),
      _789: (x0,x1) => x0.dispatchEvent(x1),
      _797: x0 => x0.target,
      _799: x0 => x0.timeStamp,
      _800: x0 => x0.type,
      _802: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _808: x0 => x0.baseURI,
      _809: x0 => x0.firstChild,
      _813: x0 => x0.parentElement,
      _815: (x0,x1) => { x0.textContent = x1 },
      _816: x0 => x0.parentNode,
      _818: x0 => x0.isConnected,
      _822: x0 => x0.firstElementChild,
      _824: x0 => x0.nextElementSibling,
      _825: x0 => x0.clientHeight,
      _826: x0 => x0.clientWidth,
      _827: x0 => x0.offsetHeight,
      _828: x0 => x0.offsetWidth,
      _829: x0 => x0.id,
      _830: (x0,x1) => { x0.id = x1 },
      _833: (x0,x1) => { x0.spellcheck = x1 },
      _834: x0 => x0.tagName,
      _835: x0 => x0.style,
      _837: (x0,x1) => x0.querySelectorAll(x1),
      _838: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _839: x0 => x0.tabIndex,
      _840: (x0,x1) => { x0.tabIndex = x1 },
      _841: (x0,x1) => x0.focus(x1),
      _842: x0 => x0.scrollTop,
      _843: (x0,x1) => { x0.scrollTop = x1 },
      _844: x0 => x0.scrollLeft,
      _845: (x0,x1) => { x0.scrollLeft = x1 },
      _846: x0 => x0.classList,
      _848: (x0,x1) => { x0.className = x1 },
      _850: (x0,x1) => x0.getElementsByClassName(x1),
      _851: (x0,x1) => x0.attachShadow(x1),
      _854: x0 => x0.computedStyleMap(),
      _855: (x0,x1) => x0.get(x1),
      _861: (x0,x1) => x0.getPropertyValue(x1),
      _862: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _863: x0 => x0.offsetLeft,
      _864: x0 => x0.offsetTop,
      _865: x0 => x0.offsetParent,
      _867: (x0,x1) => { x0.name = x1 },
      _868: x0 => x0.content,
      _869: (x0,x1) => { x0.content = x1 },
      _873: (x0,x1) => { x0.src = x1 },
      _874: x0 => x0.naturalWidth,
      _875: x0 => x0.naturalHeight,
      _879: (x0,x1) => { x0.crossOrigin = x1 },
      _881: (x0,x1) => { x0.decoding = x1 },
      _882: x0 => x0.decode(),
      _887: (x0,x1) => { x0.nonce = x1 },
      _892: (x0,x1) => { x0.width = x1 },
      _894: (x0,x1) => { x0.height = x1 },
      _897: (x0,x1) => x0.getContext(x1),
      _961: (x0,x1) => x0.fetch(x1),
      _962: x0 => x0.status,
      _964: x0 => x0.body,
      _965: x0 => x0.arrayBuffer(),
      _968: x0 => x0.read(),
      _969: x0 => x0.value,
      _970: x0 => x0.done,
      _977: x0 => x0.name,
      _978: x0 => x0.x,
      _979: x0 => x0.y,
      _982: x0 => x0.top,
      _983: x0 => x0.right,
      _984: x0 => x0.bottom,
      _985: x0 => x0.left,
      _997: x0 => x0.height,
      _998: x0 => x0.width,
      _999: x0 => x0.scale,
      _1000: (x0,x1) => { x0.value = x1 },
      _1003: (x0,x1) => { x0.placeholder = x1 },
      _1005: (x0,x1) => { x0.name = x1 },
      _1006: x0 => x0.selectionDirection,
      _1007: x0 => x0.selectionStart,
      _1008: x0 => x0.selectionEnd,
      _1011: x0 => x0.value,
      _1013: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1014: x0 => x0.readText(),
      _1015: (x0,x1) => x0.writeText(x1),
      _1017: x0 => x0.altKey,
      _1018: x0 => x0.code,
      _1019: x0 => x0.ctrlKey,
      _1020: x0 => x0.key,
      _1021: x0 => x0.keyCode,
      _1022: x0 => x0.location,
      _1023: x0 => x0.metaKey,
      _1024: x0 => x0.repeat,
      _1025: x0 => x0.shiftKey,
      _1026: x0 => x0.isComposing,
      _1028: x0 => x0.state,
      _1029: (x0,x1) => x0.go(x1),
      _1031: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _1032: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1033: x0 => x0.pathname,
      _1034: x0 => x0.search,
      _1035: x0 => x0.hash,
      _1039: x0 => x0.state,
      _1042: (x0,x1) => x0.createObjectURL(x1),
      _1044: x0 => new Blob(x0),
      _1046: x0 => new MutationObserver(x0),
      _1047: (x0,x1,x2) => x0.observe(x1,x2),
      _1048: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1048(f,arguments.length,x0,x1) }),
      _1051: x0 => x0.attributeName,
      _1052: x0 => x0.type,
      _1053: x0 => x0.matches,
      _1054: x0 => x0.matches,
      _1058: x0 => x0.relatedTarget,
      _1060: x0 => x0.clientX,
      _1061: x0 => x0.clientY,
      _1062: x0 => x0.offsetX,
      _1063: x0 => x0.offsetY,
      _1066: x0 => x0.button,
      _1067: x0 => x0.buttons,
      _1068: x0 => x0.ctrlKey,
      _1072: x0 => x0.pointerId,
      _1073: x0 => x0.pointerType,
      _1074: x0 => x0.pressure,
      _1075: x0 => x0.tiltX,
      _1076: x0 => x0.tiltY,
      _1077: x0 => x0.getCoalescedEvents(),
      _1080: x0 => x0.deltaX,
      _1081: x0 => x0.deltaY,
      _1082: x0 => x0.wheelDeltaX,
      _1083: x0 => x0.wheelDeltaY,
      _1084: x0 => x0.deltaMode,
      _1091: x0 => x0.changedTouches,
      _1094: x0 => x0.clientX,
      _1095: x0 => x0.clientY,
      _1098: x0 => x0.data,
      _1101: (x0,x1) => { x0.disabled = x1 },
      _1103: (x0,x1) => { x0.type = x1 },
      _1104: (x0,x1) => { x0.max = x1 },
      _1105: (x0,x1) => { x0.min = x1 },
      _1106: (x0,x1) => { x0.value = x1 },
      _1107: x0 => x0.value,
      _1108: (x0,x1) => { x0.disabled = x1 },
      _1109: x0 => x0.disabled,
      _1111: (x0,x1) => { x0.placeholder = x1 },
      _1113: (x0,x1) => { x0.name = x1 },
      _1114: (x0,x1) => { x0.autocomplete = x1 },
      _1116: x0 => x0.selectionDirection,
      _1117: x0 => x0.selectionStart,
      _1119: x0 => x0.selectionEnd,
      _1122: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1123: (x0,x1) => x0.add(x1),
      _1126: (x0,x1) => { x0.noValidate = x1 },
      _1127: (x0,x1) => { x0.method = x1 },
      _1128: (x0,x1) => { x0.action = x1 },
      _1154: x0 => x0.orientation,
      _1155: x0 => x0.width,
      _1156: x0 => x0.height,
      _1157: (x0,x1) => x0.lock(x1),
      _1176: x0 => new ResizeObserver(x0),
      _1179: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1179(f,arguments.length,x0,x1) }),
      _1187: x0 => x0.length,
      _1188: x0 => x0.iterator,
      _1189: x0 => x0.Segmenter,
      _1190: x0 => x0.v8BreakIterator,
      _1191: (x0,x1) => new Intl.Segmenter(x0,x1),
      _1192: x0 => x0.done,
      _1193: x0 => x0.value,
      _1194: x0 => x0.index,
      _1198: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _1199: (x0,x1) => x0.adoptText(x1),
      _1200: x0 => x0.first(),
      _1201: x0 => x0.next(),
      _1202: x0 => x0.current(),
      _1213: x0 => x0.hostElement,
      _1214: x0 => x0.viewConstraints,
      _1217: x0 => x0.maxHeight,
      _1218: x0 => x0.maxWidth,
      _1219: x0 => x0.minHeight,
      _1220: x0 => x0.minWidth,
      _1221: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1221(f,arguments.length,x0) }),
      _1222: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1222(f,arguments.length,x0) }),
      _1223: (x0,x1) => ({addView: x0,removeView: x1}),
      _1226: x0 => x0.loader,
      _1227: () => globalThis._flutter,
      _1228: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1229: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1229(f,arguments.length,x0) }),
      _1230: f => finalizeWrapper(f, function() { return dartInstance.exports._1230(f,arguments.length) }),
      _1231: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _1234: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1234(f,arguments.length,x0) }),
      _1235: x0 => ({runApp: x0}),
      _1237: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1237(f,arguments.length,x0,x1) }),
      _1238: x0 => x0.length,
      _1239: () => globalThis.window.ImageDecoder,
      _1240: x0 => x0.tracks,
      _1242: x0 => x0.completed,
      _1244: x0 => x0.image,
      _1250: x0 => x0.displayWidth,
      _1251: x0 => x0.displayHeight,
      _1252: x0 => x0.duration,
      _1255: x0 => x0.ready,
      _1256: x0 => x0.selectedTrack,
      _1257: x0 => x0.repetitionCount,
      _1258: x0 => x0.frameCount,
      _1301: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1301(f,arguments.length,x0) }),
      _1302: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1303: (x0,x1,x2) => x0.postMessage(x1,x2),
      _1304: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _1305: (x0,x1) => x0.getItem(x1),
      _1306: (x0,x1,x2) => x0.setItem(x1,x2),
      _1307: (x0,x1) => x0.querySelectorAll(x1),
      _1308: (x0,x1) => x0.removeChild(x1),
      _1309: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1309(f,arguments.length,x0) }),
      _1310: (x0,x1) => x0.forEach(x1),
      _1311: x0 => x0.preventDefault(),
      _1312: (x0,x1) => x0.item(x1),
      _1313: () => new FileReader(),
      _1314: (x0,x1) => x0.readAsText(x1),
      _1315: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1315(f,arguments.length,x0) }),
      _1316: () => globalThis.initializeGA(),
      _1318: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16,x17,x18,x19,x20,x21,x22,x23,x24,x25,x26,x27,x28,x29,x30,x31,x32,x33) => ({screen: x0,event_category: x1,event_label: x2,send_to: x3,value: x4,non_interaction: x5,user_app: x6,user_build: x7,user_platform: x8,devtools_platform: x9,devtools_chrome: x10,devtools_version: x11,ide_launched: x12,flutter_client_id: x13,is_external_build: x14,is_embedded: x15,g3_username: x16,ide_launched_feature: x17,is_wasm: x18,ui_duration_micros: x19,raster_duration_micros: x20,shader_compilation_duration_micros: x21,cpu_sample_count: x22,cpu_stack_depth: x23,trace_event_count: x24,heap_diff_objects_before: x25,heap_diff_objects_after: x26,heap_objects_total: x27,root_set_count: x28,row_count: x29,inspector_tree_controller_id: x30,android_app_id: x31,ios_bundle_id: x32,is_v2_inspector: x33}),
      _1319: x0 => x0.screen,
      _1320: x0 => x0.user_app,
      _1321: x0 => x0.user_build,
      _1322: x0 => x0.user_platform,
      _1323: x0 => x0.devtools_platform,
      _1324: x0 => x0.devtools_chrome,
      _1325: x0 => x0.devtools_version,
      _1326: x0 => x0.ide_launched,
      _1328: x0 => x0.is_external_build,
      _1329: x0 => x0.is_embedded,
      _1330: x0 => x0.g3_username,
      _1331: x0 => x0.ide_launched_feature,
      _1332: x0 => x0.is_wasm,
      _1333: x0 => x0.ui_duration_micros,
      _1334: x0 => x0.raster_duration_micros,
      _1335: x0 => x0.shader_compilation_duration_micros,
      _1336: x0 => x0.cpu_sample_count,
      _1337: x0 => x0.cpu_stack_depth,
      _1338: x0 => x0.trace_event_count,
      _1339: x0 => x0.heap_diff_objects_before,
      _1340: x0 => x0.heap_diff_objects_after,
      _1341: x0 => x0.heap_objects_total,
      _1342: x0 => x0.root_set_count,
      _1343: x0 => x0.row_count,
      _1344: x0 => x0.inspector_tree_controller_id,
      _1345: x0 => x0.android_app_id,
      _1346: x0 => x0.ios_bundle_id,
      _1347: x0 => x0.is_v2_inspector,
      _1349: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16,x17,x18,x19,x20,x21,x22,x23,x24,x25,x26,x27,x28,x29) => ({description: x0,fatal: x1,user_app: x2,user_build: x3,user_platform: x4,devtools_platform: x5,devtools_chrome: x6,devtools_version: x7,ide_launched: x8,flutter_client_id: x9,is_external_build: x10,is_embedded: x11,g3_username: x12,ide_launched_feature: x13,is_wasm: x14,ui_duration_micros: x15,raster_duration_micros: x16,shader_compilation_duration_micros: x17,cpu_sample_count: x18,cpu_stack_depth: x19,trace_event_count: x20,heap_diff_objects_before: x21,heap_diff_objects_after: x22,heap_objects_total: x23,root_set_count: x24,row_count: x25,inspector_tree_controller_id: x26,android_app_id: x27,ios_bundle_id: x28,is_v2_inspector: x29}),
      _1350: x0 => x0.user_app,
      _1351: x0 => x0.user_build,
      _1352: x0 => x0.user_platform,
      _1353: x0 => x0.devtools_platform,
      _1354: x0 => x0.devtools_chrome,
      _1355: x0 => x0.devtools_version,
      _1356: x0 => x0.ide_launched,
      _1358: x0 => x0.is_external_build,
      _1359: x0 => x0.is_embedded,
      _1360: x0 => x0.g3_username,
      _1361: x0 => x0.ide_launched_feature,
      _1362: x0 => x0.is_wasm,
      _1378: () => globalThis.getDevToolsPropertyID(),
      _1379: () => globalThis.hookupListenerForGA(),
      _1380: (x0,x1,x2) => globalThis.gtag(x0,x1,x2),
      _1382: x0 => x0.event_category,
      _1383: x0 => x0.event_label,
      _1385: x0 => x0.value,
      _1386: x0 => x0.non_interaction,
      _1389: x0 => x0.description,
      _1390: x0 => x0.fatal,
      _1391: (x0,x1) => x0.createElement(x1),
      _1392: x0 => new Blob(x0),
      _1393: x0 => globalThis.URL.createObjectURL(x0),
      _1394: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1395: (x0,x1) => x0.append(x1),
      _1396: x0 => x0.click(),
      _1397: x0 => x0.remove(),
      _1398: x0 => x0.createRange(),
      _1399: (x0,x1) => x0.selectNode(x1),
      _1400: x0 => x0.getSelection(),
      _1401: x0 => x0.removeAllRanges(),
      _1402: (x0,x1) => x0.addRange(x1),
      _1403: (x0,x1) => x0.createElement(x1),
      _1404: (x0,x1) => x0.append(x1),
      _1405: (x0,x1,x2) => x0.insertRule(x1,x2),
      _1406: (x0,x1) => x0.add(x1),
      _1407: x0 => x0.preventDefault(),
      _1408: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1408(f,arguments.length,x0) }),
      _1409: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1410: () => globalThis.window.navigator.userAgent,
      _1411: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1411(f,arguments.length,x0) }),
      _1412: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1413: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _1418: (x0,x1) => x0.closest(x1),
      _1419: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1420: x0 => x0.decode(),
      _1421: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1422: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1423: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1423(f,arguments.length,x0) }),
      _1424: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1424(f,arguments.length,x0) }),
      _1425: x0 => x0.send(),
      _1426: () => new XMLHttpRequest(),
      _1427: (x0,x1) => x0.querySelector(x1),
      _1428: (x0,x1) => x0.appendChild(x1),
      _1429: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1429(f,arguments.length,x0) }),
      _1430: Date.now,
      _1432: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _1433: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _1434: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _1435: () => typeof dartUseDateNowForTicks !== "undefined",
      _1436: () => 1000 * performance.now(),
      _1437: () => Date.now(),
      _1438: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      _1439: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      _1440: () => new WeakMap(),
      _1441: (map, o) => map.get(o),
      _1442: (map, o, v) => map.set(o, v),
      _1443: x0 => new WeakRef(x0),
      _1444: x0 => x0.deref(),
      _1451: () => globalThis.WeakRef,
      _1455: s => JSON.stringify(s),
      _1456: s => printToConsole(s),
      _1457: (o, p, r) => o.replaceAll(p, () => r),
      _1458: (o, p, r) => o.replace(p, () => r),
      _1459: Function.prototype.call.bind(String.prototype.toLowerCase),
      _1460: s => s.toUpperCase(),
      _1461: s => s.trim(),
      _1462: s => s.trimLeft(),
      _1463: s => s.trimRight(),
      _1464: (string, times) => string.repeat(times),
      _1465: Function.prototype.call.bind(String.prototype.indexOf),
      _1466: (s, p, i) => s.lastIndexOf(p, i),
      _1467: (string, token) => string.split(token),
      _1468: Object.is,
      _1469: o => o instanceof Array,
      _1470: (a, i) => a.push(i),
      _1471: (a, i) => a.splice(i, 1)[0],
      _1473: (a, l) => a.length = l,
      _1474: a => a.pop(),
      _1475: (a, i) => a.splice(i, 1),
      _1476: (a, s) => a.join(s),
      _1477: (a, s, e) => a.slice(s, e),
      _1478: (a, s, e) => a.splice(s, e),
      _1479: (a, b) => a == b ? 0 : (a > b ? 1 : -1),
      _1480: a => a.length,
      _1481: (a, l) => a.length = l,
      _1482: (a, i) => a[i],
      _1483: (a, i, v) => a[i] = v,
      _1485: o => {
        if (o instanceof ArrayBuffer) return 0;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 1;
        }
        return 2;
      },
      _1486: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _1488: o => o instanceof Uint8Array,
      _1489: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _1490: o => o instanceof Int8Array,
      _1491: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _1492: o => o instanceof Uint8ClampedArray,
      _1493: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _1494: o => o instanceof Uint16Array,
      _1495: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _1496: o => o instanceof Int16Array,
      _1497: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _1498: o => o instanceof Uint32Array,
      _1499: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _1500: o => o instanceof Int32Array,
      _1501: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _1503: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _1504: o => o instanceof Float32Array,
      _1505: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _1506: o => o instanceof Float64Array,
      _1507: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _1508: (t, s) => t.set(s),
      _1510: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _1511: o => o.byteLength,
      _1512: o => o.buffer,
      _1513: o => o.byteOffset,
      _1514: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _1515: (b, o) => new DataView(b, o),
      _1516: (b, o, l) => new DataView(b, o, l),
      _1517: Function.prototype.call.bind(DataView.prototype.getUint8),
      _1518: Function.prototype.call.bind(DataView.prototype.setUint8),
      _1519: Function.prototype.call.bind(DataView.prototype.getInt8),
      _1520: Function.prototype.call.bind(DataView.prototype.setInt8),
      _1521: Function.prototype.call.bind(DataView.prototype.getUint16),
      _1522: Function.prototype.call.bind(DataView.prototype.setUint16),
      _1523: Function.prototype.call.bind(DataView.prototype.getInt16),
      _1524: Function.prototype.call.bind(DataView.prototype.setInt16),
      _1525: Function.prototype.call.bind(DataView.prototype.getUint32),
      _1526: Function.prototype.call.bind(DataView.prototype.setUint32),
      _1527: Function.prototype.call.bind(DataView.prototype.getInt32),
      _1528: Function.prototype.call.bind(DataView.prototype.setInt32),
      _1531: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _1532: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _1533: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _1534: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _1535: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _1536: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _1549: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _1550: (handle) => clearTimeout(handle),
      _1551: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _1552: (handle) => clearInterval(handle),
      _1553: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _1554: () => Date.now(),
      _1559: o => Object.keys(o),
      _1560: (x0,x1) => new WebSocket(x0,x1),
      _1561: (x0,x1) => x0.send(x1),
      _1562: (x0,x1,x2) => x0.close(x1,x2),
      _1564: x0 => x0.close(),
      _1565: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      _1566: (x0,x1) => globalThis.fetch(x0,x1),
      _1567: (x0,x1) => x0.get(x1),
      _1568: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._1568(f,arguments.length,x0,x1,x2) }),
      _1569: (x0,x1) => x0.forEach(x1),
      _1570: x0 => x0.abort(),
      _1571: () => new AbortController(),
      _1572: x0 => x0.getReader(),
      _1573: x0 => x0.read(),
      _1574: x0 => x0.cancel(),
      _1575: x0 => ({withCredentials: x0}),
      _1576: (x0,x1) => new EventSource(x0,x1),
      _1577: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1577(f,arguments.length,x0) }),
      _1578: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1578(f,arguments.length,x0) }),
      _1579: x0 => x0.close(),
      _1580: (x0,x1,x2) => ({method: x0,body: x1,credentials: x2}),
      _1581: (x0,x1,x2) => x0.fetch(x1,x2),
      _1584: () => new XMLHttpRequest(),
      _1585: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1586: x0 => x0.send(),
      _1588: (x0,x1) => x0.readAsArrayBuffer(x1),
      _1594: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1594(f,arguments.length,x0) }),
      _1595: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1595(f,arguments.length,x0) }),
      _1600: x0 => ({body: x0}),
      _1601: (x0,x1) => new Notification(x0,x1),
      _1602: () => globalThis.Notification.requestPermission(),
      _1603: x0 => x0.close(),
      _1604: x0 => x0.reload(),
      _1605: (x0,x1) => x0.groupCollapsed(x1),
      _1606: (x0,x1) => x0.log(x1),
      _1607: x0 => x0.groupEnd(),
      _1608: (x0,x1) => x0.warn(x1),
      _1609: (x0,x1) => x0.error(x1),
      _1610: x0 => x0.measureUserAgentSpecificMemory(),
      _1611: x0 => x0.bytes,
      _1621: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1621(f,arguments.length,x0) }),
      _1622: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1622(f,arguments.length,x0) }),
      _1623: x0 => x0.blur(),
      _1624: (x0,x1) => x0.replace(x1),
      _1625: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1635: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _1636: (x0,x1) => x0.exec(x1),
      _1637: (x0,x1) => x0.test(x1),
      _1638: x0 => x0.pop(),
      _1640: o => o === undefined,
      _1642: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _1644: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _1645: o => o instanceof RegExp,
      _1646: (l, r) => l === r,
      _1647: o => o,
      _1648: o => o,
      _1649: o => o,
      _1650: b => !!b,
      _1651: o => o.length,
      _1653: (o, i) => o[i],
      _1654: f => f.dartFunction,
      _1655: () => ({}),
      _1656: () => [],
      _1658: () => globalThis,
      _1659: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _1660: (o, p) => p in o,
      _1661: (o, p) => o[p],
      _1662: (o, p, v) => o[p] = v,
      _1663: (o, m, a) => o[m].apply(o, a),
      _1665: o => String(o),
      _1666: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      _1667: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        return 18;
      },
      _1668: o => [o],
      _1669: (o0, o1) => [o0, o1],
      _1670: (o0, o1, o2) => [o0, o1, o2],
      _1671: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      _1672: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1673: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1674: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1675: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1676: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1677: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1678: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1679: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1680: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1681: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1682: x0 => new ArrayBuffer(x0),
      _1683: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _1684: x0 => x0.input,
      _1685: x0 => x0.index,
      _1686: x0 => x0.groups,
      _1687: x0 => x0.flags,
      _1688: x0 => x0.multiline,
      _1689: x0 => x0.ignoreCase,
      _1690: x0 => x0.unicode,
      _1691: x0 => x0.dotAll,
      _1692: (x0,x1) => { x0.lastIndex = x1 },
      _1693: (o, p) => p in o,
      _1694: (o, p) => o[p],
      _1697: x0 => x0.random(),
      _1700: () => globalThis.Math,
      _1701: Function.prototype.call.bind(Number.prototype.toString),
      _1702: Function.prototype.call.bind(BigInt.prototype.toString),
      _1703: Function.prototype.call.bind(Number.prototype.toString),
      _1704: (d, digits) => d.toFixed(digits),
      _1707: (d, precision) => d.toPrecision(precision),
      _1708: () => globalThis.document,
      _1709: () => globalThis.window,
      _1714: (x0,x1) => { x0.height = x1 },
      _1716: (x0,x1) => { x0.width = x1 },
      _1719: x0 => x0.head,
      _1720: x0 => x0.classList,
      _1724: (x0,x1) => { x0.innerText = x1 },
      _1725: x0 => x0.style,
      _1727: x0 => x0.sheet,
      _1728: x0 => x0.src,
      _1729: (x0,x1) => { x0.src = x1 },
      _1730: x0 => x0.naturalWidth,
      _1731: x0 => x0.naturalHeight,
      _1738: x0 => x0.offsetX,
      _1739: x0 => x0.offsetY,
      _1740: x0 => x0.button,
      _1747: x0 => x0.status,
      _1748: (x0,x1) => { x0.responseType = x1 },
      _1750: x0 => x0.response,
      _1799: (x0,x1) => { x0.responseType = x1 },
      _1800: x0 => x0.response,
      _1875: x0 => x0.style,
      _2352: (x0,x1) => { x0.src = x1 },
      _2359: (x0,x1) => { x0.allow = x1 },
      _2371: x0 => x0.contentWindow,
      _2804: (x0,x1) => { x0.accept = x1 },
      _2818: x0 => x0.files,
      _2844: (x0,x1) => { x0.multiple = x1 },
      _2862: (x0,x1) => { x0.type = x1 },
      _3560: (x0,x1) => { x0.dropEffect = x1 },
      _3565: x0 => x0.files,
      _3577: x0 => x0.dataTransfer,
      _3581: () => globalThis.window,
      _3623: x0 => x0.location,
      _3624: x0 => x0.history,
      _3640: x0 => x0.parent,
      _3642: x0 => x0.navigator,
      _3897: x0 => x0.isSecureContext,
      _3898: x0 => x0.crossOriginIsolated,
      _3901: x0 => x0.performance,
      _3906: x0 => x0.localStorage,
      _3914: x0 => x0.origin,
      _3923: x0 => x0.pathname,
      _3937: x0 => x0.state,
      _3962: x0 => x0.message,
      _4024: x0 => x0.appVersion,
      _4025: x0 => x0.platform,
      _4028: x0 => x0.userAgent,
      _4029: x0 => x0.vendor,
      _4079: x0 => x0.data,
      _4080: x0 => x0.origin,
      _4452: x0 => x0.readyState,
      _4461: x0 => x0.protocol,
      _4465: (x0,x1) => { x0.binaryType = x1 },
      _4468: x0 => x0.code,
      _4469: x0 => x0.reason,
      _6136: x0 => x0.type,
      _6177: x0 => x0.signal,
      _6235: x0 => x0.parentNode,
      _6249: () => globalThis.document,
      _6331: x0 => x0.body,
      _6374: x0 => x0.activeElement,
      _7008: x0 => x0.offsetX,
      _7009: x0 => x0.offsetY,
      _7094: x0 => x0.key,
      _7095: x0 => x0.code,
      _7096: x0 => x0.location,
      _7097: x0 => x0.ctrlKey,
      _7098: x0 => x0.shiftKey,
      _7099: x0 => x0.altKey,
      _7100: x0 => x0.metaKey,
      _7101: x0 => x0.repeat,
      _7102: x0 => x0.isComposing,
      _8008: x0 => x0.value,
      _8010: x0 => x0.done,
      _8190: x0 => x0.size,
      _8191: x0 => x0.type,
      _8198: x0 => x0.name,
      _8199: x0 => x0.lastModified,
      _8204: x0 => x0.length,
      _8210: x0 => x0.result,
      _8705: x0 => x0.url,
      _8707: x0 => x0.status,
      _8709: x0 => x0.statusText,
      _8710: x0 => x0.headers,
      _8711: x0 => x0.body,
      _10793: (x0,x1) => { x0.backgroundColor = x1 },
      _10839: (x0,x1) => { x0.border = x1 },
      _11117: (x0,x1) => { x0.display = x1 },
      _11281: (x0,x1) => { x0.height = x1 },
      _11971: (x0,x1) => { x0.width = x1 },
      _13058: () => globalThis.console,

    };

    const baseImports = {
      dart2wasm: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      S: new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
