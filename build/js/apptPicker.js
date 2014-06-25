var theApptPicker = (function(w,d,c,$){
    var createPicker, makeLists, init, state, defaults, handlePickerBtnClick, handleBaseTimeClick, applyMiddleClasses, 
        handleSecondaryTimeClick, handleSecondaryHover, fixtimingorder, reportChange, registerCallback, wireCallback; 

    state = { 
        count: 0,
        pickers: { }
    }; 

    defaults = { 
        start: '9:00am', 
        end: '5:00pm', 
        subinterval: 60,
        interval: 15, 
        slidedur: 280, 
        opendur: 300, 
        height: '351px', 
        opentext: 'Choose Times', 
        inputid: false, 
        changecallback: false, 
        expandcallback: false, 
        changetxt: true 
    }; 
    
    makeLists = function(times, exact) { 
        exact = (typeof exact == 'undefined') ? false : true; 
        var contains, obj, lim; 
        contains = [ ]; 
        lim = (exact) ? times.length : times.length -1; 
        for(var i=0; i < lim; ++i) {
            var str, attrs = { }; 
            if(exact) { 
                str = timeUtils.formatTimeStr(times[i]); 
                attrs['data-time'] = times[i].getTime(); 
            } else { 
                str = timeUtils.formatTimeStr(times[i], true) + " - " + 
                      timeUtils.formatTimeStr(times[i+1],true); 
                attrs['data-start'] = times[i].getTime(); 
                attrs['data-end'] = times[i+1].getTime();
            }
            attrs['data-listindex'] = i; 
            contains.push({
                type: 'li', 
                attributes: attrs, 
                contains: str
            });
        }
        obj = { 
            type: 'ul', 
            attributes: { class: (exact) ? 'appt-picker second' : 'appt-picker first' }, 
            contains: contains
        }
        return jDom.create(obj); 
    }; 
    
    createPicker = function(el) { 
        var settings, picker, tlarge, tsmall; 
        settings = $.extend({},defaults,$(el).data()); 
        c.log(settings); 
        settings.btn = jDom.create('button.appt-picker-button#pickerBtn_'+state.count+'${' + settings.opentext + '}'); 
        $(settings.btn).on('click',handlePickerBtnClick); 
        el.appendChild(settings.btn); 
        tlarge = timeUtils.getTimes(settings.start,settings.end,settings.subinterval); 
        tsmall = timeUtils.getTimes(settings.start,settings.end,settings.interval);
        tlarge = makeLists(tlarge); 
        tsmall = makeLists(tsmall,true);
        el.appendChild(tlarge); 
        el.appendChild(tsmall); 
        el.setAttribute('data-pickerid','picker_'+state.count); 
        settings.minimizedheight = el.offsetHeight + 'px'; 

        if(settings.inputid != false) { 
            settings.input = d.getElementById(settings.inputid); 
            if(settings.input) { 
                settings.input.setAttribute('data-pickerid', 'picker_'+state.count); 
                settings.input.setAttribute('readonly','true');
                $(settings.input).on('click focus',function(){
                    var id = this.getAttribute('data-pickerid'); 
                    if(state.pickers[id].minimized) { 
                        $(state.pickers[id].settings.btn).trigger('click'); 
                    } 
                }); 
            }
        }

        state.pickers['picker_'+state.count] = { 
            el: el, 
            minimized: true,
            expanded: false, 
            selecting: false, 
            start: false, 
            end: false, 
            startindex: 0,
            endindex: 0, 
            lasthoverindex: -1, 
            settings: settings, 
        }; 
        ++state.count; 
    }; 
    
    handlePickerBtnClick = function() { 
        var id = 'picker_' + this.getAttribute('id').split('pickerBtn_').pop(); 
        if(state.pickers[id].el.offsetHeight < parseFloat(state.pickers[id].settings.height)) { 
            var targetHeight = state.pickers[id].settings.height; 
            state.pickers[id].minimized = false; 
        } else { 
            var targetHeight = state.pickers[id].settings.minimizedheight; 
            state.pickers[id].minimized = true; 
        }
        state.pickers[id].el.style.height = targetHeight; 
    }; 
    
    handleBaseTimeClick = function() { 
        var list, container, secondarylist, start, id, y; 
        list = this.parentNode; 
        container = list.parentNode; 
        secondarylist = container.getElementsByTagName('ul')[1]; 
        id = container.getAttribute('data-pickerid');
        
        start = this.getAttribute('data-start'); 

        $('.appt-picker.first>li').removeClass('active'); 
        $(this).addClass('active');
        if(!state.pickers[id].expanded) {
            state.pickers[id].expanded = true; 
            list.style.width = '40%';  
        }
        
        y = $(container).find('ul.appt-picker>li[data-time="'+start+'"]')[0].offsetTop;
        $(secondarylist).animate({scrollTop: y+"px"}, 300, 'easeInOutExpo', function(){}); 
             
    }; 
    
    applyMiddleClasses = function(list,a,b) { 
        var arr, start, end; 
        arr = list.getElementsByTagName('li'); 
        start = Math.min(a,b); 
        end = Math.max(a,b); 
        if(a-b!=0) { 
            $(arr).removeClass('pick-start pick-middle pick-end'); 
            for(var i=start+1; i < end; ++i) { 
                $(arr[i]).addClass('pick-middle');    
            }    
            $(arr[start]).addClass('pick-start'); 
            $(arr[end]).addClass('pick-end'); 
        }
    }; 
    
    fixtimingorder = function(id) { 
        var small, large, intermediate; 
        if(state.pickers[id].start > state.pickers[id].end) { 
            intermediate = state.pickers[id].start; 
            state.pickers[id].start = state.pickers[id].end; 
            state.pickers[id].end = intermediate; 
        }
    }; 
    
    handleSecondaryTimeClick = function() { 
        var list, container, time, id; 
        list = this.parentNode; 
        container = list.parentNode; 
        id = container.getAttribute('data-pickerid'); 
        time = new Date(parseFloat(this.getAttribute('data-time'))); 
        if(state.pickers[id].selecting == false) { 
            // selecting the first date:  
            state.pickers[id].selecting = true; 
            state.pickers[id].end = false; 
            state.pickers[id].start = time
            state.pickers[id].startindex = this.getAttribute('data-listindex'); 
            $(list).find('li').removeClass('pick-start pick-middle pick-end');
            $(this).addClass('pick-start'); 
            reportChange(id); 
        } else { 
            if(this.getAttribute('data-listindex') != state.pickers[id].startindex) { 
                // selecting the second date: 
                state.pickers[id].selecting = false; 
                state.pickers[id].end = time; 
                state.pickers[id].endindex = this.getAttribute('data-listindex'); 
                $(this).addClass('pick-end'); 
                applyMiddleClasses(list,state.pickers[id].startindex,state.pickers[id].endindex); 
                $(state.pickers[id].settings.btn).click(); 
                if(state.pickers[id].settings.inputid) { 
                    fixtimingorder(id); 
                    var str = timeUtils.formatTimeStr(state.pickers[id].start) + " to " + 
                                timeUtils.formatTimeStr(state.pickers[id].end); 
                    var arr = [ state.pickers[id].start.toISOString(), state.pickers[id].end.toISOString()]; 
                    c.log(arr.join(',')); 
                    d.getElementById(state.pickers[id].settings.inputid).value = str;
                }
            }
            reportChange(id); 
        }
    }; 
    
    handleSecondaryHover = function() { 
        var id, curr, list;
        list = this.parentNode; 
        id = list.parentNode.getAttribute('data-pickerid'); 
        curr = this.getAttribute('data-listindex'); 
        if(state.pickers[id].selecting && state.pickers[id].lasthoverindex != curr) {
            state.pickers[id].lasthoverindex = curr;
            if(state.pickers[id].startindex != curr) { 
                applyMiddleClasses(list,state.pickers[id].startindex,curr); 
            } else { 
                // we are hovering the starting time <li> : 
                $(list.getElementsByTagName('li')).removeClass('pick-middle pick-end');
                $(this).addClass('pick-start'); 
            }
        }
    }; 

    reportChange = function(id) { 
        if(state.pickers[id].settings.changecallback) { 
            state.pickers[id].settings.changecallback(state.pickers[id]); 
        }
        if(state.pickers[id].settings.changetxt) { 
            var str = timeUtils.formatTimeStr(state.pickers[id].start) + " to " + timeUtils.formatTimeStr(state.pickers[id].end); 
            state.pickers[id].settings.btn.innerHTML = str; 
        }
    }; 
    
    wireCallback = function(el,type,func) { 
        var validfunc = false 
        validfunc = (typeof func == 'function') ? true : false; 
        if(typeof window[func] != 'undefined') { 
            if(typeof window[func] == 'function') { 
                validfunc = true;
                func = window[func];  
            }
        }
        if(validfunc) { 
            var id = el.getAttribute('data-pickerid'); 
            if(typeof state.pickers[id] != 'undefined') { 
                switch(type.toLowerCase()) { 
                    case 'expand': 
                        state.pickers[id].settings.expandcallback = func; 
                        break; 
                    case 'change': 
                        state.pickers[id].settings.changecallback = func; 
                        break; 
                }
            }
        }
    }
    
    init = function() { 
        $('.apptPicker').each(function(){createPicker(this)}); 
        $(d).on('click','.appt-picker.first>li',handleBaseTimeClick);
        $(d).on('click','.appt-picker.second>li',handleSecondaryTimeClick); 
        $(d).on('hover focus', '.appt-picker.second>li', handleSecondaryHover); 
    };

    /* Public Methods: */
    w.apptPicker = function(id) { 
        var on, create, getTimes, expand, el, pickerid; 
        el = d.getElementById(id); 
        pickerid = el.getAttribute('data-pickerid'); 
        
        on = function(type,func) {
            if(el) { 
                wireCallback(el,type,func); 
                return apptPicker(id); 
            }
        }; 

        getTimes = function(type,func) { 
            if(typeof state.pickers[pickerid] != 'undefined') { 
                if(!state.pickers[pickerid].start || !state.pickers[pickerid].end) { 
                    return false; 
                } else { 
                    return { 
                        start: state.pickers[pickerid].start, 
                        end: state.pickers[pickerid].end
                    }
                }
            } else { 
                return false; 
            }
        }; 

        create = function(opts) {
            if(el) { 
                for(var key in opts) { 
                    el.setAttribute('data-'+key, opts[key]); 
                }
                c.log(el); 
                if(!pickerid) { 
                    createPicker(el); 
                    return apptPicker(el.getAttribute('id')); 
                } else { 
                    return apptPicker(el.getAttribute('id')); 
                }
            }
        }; 

        toggleOpen = function() { 
            if(typeof pickerid != 'undefined') {
                $(state.pickers[pickerid].settings.btn).click();
                return apptPicker(el.getAttribute('id')); 
            }
        }; 

        return { 
            on: on, 
            getTimes: getTimes, 
            create: create, 
            toggleOpen: toggleOpen
        }
    };

    // go! go! go! 
    $(d).ready(init); 
    
})(window,document,console,jQuery); 