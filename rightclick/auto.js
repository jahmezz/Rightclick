var AATK = (function()	{

	//champion object
	var champ = {
		cooldown: 1700,
		moveSpeed: 180, //move speed in pixels per second
		speedx: 0,
		speedy: 0,
	};

	//hud object
	var hud = 	{
		cooldown: 0
	};

	//initialize canvas
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext("2d");
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	document.body.appendChild(canvas);
	var timerDiv = document.createElement("div");
	timerDiv.innerHTML=hud.cooldown;
	document.body.appendChild(timerDiv);
	// Cross-browser support for requestAnimationFrame
	var w = window;
	requestAnimationFrame = w.requestAnimationFrame ||
	w.webkitRequestAnimationFrame || w.msRequestAnimationFrame ||
	w.mozRequestAnimationFrame;

	//right click move
	canvas.oncontextmenu = function(e)	{
		champ.destx = e.pageX;
		champ.desty = e.pageY;
		var distancex = champ.destx-champ.x;
		var distancey = champ.desty-champ.y;
		total = Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2));
		champ.travelTime = total/champ.moveSpeed;
		hud.blinktime = 0.25;

		if(!champ.canShoot)
		hud.cooldown = champ.cooldown;
		champ.speedx=distancex/champ.travelTime;
		champ.speedy=distancey/champ.travelTime;
		return false;
	}

	//Set current time
	var then = Date.now();

	//initialize champ location
	function init()	{
		champ.x = canvas.width/2;
		champ.y = canvas.height/2;
		champ.destx = champ.x;
		champ.desty = champ.y;
		gameLoop();
	}

	//main game loop
	function gameLoop()	{
		var now = Date.now();
		var msElapsed = now - then;

		update(msElapsed/1000);
		render();

		then = now;

		// Differential framerate
		requestAnimationFrame(gameLoop);
	}

	//update game logic
	function update(secondsPassed)	{
		champ.x+=champ.speedx*secondsPassed;
		champ.y+=champ.speedy*secondsPassed;
		champ.travelTime-=secondsPassed;
		hud.blinktime-=secondsPassed;
		if(champ.travelTime <= 0)	{
			champ.x = champ.destx;
			champ.y = champ.desty;
			champ.speedx=champ.speedy=0;
		}
		if(hud.cooldown > 0)	{
			hud.cooldown -= secondsPassed*1000;
			hud.percentCd = (champ.cooldown-hud.cooldown)/champ.cooldown;
		}
		else {
			hud.cooldown=0;
		}
	}

	//draw game
	function render()	{
		//refresh screen
		ctx.clearRect(0,0,canvas.width, canvas.height);
		//cooldown indicator
		ctx.beginPath();
		ctx.strokeStyle="black";
		ctx.arc(canvas.width-100, canvas.height-100, 50,
			0, 2*Math.PI*hud.percentCd);
		ctx.stroke();
		//champ
		ctx.beginPath();
		ctx.arc(champ.x, champ.y, 20, 0, 2*Math.PI);
		ctx.fill();
		//destination marker
		if(hud.blinktime > 0)	{
			ctx.beginPath();
			ctx.arc(champ.destx, champ.desty, 20*(hud.blinktime*4), 0, 2*Math.PI);
			ctx.strokeStyle="#FF0000";
			ctx.stroke();
		}
	}

	//public functions
	return	{
		init: init,
		update: update,
		render: render
	}
})();

//start game
AATK.init();