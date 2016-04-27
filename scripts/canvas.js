 var fun={
	init:function(callback){
		var data = $(this).data('eraser');
		if(!data){
			var $canvas=$("<canvas/>"),		//创建画布ID
				canvas=$canvas.get(0),
				ctx = canvas.getContext("2d"),		//画布类型
				cWidth=180,		//画布宽度
				cHeight=45,	//画布高度
				pos = $(this).offset(),		//相对偏移量
				size=30,		//画笔大小
				completeRatio=0.7,		//完成度
				parts = [],
				colParts = Math.floor( cWidth / size ),
				numParts = colParts * Math.floor( cHeight / size ),
				n = numParts,
				that = $(this)[0];
			$(this).after( $canvas );
			canvas.id = that.id;
			canvas.width = cWidth;
			canvas.height = cHeight;
			//创建画布
			ctx.beginPath();
			ctx.fillStyle = '#cacaca';
			ctx.drawImage(that, 0, 0, cWidth, cHeight);
			$(this).remove();
		    //画笔
		    ctx.globalCompositeOperation = "destination-out";
			ctx.strokeStyle = 'rgba(255,0,0,255)';
			ctx.lineWidth = size;
			ctx.lineCap = "round";
		    //绑定touch动作
		    $canvas.on('touchstart', fun.touchStart);
			$canvas.on('touchmove', fun.touchMove);
			$canvas.on('touchend', fun.touchEnd);
			//配置项
			while( n-- ) parts.push(1);
			data = {
				posX:pos.left,
				posY:pos.top,
				touchDown: false,
				touchID:-999,
				touchX: 0,
				touchY: 0,
				ptouchX: 0,
				ptouchY: 0,
				canvas: $canvas,
				ctx: ctx,
				w:cWidth,
				h:cHeight,
				source: that,
				size: size,
				parts: parts,
				colParts: colParts,
				numParts: numParts,
				ratio: 0,
				complete: false,
				completeRatio: completeRatio,
				completeCall:callback
			};
			$canvas.data('eraser', data);
		}else{
			data.completeCall=callback;
		}
	},
	//开始touch，改变状态，获取当前手指相对于画布的位置
	touchStart:function(event) {
		var data = $(this).data('eraser');
		if ( !data.touchDown ) {
			var t = event.originalEvent.changedTouches[0],
				tx = t.pageX - data.posX,
				ty = t.pageY - data.posY;
			//fun.evaluatePoint( data, tx, ty );
			data.touchDown = true;
			data.touchID = t.identifier;
			data.touchX = tx;
			data.touchY = ty;
			event.preventDefault();
		}
	},
	//滑动touch，进行画笔涂抹
	touchMove:function(event){
		var data = $(this).data('eraser');
		if ( data.touchDown ) {
			var ta = event.originalEvent.changedTouches,
				n = ta.length;
			while( n-- )
				if ( ta[n].identifier == data.touchID ) {
					var tx = ta[n].pageX - data.posX,
						ty = ta[n].pageY - data.posY;
					fun.evaluatePoint( data, tx, ty );		//进行擦除率判断
					data.ctx.beginPath();
					data.ctx.moveTo( data.touchX, data.touchY );
					data.touchX = tx;
					data.touchY = ty;
					data.ctx.lineTo( data.touchX, data.touchY );
					data.ctx.stroke();
					event.preventDefault();
					break;
				}
		}
	},
	//touch完毕，改变状态
	touchEnd:function(event){
		var data = $(this).data('eraser');
		if ( data.touchDown ) {
			var ta = event.originalEvent.changedTouches,
				n = ta.length;
			while( n-- )
				if ( ta[n].identifier == data.touchID ) {
					data.touchDown = false;
					event.preventDefault();
					break;
				}
		}
	},
	//计算擦除率
	evaluatePoint:function(data,tx,ty){
		var p = Math.floor(tx/data.size) + Math.floor( ty / data.size ) * data.colParts;
		if ( p >= 0 && p < data.numParts ) {
			data.ratio += data.parts[p];
			data.parts[p] = 0;
			if (!data.complete) {
				if ( data.ratio/data.numParts >= data.completeRatio ) {
					data.complete = true;
					fun.clear(data);
					if(data.completeCall!= null){
						data.completeCall();
					} 
				}
			}
		}
	},
	//清除整个画布
	clear:function(data){
		data.ctx.clearRect( 0, 0, data.w, data.h );
		var n = data.numParts;
		while( n-- ) data.parts[n] = 0;
		data.ratio = data.numParts;
		data.complete = true;
	},
	//刷新
	reset:function(){
		var data = $(this).data('eraser');
		if(data)
		{
			data.ctx.globalCompositeOperation = "source-over";
			data.ctx.drawImage( data.source, 0, 0 );
			data.ctx.globalCompositeOperation = "destination-out";
			var n = data.numParts;
			while( n-- ) data.parts[n] = 1;
			data.ratio = 0;
			data.complete = false;
		}
	}
}
$.fn.lotteryS=function(callback){
	if (fun[callback]){
		return fun[callback].apply( this, Array.prototype.slice.call( arguments, 1 ));
	}else if( typeof callback === 'function' || ! callback){
		return fun.init.apply( this, arguments );
	}
};
