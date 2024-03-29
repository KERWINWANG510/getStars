// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        ////主角跳跃高度
        jumpHeight:0,
        //主角跳跃持续时间
        jumpDuration:0,
        //最大移动速度
        maxMoveSpeed:0,
        //加速度
        accel:0,
        //跟踪音效
        jumpAudio:{
            default:null,
            type:cc.AudioClip
        },
        //形变时间
        changeDuration:0
    },

    setJumpAction:function(){
        //跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        //下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        //主角在上升和下降的时候产生形变
        var taller = cc.scaleTo(this.changeDuration,1, 1.2);
        var shorter = cc.scaleTo(this.changeDuration,1, 0.8);
        var reduction = cc.scaleTo(this.changeDuration, 1, 1);

        //添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        //不断重复，每次完成落地动作后，调用回调不播放声音
        return cc.repeatForever(cc.sequence(shorter, taller, jumpUp,reduction, jumpDown, callback));
    },

    playJumpSound:function(){
        //调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    onLoad:function(){
        //初始化跳跃动作
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);

        //加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        //主角当前水平方向速度
        this.xSpeed = 0;

        //初始化键盘输入监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onDestroy(){
        //取消键盘输入监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyDown:function(event){
        //按下键盘
        switch(event.keyCode){
            case cc.macro.KEY.a:
                this.accLeft = true;
                break;
            case cc.macro.KEY.d:
                this.accRight = true;
                break;
        }
    },

    onKeyUp:function(event){
        //放开键盘
        switch(event.keyCode){
            case cc.macro.KEY.a:
                this.accLeft = false;
                break;
            case cc.macro.KEY.d:
                this.accRight = false;
                break;
        }
    },

    start () {

    },

    update (dt) {
        //根据当前加速度方向每帧更新速度
        if(this.accLeft){
            this.xSpeed -= this.accel * dt;
        }else if(this.accRight){
            this.xSpeed += this.accel * dt;
        }
        //限制主角速度不能超过最大值
        if(Math.abs(this.xSpeed) > this.maxMoveSpeed){
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }
        //根据当前速度更新主角位置
        this.node.x += this.xSpeed * dt;
        //主角的位置不能超过canvas的边界
        var gameBorder = cc.game.canvas.width/2;
        if(Math.abs(this.node.x) > gameBorder){
            this.node.x = gameBorder * this.node.x / Math.abs(this.node.x);
        }
    },
});
