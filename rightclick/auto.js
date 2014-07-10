var AATK = (function()	{

	//champion object
	var champ = {
		cooldown: 1700,
		moveSpeed: 180, //move speed in pixels per second
		speedx: 0,
		speedy: 0,
		canShoot: true,
		showRange: false,
		attackRange: 200

	};

	//heads-up display object
	var display = 	{
		cooldown: 0
	};

	//initialize canvas
	var canvas = document.createElement('canvas');
	canvas.setAttribute('tabindex','0');
	canvas.focus();
	var ctx = canvas.getContext("2d");
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	document.body.appendChild(canvas);
	var timerDiv = document.createElement("div");
	timerDiv.innerHTML=display.cooldown;
	document.body.appendChild(timerDiv);
	// Cross-browser support for requestAnimationFrame
	var w = window;
	requestAnimationFrame = w.requestAnimationFrame ||
	w.webkitRequestAnimationFrame || w.msRequestAnimationFrame ||
	w.mozRequestAnimationFrame;


	//press a for attack
	canvas.addEventListener("keydown", keyDownListener);

	function keyDownListener(e)	{
		var code = e.keyCode;
		switch(code)	{
			case 65: champ.showRange = true;
		}
	}
	//right click move
	canvas.oncontextmenu = function(e)	{
		if(champ.showRange)	{
			champ.showRange=false;
			return false;
		}
		champ.destx = e.pageX;
		champ.desty = e.pageY;
		var distancex = champ.destx-champ.x;
		var distancey = champ.desty-champ.y;
		total = Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2));
		champ.travelTime = total/champ.moveSpeed;
		display.blinktime = 0.25;

		if(champ.canShoot)	{
			display.cooldown = champ.cooldown;
		}

		champ.canShoot = false;
		champ.speedx=distancex/champ.travelTime;
		champ.speedy=distancey/champ.travelTime;
		return false;
	};

	//Set current time
	var then = Date.now();

	//initialize champ location
	function init()	{
		champ.x = canvas.width/2;
		champ.y = canvas.height/2;
		champ.destx = champ.x;
		champ.desty = champ.y;
		requestAnimationFrame(drawLoop);
		gameLoop();
	};

	var fps = 50;
	//main game loop
	function gameLoop()	{
		var now = Date.now();
		var msElapsed = now - then;

		update(msElapsed/1000)
		then = now;

		// Constant
		setTimeout(gameLoop, msElapsed/1000);
	};

	//update game logic
	function update(secondsPassed)	{
		champ.x+=champ.speedx*secondsPassed;
		champ.y+=champ.speedy*secondsPassed;
		champ.travelTime-=secondsPassed;
		display.blinktime-=secondsPassed;
		if(champ.travelTime <= 0)	{
			champ.x = champ.destx;
			champ.y = champ.desty;
			champ.speedx=champ.speedy=0;
		}
		if(display.cooldown > 0)	{
			display.cooldown -= secondsPassed*1000;
			display.percentCd = (champ.cooldown-display.cooldown)/champ.cooldown;
		}
		else {
			display.cooldown=0;
			champ.canShoot = true;
		}
	};

	//draw game
	function drawLoop()	{
		//refresh screen
		ctx.clearRect(0,0,canvas.width, canvas.height);
		//cooldown indicator
		ctx.beginPath();
		ctx.strokeStyle="black";
		ctx.arc(canvas.width-100, canvas.height-100, 50,
			0-(Math.PI/2), -(Math.PI/2)+(2*Math.PI*display.percentCd));
		ctx.stroke();
		//champ
		ctx.beginPath();
		ctx.arc(champ.x, champ.y, 20, 0, 2*Math.PI);
		ctx.fill();
		//attack range
		if(champ.showRange)	{
			ctx.beginPath();
			ctx.save();
			ctx.globalAlpha = 0.3;
			ctx.fillStyle="blue";
			ctx.arc(champ.x, champ.y, champ.attackRange, 0, 2*Math.PI);
			ctx.fill();
			ctx.restore();
		}
		//destination marker
		if(display.blinktime > 0)	{
			ctx.beginPath();
			ctx.arc(champ.destx, champ.desty, 20*(display.blinktime*4), 0, 2*Math.PI);
			ctx.strokeStyle="#FF0000";
			ctx.stroke();
		}
		requestAnimationFrame(drawLoop);
	}

	//public functions
	return	{
		champ: champ,
		init: init,
		update: update,
		drawLoop: drawLoop
	}
})();

//start game
AATK.init();