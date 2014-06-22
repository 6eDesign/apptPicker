var timeUtils = (function(w,d,c){
    var interpretTimeStr, getTimes, getTimesDispatcher, 
        formatTimeStr, formatTimeStrDispatcher; 

    var exports = { }; 

    interpretTimeStr = function(time,date) { 
      time = { timeing: time, arr: time.split(':') }; 
      time.hours = parseInt(time.arr[0]); 
      time.minutes = parseInt(time.arr[1].substring(0,2)); 
      time.pm = (time.arr[1].substring(2,time.arr[1].length).trim().toLowerCase() == 'pm'); 
      time.militaryhours = (time.pm && time.hours != 12) ? 12 + time.hours : time.hours;
      time.militaryhours = (!time.pm && time.hours == 12) ? 0 : time.militaryhours; 
      date.setHours(time.militaryhours); date.setMinutes(time.minutes); date.setSeconds(0);
      time.date = date.setMilliseconds(0); 
      time.totalminutes = time.militaryhours * 60 + time.minutes; 
      return time; 
    }; 
    
    getTimes = function(start,end,delta,date) { 
      date = (typeof date == 'undefined') ? new Date() : date; 
      start = interpretTimeStr(start,date); 
      end = interpretTimeStr(end,date); 
      var numsteps = ((end.totalminutes - start.totalminutes) / delta) + 1; 
      var arr = []; 
      for(var i=0; i < numsteps; ++i) { 
        arr.push(new Date(start.date + (60000 * (i*delta))))
      }
      return arr; 
    }
    exports.getTimes = function(start,end,delta,date) { return getTimes(start,end,delta,date); }; 
    
    formatTimeStr = function(date,short) { 
        var hrs, mins, pm, str; 
        short = (typeof short == 'undefined') ? false : short; 
        hrs = date.getHours(); 
        pm = (hrs > 11) ? true : false; 
        hrs -= (hrs!=0 && pm) ? 12 : 0;
        hrs = (hrs==0) ? 12 : hrs; 
        mins = date.getMinutes(); 
        mins = (mins < 10) ? "0" + mins : mins; 
        pm = (pm) ? "pm" : "am"; 
        if(short) { 
            str = hrs + pm; 
        } else {
            str = hrs + ":" + mins + " " + pm; 
        }
        return str; 
    }; 
    exports.formatTimeStr = function(date,short) { return formatTimeStr(date,short); }; 

    return exports;
    
})(window,document,console); 