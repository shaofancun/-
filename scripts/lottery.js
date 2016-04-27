"use srtict";
var wWidth=window.innerWidth-30;
$(function(){
	if($(".pay_box").length>0){
		//orderState();
	}
})
//替换alert
window.alert = nAlert;
function nAlert(msg,callBack){
    var box=$(".alert_box");
    var str='<div class="alert_box"><span class="alert_msg">'+msg+'</span></div>';
    if(box) box.remove();
    $("body").append(str);
    setTimeout(function(){
        $(".alert_box").animate({opacity : 0},500,function(){
            $(".alert_box").remove();
            if(callBack) callBack();
        })
    },1000)
}
//ajax配置
$.ajaxSetup({
    dataType: 'json',
    type: 'post',
	beforeSend : function() {
		loading.show();
	},
	complete : function() {
		loading.hide();
	}
});
//loading
var loading={
    dom: '<div class="loadingbox"><div class="loadecenter"><div class="loadrgb"><div class="loader"></div><p>正在加载，请稍等...</p></div></div></div>',
	show:function(){
		$('body').append(loading.dom);
	},
	hide:function(){
		$('.loadingbox').remove();
	}
}
//判断订单状态
function orderState(){
	$.post("http://192.168.1.250/zzb_wap/testApi/success.php").done(function(data){
		if(data.Success){
			window.location.href="success.html";
		}else{
			alert("订单未支付");
		}
	})
}
//提交支付
function pay(){
	var from=$("form"),		//获取表单
		money=$("#money").val();		//获取金额
	if(!money){
		nAlert("请输入支付金额");
		return false;
	}
	from.submit();
}
var userId=$("#userId").val();		//获取用户ID
/*
 *	刮刮卡相关方法
 * 	
 * */
var lottery={
	box:$(".lottery_box"),		//刮刮卡盒子
	getBefore:$(".get_before"),		//获取前
	getAfter:$("#getAfter"),		//获取后
	surplusNum:$(".info span").eq(0),
	winNum:$(".info span").eq(1),
	//获取刮刮卡
	get:function(e){
		var _this=this;
		$.ajax({
			url:"http://192.168.1.250/zzb_wap/testApi/success.php",
			data:{
				userId:this.userId
			}
		}).done(function(data){
			if(data.Success){
				_this.surplusNum.text(data.SurplusNum);
				$(e).animate({opacity : 0},200,function(){
						_this.getBefore.hide();
						$("#canvas").lotteryS(function(){
							console.log(data);
							if(data.WinState==1){
								nAlert("恭喜中奖了");
								_this.winNum.text(data.WinNum);
							}else{
								nAlert("很遗憾没有中奖");
							}
						});
						_this.getAfter.find("span").text(data.Prize);
						_this.getAfter.animate({opacity:1,zIndex:1},200);
			    });
			}else{
				nAlert("获取失败，点击重新获取");
			}
		}).fail(function(){
			nAlert("网络错误,确认网络是否已连接");
		})
	},
	//再刮一次
	getAgain:function(){
		this.getBefore.find("div").css("opacity",1);
		this.getBefore.show();
		this.getAfter.css({"opacity":0,"z-index":-1});
		$("#canvas").lotteryS('reset');
	}
}
//地址框相关
var adrsBox=$(".adrs_box");
$("#showAdrs").click(function(){
	adrsBox.show();
})
$("#close").click(function(){
	adrsBox.hide();
})
function save(){
	var realname=$("#realname").val(),
		phone=$("#phone").val(),
		address=$("#address").val(),
		remarks=$("#remarks").val();
	if(!realname){
		nAlert("请输入真实姓名");
		return false;
	}else if(!phone.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/)){
		nAlert("请输入正确的手机号码");
		return false;
	}else if(!address){
		nAlert("请输入收货地址");
		return false;
	}
	$.ajax({
		url:"http://192.168.1.250/zzb_wap/testApi/success.php",
		data:{
			userId:userId,
			realname:realname,
			phone:phone,
			address:address,
			remarks:remarks
		}
	}).done(function(data){
		if(data.Success){
			nAlert("保存成功",function(){
				adrsBox.hide();
			})
		}
	})
}
