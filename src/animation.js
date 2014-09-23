/*
 * Animation
 * @author qiqiboy
 * @github https://github.com/qiqiboy/animation
 */
(function(ROOT, struct, undefined){
    "use strict";
	
    var nextFrame=ROOT.requestAnimationFrame            ||
                ROOT.webkitRequestAnimationFrame        ||
                ROOT.mozRequestAnimationFrame           ||
                ROOT.msRequestAnimationFrame            ||
                function(callback){
                    return setTimeout(callback,30);
                },
        cancelFrame=ROOT.cancelAnimationFrame           ||
                ROOT.webkitCancelAnimationFrame         ||
                ROOT.webkitCancelRequestAnimationFrame  ||
                ROOT.mozCancelRequestAnimationFrame     ||
                ROOT.msCancelRequestAnimationFrame      ||
                clearTimeout;

    if(typeof Function.prototype.bind!='function'){
        Function.prototype.bind=function(obj){
            var self=this;
            return function(){
                return self.apply(obj,arguments)
            }
        }
    }

    if(typeof Array.prototype.forEach!='function'){
         Array.prototype.forEach=function(iterate){
            var i=0,len=this.length,item;
            for(;i<len;i++){
                item=this[i];
                if(typeof item!='undefined'){
                    iterate(item,i,this);
                }
            }
         }
    }
    
    struct.prototype={
        constructor:struct,
        playing:false,
        complete:false,
        percent:0,
        bindEvent:function(){
            this.events={};
            this.on({
                finish:function(){
                    this.complete=true;
                    this.timeout=0;
                }
            });
        },
        on:function(ev,callback){
            if(typeof ev=='object'){
                for(var e in ev){
                    this.on(e,ev[e]);
                }
            }else{
                if(!this.events[ev]){
                    this.events[ev]=[];
                }
                this.events[ev].push(callback);
            }
            return this;
        },
        fire:function(ev){
            var args=[].slice.call(arguments,1);
            (this.events[ev]||[]).forEach(function(callback){
                if(typeof callback == 'function'){
                    callback.apply(this,args);
                }
            }.bind(this));
            return this;
        },
        now:Date.now||function(){
            return +new Date;
        },
        toggle:function(){
            return this.playing?this.stop():this.start();
        },
        _start:function(){
            if(!this.playing){
                this.playing=true;
                this.complete=false;
                this.frameTime=this.now();
                this.fire('start').next();
            }
            return this;
        },
        _next:function(){
            var total=this.duration,
                now=this.now();
            this.percent=total?this.easeFunc.call(null,this.timeout=Math.min(total,this.timeout+now-(this.frameTime||0)),0,total,total)/total:1;
            this.fire('next');
            if(this.timeout<total){
                cancelFrame(this._timer);
                this._timer=nextFrame(this.next.bind(this));
                this.frameTime=now;
            }else{
                setTimeout(function(){
                    this.stop().fire('finish');
                }.bind(this),0);
            }
            return this;
        },
        _stop:function(){
            if(this.playing){
                this.playing=false;
                cancelFrame(this._timer);
                this.fire('stop');
            }
            return this;
        },
        _finish:function(){
            if(!this.complete){   
                this.frameTime=0;
                this.next();
            }
            return this;
        },
        setDuration:function(duration){
            this.duration=parseFloat(duration)||0;
            this.timeout=this.duration*this.percent;
            return this;
        },
        setTween:function(tween){
            this.easeFunc=typeof tween=='function'?tween:function(t,b,c,d){return c*t/d+b;};
            return this;
        }
    }

    "start next stop finish".split(" ").forEach(function(prop){
        struct.prototype[prop]=function(callback){
            if(typeof callback=='function'){
                return this.on(prop,callback);
            }
            return this['_'+prop]();
        }
    });

    ROOT.Animation=struct;
	
})(window, function(duration,easeFunc){
    /*
     * 动画类
     * @param int(ms) duration 动画执行时间
     * @param Function easeFunc 缓动公式 eg:linear=function(t,b,c,d){return c*t/d+b;}
     *                          其它公式参见 https://github.com/zhangxinxu/Tween/blob/master/tween.js
     */
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(duration,easeFunc);
    }
    this.setDuration(duration).setTween(easeFunc).bindEvent();
});
