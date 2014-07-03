var JGBinder = (function(w,d,c,$){
  var extend = function() {
    for(var i=1; i<arguments.length; i++)
      for(var key in arguments[i])
        if(arguments[i].hasOwnProperty(key))
          arguments[0][key] = arguments[i][key];
    return arguments[0];
  }

  // some state-tracking mechanisms: 
  var state = { 
    queue:              [ ], 
    processingQueue:    false, 
    domCollected:       false, 
    objects:            { }, 
    originalObjects:    { }, 
    boundelems:         { },
    changeHandlers:     { }, 
    handlers:      { }
  }

    // switch(type) { 
    //   case '': 

    //     break; 
    //   case '': 

    //     break; 
    //   default: 
    //     break;
    // }
  var interpretHandler = function(elem,type) { 
    var classStr = elem.getAttribute(type).split(','); 
    for(var j = 0; j < classStr.length; ++j) { 
      var handlename, objname, classobjkey, thisarr = classStr[j].split(':'); 
      handlename = thisarr.shift(); 
      thisarr = thisarr[0].split('.'); 
      objname = thisarr.shift(); 
      classobjkey = thisarr.join('.'); 
      if(state.boundelems[objname] == 'undefined') { 
        state.boundelems[objname] = []; 
      }
      state.boundelems[objname].push({
        el: elem, 
        key: classobjkey, 
        type: type, 
        handle: handlename
      }); 
      elem.setAttribute('JGBound','true'); 
    }
  }; 

  // get all the elements and find those w/ bindings: 
  var collectDOM = function() { 
    state.domCollected = false; 
    var all = document.getElementsByTagName('*'); 
    for(var i=0; i < all.length; ++i) { 
      if(!all[i].getAttribute('JGBound')) { 
        var classBind = false, bindType = false; 
        var str = showStr = hideStr = ''; 

        // first check if it is a JGBind or JGValue binding: 
        if(all[i].getAttribute('JGBind')) { 
          bindType = 'bind'; 
          str = all[i].getAttribute('JGBind');
        } else if(all[i].getAttribute('JGValue')) { 
          bindType = 'value'; 
          str = all[i].getAttribute('JGValue'); 
        } 
        /*
          Expects: 
            <elem JGClass='someClassHandle:someObj.someProperty'></elem>
            also permits: 'handle1:someObj.prop1,handle2:someObj.prop2'
          Then: 
            JGBinder.registerHandler('someClassHandle', cb)
          Where: 
            cb = function(oldValue,newValue) { 
              // do some logic here & assign className = String
              return className; 
            }
        */
        if(all[i].getAttribute('JGClass')) { 
          interpretHandler(all[i],'JGClass'); 
        }       
        if(all[i].getAttribute('JGData')) { 
          interpretHandler(all[i],'JGData'); 
        }

        if(bindType) { 
          all[i].setAttribute('JGBound','true'); 
          all[i].onkeyup = function() { analyzechange(this); }; 
          str = str.split('.');  
          var objname = str.shift(); 
          var objkey = str.join('.'); 
          if(typeof state.boundelems[objname] == 'undefined') { 
            state.boundelems[objname] = []; 
          } 
          state.boundelems[objname].push({ 
            el: all[i], 
            key: objkey, 
            type: bindType
          }); 
        }
      }
    }
    state.domCollected = true; 
    if(state.queue.length > 0) { 
      processQueue(); 
    } 
  }; 

  var analyzechange = function(el) {
    var str = false; 
    if(el.getAttribute('JGBind')) { 
      str = el.getAttribute('JGBind').split('.'); 
      var val = el.innerHTML; 
    } else if (el.getAttribute('JGValue')) { 
      str = el.getAttribute('JGValue').split('.'); 
      var val = el.value; 
    }
    if(str) { 
      var objName = str.shift(); 
      str = str.join('.'); 
      // only fire if the object prop has changed: 
      if(get(state.objects[objName], str) != val) { 
        set( state.objects[objName], str, val ); 
        state.queue.push({
          objName: objName, 
          obj: state.objects[objName], 
          changeinitiator: el
        }); 
        if(state.domCollected && !state.processingQueue) { 
          processQueue(); 
        }
        // check for changeHandler functions tied to this key or $base {obj}
        if(typeof state.changeHandlers[objName] != "undefined") { 
          if(typeof state.changeHandlers[objName][str] != "undefined") { 
            state.changeHandlers[objName][str](); 
          } 
          if(typeof state.changeHandlers[objName]['$base'] != "undefined") { 
            // if the handler is tied to base function then we pass the keyStr: 
            state.changeHandlers[objName]['$base'](str); 
          } 
        }
      }
    }
  }; 

  var processQueue = function() { 
    var len = state.queue.length; 
    for(var i=0; i < len; ++i) { 
      executeBind(state.queue[i]); 
    } 
    state.queue.splice(0,len); 
    if(state.queue.length > 0) { 
      processQueue(); 
    }
  }; 

  var executeBind = function(task) { 
    var arr = state.boundelems[task.objName]; 
    // c.log(state.boundelems[task.objName]); 
    for(var i=0; i < arr.length; ++i) { 
      // don't update the element that invoked the change to prevent cursor problems: 
      if(arr[i].el != task.changeinitiator) { 
        switch(arr[i].type) { 
          case 'bind': 
            arr[i].el.innerHTML = get(task.obj, arr[i].key); 
            break; 
          case 'value': 
            arr[i].el.setAttribute('value', get(task.obj, arr[i].key)); 
            arr[i].el.value = get(task.obj, arr[i].key); 
            break; 
          default: 
            break; 
        }
      } 
      if(arr[i].type == 'JGClass' || arr[i].type == 'JGData') { 
        if(typeof state.handlers[arr[i].handle] != 'undefined') { 
          var instr = state.handlers[arr[i].handle](get(task.obj, arr[i].key)); 
          if(typeof instr == 'object') { 
            instr.add = (typeof instr.add == 'undefined') ? false : instr.add; 
            instr.remove = (typeof instr.remove == 'undefined') ? false : instr.remove; 
            switch(arr[i].type) { 
              case 'JGClass': 
                  if(instr.add) 
                    $.addClass(arr[i].el,instr.add); 
                  if(instr.remove) 
                    $.removeClass(arr[i].el,instr.remove); 
                break; 
              case 'JGData': 
                if(instr.add) { 
                  $.setData(arr[i].el,instr.add);
                }
                // if(instr.remove) 
                //   $.removeData(arr[i].el,instr.remove); 
                break; 
              default: 
                break; 
            }
          }
        }
        // if(typeof state.handlers[])
      }
    } 
  }; 

  var uploadObject = function(objName) { 
    for(var i=0; i < state.boundelems[objName].length; ++i) { 
      if(state.boundelems[objName][i]['type'] == 'bind') { 
        set(state.objects[objName],state.boundelems[objName][i]['key'],state.boundelems[objName][i]['el'].innerHTML); 
      } else if (state.boundelems[objName][i]['type'] == 'value') { 
        set(state.objects[objName],state.boundelems[objName][i]['key'],state.boundelems[objName][i]['el'].getAttribute('value')); 
      }
    } 
    return state.objects[objName]
  }; 

  var set = function(obj,str,val) { 
    str = str.split('.'); 
    while(str.length > 1) { 
      obj = obj[str.shift()]; 
    }
    return obj[str.shift()] = val; 
  };

  var get = function(obj,str) { 
    str = str.split('.'); 
    for(var i=0; i < str.length; ++i) { 
      if(typeof obj[str[i]] == 'undefined') { 
        return ''; 
      } else { 
        obj = obj[str[i]]; 
      }
    } 
    return obj; 
  }; 

  var binder = function(objName,obj) { 
    // state.originalObjects[objName] = JSON.parse(JSON.stringify(obj)); 
    state.originalObjects[objName] = $.extend({},obj);
    state.objects[objName] = obj; 
    state.queue.push({
      objName: objName, 
      obj: obj, 
      changeinitiator: false
    }); 

    if(state.domCollected && !state.processingQueue) { 
      processQueue(); 
    }
  }; 

  var public = { 
    // ex: JGBinder.bind('strain', {article: '', title: ''}); 
    set: function(objName, obj) {
      binder(objName,obj); 
    },
    // ex: var fetchedObj = JGBinder.fetch('strain'); 
    fetch: function(objName) {
      return uploadObject(objName);  
    }, 
    // ex: JGBinder.revert('strain'); 
    revert: function(objName) { 
      binder(objName, state.originalObjects[objName]); 
    },
    // ex: JGBinder.onChange('strain',function('propName',newValue,){}); 
    onChange: function(objName,propName,fn) { 
      if(typeof state.changeHandlers[objName] == 'undefined') { 
        state.changeHandlers[objName] = { }; 
      } 
      if(typeof fn == "function") { 
        state.changeHandlers[objName][propName] = fn; 
      }
    }, 
    reload: function() { 
      collectDOM(); 
      return true; 
    }, 
    registerHandler: function(handlername,cb) { 
      if(typeof cb != 'undefined' && typeof cb == 'function') { 
        state.handlers[handlername] = cb; 
        return true; 
      }
    }
  };  

  $.ready(collectDOM); 

  return { 
    set: public.set, 
    fetch: public.fetch, 
    revert: public.revert, 
    onChange: public.onChange, 
    reload: public.reload, 
    registerHandler: public.registerHandler
  } 

})(window,document,console,jDom); 