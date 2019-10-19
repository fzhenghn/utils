/*!
 * jquery.date.js v1.4.0
 * By 雾空 https://github.com/weijhfly/jqueryDatePlugin
 * Time:2017/1/24
*/
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
    'use strict';
 
    var d = new Date(),
        doc = window.document,
        nowYear = d.getFullYear(),
        nowMonth = d.getMonth() + 1,
        domDate,
        createDate,
		time,
        body = $('body'),
        emptyStr = "<li></li>",
        isTouch = "ontouchend" in doc,
        tstart = isTouch ? "touchstart" : "mousedown",
        tmove = isTouch ? "touchmove" : "mousemove",
        tend = isTouch ? "touchend" : "mouseup",
        tcancel = isTouch ? "touchcancel" : "mouseleave",
        isEnglish = (navigator.language || navigator.browserLanguage).toLowerCase().indexOf('zh') == -1,
		//基于40px的高度滑动,自适应就改动这或者dpr
		h = 40,
		dpr = $('html').attr('data-dpr') || 1,
		resH = h*dpr,
        //支持的时间格式展示
        dateFormat = [
			['DD']
        ],
		callback_ = null,
    	
        opts = {            
            beginYear: 2010,        
            endYear: 2088, //可不填，结束年份不会小于当前年份           
            type:'YYYY-MM-DD',
            limitTime:false,//限制选择时间 today 今天之前的时间不可选 tomorrow 明天之前的不可选
            location:null //before 跳转至之前选择的时间，如果为空则跳转至当前时间
        };
    //dom渲染
    domDate = '<div id="date-wrapper"><h3>选择日期</h3><div id="d-content"><div id="d-bg"><ol id="d-day"></ol></div></div><a id="d-confirm" href="javascript:">确定</a></div><div id="d-mask"></div>';
    var css = '<style type="text/css">a{text-decoration:none;}ol,li{margin:0;padding:0}li{list-style-type:none}#date-wrapper{position:fixed;top:50%;left:50%;width:400px;height:250px;margin: -125px 0 0 -200px;z-index:56;text-align:center;background:#fff;border-radius:3px;padding-bottom:15px;display:none}#d-mask{position:fixed;width:100%;height:100%;top:0;left:0;background:#000;filter:alpha(Opacity=50);-moz-opacity:.5;opacity:.5;z-index:55;display:none}#date-wrapper h3{line-height:50px;background:#222d32;color:#fff;font-size:20px;margin:0;border-radius:3px 3px 0 0}#date-wrapper ol,#d-tit>div{width:16.6666666%;float:left;position:relative}#d-content{padding:10px}#d-content #d-bg{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:0 0 5px 5px;height:120px;overflow:hidden;margin-bottom:10px;position:relative}#d-cancel,#d-confirm{border-radius:3px;width:230px;height:40px;display:inline-block;line-height:40px;font-size:22px;background:#dcdddd;color:#666;margin:0 5%}#d-confirm{background:#222d32;color:#fff}#date-wrapper li{line-height:40px;height:40px;cursor:pointer;position:relative}#d-tit{background:#f8f8f8;overflow:hidden;border-radius:5px 5px 0 0;line-height:30px;border:1px solid #e0e0e0;margin-bottom:-1px}#date-wrapper ol{-webkit-overflow-scrolling:touch;position:absolute;top:0;left:0}#date-wrapper ol:nth-child(2){left:16.6666666%}#date-wrapper ol:nth-child(3){/*left:33.3333332%*/}#date-wrapper ol:nth-child(4){left:49.9999998%}#date-wrapper ol:nth-child(5){left:66.6666664%}#date-wrapper ol:nth-child(6){left:83.333333%}#d-content #d-bg:after{content:\'\';height:40px;background:#ddd;position:absolute;top:40px;left:0;width:100%;z-index:1}#date-wrapper li span{position:absolute;width:100%;z-index:99;height:100%;left:0;top:0}#date-wrapper.two ol,.two #d-tit>div{width:100%}#date-wrapper.two ol:nth-child(2){left:50%}#date-wrapper.three ol,.three #d-tit>div{width:33.333333%}#date-wrapper.three ol:nth-child(2){left:33.333333%}#date-wrapper.three ol:nth-child(3){left:66.666666%}#date-wrapper.four ol,.four #d-tit>div{width:25%}#date-wrapper.four ol:nth-child(2){left:25%}#date-wrapper.four ol:nth-child(3){left:50%}#date-wrapper.four ol:nth-child(4){left:75%}#date-wrapper.five ol,.five #d-tit>div{width:20%}#date-wrapper.five ol:nth-child(2){left:20%}#date-wrapper.five ol:nth-child(3){left:40%}#date-wrapper.five ol:nth-child(4){left:60%}#date-wrapper.five ol:nth-child(5){left:80%}#date-wrapper.hms #d-hours{left:0;}#date-wrapper.hms #d-minutes{left:33.333333%;}#date-wrapper.hms #d-seconds{left:66.666666%;}#date-wrapper.hm #d-hours{left:0;}#date-wrapper.hm #d-minutes{left:50%;}</style>';
	
	if(isEnglish){
		domDate = domDate.replace('选择日期','DatePicker').replace('取消','cancel').replace('确定','confirm');
		css = css.replace('</style>','#date-wrapper #d-tit{display:none;}</style>');
	}
	if(h != 40){
		css = css.replace('40px',h+'px');
	}
	if(dpr != 1){
		css = css.replace(/(\d+)px/g,function(i){
			return i.replace(/\D/g,'')*dpr + 'px';
		});
	}
    body.append(css).append(domDate);
    createDate = {
		padstr:function(param){
			param = param.toString();
			if(param.length==1){
				return '0'+param;
			}
			return param;
		},
		d:function(end,active){
			var end = end || 10,
				domDay = '';
				
			var arr = [];
			for(var i=end-1;i>=-1;i--){
				console.log(i);
				var date = new Date();
				var index=i*-1;
				var dd = new Date(date.setDate(date.getDate()+index));
				arr.push(dd.getFullYear()+'/'+this.padstr(dd.getMonth()+1)+'/'+this.padstr(dd.getDate()));
			}
			var d_ = new Date();
			if(!active)
				active = d_.getFullYear()+'/'+this.padstr(d_.getMonth()+1)+'/'+this.padstr(d_.getDate());
			
            for (var k = 0; k <= end; k++) {
				if(active && active == arr[k]){
					domDay += '<li class="active"><span>' + arr[k] + '</span></li>';
				}else{
					domDay += '<li><span>' + arr[k] + '</span></li>';
				}
			}
            $('#d-day').html(emptyStr + domDay + emptyStr);
		},
        bissextile:function(year,month){
            var day;
            if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                day = 31
            } else if (month == 4 || month == 6 || month == 11 || month == 9) {
                day = 30
            } else if (month == 2) {
				if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) { //闰年
					day = 29
				} else {
					day = 28
				}

			}
			return day;
        },
        slide:function(el){
            //滑动
            var T,mT,isPress = false,el = $('#date-wrapper ol');
            el.bind(tstart, function(e){
				e.stopPropagation();
                e.preventDefault();
                var e = e.originalEvent;
                T = e.pageY || e.touches[0].pageY;
                if(!isTouch){isPress = true;}
            })
            el.bind(tmove, function(e){
				e.stopPropagation();
                e.preventDefault();
                var e = e.originalEvent,that = $(this);
                if(!isTouch && !isPress){return false};
                mT = e.pageY || e.touches[0].pageY;
                that.css('top', that.position().top + (mT - T) + 'px');
                T = mT;
                if (that.position().top > 0) that.css('top', '0');
                if (that.position().top < -(that.height() - (3*resH))) that.css('top', '-' + (that.height() - (3*resH)) + 'px');
            })
            el.bind(tend, function(e){
				e.stopPropagation();
                e.preventDefault();
                var e = e.originalEvent,that = $(this);
                isPress = false;
                dragEnd(that);
            })
            el.bind(tcancel, function(e){
				e.stopPropagation();
                e.preventDefault();
                var e = e.originalEvent,that = $(this);
                isPress = false;
				// 解决一个pc端莫名触发问题
				if(!isTouch && + new Date() > time + 600){
					dragEnd(that);
				}
            })
            function dragEnd(that){
                //滚动调整
                var t = that.position().top;
                that.css('top',Math.round(t/resH)*resH+'px');
                //定位active
                t = Math.round(Math.abs($(that).position().top));
                var li = that.children('li').get(t/resH+1);
                $(li).addClass('active').siblings().removeClass('active');
            }
        },
        show:function(isShow){
            var domMain = $('#date-wrapper'),
                domMask = $('#d-mask');
            if (isShow) {
                domMain.show();
                domMask.show();
				time = + new Date();
                body.css('overflow','hidden');
            } else {
                domMain.hide();
                domMask.hide();
                body.css('overflow','auto');
            }
        },
        resetActive:function(el){
             var d = new Date(),
				 date = el.data('fullDate');
  
             if(opt.location == 'before' && date){
					createDate.d(opt.date,date);
             }
            if(opt.limitTime == 'tomorrow' && !opt.location){
                d.setDate(d.getDate()+1);
            }
			$('#date-wrapper ol').each(function() {
                var e = $(this),
                eId = e.attr('id');
                e.children('li').each(function() {
                    var li = $(this),liText = Number(li.text() == ''? 'false':li.text());
                    if (eId == 'd-day' && liText === d.getDate()) {
                        li.addClass('active').siblings().removeClass('active');
                        return false;
                    }
                })
            })
        },
        toNow:function(refresh){
            if (!refresh) {
                $('#date-wrapper ol').each(function(){
                    var that = $(this);
                    var liTop = -(that.children('.active').position().top -resH);
                    that.animate({
                        top: liTop
                    },
                    0);
                })
            } else {
                $('#date-wrapper ol').each(function() {
                    $(this).animate({
                        top: 0
                    },
                    0);
                })
            }
        },
        clear:function(){
            createDate.toNow(true);
            createDate.show(false);
        }
    }
    createDate.slide();
	
    var opt,
        userOption,
		el = $('#date-wrapper'),
		elTit = $('#d-tit'),
		elBg = $('#d-bg'),
		prevY = '';
		
	$.initDateTool = function(obj,callback){
        var that = $(obj);
		if(that.get(0).tagName == 'INPUT'){that.blur();}
			userOption = that.data('options');
			if(typeof(userOption) == 'string'){userOption = JSON.parse(userOption.replace(/'/g,'"'));}
            if (!el.is(':visible')) {
				opt = null;
				opt = $.extend({},opts,userOption || {});
				createDate.d(opt.date);
				elBg.children().show();
				el.attr('class','two hm');
                createDate.resetActive(that);
                createDate.show(true);
                createDate.toNow(false);
                $('#d-confirm').attr('d-id', obj);
				callback_ = callback;
            }
	}
    function DateTool(obj){
        var that = $(obj);
        that.bind('click',function() {
			if(that.get(0).tagName == 'INPUT'){that.blur();}
			userOption = that.data('options');
			if(typeof(userOption) == 'string'){userOption = JSON.parse(userOption.replace(/'/g,'"'));}
            if (!el.is(':visible')) {
				opt = null;
				opt = $.extend({},opts,userOption || {});
				createDate.d(opt.date);
				elBg.children().show();
				el.attr('class','two hm');
                createDate.resetActive(that);
                createDate.show(true);
                createDate.toNow(false);
                $('#d-confirm').attr('d-id', obj);
            }
        });
    }
    $.date = function(obj){
		DateTool(obj);
	}
    //取消
    $('#d-cancel').bind('click',function(){
        createDate.clear();
    })
    //确定
    $('#d-confirm').bind('click',function(){
        var d = $('#d-day .active').text(),
			str,
			that = $($(this).attr('d-id')),
			
		str = d;
        //赋值
        if(that.get(0).tagName == 'INPUT'){
            that.val(str);
        }else{
            that.text(str);
        }
		
		if(opt.location){
			that.data('fullDate',d);
		}
        createDate.show(false);
        createDate.toNow(true);
		if(typeof callback_ == 'function'){
			callback_(d);
		}
    })
}))