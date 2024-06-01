// 全屏相关
export const full = {
  /**
   * @param {HTMLElement} [elem]
   * @returns {Promise<void>}
   */
  toggle(elem) {
    // 踩坑：Apple第三方浏览器可能根本没有包含full的属性或方法
    if (!this.enabled) return Promise.reject(new Error('Fullscreen is not supported'));
    const onFullscreen = () => new Promise((resolve, reject) => {
      document.addEventListener(this.onchange, resolve, { once: true });
      document.addEventListener(this.onerror, reject, { once: true });
    });
    if (this.element) {
      const handler = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
      if (handler) { handler.call(document); return onFullscreen() }
    } else {
      const element = elem instanceof HTMLElement ? elem : document.body;
      const handler = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen;
      if (handler) { handler.call(element); return onFullscreen() }
    }
    return Promise.reject(new Error('Fullscreen is not supported'));
  },
  check(elem) {
    const element = elem instanceof HTMLElement ? elem : document.body;
    return this.element === element;
  },
  get onchange() {
    if (document.onfullscreenchange !== undefined) return 'fullscreenchange';
    if (document.onwebkitfullscreenchange !== undefined) return 'webkitfullscreenchange';
    if (document.onmozfullscreenchange !== undefined) return 'mozfullscreenchange';
    return null;
  },
  get onerror() {
    if (document.onfullscreenerror !== undefined) return 'fullscreenerror';
    if (document.onwebkitfullscreenerror !== undefined) return 'webkitfullscreenerror';
    if (document.onmozfullscreenerror !== undefined) return 'mozfullscreenerror';
    return null;
  },
  get element() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || null;
  },
  get enabled() {
    return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || false;
  }
};
export const orientation = {
  async checkSupport() {
    const s = screen.orientation;
    if (!s) return false;
    try {
      await s.lock(s.type);
      s.unlock();
      hook.toast('如果你看到了这个提示，请联系开发者：Unexpected Allow Orientation Lock Without Permission');
      return true;
    } catch (e) {
      if (e.name === 'SecurityError') {
        if (e.message === 'The operation is insecure.') return false; // Firefox
        return true;
      } else if (e.name === 'NotSupportedError') return false;
      else if (e.name === 'TypeError') return false; // Safari 16.4
      throw e;
    }
  },
  lockLandscape() {
    const s = screen.orientation;
    if (!s) return Promise.reject(new Error('Orientation is not supported'));
    return s.lock('landscape-primary');
  },
  lockPortrait() {
    const s = screen.orientation;
    if (!s) return Promise.reject(new Error('Orientation is not supported'));
    return s.lock('portrait-primary');
  },
  unlock() {
    const s = screen.orientation;
    if (!s) return Promise.reject(new Error('Orientation is not supported'));
    return s.unlock();
  }
};
// function loadJS(url, callback) {
//   const script = document.createElement('script');
//   const fn = callback || function() {};
//   script.type = 'text/javascript';
//   script.onload = function() {
//     fn();
//   };
//   script.src = url;
//   document.getElementsByTagName('head')[0].appendChild(script);
// }
// function loadJS2(url) {
//   return new Promise((resolve, reject) => {
//     const script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.onload = resolve;
//     script.onerror = reject;
//     script.src = url;
//     document.getElementsByTagName('head')[0].appendChild(script);
//   });
// }
// self.onerror=(...a)=>console.log('awa',a);
// self.addEventListener('error',(...a)=>console.log('awa',a));
export const urls0 = {
  jszip: ['//unpkg.com/jszip/dist/jszip.min.js', '//cdn.jsdelivr.net/npm/jszip', '//fastly.jsdelivr.net/npm/jszip'],
  blur: ['//unpkg.com/stackblur-canvas/dist/stackblur.min.js', '//cdn.jsdelivr.net/npm/stackblur-canvas', '//fastly.jsdelivr.net/npm/stackblur-canvas'],
  md5: ['//unpkg.com/md5-js/md5.min.js', '//cdn.jsdelivr.net/npm/md5-js', '//fastly.jsdelivr.net/npm/md5-js']
};
export const getConstructorName = obj => {
  if (obj === null) return 'Null';
  if (obj === undefined) return 'Undefined';
  return obj.constructor.name;
};
export const isUndefined = name => self[name] === undefined;
// Legacy
{
  // EventTarget.constructor polyfill for Safari 14-
  try {
    Reflect.construct(EventTarget, []);
  } catch (e) {
    self.EventTarget = function() {
      this.listeners = {};
    };
    EventTarget.prototype = {
      constructor: EventTarget,
      addEventListener(type, callback) {
        if (!(type in this.listeners)) this.listeners[type] = [];
        this.listeners[type].push(callback);
      },
      removeEventListener(type, callback) {
        if (!(type in this.listeners)) return;
        const stack = this.listeners[type];
        for (let i = 0, l = stack.length; i < l; i++) {
          if (stack[i] === callback) {
            stack.splice(i, 1);
            return;
          }
        }
      },
      dispatchEvent(event) {
        if (!(event.type in this.listeners)) return true;
        const stack = this.listeners[event.type];
        // event.target = this;
        for (let i = 0, l = stack.length; i < l; i++) {
          stack[i].call(this, event);
        }
        return !event.defaultPrevented;
      }
    };
  }
  // Error.cause polyfill for Safari 15-
  const error = new Error();
  if (new Error('', { cause: error }).cause !== error) {
    class Error extends self.Error {
      constructor(message, { cause } = {}) {
        super(message);
        this.cause = cause;
      }
    }
    Object.defineProperty(Error, 'name', { value: 'Error' });
    self.Error = Error;
  }
  // DOMException.stack polyfill for All Browsers
  class DOMException extends self.DOMException {
    constructor(message, name) {
      super(message, name);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, DOMException); // 过滤自身stack
      } else {
        this.stack = new Error().stack.replace(/.+\n/, '');
      }
    }
  }
  Object.defineProperty(DOMException, 'name', { value: 'DOMException' });
  self.DOMException = DOMException;
  // AudioContext constructor polyfill for Safari 14.5-
  if (isUndefined('AudioContext')) {
    self.AudioContext = self.webkitAudioContext;
  }
  // Object.hasOwn polyfill for Safari 15.4-
  if (Object.hasOwn === undefined) {
    Object.defineProperty(Object, 'hasOwn', {
      value(obj, prop) {
        // eslint-disable-next-line prefer-object-has-own
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }
    });
  }
  // Array.prototype.findLast polyfill
  if (Array.prototype.findLast === undefined) {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Array.prototype, 'findLast', {
      value(predicate, thisArg) {
        for (let i = this.length - 1; i >= 0; i--) {
          if (predicate.call(thisArg, this[i], i, this)) return this[i];
        }
        return undefined;
      }
    });
  }
  // Array.prototype.toReversed polyfill
  if (Array.prototype.toReversed === undefined) {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Array.prototype, 'toReversed', {
      value() {
        return this.slice().reverse();
      }
    });
  }
}
export function loadJS(...args) {
  const arr = Array.from(args[0] instanceof Array ? args[0] : args, i => new URL(i, location).href);
  const args0 = (function *(arg) { yield* arg }(arr));
  const load = url => new Promise((resolve, reject) => {
    if (!url) { reject(new DOMException(`All urls are invalid\n${arr.join('\n')}`, 'NetworkError')); return }
    const script = document.createElement('script');
    script.onload = () => resolve(script);
    script.onerror = () => load(args0.next().value).then(s => resolve(s)).catch(e => reject(e));
    script.src = url;
    if (!location.port) script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  });
  return load(args0.next().value);
}
