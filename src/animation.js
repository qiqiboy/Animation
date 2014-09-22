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
        bindEvent:function(){
            this.events={};
            this.on({
                start:function(){
                    this.playing=true;
                    this.complete=false;
                    this.frameTime=this.now();
                    this.next();
                },
                next:function(){
                    var total=this.duration,
                        now=this.now();
                    this.percent=total?this.easeFunc.call(null,this.timeout=Math.min(total,this.timeout+now-(this.frameTime||0)),0,total,total)/total:1;
                    if(this.timeout<total){
                        cancelFrame(this._timer);
                        this._timer=nextFrame(this.next.bind(this));
                        this.frameTime=now;
                    }else{
                        this.stop().fire('finish');
                        this.timeout=0;
                    }
                },
                stop:function(){
                    this.playing=false;
                    cancelFrame(this._timer);
                },
                finish:function(){
                    this.complete=true;
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
            return new Date().getTime();
        },
        toggle:function(){
            return this.playing?this.stop():this.start();
        },
        finish:function(callback){
            if(typeof callback=='function'){
                return this.on('finish',callback);
            }
            this.frameTime=0;
            return this.next();
        },
        setDuration:function(duration){
            this.duration=parseFloat(duration)||0;
            this.timeout=this.duration*this.percent;
            return this;
        }
    }

    "start next stop".split(" ").forEach(function(prop){
        struct.prototype[prop]=function(callback){
            if(typeof callback=='function'){
                return this.on(prop,callback);
            }
            return this.fire(prop);
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
    this.percent=0
    this.setDuration(duration);
    this.easeFunc=typeof easeFunc=='function'?easeFunc:function(t,b,c,d){return c*t/d+b;};
    this.bindEvent();
});
