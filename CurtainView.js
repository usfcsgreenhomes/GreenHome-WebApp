// CurtainView -------------------------------------------------- BEGIN // 

  //VIEW: CurtainView
  var CurtainView = Backbone.View.extend({
   
   el: $(".appContainer"),

    defaults: {
        curtains: "present"
    },

    events: {
   "click #curtainLeft" : "toggle_curtains",
   "click #curtainRight" : "toggle_curtains"
    },
    
    initialize: function() {
	    this.curtains = "present";
            userAppModel.on('toggle_curtains_event', this.toggle_curtains, this);
            $('#curtainLeft').css({'position':'absolute'});
            $('#curtainRight').css({'position':'absolute'});
        },
    
        render: function(){
            
        },
        
        toggle_curtains: function(){

            if (this.curtains == 'present') {
                this.curtains = 'not-present';
                $('#curtainLeft').animate({'right':'4200px'}, { duration: 10, queue: false});
                $('#curtainRight').animate({'left':'3400px'}, { duration: 10, queue: false});
		//in case the user has clicked toggle curtains multiple times
            } else {
                this.curtains = 'present';
                $('#curtainLeft').animate({'right':'1050px'}, { duration: 10, queue: false});
                    
                $('#curtainRight').animate({'left':'1050px'}, { duration: 10, queue: false });  
            }
            
        }
    
  });


/*
 , complete: function(){
                    $('#curtainLeft').css({'right':'1050px'}
                    
*/

// END ---------------------------------------------------- CurtainView // 