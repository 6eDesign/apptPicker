jDom = (function(exports,w,d,c){
    var _oldMethod, interpret, interpreter; 
    _oldCreate = exports.create; 

    // Method override: jDom.create()
    exports.create = function(obj) {
        if(typeof obj=='string') { 
            return _oldCreate(interpreter(obj)); 
        } else { 
            return _oldCreate(obj);
        }
    };

    interpret = function(str) { 
        var re, text, attr, type, dotIndex, hashIndex, id, classes; 
        re = { text: /\${([^}]+)}/, attr: /\$\[(.*?)\]/ }  

        // extract text/attrs: ${text}
        text = str.match(re.text); 
        attr = str.match(re.attr); 

        // replace the text and attr strings in original string (if set): 
        if(text) str = str.replace(text[0],''); 
        if(attr) str = str.replace(attr[0],''); 

        // set default type:
        type = 'div'; 
        if(str.length > 0 || attr) { 
            dotIndex = str.indexOf('.'); hashIndex = str.indexOf('#')
            // if we have an element type, find it and remove it from string: 
            if(dotIndex > 0 && hashIndex > 0) { 
                // classes and id's ARE present
                type = str.substring(0,Math.min(dotIndex,hashIndex)); 
                str = str.replace(type,''); 
            } else if(dotIndex < 0 && hashIndex < 0) { 
                // NEITHER the id NOR the class are present
                type = str; 
                str = str.replace(type,''); 
            } else if(dotIndex*hashIndex < 0) { 
                // either an ID or a Class are NOT present (but one is)
                type = str.substring(0,Math.max(dotIndex,hashIndex)); 
                str = str.replace(type,''); 
            } 

            // find any id's or classes: 
            id = false; classes = false; 
            if(str.length > 0) { 
                hashIndex = str.indexOf('#'); 
                if(hashIndex > -1) { 
                    id = str.substring(hashIndex+1,str.length); 
                    dotIndex = id.indexOf('.'); 
                    if(dotIndex > -1) { 
                        id = id.substring(0,dotIndex); 
                    }
                    str = str.replace('#'+id,''); 
                } 
                if(str.length > 0) { 
                    classes = exports.trim(str.split('.').join(' ')); 
                }
            } 

        } else { 
            if(text && !attr) { 
                return text[1]; 
            }
        }

        // interpret attributes: 
        attr = (attr) ? attr[1] : {};
        if(typeof attr == 'string') { 
            var arr = attr.split(','); 
            attr = {}; 
            for(var i=0; i < arr.length; ++i) { 
                var theseattrs = arr[i].split('='); 
                attr[theseattrs[0]] = theseattrs[1]; 
            }
        }  

        // put any ID's classes in as well - we're not doing an extend so they get overwritten: 
        if(id) attr['id'] = id; 
        if(classes) attr['class'] = classes; 

        return { 
            'type': type, 
            'attributes': attr, 
            'contains': (text) ? [text[1]] : []
        }
    } 

    interpreter = function(str) { 
        var levels, currentLevel, obj, plusIndex, starIndex;
        // split on '$>' for hierarchy: 
        levels = str.split('$>'); 
        plusIndex = levels[0].indexOf('$+');
        starIndex = levels[0].indexOf('$*'); 
        if(plusIndex > -1 || starIndex > -1) { 
            // we can't really handle sibling elements ($* || $+) on the base level so if it occurs we're going to wrap in a div
            obj = interpret('div'); 
        } else { 
            // send level1 to interpret() while removing it from [levels]
            obj = interpret(levels.splice(0,1)[0]); 
        }
        var currobj = obj; 
        // perform recursive calls for deeper-level elements: 
        for(var i=0; i < levels.length; ++i) { 
            var siblings = levels[i].split('$+'); 
            for(var j=0; j < siblings.length; ++j) { 
                starIndex = siblings[j].indexOf('$*'); 
                if(starIndex > -1) { 
                    // get multiplier (if exists) and remove from string: 
                    var multiplier = parseInt(siblings[j].substring(starIndex+2,siblings[j].length)); 
                    siblings[j] = siblings[j].replace('$*'+multiplier,''); 
                    for(var k=0; k < multiplier; ++k) { 
                        currobj.contains.push(interpreter(siblings[j])); 
                    } 
                } else { 
                    currobj.contains.push(interpreter(siblings[j]));
                }
            } 
            currobj = obj.contains[obj.contains.length-1]
        } 
        return obj; 
    } 

    // return our public functions: 
    return exports; 
})(jDom || {}, window,document,console); 