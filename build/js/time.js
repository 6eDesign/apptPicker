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

	/* Setup our JGClass handlers: */
	var cellDateHandler, dayToTimestamp; 
	cellDateHandler = function(val) { 
		var obj = { add: '', remove: '' }; 

		if(val.day != null) { 
			obj.remove += 'empty'; 
		} else { 
			obj.add += 'empty'; 
		}
		if(typeof val.schedule.available != 'undefined') { 
			if(val.schedule.available == true) { 
				obj.remove += ' unavailable';  
			} else { 
				obj.add += ' unavailable'; 
			}
		} else { 
			obj.remove += ' unavailable'; 
		}
		return obj; 
	}; 
	dayToTimestamp = function(val) { 
		var obj = { add: {  } }; 
		if(val.day) { 
			obj.add.timestamp = val.date.getTime()
		}
		return obj; 
	}; 

	JGBinder.registerHandler('cellDateHandler',cellDateHandler); 
	JGBinder.registerHandler('dayToTimestamp',dayToTimestamp); 

	// functions: 
	var generateMonth, getMonth, setMonth, updateSchedule, padMonth, getDaysInMonth, getWeeksInMonth, applyDaysTo, addMonth, subtractMonth, fixlength, handleDayClick, openPicker;
	handleDayClick = function() { 
		var id, date; 
		id = this.parentNode.parentNode.parentNode.getAttribute('id'); 
		date = new D(parseInt(this.getAttribute('data-timestamp'))); 
		openPicker(id,date); 
	};

	openPicker = function(id,date) { 
		c.log("OPEN " + id);
		c.log(date);  
	}; 

	fixlength = function(num,digits) { 
	  num = num.toString(); 
    var add = ""; 
	  if(num.length < digits) { 
	    for(var i=0; i < digits-num.length; ++i) { 
	      add = "0" + add; 
	    }
	  }
    return add + num; 
	}
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
		var mainDiv = {}, calendar = {}, contains = [], id = 'calendar_' + state.count; 
		mainDiv.type = 'div'; 
		mainDiv.attributes = { 'class': 'theApptPicker' }; 
		mainDiv.contains = []; 
		mainDiv.contains.push({
			type: 'div', 
			attributes: {'class': 'apptPicker'}, 
			contains: [
				{
					type: 'div', 
					attributes: { 'JGBind': id+'.selectedDayLabel' }
				},{
					type: 'input', 
					attributes: { type: 'hidden', readonly: 'true', id: 'pickerInput_'+id } 
				},{
					type: 'div', 
					attributes: { 'id': 'picker_'+id }
				}
			]
		}); 

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
		var jCalDayLabels = { type: 'div', attributes: { 'class': 'row jCalDayLabels jCalRow' }, contains: [] }; 
		for(var i=0; i < labels.days.length; ++i) { 
			jCalDayLabels.contains.push({
				type: 'div', 
				attributes: { 'class': 'col jCalCell' }, 
				contains: [	
					{
						type: 'div', 
						attributes: { 'class': 'label' }, 
						contains: labels.days[i]
					}, { 
						type: 'div', 
						attributes: { 'class': 'label abbr' } , 
						contains: labels.days[i].substring(0,3)
					}
				]
			}); 
		}	
		calendar.contains.push(jCalDayLabels); 
		for(var i = 0; i < 5; ++i) { 
			var row = { type: 'a', attributes: { 'class': 'row jCalRow' }, contains: []}; 
			for(var j = 0; j < 7; ++j) { 
				var currday = (i*7)+j+1; 
				row.contains.push({
					type: 'div', 
					attributes: { 'class': 'col jCalCell' },
					contains: [ 
						{ 
							type: 'img', 
							attributes: { src: 'dist/img/square.png', 'class': 'squaringImage', width: '100%', height: 'auto' }
						}, { 
							type: 'div', 
							attributes: { 
								'class': 'innerCell', 
								'JGClass': 'cellDateHandler:'+id+'.days.day_'+currday, 
								'JGData': 'dayToTimestamp:'+id+'.days.day_'+currday 
							},  
							bindings: { 'click': handleDayClick }, 
							contains: [
								{ 
									type: 'span', 
									attributes: { 
										'class': 'dayLabel',
										'JGBind': id+'.days.day_'+currday+'.day' 
									}
								},{ 
									type: 'div', 
									attributes: { 
										'class': 'availabilityLabel'

										// 'JGBind': id+'.days.day_'+currday+'.schedule'
									}, 
									contains: [ 
										{ 
											type: 'div', 
											attributes: { 
												'class': 'description mobile', 
												'JGBind': id+'.days.day_'+currday+'.schedule.description.mobile' 
											}
										}, { 
											type: 'div', 
											attributes: { 
												'class': 'description', 
												'JGBind': id+'.days.day_'+currday+'.schedule.description.desktop'
											}
										}
									]
								}
							]
						}
					]
				})
			}
			calendar.contains.push(row); 
		}
		mainDiv.contains.push(calendar); 

		state.calendars[id] = { }; 
		state.calendars[id].el = elem.appendChild($.create(mainDiv)); 

		state.calendars[id].picker = apptPicker('picker_'+id).create({
			start: '6:00am', 
			end: '6:00pm', 
			interval: 15, 
			subinterval: 120, 
			inputid: 'pickerInput_'+id
		}); 
		apptPicker('picker_'+id).toggleOpen(); 

		state.calendars[id].days = $.extend({},basedays); 
		state.calendars[id].currday = { 
			day: today.getDay()+1, 
			month: today.getMonth()+1, 
			year: today.getYear()
		}; 
		state.calendars[id].schedule = { }; 
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
		return days;  
	}; 

	applyDaysTo = function(id,days) { 
		var startingNull = 0; 
		for(var i=0; i < days.length; ++i) { 
			startingNull += (days[i]) ? 0 : 1; 
			var schedule = {}; 
			if(days[i]) {
				var key = days[i].getFullYear() + "_" + fixlength(days[i].getMonth()+1,2) + "_" + fixlength(i+1-startingNull,2); 
				if(typeof state.calendars[id].schedule[key] != 'undefined') { 
					schedule = state.calendars[id].schedule[key];
				}
			}
			state.calendars[id].days['day_'+(i+1)] = { 
				day: (days[i]) ? i+1-startingNull : days[i], 
				date: days[i], 
				schedule: schedule
			}; 
		}
		JGBinder.reload(); 
		JGBinder.set(id,state.calendars[id]) 
	}; 
	
	setMonth = function(id,month,year) { 
		month = (typeof month == 'undefined') ? today.getMonth() : month-1; 
		year = (typeof year == 'undefined') ? today.getFullYear() : year; 
		var days, numWeeks, padding = []; 
		days = getMonth(month,year);
		padding[0] = days[0].getDay(); 
		padding[1] = 35 - days.length - padding[0]; 
		days = padMonth(days,padding); 
		state.calendars[id].month = month+1; 
		state.calendars[id].monthLabel = labels.months[month]; 
		state.calendars[id].monthLabelAbbr = labels.months[month].substring(0,3); 
		state.calendars[id].year = year; 
		state.calendars[id].currday.month = month+1; 
		state.calendars[id].currday.year = year; 
		applyDaysTo(id,days);
	}; 

	updateSchedule = function(id,schedule) { 
		state.calendars[id].schedule = $.extend(state.calendars[id].schedule,schedule); 
		setMonth(id,state.calendars[id].currday.month,state.calendars[id].currday.year);
	}; 

	exports.generateCalendar = function(id,month,year,schedule) { 
		schedule = (typeof schedule == 'undefined') ? false : schedule; 
		var calendarId, target = d.getElementById(id); 
		calendarId = generateMonth(target); 
		target.style.position = "relative"; 
		setMonth(calendarId,month,year); 
		if(schedule) { 
			updateSchedule(calendarId,schedule); 
		}	 
		return calendarId; 	
	}

	exports.setMonth = function(id,month,year) { 
		if(typeof state.calendars[id] != 'undefined') { 
			setMonth(id,month,year); 
		}
	}; 

	exports.updateSchedule = function(id,schedule) { 
		updateSchedule(id,schedule); 
		return true; 
	}; 

	return exports; 

})(window,document,console,Date,jDom,calendar||{}); 




/*
	Thoughts on storing a schedule in JSON: 
		schedule = { 
			date_string: minutes_array
		}
		where: 
			date_string: 		"YYYY_MM_DD" (ex: "2015_07_01")
			minutes_array: 	an array (of length%2=0, even) of integers .  Each pair 
											of integers represents the start and end time of an appt.
											in minutes from 12:00am


 */