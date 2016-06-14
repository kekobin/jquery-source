(function(global) {
	var K = function(selector, context) {
		return new K.prototype.init(selector, context);//要点1-返回K原型上面init构造器的实例(分离作用域)
	};

	K.prototype = {
		constructor: K,
		init: function(selector, context) {
			return this;
		},
		setName: function(name) {
			this.name = name;
		},
		getName: function() {
			return this.name;
		}
	};

	K.prototype.init.prototype = K.prototype;//要点2-用K原型对象覆盖了init构造器的原型对象(这样返回的int
	//实例也能访问所有K的原型方法)

	global.K = K;
})(window, undefined);