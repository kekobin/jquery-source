(function() {
	var Util = {},
		slice = Array.prototype.slice,
		toString = Object.prototype.toString,
		whitespaceReg = /\S+/g;

	Util.Callbacks = function(options) {
		var list = [],
			opts = options && handleOpts(options) || {},
			self,
			memory,
			fire = function(data) {
				memory = opts.memory && data;

				if(list && list.length > 0) {
					list.forEach(function(func, i) {
						func.apply(data[0], data[1]);//data[0]->context
					});
				}

				if(list) {
					if(memory) {
						list = [];
					} else {
						self.disable();
					}
				}
			};

		function handleOpts(opts) {
			var result = {};
			opts = opts.match(whitespaceReg);

			opts.forEach(function(key) {
				result[key] = true;
			});

			return result;
		}

		self = {
			add: function() {
				if(list) {
					(function add(funcs) {
						slice.call(funcs).forEach(function(func, i) {
							if(toString.call(func) == "[object Function]") {
								list.push(func);
							} else if(func && func.length && toString.call(func) != "[object String]") {//这里是数组，也可能是伪数组
								add(func);
							}
						});
					})(arguments);	

					if(memory) {
						fire(memory);
					}
				}

				return this;//done().fail()等链式的关键(哪个对象指向add，返回的就是哪个对象)
			},
			fireWith: function(context, args) {
				if(list) {
					args = args || [];
					args = [context, args.slice ? args.slice() : args];

					fire(args);
				}

				return this;
			},
			disable: function() {
				list = undefined;
				return this;
			}
		};

		return self;
	}

	Util.Deferred = function() {
		var tuples = [
			["resolve", "done", Util.Callbacks('once memory')],
			["reject", "fail", Util.Callbacks('once memory')],
			["notify", "progress", Util.Callbacks()]
		],
		deferred = {},
		promise = {
			promise: function() {
				return promise;
			},
			always: function() {
				deferred.done(arguments).fail(arguments);

				return this;
			},
			then: function() {
				deferred.done(arguments[0]).fail(arguments[1]).progress(arguments[2]);

				return this;
			}
		};

		tuples.forEach(function(tuple, i) {
			var cb = tuple[2];

			//promise['done' | 'fail' | 'progress']
			promise[ tuple[1] ] = cb.add;

			//deferred['resolve' | 'reject' | 'notify']
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + 'With'](this, arguments);

				return this;
			};

			deferred[ tuple[0] + 'With'] = cb.fireWith;
		});

		extend(deferred, promise);

		return deferred;
	};

	Util.when = function() {
		var resolveValues = slice.call(arguments),
			length = resolveValues.length, deferred,
			resolveContexts,
			remaining = length != 1 ? length : 0,
			updateRemaining = function(i, context, values) {
				return function(value) {
					context[i] = this;
					values[i] = arguments.length > 1 ? slice.call(arguments) : value;
 					if( !(--remaining)) { //减数器
						deferred.resolveWith(context, values);
					}
				};
			};

		deferred = length == 1 ? resolveValues[0] : Util.Deferred();

		if(length > 1) {
			resolveContexts = new Array(length);
			for(var i=0;i < length; i++) {
				resolveValues[i].promise()
					.done( updateRemaining(i, resolveContexts, resolveValues))
					.fail( deferred.reject );
			}
		}

		if(!length) {
			deferred.resolveWith(resolveContexts, resolveValues);
		}

		return deferred.promise();
	};

	function extend() {
		var target = arguments[0] || {},
			slice = Array.prototype.slice,
			options;

		if(!arguments) return;

		options = slice.call(arguments).slice(1);

		for(var i = 0, len = options.length; i < len; i++) {
			var obj = options[i];

			for(var key in obj) {
				var value = obj[key];
				target[key] = value;
			}	
		}
		

		return target;
	}

	window.Util = Util;
})(window);