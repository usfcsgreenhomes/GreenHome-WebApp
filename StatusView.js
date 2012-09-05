// StatusView -------------------------------------------------- BEGIN // 

// to print latest status on the app loading, reacting, etc. !

  //VIEW: graphView
  var StatusView = Backbone.View.extend({
   
   el: $("#statusView"),
    
    events: {
   
    },
   
    
    initialize: function() {
		// Used to trigger syncronous code after Devices data has been downloaded from API
		userAppModel.on('devices_ready_event', function() {
                        this.add_message('devices_ready_event');
                      }, this);
		userAppModel.on('statuses_ready_event', function() {
                        this.add_message('statuses_ready_event');
                      }, this);
		userAppModel.on('new_device_select', function() {
                        this.add_message('new_device_select');
                      }, this);
                userAppModel.on('panels_clear', function() {
                        this.add_message('panels_clear');
                      }, this);
		userAppModel.on('logged_out', function() {
                        this.add_message('logged out');
                      }, this);
                userAppModel.on('return_start_elements', function() {
                        this.add_message('return_start_elements');
                      }, this);
    },
    
        render: function(){
            
            
            
        // Check state of D1, D2 elements to determine checked or unchecked
            
        },
        
        add_message: function(msg){
            //console.log('hello from status view');
            //console.log('Status message: ' + msg);
            this.$el.append('Status message: the following event has fired ' + msg + "<br>")
        }
    
  });



// END ---------------------------------------------------- StatusView // 