/**
利用事件传播（这里是冒泡）这个机制，就可以实现事件委托。
具体来说，事件委托就是事件目标自身不处理事件，而是把处
理任务委托给其父元素或者祖先元素，甚至根元素（document）.
这是一种优化事件处理的思想。

要点:
1.对每一个元素添加事件会极大增加内存损耗.
2.bind()方法是直接调用,没有使用事件委托.
3.live()方法是将事件代理到document上面(性能不好,速度慢).
  例如: $('a').live('click', function() {});
  任何时候只要有事件冒泡到document节点上，它就查看该事件是否是一个click事件，
  以及该事件的目标元素与’a’这一CSS选择器是否匹配，如果都是的话，则执行函数。
4.delegate()方法是将事件代理到指定元素上.
5.上面方法的内部实现都是对on()方法的实现.

所以,当出现如下情况时，应该使用事件委托:
	为DOM中的很多元素绑定相同事件；
	为DOM中尚不存在的元素绑定事件；
**/

//1.click事件
// jQuery.each( ("blur focus focusin focusout load resize scroll unload 
// click dblclick " +
//     "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
//     "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

//     // Handle event binding
//     jQuery.fn[ name ] = function( data, fn ) {
//         return arguments.length > 0 ?
//             this.on( name, null, data, fn ) :
//             this.trigger( name );
//     };
// });
(function(window, undefined) {
	var idReg = /^\#(\w+)$/,
		classReg = /^\.(\w+)$/,
		arrSlice = Array.prototype.slice,
		objToString = Object.prototype.toString;

	var jQuery = function(selector, context) {
		return new jQuery.fn.init(selector, context);
	};

	jQuery.random_uid = 'jQueryRandom' + Date.now();

	jQuery.fn = jQuery.prototype = {
		constructor: jQuery,
		init: function(selector, context) {
			var elem, i;

			if(!selector) return;

			if(idReg.test(selector)) {
				elem = document.getElementById(RegExp.$1);
				
				this[0] = elem;				
				this.context = document;
				this.length = 1;
				this.selector = selector;

				return this;
			} else if(classReg.test(selector)) {
				elem = document.getElementsByClassName(RegExp.$1);

				this.length = elem.length;

				i = -1;
				while(++i < elem.length)				 {
					this[i] = elem[i];
				}

				this.context = context;
				this.selector = selector;
				return this;
			}

			return this;
		}
	};

	jQuery.prototype.init.prototype = jQuery.fn = jQuery.prototype;

	jQuery.extend = jQuery.fn.extend = function() {
		var option,
			target = arguments[0] || {},
			length = arguments.length, i = 1;

		//注意这里的小技巧
		if(length == i) {
			target = this;
			--i;
		}

		for(;i < length; i++) {
			option = arguments[i];

			for(var key in option) {
				target[key] = option[key];
			}
		}

		return target;
	};

	jQuery.extend({
		each: function(obj, callback, args) {
			var i=0, length = obj.length,
				isArray = isArrayLike(obj);

			if(typeof obj == 'string') return;

			//特别对于遍历类数组的对象时,一定是通过数组的形式遍历,
			//否则会得到很多不想要的结果
			if(isArray) {
				for(;i<length; i++) {
					callback.call(obj[i], i, args);
				}
			} else {
				for(i in obj) {
					callback.call(obj[i], i, args);
				}
			}

			return obj;
		}
	});

	jQuery.fn.extend({
		on: function(type, fn) {
			this.each(function() {
				jQuery.event.add(this, type, fn);
			});
		},
		each: function(fn) {
			jQuery.each(this, fn, arguments);
		}
	});

	function Data() {
		this.cache = {};
	}

	Data.uid = 1;

	Data.prototype = {
		constructor: Data,
		key: function(elem) {
			var unlock = elem[jQuery.random_uid],
				descriptor = {};

			if(!unlock) {
				unlock = Data.uid++;

				descriptor[jQuery.random_uid] = unlock;
				jQuery.extend(elem, descriptor);
			}

			if(!this.cache[unlock]) {
				this.cache[unlock] = {};
			}

			return unlock;
		},
		get: function(elem, key) {
			var cache = this.cache[this.key(elem)];

			return key == undefined ? cache : cache[key];
		}
	};

	var data_priv = new Data();

	jQuery.event = {
		add: function(elem, types, handle) {
			//jquery将事件的绑定与处理分离的好处是:
			//1.对于某一类型事件只会绑定一次，减少多次绑定消耗资源
			//2.将分离出的事件处理器放到一个队列中，便于管理和销毁
			//这里events和handle对于某一个elem来说，是唯一的，如：
			//Cache = {
			// 	1: {
			// 		events: {
			// 			click: [handleObj],
			// 			mouseover: [handleObj]
			// 		},
			// 		handle: function(){} -->唯一用处就是触发调用dispatch分发事件
			// 	}
			// }

			var elemData = data_priv.get(elem),
				events, eventHandle, t, type, handlers,
				types = types.match(/\S+/g);//可以同时添加多个事件

			if(!(events = elemData.events)) {
				events = elemData.events = {};
			}

			if(!(eventHandle = elemData.handle)) {
				eventHandle = elemData.handle = function(e) {
					return jQuery.event.dispatch(eventHandle.elem, e);
				};
				eventHandle.elem = elem;//这么做是因为下面为了解决IE内存泄漏问题而将传进来的elem置为null
			}

			t = types.length;

			while(t--) {
				type = types[t];

				if(!(handlers = events[type])) {
					handlers = events[type] = [];

					if(elem.addEventListener) {
						elem.addEventListener(type, eventHandle, false);
					}
				}

				handlers.push({
					type: type,
					handle: handle
				});
			}

			elem = null;//解决IE内存泄漏问题
		},
		dispatch: function(elem, event) {
			var elemData = data_priv.get(elem),
				events = elemData.events[event.type],
				t = events.length;

			//这里只需要从每个事件队列中拿出对应的handle进行处理即可
			while(t--) {
				events[t].handle.call(elem, event);
			}
		}
	}

	//统一在jQuery.fn上面添加事件
	"click mouseenter mouseleave dblclick".split(" ").forEach(function(eventName) {
		jQuery.fn[eventName] = function(fn) {
			// return arguments.length > 0 ? jQuery.fn.on(eventName, fn)
			// 	: jQuery.fn.trigger(eventName);
			//上面这种方式调用on和trigger，那么里面的this就都是jQuery.fn
			//记住一点:想知道this指向谁,就看谁调用的它所在的函数
			//下面的this也是如此，如$('#demo').click()-->$('#demo')调用的click,所以this->$('#demo')

			return arguments.length > 0 ? this.on(eventName, fn)
				: this.trigger(eventName);
		}
	});

	function isArrayLike(obj) {
		var length = obj.length;

		return objToString.call(obj) == '[object Array]' || length && length > 0 && (length - 1) in obj; 
	}

	window.jQuery = window.$ = jQuery;
})(window);