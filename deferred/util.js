(function() {
	var Util = {},
		slice = Array.prototype.slice,
		toString = Object.prototype.toString,
		whitespaceReg = /\S+/g;

	Util.Callbacks = function(options) {
		var list = [],
			opts = options && options.match(whitespaceReg) || [],
			self;

		self = {
			add: function() {
				if(list) {
					(function add(funcs) {
						slice.call(funcs).forEach(function(func, i) {
							if(toString.call(func) == "[object Function]") {
								list.push(func);
							} else if(toString.call(func) == "[object Array]" && func.length > 0) {
								add(func);
							}
						});
					})(arguments);	
				}
				
				return this;//done().fail()等链式的关键(哪个对象指向add，返回的就是哪个对象)
			},
			fire: function() {
				if(list && list.length > 0) {
					(function(self, args) {
						list.forEach(function(func, i) {
							func.apply(args[0], args[1]);//argus[0]->context
						});
					})(this, arguments);
				}

				if(opt[0] == "once") {
					self.disable();
				}
			},
			disable: function() {
				list = undefined;
			}
		};

		return self;
	}

	Util.Deferred = function() {
		var tuples = [
			["resolve", "done", Util.Callbacks('once')],
			["reject", "fail", Util.Callbacks('once')],
			["notify", "progress", Util.Callbacks()]
		],
		deferred = {};

		tuples.forEach(function(tuple, i) {
			var cb = tuple[2];

			deferred[ tuple[1] ] = cb.add;

			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + 'With'](this, arguments);

				return this;
			};

			deferred[ tuple[0] + 'With'] = cb.fire;
		});

		return deferred;
	};

	window.Util = Util;
})(window);