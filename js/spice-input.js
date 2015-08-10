/* 
	SpiceJS - input 
		
		App.input
		
		SpiceJS loads SpiceInput automatically
		
			prototype is LOCAL
			
			constructor is GLOBAL
			
			var  input = SpiceJS.create(SpiceInput.prototype,SpiceInput.constructor(Application));
	
		TODO: 
				
			Ensure varable stack
			Get Functions for Each public requested input
			Measure Touch/Keyboard sensitivity differences
			Research need for confining cursor 
			
			
*/

var SpiceInput = Object.create(null);
SpiceInput.prototype = {

		/* Cache */
		
		x: 0,
		y: 0,
		
		delay:0,
		duration: 0,
		
		press:false,
		pressed:false,
		released:false,
		
		end: {x:0,y:0},
		pos: {x:0,y:0},
		dist: {x:0,y:0},
		start:{x:0,y:0},
		last: {x:0,y:0},
		
		touch:false,
		touch_dist:{x:0,y:0},
		
		key:false,
		keyPower:0,
		keyup:false,
		keydown:false,
		
		control:false,
		
		doc:document,
		body:document.body,
		
		codes:new Array(),
		codeList:new Array(),
		confine:false,
		preventNext:true,
		preventDefault:function(e) {  e.preventDefault(); return e.target.app; },
		preventNextInput:function() { return this.preventNext = true; },
		
		multi:{
		  list:[]
		},
		
		window:{
			self:window,
			play:15,
			x:false,
			y:false,
			inside:false
		},
		
		/*	
			Initalization
				-flags and options for input handling and other stuff
		*/

        init_pointerEvents:function(){
          
			/* mousewheel event			*/
			
			this.app.Listener(this.window.self,'mousewheel',this.scroll.event);
            
			/* 
			
				Pointer events 
				
					- Modern Touch Events
					- MS Pointer Events
					- Legacy Mouse and Touch Events
					
			*/
			
			if	(this.window.self.PointerEvent){
				
				this.app.Listener(this.window.self,'pointerdown',function(evt) {

					if (!evt.target.app)
						return;
					evt.target.app.input.touch = true;
					evt.target.app.input.listener.down(evt);
					
				});
				
				this.app.Listener(this.window.self,'pointermove',function(evt) {

					if (!evt.target.app)
						return;
					evt.target.app.input.touch = true;
					evt.target.app.input.listener.move(evt);
					
				});
				
				this.app.Listener(this.window.self,'pointerup',	function(evt) {

					if (!evt.target.app)
						return;
					evt.target.app.input.touch = false;
					evt.target.app.input.listener.up(evt);
					
				});

			} 
			else
			if (this.window.self.MSPointerEvent) {

					//MS Pointer Events
					this.app.Listener(this.window.self,'MSPointerDown',function(evt) {

							if (!evt.target.app)
								return;
							evt.target.app.input.touch = true;
							evt.target.app.input.listener.down(evt);
						
					});
				
					this.app.Listener(this.window.self,'MSPointerMove',function(evt) {

							if (!evt.target.app)
								return;
							evt.target.app.input.touch = true;
							evt.target.app.input.listener.move(evt);
						
					});
				
					this.app.Listener(this.window.self,'MSPointerUp',	function(evt) {

							if (!evt.target.app)
								return;
							evt.target.app.input.touch = false;
							evt.target.app.input.listener.up(evt);
						
					});

			}
			else 
			{

				this.app.Listener(this.window.self,'mousedown',function(evt) {

						if (!evt.target.app)
							return;
					
						evt.target.app.input.listener.down(evt);
					
				});
				
				this.app.Listener(this.window.self,'mousemove',function(evt) {

						if (!evt.target.app)
							return;
					
						evt.target.app.input.listener.move(evt);
					
				});
				
				this.app.Listener(this.window.self,'mouseup',function(evt) {

						if (!evt.target.app)
							return;
					
						evt.target.app.input.touch = false;
						evt.target.app.input.listener.up(evt,evt);
					
				});

				this.app.Listener(this.window.self,'touchstart',	function(evt) {

						if (!evt.target.app)
							return;
					
						evt.target.app.input.touch = true;
						evt.target.app.input.listener.touch(evt.targetTouches[0]);
					
						if (evt.target.app.options.flags.touchprevent)
							evt.preventDefault();
					
				});

				this.app.Listener(this.window.self,'touchmove',	function(evt) {

						if (!evt.target.app)
							return;
					
						if (evt.target.app.options.flags.touchprevent)
							evt.preventDefault();
					
						evt.target.app.input.touch = true;
						evt.target.app.input.listener.move(evt,evt.targetTouches[0]);
					
				});
				
				this.app.Listener(this.window.self,'touchend',		function(evt) {

						if (!evt.target.app)
							return;
					
						evt.target.app.input.touch = false;
						evt.target.app.input.listener.up(evt);
					
						if (evt.target.app.options.flags.touchprevent)
							evt.preventDefault();
				});

			}  
        },
    
        init_keys:function(){
            
			/* 	Key Down and Key Up Events - Populates supported codes */
			
			this.populateCodes();
			
			this.app.Listener(this.window.self,'keydown',function(evt){

					if (this.app.input.preventNext==true)
						evt.preventDefault();
				
					this.app.input.preventNext = false;
					this.app.input.codedown = this.app.input.codes[evt.keyCode];
				
					this.app.input.codeList.push(this.app.input.codedown);
				
					if (evt.ctrlKey)
						this.app.input.control = true;
				
					this.app.input.pressed = true;
					this.app.input.released = false;

					this.app.input.listener.key_down(this.app);
				
			});

			this.app.Listener(this.window.self,'keyup',function(evt) {

					if (this.app.input.preventNext)
						evt.preventDefault();
				
					this.app.input.preventNext = false;
					this.app.input.codeup = this.app.input.codes[evt.keyCode];
				
					this.app.input.keyboardPop(this.app.input.codeup);
				
					this.app.input.control = false;
					this.app.input.pressed = false;
					this.app.input.released = true;
					this.app.input.true = true;

					this.app.input.listener.key_up(this.app);
				
			});
            
        },
    
        init_win:function(){
            
           // this.upointer = window.WinPointer;
           // console.log(this.upointer);
            
        },
    
        init_options:function(){
      
			/*	Overrides the selection start event for selecting events	*/
			
			if (!this.app.options.get("override").SelectStart){
				this.app.Listener(this.app.canvas.canvas,'selectstart',this.preventDefault);
			}

			/*	Overrides the 'holdtouch, MSHoldVisual' event */
			
			if (!this.app.options.get("override").MSHoldVisual){
				this.app.Listener(this.app.canvas.canvas,'MSHoldVisual',this.preventDefault);
			}
			
			/* Overrides the ContextMenu event */
			
			if (this.app.options.get("override").ContextMenu) {
				this.doc.oncontextmenu = this.preventDefault;
				this.window.self.oncontextmenu = this.preventDefault;
			}

			/*	Overrides dragstart event		*/
			
			if (this.app.options.get("override").Drag) {
				this.doc.ondragstart   = this.preventDefault;
				this.window.self.ondragstart   = this.preventDefault;
			}

			/*	CSS based Overrides 
			
					- mstouch 
					- seamless ( toggles overflow ) 
					- tight ( zeros padding and margin )
			
			*/
			
			if (this.app.options.get("flags").mstouch){
				this.doc.body.setAttribute("style","-ms-touch-action: none; ms-content-zooming: none; touch-action: none; -ms-overflow-style: none;");
			}

			if (this.app.options.get("flags").seamless){
				this.doc.body.style.overflow = "hidden";
			}
			
			if (this.app.options.get("flags").tight){
				this.doc.body.style.padding = "0px", this.doc.body.style.margin = "0px auto";
			}      
            
        },

		init:function(){

			//Overrides the 'holdtouch, MSHoldVisual' event
			
			this.scroll = (this.app.Construct(this.scroll.prototype,this.scroll.constructor)).init();
            
            this.init_options();
            this.init_pointerEvents();
            this.init_keys();
            
            this.detect();

			return this;
		},

        detect:function(){
            
          // if (window.winPointer)
          //     this.init_win();
          // else
          //     log("No Win");
            
        },
    
		/* Update Input */
		
        winupdate:function(){
            
            if (this.pressed!=this.lastpressed)
                this.released = true,this.dist.x=0,this.dist.y=0;
            
            this.lastpressed = this.pressed;
            
            
            try {
                
                var w = Windows;
                var p = Windows.UI.Input.PointerPoint.getCurrentPoint(1);
                
                
                this.pressed = (Windows.UI.Input.PointerPoint.getCurrentPoint(1).isInContact);
                this.pointerDevice = (Windows.UI.Input.PointerPoint.getCurrentPoint(1).pointerDevice);
                
            }catch(e){
            
            Windows = false;
            }
            
          //  if (Windows)
          //  if (Windows.UI.Input.PointerPoint.getCurrentPoint(1).isInContact)
          //  this.pressed = (Windows.UI.Input.PointerPoint.getCurrentPoint(1).isInContact);
            
        },
    
		update:function() {

            
			//Reset last positions
			this.last.x = this.x;
			this.last.y = this.y;

			//Confine x,y
			this.confined();

			//Reset variables
			this.press = false;
			this.touch = 0;
			this.window.inside = 0;
			this.wheelDelta = 0;

			//If pressed, increase duration, otherwise reset
			this.pressed?this.duration++:this.duration=0;
            
			//if released, reset release and distance. else nothing.
			this.released?(this.released=false,this.dist.x=0,this.dist.y=0):null;
            
            this.winupdate();
            
			//reset code released, unused?
			this.codereleased = 0;

			//decrease delay if delay>0
			(this.delay>0)?this.delay-=Math.floor(this.delay-1*this.app.getDelta()):null;
    
        
    
    
    
		return true;
		},
    
		/*
		Listeners
		*/
		
		listener:{

							touchpoints:0,

							//Input down/press polyfill
							down:function(evt) {
								//Grab parent
								var input = evt.target.app.input;

								//Save Latest X/Y or 0
								
								input.x = input.start.x = evt.x || evt.clientX || evt.pageX;
								input.y = input.start.y = evt.y || evt.clientY || evt.pageY;

								//Increment Touch Count
								input.touched.count++;

								//Add positions to touch list
								input.touched.downlist.push({x:input.x,y:input.y});

								//Track touch downs, make CheckTouchDown and CheckTouchUp for buttons

								//Flags
                                if (!Windows)
								input.pressed = true;
                                if (!Windows)
								input.press = true;

								//Reset distance
								input.dist.x = 0;
								input.dist.y = 0;
							},

							//input move fill
							
							mouse_last:0,
							move:function(evt){

								//Grab parent
								var input = evt.target.app.input;

								evt = evt || input || {clientX:null,clientY:null};

								var mouse_last = this.mouse_last; 
								//sET PRESS
                                
                                if (input.pressed)
                                {
                                if (!Windows)
								input.press = true;
								input.x = evt.clientX || evt.x || evt.pageX;
								input.y = evt.clientY || evt.y || evt.pageY;
								input.dist.x = (input.x-input.start.x)*evt.target.app.getScale();
								input.dist.y = (input.y-input.start.y)*evt.target.app.getScale();
								
								
	//		log(this.mouse_last-input.dist.x);
								
								if (input.dist.x>0)
									if (this.mouse_last>input.dist.x)
										input.start.x = input.x, input.dist.x = 0;
								
								if (input.dist.x<0)
									if (this.mouse_last<input.dist.x)
										input.start.x = input.x, input.dist.x = 0;
								
								this.mouse_last =  input.dist.x;
                                }
                                
							},

							up:function(evt) {

								var input = evt.target.app.input;

								input.end.x = evt.x || input.x;
								input.end.y = evt.y || input.y;

								input.touched.uplist.push({x:input.x,y:input.y});
								input.touched.last = {x:input.x,y:input.y};
								input.touched.count--;
								//Track touch downs, make CheckTouchDown and CheckTouchUp for buttons


								input.press = false;
								input.pressed = false;
								input.released = true;
								input.touch = false;
								input.dist.x = (input.x-input.start.x)*evt.target.app.getScale();
								input.dist.y = (input.y-input.start.y)*evt.target.app.getScale();
							},

							key_down:function(evt){
								evt.input.key = true;
								evt.input.kpressed = true;
							},

							key_up:function(evt){
								evt.input.key = false;
								evt.input.kpressed = false;
								evt.input.kreleased = true;
								evt.input.kpressed = false;
							},

							touch:function(evt){
return;
							//	var input = touch.target.app.input;
								
								
								//log(input,touch);
								try {
								var input = evt.target.app.input || evt;
								} catch (e){
									var input = evt; log(evt);								
								};
								input.touch = true;
								
								input.x = evt.clientX || evt.x || evt.pageX;
								input.y = evt.clientY || evt.y || evt.pageY;
								
								input.pos = {x:0,y:0};
								input.pos.x = evt.pageX||evt.clientX;
								input.pos.y = evt.pageY||evt.clientY;
								input.released = false;
								input.duration = 0;

							},

						},

		/* 
			Touched 
		*/
		
		touched:{
			count:0,
			uplist:[],
			downlist:[],
			last:{x:0,y:0},
			CheckTouchUp:function(){

				return this.uplist[this.uplist.length-1];
			},
			CheckTouchDown:function(){

			},
		},
		

		/*
			Scroll to/scrolling - Needs Testing
			
				this.scrollto = true;
			
				if (this.scrollto){this.app.ext.scroll.to(0,1000);
				this.scrollto = this.app.ext.scroll.update();}
		*/

		scroll:{

			prototype:{

				/* Cache */
				
				x:0,
				y:1,
				target:{x:0,y:0},
				
				accel:1,
				
				active:null,
                reverse:false,
                a:false,

				window:window,
				doc:document.documentElement,

				//ScrollWheel Event
				event:function(evt,delta) {
					
					if (this.app.options.get("seamless"))
                       this.app.input.scroll.a = true;
                       
					if (this.app.options.get("seamless"))
						evt.preventDefault();
                       
					this.app.input.wheelDelta = evt.wheelDelta;

					var doc = document.documentElement;
					var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
					var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
                       
                       
                       //Flip for horizontal scrolling
                       if (this.reverse)
                       {
                           this.app.input.scroll.target.x = left;
                           this.app.input.scroll.target.y = top-evt.wheelDelta;
                           this.app.input.scroll.x = left;
                           this.app.input.scroll.y = top-evt.wheelDelta;
                       }
                       else{
                           this.app.input.scroll.target.y = 0;
                           this.app.input.scroll.target.x = left-evt.wheelDelta;
                           this.app.input.scroll.y = 0;
                           this.app.input.scroll.x = left-evt.wheelDelta;
                       }
					
					//App.ext.scroll.active = false;$
					
				},
				
				up:function(){
                                    
					var transitionSpeed = 1;
					
					if (this.target.x>this.x)
						this.x+=this.app.client.Math.Clamp(Math.floor((this.target.x-this.x)*(transitionSpeed)),1,100),this.a=true;
					
					if (this.target.x<this.x)
						this.x-=this.app.client.Math.Clamp(Math.floor((this.x-this.target.x)*(transitionSpeed)),1,100),this.a=true;
					
					this.x = this.app.client.Math.Clamp(this.x,0,window.innerWidth*3);
					this.target.x = this.app.client.Math.Clamp(this.target.x,0,window.innerWidth*3);
					
					//if (this.a)
					this.window.scrollTo(this.x,this.y),this.a = false;
					
					log(this.x,this.y);
                                    
                },
				
				//Update the position for smooth scrolling
				
				update:function(x,y){
					
					var left = (this.window.pageXOffset || this.doc.scrollLeft) - (this.doc.clientLeft || 0);
					var top = (this.window.pageYOffset || this.doc.scrollTop)  - (this.doc.clientTop || 0);

					/* DEACTIVATE IF CONFUSED */
					if (!this.active)
						return;
					
					var LD = Math.round(-this.x+this.target.x)/10;
					var YD = Math.round(-this.y+this.target.y)/10;

					if (left<this.target.x)
						this.x+=this.accel*LD;
					if (left>this.target.x)
						this.x+=this.accel*LD;
					if (top<this.target.y)
						this.y+=this.accel*YD;
					if (top>this.target.y)
						this.y+=this.accel*YD;

					this.window.scrollTo(this.x,this.y);

					if ((Math.round(this.x/10) == Math.round(this.target.x/10))&&
						(Math.round(this.y/10) == Math.round(this.target.y/10)))
						return false;
					
					return true;
				},

				//Set position,
				
				to:function(x,y) {

					this.target.x = x;
					this.target.y = y;

				}

			},

			constructor:function(a){return {
				app:{value:a},
				init:{value:function(){
							this.to(0,0);
							return this;
						}
					}
				}
			}
			
		},
		
		
		/*
		
			Confine input's to inside the canvas only.
		
		*/
		
		confined:function(){

			this.confine?(
				((this.y<this.app.client.visuals.fixY(0))?
					(this.window.y=0,this.window.inside -= 1):
						((this.y>this.app.client.visuals.fixY(this.app.client.setHeight))?
							(this.window.y=this.app.client.visuals.fixW(this.app.client.setHeight),this.window.inside += 1):
							(this.window.y=-this.app.client.visuals.fixY(0)+this.y)
						),
						((this.x<this.app.client.visuals.fixX(0))?
							(this.window.x = 0,this.window.inside -=1):
							((this.x>this.app.client.visuals.fixX(this.app.client.setWidth))?
								(this.window.x = this.app.client.visuals.fixW(this.app.client.setWidth),this.window.inside += 1):
								(this.window.x = -this.app.client.visuals.fixX(0)+this.x)
							)
						)
					)
				):((this.y<this.app.client.visuals.fixY(0))?
						(this.window.y=-this.app.client.visuals.fixY(0)+this.y):
						((this.y>this.app.client.visuals.fixY(this.app.client.setHeight))?
							(this.window.y=-this.app.client.visuals.fixY(0)+this.y):
							(this.window.y=-this.app.client.visuals.fixY(0)+this.y)
					),
					((this.x<this.app.client.visuals.fixX(0))?
						(this.window.x=-this.app.client.visuals.fixX(0)+this.x):
						((this.x>this.app.client.visuals.fixX(this.app.client.setWidth))?
							(this.window.x=-this.app.client.visuals.fixX(0)+this.x):
							(this.window.x=-this.app.client.visuals.fixX(0)+this.x)
						)
					));

		},

		/*
		
			Populates this.codes with an array of codes
		
		*/
		
		populateCodes:function(){
			
			//Keyboard codes
			
			this.codes[0]  ='';
			this.codes[1]  ='';
			this.codes[2]  ='';
			this.codes[3]  ='';
			this.codes[4]  ='';
			this.codes[5]  ='';
			this.codes[6]  ='';
			this.codes[7]  ='';
			this.codes[8]  ='backspace';
			this.codes[9]  ='tab';
			this.codes[13] ='enter';
			this.codes[16] ='shift';
			this.codes[17] ='ctrl';
			this.codes[18] ='alt';
			this.codes[19] ='pause/break';
			this.codes[20] ='capslock';
			this.codes[27] ='escape';
			this.codes[32] ='space';
			this.codes[33] ='pageup';
			this.codes[34] ='pagedown';
			this.codes[35] ='end';
			this.codes[36] ='home';
			this.codes[37] ='leftarrow';
			this.codes[38] ='uparrow';
			this.codes[39] ='rightarrow';
			this.codes[40] ='downarrow';
			this.codes[45] ='insert';
			this.codes[46] ='delete';
			this.codes[48] ='0';
			this.codes[49] ='1';
			this.codes[50] ='2';
			this.codes[51] ='3';
			this.codes[52] ='4';
			this.codes[53] ='5';
			this.codes[54] ='6';
			this.codes[55] ='7';
			this.codes[56] ='8';
			this.codes[57] ='9';
			this.codes[65] ='a';
			this.codes[66] ='b';
			this.codes[67] ='c';
			this.codes[68] ='d';
			this.codes[69] ='e';
			this.codes[70] ='f';
			this.codes[71] ='g';
			this.codes[72] ='h';
			this.codes[73] ='i';
			this.codes[74] ='j';
			this.codes[75] ='k';
			this.codes[76] ='l';
			this.codes[77] ='m';
			this.codes[78] ='n';
			this.codes[79] ='o';
			this.codes[80] ='p';
			this.codes[81] ='q';
			this.codes[82] ='r';
			this.codes[83] ='s';
			this.codes[84] ='t';
			this.codes[85] ='u';
			this.codes[86] ='v';
			this.codes[87] ='w';
			this.codes[88] ='x';
			this.codes[89] ='y';
			this.codes[90] ='z';
			this.codes[91] ='leftwindowkey';
			this.codes[92] ='rightwindowkey';
			this.codes[93] ='selectkey';
			this.codes[96] ='numpad0';
			this.codes[97] ='numpad1';
			this.codes[98] ='numpad2';
			this.codes[99] ='numpad3';
			this.codes[100]='numpad4';
			this.codes[101]='numpad5';
			this.codes[102]='numpad6';
			this.codes[103]='numpad7';
			this.codes[104]='numpad8';
			this.codes[105]='numpad9';
			this.codes[106]='multiply';
			this.codes[107]='add';
			this.codes[109]='subtract';
			this.codes[110]='decimalpoint';
			this.codes[111]='divide';
			this.codes[112]='f1';
			this.codes[113]='f2';
			this.codes[114]='f3';
			this.codes[115]='f4';
			this.codes[116]='f5';
			this.codes[117]='f6';
			this.codes[118]='f7';
			this.codes[119]='f8';
			this.codes[120]='f9';
			this.codes[121]='f10';
			this.codes[122]='f11';
			this.codes[123]='f12';
			this.codes[144]='numlock';
			this.codes[145]='scrolllock';

			//"Nintendo Wii"
			this.codes[175]='Up (Wii?)';			//(CAUTION! ALSO SCROLLS UP)
			this.codes[176]='Down (Wii?)';		//(CAUTION! ALSO SCROLLS UP)
			this.codes[177]='Left (Wii?)';			//(CAUTION! ALSO SCROLLS UP)
			this.codes[178]='Right (Wii?)';			//(CAUTION! ALSO SCROLLS UP)

			this.codes[170]='- (Wii?)';		//(CAUTION! ALSO ZOOMS OUT)
			this.codes[174]='+ (Wii?)';		//(CAUTION! ALSO ZOOMS IN)
			this.codes[172]='1 (Wii?)';		//
			this.codes[173]='2 (Wii?)';		//(CAUTION! ALSO SPLITS SCREEN INTO SINGLE COLUMN MODE)


			/*
			PS3:
			Platform: "PLAYSTATION 3"
			Up: 38
			Down: 40
			Left: 37
			Right: 39
			X: 63 (CAUTION! ALSO CLICKS)
			Nintendo 3ds:
			Platform: "Nintendo 3ds"
			Up: 38
			Down: 40
			Left: 37
			Right: 39
			LG Smart TV:
			Platform: "Linux 35230"
			0-9: 48-57
			Play: 445
			Pause: 19
			Rewind: 412
			FF: 417
			*/


			this.codes[186]='semi-colon';
			this.codes[187]='equalsign';
			this.codes[188]='comma';
			this.codes[189]='dash';
			this.codes[190]='period';
			this.codes[191]='forwardslash';
			this.codes[192]='graveaccent';
			this.codes[219]='openbracket';
			this.codes[220]='backslash';
			this.codes[221]='closebraket';
			this.codes[222]='singlequote';

		},

		/*
		
			Check if keyboard key is pressed
		
		*/
		
		keyboardCheck:function(code){

			var e = this.codeList.length-1;
			for (var i = e;i>=0;--i)
				if (this.codeList[i]==code)
					return true;

		return false;
		},

		/*
		
			Add code to array
		
		*/
		
		keyboardPop:function(code){
				var e = this.codeList.length-1;
				for (var i = e;i>=0;--i)
					if (this.codeList[i]==code)
						this.codeList[i] = null;
		},

		/* 
			Unused? Legacy Functions
		*/

		mouse:function() {
			
			if (!App.input.pressed)
				App.input.dist =  App.client.Math.Vector.Difference(App.ext.input,App.input.start);
			
		},
		mouse_distance:function() {
			
			if (!App.input.pressed)
				App.input.dist =  App.client.Math.Vector.Difference(App.input.start,App.input.end);
			
		},
		touch_distance:function(touch) {
			
			if (!touch)
				return;
			App.input.x = touch.pageX||touch.clientX;
			App.input.y = touch.pageY||touch.clientX;
			//if (!App.input.input.pressed)
				App.input.dist =  App.client.Math.Vector.Difference(App.input.start,App.input.end);
			
		},
		
	};
SpiceInput.constructor = function(app){

						return{
							
							//
							app:{writable:true, configurable:true, enumerable:false, value:app},
							//
							getX:{writable:false, configurable:false, enumerable:false, value:function(){return this.x;}},
							//
							getY:{writable:false, configurable:false, enumerable:false, value:function(){return this.y;}},
							//
							getLastX:{writable:false, configurable:false, enumerable:false, value:function(){return this.last.x;}},
							//
							getLastY:{writable:false, configurable:false, enumerable:false, value:function(){return this.last.y;}},
							//
							getStartX:{writable:false, configurable:false, enumerable:false, value:function(){return this.start.x;}},
							//
							getStartY:{writable:false, configurable:false, enumerable:false, value:function(){return this.start.y;}},
							//
							getDuration:{writable:false, configurable:false, enumerable:false, value:function(){return this.duration;}},
							//
							getTouched:{writable:false, configurable:false, enumerable:false, value:function(){return this.touch;}},
							//
							getPressed:{writable:false, configurable:false, enumerable:false, value:function(){return this.pressed;}},
							//
							getReleased:{writable:false, configurable:false, enumerable:false, value:function(){return this.released;}},
							//
							getPosition:{writable:false, configurable:false, enumerable:false, value:function(canvas,evt) {
								if ((!canvas)||(!evt))
										return false;
								return {x: evt.clientX,y: evt.clientY};
							}},
							//
							getAngle:{writable:false, configurable:false, enumerable:false, value: function(){

								//Convert to degrees
								return 57.2957795 * Math.atan2(this.end.y-this.start.y,this.end.x-this.start.x);
							}},
							//
							getAngleDistance:{writable:false, configurable:false, enumerable:false, value: function(){

								//Return the delta between x and y
								var delta = (this.dist.x*this.dist.x+this.dist.y*this.dist.y)/2;
								return delta;
							}},
							//
							getHorizontal:{writable:false, configurable:false, enumerable:false, value:function(){

								var wasd = this.app.input.keyboardCheck("a") - this.app.input.keyboardCheck("d");
								var arrows = this.app.input.keyboardCheck("leftarrow") - this.app.input.keyboardCheck("rightarrow") ;
								var mouse = -this.getPressed()*this.app.input.dist.x;
								var touch = -this.getTouched()*this.app.input.dist.x;


								var keyboard = this.app.client.Math.Clamp(wasd || arrows,-1,1);
								var touched = this.app.client.Math.Clamp(mouse || touch,-1,1);

								return {keyboard:keyboard,touch:touched};
							}},
							//
							getVertical:{writable:false, configurable:false, enumerable:false, value:function(){

								var wasd = this.app.input.keyboardCheck("s") - this.app.input.keyboardCheck("w");
								var arrows = this.app.input.keyboardCheck("downarrow") - this.app.input.keyboardCheck("uparrow");
								var mouse = this.getPressed()*this.app.input.dist.y;
								var touch = this.getTouched()*this.app.input.dist.y;


								var keyboard = this.app.client.Math.Clamp(wasd || arrows,-1,1);
								var touched = this.app.client.Math.Clamp(mouse || touch,-1,1);

								return {keyboard:keyboard,touch:touched};
							}},

						}
					};