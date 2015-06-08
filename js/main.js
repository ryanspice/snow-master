"use strict";
var Application = SpiceJS.create();

//Application OnLoad
Application.OnLoad = function (self) {

	self.Init("Example SpiceJS", 320, 720);

	self.canvas.setBackground("#000000");

	//self.options.set({paths:{images:""}});

	self.ext.metatag.metaFavicon("favicon.png");

};

//Application main loop Object[init,update,draw]
Application.main= {

	name:"Example",

	init:function() {

		//Initialization Logic
		this.img = this.graphics.load("../favicon");

		this.loading = this.app.create(Loading).init();
		
		return true;
	},

	update:function() {

		this.loading.update();
		
		return true;
	},

	draw:function() {

		this.loading.draw();
		//this.visuals.rotate_at(25,-this.img.width/2,-this.img.height/2);
		//this.visuals.image(this.img,0,0);
		//this.visuals.setBleed(1);
		return true;
	}

};