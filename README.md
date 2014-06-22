#apptPicker.js

A lightweight JavaScript Appointment Picker for selecting time ranges.  

[See a live Example on the apptPicker.js github.io Page](http://6eDesign.github.io/apptPicker/)
![alt tag](http://6edesign.github.io/apptPicker/dist/img/demo_img.png)

## Getting Started: 
````html
<!-- Include the CSS (customizeable or roll your own) -->
<link rel="stylesheet" href="./dist/css/apptPicker.min.css">
<!-- Include the JavaScripts -->
<script type="text/javascript" src="./dist/js/vendor.min.js"></script>
<script type="text/javascript" src="./dist/js/apptPicker.min.js"></script>
<!-- Vendor.min.js simply includes jQuery and jQuery.easing -->
````

## Usage (JavaScript): 
````js
// create an apptPicker on a div with id "exApptPicker" and also wire a callback for change events: 
var opts = { 
	// see the documentation for more options
	start: '5:00am', 
	end: '5:00pm', 
	interval: 30		// all intervals are represented in minutes
}; 
jQuery(document).ready(function(){
	apptPicker('exApptPicker').create(opts).on('change',function(chosenTimes){
		console.log(chosenTimes); 
	}); 
}); 
````

## Usage (HTML):
````html
<!-- Include an (optional) input to bind the apptPicker to: -->
<input type="text" id="exApptPickerInput" placeholder="Choose a Time Range" readonly />
<div 
	class="apptPicker" 
	id="exApptPicker" 
	data-start="5:00am"
	data-end="5:00am"
></div>
````

## Options: 
Options can be chosen via data-attributes when using DOM declarations to include an apptPicker or by passing an {options} object to apptPicker(id).create({options}). When using data-attributes, simply prepend 'data-' to each option key in the DOM. 

Key | Type | Description | Example | Default
--- | --- | --- | --- | ---
'start' | String | The minimum time for apointment range. | "5:00am" | "9:00am"
'end' | String | The maximum time for appointment range. | "11:00pm" | "5:00pm"
'interval' | Int | The number of minutes between each time option. | 30 | 15
'subinterval' | Int | The number of minutes between each sub-time option. | 180 | 120
'slidedur' | Int | The number of milliseconds for the duration of slide animations | 400 | 280
'opendur' | Int | The number of milliseconds for the opening animation | 500 | 300
'height' | String | The desired height, in pixels, of the appointment picker when open. | "400px" | "351px"
'opentext' | String | The text to be displayed on the button generated for apptPicker | "Open Me" | "Choose Times"
'inputid' | String | (optional) Input ID for apptPicker - updates value on change | "myInputID" | false
'changetxt' | String/Boolean | Determine whether apptPicker changes text of apptPicker button on change | false | true



### License
````js
The MIT License (MIT)

Copyright (c) 2013 Jonathan Greenemeier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````