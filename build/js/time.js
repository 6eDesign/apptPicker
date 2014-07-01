var calendar = (function(w,d,c,D,$,exports){
	// variables: 
	var today, basedays, basedayskeys, dayspermonth, 
			labels = {}, 
			state = { count: 0, calendars: {} };

	today = new D(); 
	basedays = {}; 
	basedayskeys = []; 
	dayspermonth = [31,28,31,30,31,30,31,31,30,31,30,31]; 
	labels.months = ["January","February","March","April","May","June","July","August","September","October","November","December"];  
	labels.days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]; 
	// setup our basedays templates: 
	for(var i=0; i < 35; ++i) { 
		basedayskeys.push('day_'+(i+1)); 
		basedays['day_'+(i+1)] = {}; 
	}

	// functions: 
	var generateMonth, getMonth, setMonth, padMonth, getDaysInMonth, getWeeksInMonth, applyDaysTo, addMonth, subtractMonth;
	addMonth = function() { 
		var id, month, year; 
		id = this.getAttribute('data-jcalid'); 
		if(state.calendars[id].month == 12) { 
			year = 1 + state.calendars[id].year; 
			month = 1;
		} else { 
			year = state.calendars[id].year; 
			month = 1 + state.calendars[id].month; 
		}
		setMonth(id,month,year); 
	}; 
	subtractMonth = function() { 
		var month, year, id = this.getAttribute('data-jcalid'); 
		if(state.calendars[id].month == 1) { 
			month = 12; 
			year = state.calendars[id].year - 1; 
		} else { 
			month = state.calendars[id].month -1; 
			year = state.calendars[id].year; 
		}
		setMonth(id,month,year); 
	};  
	generateMonth = function(elem) { 
		var calendar = {}, contains = [], id = 'calendar_' + state.count; 
		calendar.type = 'div'; 
		calendar.attributes = { 'class': 'jCal', id: id };
		calendar.contains = []; 
		calendar.contains.push({
			type: 'div', 
			attributes: {'class': 'row jCalHeader'}, 
			contains: [
				{
					type: 'a', 
					attributes: { 'class': 'jCalBtn col left', 'data-jcalid': id },
					bindings: { 'click': subtractMonth },
					contains: [ '<' ]
				}, { 
					type: 'div', 
					attributes: { 'class': 'jCalLabel col', 'data-jcalid': id }, 
					contains: [ 
						{ 
							type: 'span', 
							attributes: { 'class': 'month', 'JGBind': id+'.monthLabelAbbr' }
						}, { 
							type: 'span', 
							attributes: { 'class': 'year', 'JGBind': id+'.year' }
						}
					] 
				}, {
					type: 'a', 
					attributes: { 'class': 'jCalBtn col left', 'data-jcalid': id },
					bindings: { 'click': addMonth },
					contains: [ '>' ]
				}
			]
		}); 
		for(var i = 0; i < 5; ++i) { 
			var row = { type: 'a', attributes: { 'class': 'row jCalRow' }, contains: []}; 
			for(var j = 0; j < 7; ++j) { 
				row.contains.push({
					type: 'div', 
					attributes: { 'class': 'col jCalCell' }, 
					contains: [ 
						{ 
							type: 'img', 
							attributes: { src: 'dist/img/square.png', 'class': 'squaringImage', width: '100%', height: 'auto' }
						}, { 
							type: 'div', 
							attributes: { 'class': 'innerCell' }, 
							contains: [
								{ 
									type: 'span', 
									attributes: { 
										'JGBind': id+'.days.day_'+(((i*7) + j+1)+'.day') 
									}
								}
							]
						}
					]
				})
			}
			calendar.contains.push(row); 
		}
		state.calendars[id] = { }; 
		state.calendars[id].el = elem.appendChild($.create(calendar)); 
		state.calendars[id].days = $.extend({},basedays); 
		++state.count;  
		return id; 
	}; 

	padMonth = function(days,padding) { 
		for(var i=0; i < padding[0]; ++i) { 
			days.splice(0,0,null); 
		}
		for(var i=0; i < padding[1]; ++i) { 
			days.push(null); 
		}
		return days; 
	}; 

	getDaysInMonth = function(month,year) { 
		if(month == 1 && (year%4===0 && (year%100!=0 || year%400!=0))) { 
			return 29; 
		} else { 
			return dayspermonth[month]; 
		}
	}; 

	getMonth = function(month,year) { 
		var numDays, days = [];  
		numDays = getDaysInMonth(month,year); 
		for(var i=0; i < numDays; ++i) { 
			days.push(new Date(year,month,i+1)); 
		}	
		c.log(numDays); 
		return days;  
	}; 

	applyDaysTo = function(id,days) { 
		var startingNull = 0; 
		for(var i=0; i < days.length; ++i) { 
			startingNull += (days[i]) ? 0 : 1; 
			state.calendars[id].days['day_'+(i+1)] = { 
				day: (days[i]) ? i+1-startingNull : days[i], 
				date: days[i]
			}; 
		}
		JGBinder.reload(); 
		JGBinder.set(id,state.calendars[id]) 
	}; 
	
	setMonth = function(id,month,year) { 
		month = (typeof month == 'undefined') ? today.getMonth() : month-1; 
		year = (typeof year == 'undefined') ? today.getYear() : year; 
		var days, numWeeks, padding = []; 
		days = getMonth(month,year);
		padding[0] = days[0].getDay(); 
		padding[1] = 35 - days.length - padding[0]; 
		days = padMonth(days,padding); 
		state.calendars[id].month = month+1; 
		state.calendars[id].monthLabel = labels.months[month]; 
		state.calendars[id].monthLabelAbbr = labels.months[month].substring(0,3); 
		state.calendars[id].year = year; 
		applyDaysTo(id,days);
	}; 

	exports.generateCalendar = function(id,month,year) { 
		var calendarId = generateMonth(d.getElementById(id)); 
		setMonth(calendarId,month,year); 		 
		return calendarId; 	
	}

	exports.setMonth = function(id,month,year) { 
		if(typeof state.calendars[id] != 'undefined') { 
			setMonth(id,month,year); 
		}
	}; 

	return exports; 

})(window,document,console,Date,jDom,calendar||{}); 