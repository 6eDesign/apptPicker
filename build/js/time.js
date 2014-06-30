var time = (function(w,d,c,exports){
	/* This function will be used for all the time things: */
	var today, getMonth, getDaysInMonth, getWeeksInMonth, daysInMonths, buildMonth, padMonth, labels = {};
	labels.months = ["January","February","March","April","May","June","July","August","September","October","November","December"];  
	labels.days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]; 
	daysInMonths = [31,28,31,30,31,30,31,31,3031,30,31]; 

	today = new Date(); 

	padMonth = function(days,padding) { 
		for(var i=0; i < padding[0]; ++i) { 
			days.splice(0,0,null); 
		}
		for(var i=0; i < padding[1]; ++i) { 
			days.push(null); 
		}
		return days; 
	}; 

	buildMonth = function(days) { 
		var numWeeks, padding = [], html = {}; 
		numWeeks = getWeeksInMonth(days); 
		padding[0] = days[0].getDay(); 
		padding[1] = numWeeks*7 - days.length - padding[0]; 
		days = padMonth(days,padding); 
		html.type = 'div'; 
		html.attributes = { 'class': 'jCal' };
		html.contains = [];  
		for(var i=0; i < numWeeks; ++i) { 
			var row = {type: 'div', attributes: { 'class': 'row jCalCell' }, contains: []}; 
			for(var j=0; j < 7; ++j) { 
				var thisday = days[i*7+j]; 
				row.contains.push({
					type: 'div',
					attributes: { 'class': (thisday) ? '' : 'empty' }, 
					contains: (thisday) ? thisday.getDate().toString() : '' 
				})
				c.log(row);
			}
			html.contains.push(row); 
		}
		c.log(jDom.create(html)); 
	}; 
	getWeeksInMonth = function(days) { 
		c.log("DAYS IN MONTH: " + days.length); 
		var firstWeek; 
		firstWeek = 7 - days[0].getDay(); 
		return Math.ceil((days.length-firstWeek)/7 + 1); 
	}; 
	getDaysInMonth = function(month,year) { 
		if(month == 1 && (year%4===0 && (year%100!=0 || year%400!=0))) { 
			return 29; 
		} else { 
			return daysInMonths[month]; 
		}
	}; 
	getMonth = function(month,year) { 
		var numDays, days = [];  
		numDays = getDaysInMonth(month,year); 
		for(var i=0; i < numDays; ++i) { 
			days.push(new Date(year,month,i+1)); 
		}	
		buildMonth(days); 
		return days;  
	}; 
	exports.getMonth = function(month,year) { 
		month = (typeof month == 'undefined') ? today.getMonth() : month-1; 
		year = (typeof year == 'undefined') ? today.getYear() : year; 
		var days; 
		days = getMonth(month,year); 	
		return days; 
	};
	exports.getWeek = function(start) { 

	}; 
	exports.getDay = function(date) { 

	};  

	return exports; 
})(window,document,console,time||{}); 