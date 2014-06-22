var example = (function(w,d,c,$){
  var init = function() { 
    for(var i=0; i < 10; ++i) { 
      var div = jDom.create('div#latent'+i+'.dynApptPicker'); 
      document.body.appendChild(div); 
      apptPicker('latent'+i).create({start: '5:00am', opentext: 'Like a bawss'}).toggleOpen()
    }
  };
  $(d).ready(init);  
})(window,document,console,jQuery); 