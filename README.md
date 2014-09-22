Animation
=========

javascript简易动画组件

## 如何使用
```javascript
// 首先在页面中引入animation.js
// @param duration 动画时长
// @param easingFunction tween缓动公式
						 参见：https://github.com/zhangxinxu/Tween/blob/master/tween.js
var ani=new Animation(duration, easingFunction);
ani.start(callback); // 绑定动画开始事件
ani.stop(callback); // 绑定动画停止事件
ani.next(callback); // 绑定动画帧更新事件
ani.finish(callback); // 绑定动画结束事件

// 以上四个方法如果不带参数，则为分别触发相应的事件
ani.start(); //开始执行动画
ani.stop(); //停止执行动画

````
