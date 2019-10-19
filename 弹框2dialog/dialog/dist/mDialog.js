const Dialog = (function(win,doc){
    window.addEventListener('load',function(){document.body.addEventListener('touchstart',function(){},false); },false);
	let dltime = '';
	let stratTime = '';
    class DialogFn{
        constructor(obj) {
            this.timer = null;
            this.set = {};
        }
        extend (n,n1){ 
            for(let i in n1){n[i] = n1[i]};
        }
		countDown() {
			if(dltime=='' || dltime <= 0) return;
			setTimeout(()=>{
				let catt = document.getElementById('c_alert_title_time');
				if(!catt) return;
				catt.innerText=dltime;
				clearInterval(stratTime);
				stratTime = setInterval(()=>{
					dltime -= 1;
					catt.innerText=dltime;
					if(dltime<=1) clearInterval(stratTime);
				},1000);
			},10);
		}
		monitor(){
			let cac = document.getElementById('c_alert_con').getElementsByTagName('input')[0];
			if(!cac) return;
			cac.onkeyup = function () {
				var inputValue = cac.value;
				if (!inputValue) {
					inputValue = '0.00'
				}
				inputValue = (parseFloat(inputValue.replace('.', '')) / 100).toFixed(2)
				cac.value = inputValue;
			}
		}
        init(a,b,c){
            if(b && typeof b === 'object') this.extend(this.set,b);
            let _dialog = document.createElement('div'),
            item = document.createElement('div'),
            t = this,set = t.set;
            _dialog.classList.add('c_alert_dialog');
            if(set.index) _dialog.dataset.index = set.index
            item.classList.add('c_alert_wrap');
            item.innerHTML = `<div id='c_alert_con' class="c_alert_con" style="${set.style}">${a}</div>`;
            set.addClass && item.classList.add(set.addClass)
            if(set.title) {
                item.classList.add('c_alert_width');
                item.insertAdjacentHTML("afterbegin", `<div class="c_alert_title">${b.title}<span id='c_alert_title_time' style='float: right;font-size: 20px;position: absolute;right: 20px;'>`+dltime+`</span></div>`);
            }
            if(set.button) {
                item.classList.add('c_alert_width');
                let _btn = ''
                for(let i in set.button){
                    _btn+=`<a href="javascript:;" data-name="${i}">${i}</a>`
                };
                item.insertAdjacentHTML("beforeend", `<div class="c_alert_btn">${_btn}</div>`);
                let btnArr = item.querySelectorAll('.c_alert_btn a');
                ;[].forEach.call(btnArr,o =>{
                    //o.style.width = 100 / btnArr.length + '%'
                    o.onclick = function(e){
                        e.preventDefault();
                        set.button[o.dataset.name].call(item,t);
                    }
                })
            }; 
            if(set.time) 
				dltime = set.time/1000;
            if(set.time) 
                t.timer = setTimeout(()=>{_D_obj.close(item,set.after)},set.time+300);
            if(b && typeof b !== 'object') 
                t.timer = setTimeout(()=>{_D_obj.close(item,set.after)},b+300)
            set.before && set.before.call(item);
            if(set.mask===undefined || set.mask){
                _dialog.insertAdjacentHTML("beforeend","<div class='c_alert_mask'  ontouchmove='return false'></div>");
            };
            _dialog.appendChild(item);
            document.body.appendChild(_dialog)
            if(set.mask=== undefined || set.mask){
                _dialog.querySelector('.c_alert_mask').onclick =(e)=>{
                    e.preventDefault();
                    if(set.maskClick || set.maskClick===undefined) _D_obj.close(item,set.after) ;
                };
            };
            set.onload && set.onload.call(item)
            setTimeout(()=>{_dialog.classList.add('dialog_open')},50)
			this.countDown();
			this.monitor();
			
        }
    };
    window._D_obj = {
        init : function(a,b,c){
			clearInterval(stratTime);
			dltime = "";
            new DialogFn().init(a,b,c);
        },
        close : function(index,fn) {
			clearInterval(stratTime);
            let _dialog = document.querySelectorAll('.c_alert_dialog');
            ;[].forEach.call(_dialog,o =>{
                if(o.dataset.index == index || o === index.parentNode){
                    o.classList.remove('dialog_open')
                    o.classList.add('dialog_close');
                    fn && fn.call(o.querySelector('.c_alert_wrap'),index)
                    o.querySelector('.c_alert_wrap').addEventListener('animationend', function(){
                        o.remove();
                    });
                }
            })
        }
    };
    return _D_obj;
})(window,document);