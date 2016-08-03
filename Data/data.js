(function(global) {
	var Util = {},
		data_user;

	function Data() {
		Object.defineProperty( this.cache = {}, 0, {
			get: function() {
				return {};
			}
		});

		this.randomVal = 'Data_Object_' + Math.random();
	}

	Data.uid = 1;

	Data.prototype = {
		constructor: Data,
		set: function(elem, key, value) {
			var cache = this.cache[ this.key(elem) ];

			cache[key] = value;
		},
		get: function(elem, key) {
			var cache = this.cache[ elem[this.randomVal] ];

			return key === undefined ? 
				cache : cache[key];
		},
		key: function(elem) {
			var unlock = elem[ this.randomVal ];

			if(!unlock) {
				unlock = Data.uid++;

				elem[ this.randomVal ] = unlock;

				if(!this.cache[ unlock ])
					this.cache[ unlock ] = {};
			}

			return unlock;
		}
	}

	data_user = new Data();

	Util.data = function(key, value) {
		if(!key) {

		}

		if(!value) {
			return data_user.get(this, key);
		}

		data_user.set(this, key, value);
	};


	window.Util = Util;
})(window);