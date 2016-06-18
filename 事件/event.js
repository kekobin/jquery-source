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