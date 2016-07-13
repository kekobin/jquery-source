'use strict';

(function(window, undefined) {
	//1.基础变量
	var idReg = /^#(\w+)$/,
		classReg = /^\.(\w+)$/,
		rootjQuery,
		class2Type = {},
		objToString = class2Type.toString,
		arr = [],
		core_slice = arr.slice,
		completed = function(callback) {
			document.removeEventListener( "DOMContentLoaded", null, false );
			// window.removeEventListener( "load", null, false );
			callback();
		};

	//2.对象构建
	var jQuery = function(selector, context) {
		return new jQuery.fn.init(selector, context);
	};
	//3.原型及方法构建
	jQuery.fn = jQuery.prototype = {
		construct: jQuery,
		init: function(selector, context) {
			var elem;

			if(idReg.test(selector)) {
				elem = document.getElementById(RegExp.$1);

				this.length = 1;
				this.context = document;
				this[0] = elem;
				return this;
			} else if(classReg. test(selector)) {
				elem = document.getElementsByClassName(RegExp.$1);

				this.length = elem.length;
				this.context = document;

				for(var i=0,len=elem.length;i<len;i++) {
					this[i] = elem[i];
				}
				
				return this;
			} else if(selector.nodeType) {
				this.context = this[0] = selector;
				this.length = 1;
				return this;
			} else if(jQuery.isFunction(selector)) {
				return rootjQuery.ready(selector);
			}
		},
		ready: function(fn) {
			if(document.readyState == 'complete') {
				setTimeout(fn);
			} else {
				document.addEventListener('DOMContentLoaded', completed(fn), false);
				// window.addEventListener('load', completed(fn), false);
			}

			return this;
		},
		toArray: function() {
			return core_slice.call(this);
		},
		get: function(num) {
			return num == null ? 

				   this.toArray() : 
				   
				   (num < 0 ? this[this.length + num] : this[num]);
		}
	};

	jQuery.fn.init.prototype = jQuery.fn;

	jQuery.extend = jQuery.fn.extend = function() {
		var length = arguments.length, 
			target = arguments[0] || {},
			i = 1,
			options,
			src, 
			copy;

		if(length === i) {
			target = this;
			i--;
		}

		for(; i < length; i++) {
			if((options = arguments[i]) != null) {
				for(var key in options) {
					src = target[key];
					copy = options[key];

					if(src == copy) continue;

					target[key] = copy;
				}
			}
		}

		return target;
	};

	jQuery.extend({
		isFunction: function(obj) {
			return jQuery.type(obj) == 'function';
		},
		type: function(obj) {
			return obj == null ? String(obj) : 
				(typeof obj == 'object' || typeof obj == 'function' ? class2Type[ objToString.call(obj) ] : typeof obj);
		},
		parseHTML: function(data, context) {
			
		}
	});

	rootjQuery = jQuery(document);

	var baseTypes = "Boolean Number String Function Array Date RegExp Object Error".split(" ");

	baseTypes.forEach(function(name) {
		class2Type[ "[object " + name + "]" ] = name.toLowerCase();
	});

	window.$ = window.jQuery = jQuery;
})(window);