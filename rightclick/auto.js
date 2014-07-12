var AATK = (function()	{

	//champion object
	var champ = {
		cooldown: 1700,
		moveSpeed: 180, //move speed in pixels per second
		x: 0,
		y: 0,
		destx: 0,
		desty: 0,
		speedx: 0,
		speedy: 0,
		travelTime: 0,
		blinktime: 0,
		canShoot: true,
		showRange: false,
		attackRange: 200,
		target: null,
		aMove: false,
		stop: function()	{
			this.destx=this.x;
			this.desty=this.y;
			this.speedx=this.speedy=this.travelTime=0;
			this.aggro=false;
			this.stopped=true;
			this.target=-1;
			this.showRange=false;
		}
	};



	//heads-up display object
	var display = 	{
		cooldown: 0
	};

	//initialize canvas
	var canvas = document.createElement('canvas');
	canvas.setAttribute('tabindex','0');
	
	var ctx = canvas.getContext("2d");
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	document.body.appendChild(canvas);

	// Cross-browser support for requestAnimationFrame
	var w = window;
	requestAnimationFrame = w.requestAnimationFrame ||
	w.webkitRequestAnimationFrame || w.msRequestAnimationFrame ||
	w.mozRequestAnimationFrame;
	canvas.focus();

	var enemy = [];

	function initEnemies()	{
		var enemyCount = 4;
		for(var i = 0; i < enemyCount; i++)	{
			enemy[i] = new Enemy(2*canvas.width/3, (i+1)*canvas.height/(enemyCount+1));
		}
	};
	
	function Enemy(x, y)	{
		this.x = x;
		this.y = y;
	};

	//press a for attack
	canvas.addEventListener("keydown", keyDownListener);
	canvas.addEventListener("mouseup", clickListener);

	function keyDownListener(e)	{
		var code = e.keyCode;
		switch(code)	{
			case 65: champ.showRange = true; break;
			case 83: champ.stop(); break;
		}
	};

	//right click move
	canvas.oncontextmenu = function(e)	{return false;};
	canvas.onselectstart = function(e){return false};

	function clickListener(e)	{
		var clickx = e.pageX;
		var clicky = e.pageY;
		switch(e.which)	{
			case 1:
				if(champ.showRange)	{
					champ.showRange = false;
					champ.aggro = true;
					champ.aMove = true;
					champ.stopped=false;
					champ.target = findTarget(champ.x, champ.y);
					registerMove(clickx, clicky);
				}
				break;

			case 3:
				champ.showRange=false;
				champ.stopped=false;
				champ.aggro = clickedEnemy(clickx, clicky);
				registerMove(clickx, clicky);
			break;
		}
	};

	function clickedEnemy(x, y)	{
		for(var i = 0; i < enemy.length; i++)	{
			if(Math.abs(enemy[i].x-x) <= 20 && Math.abs(enemy[i].y-y) <= 20)	{
				champ.target = i;
				return true;
			}
		}
		champ.target = -1;
		return false;
	};

	function findTarget(x, y)	{
		//first we gather the enemies in range
		var enemiesInRange = inRange(x, y);
		//then, we pick the closest to the champ
		if(enemiesInRange.length > 0) return nearestEnemy(enemiesInRange);
		//if no one in range, then no target
		else return -1;
	};

	function inRange(x, y)	{
		var enemiesInRange = [];
		for(var i = 0; i < enemy.length; i++)	{
			var distancex = enemy[i].x-champ.x;
			var distancey = enemy[i].y-champ.y;
			var distance = Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2));
			if(distance <= champ.attackRange)	{
				enemiesInRange[enemiesInRange.length] = i;
			}
		}
		return enemiesInRange;
	};

	function nearestEnemy(enemiesInRange)	{
		var enemyIndex = enemiesInRange[0];
		console.log(enemyIndex);
		var distancex = enemy[enemyIndex].x-champ.x;
		var distancey = enemy[enemyIndex].y-champ.y;
		var nearest = enemyIndex;
		var minDistance = Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2));
		console.log("first element " + enemyIndex);
		for(var i = 0; i < enemiesInRange.length; i++)	{
			enemyIndex = enemiesInRange[i];
			distancex = enemy[enemyIndex].x-champ.x;
			distancey = enemy[enemyIndex].y-champ.y;
			var thisDistance = Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2));
			console.log(enemyIndex + ": " + thisDistance);
			if(thisDistance < minDistance)	{
				nearest = enemyIndex;
				console.log(nearest);
				minDistance = thisDistance;
			}
		}
		return nearest;
	};

	function registerMove(x, y)	{
		champ.destx = x;
		champ.desty = y;
		var distancex = champ.destx-champ.x;
		var distancey = champ.desty-champ.y;
		total = Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2));
		champ.travelTime = total/champ.moveSpeed;
		display.blinktime = 0.25;

		//shoot event
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
		initEnemies();
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
		if(champ.aggro && champ.target === -1)	{
			champ.target = findTarget(champ.x, champ.y);
		}
		if(champ.travelTime <= 0 && !champ.stopped)	{
			champ.x = champ.destx;
			champ.y = champ.desty;
			champ.speedx=champ.speedy=0;
			champ.aggro = true;
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
		ctx.fillStyle="black";
		ctx.arc(champ.x, champ.y, 20, 0, 2*Math.PI);
		ctx.fill();
		//attack range
		if(champ.showRange)	{
			ctx.beginPath();
			ctx.save();
			ctx.globalAlpha = 0.1;
			ctx.fillStyle="blue";
			ctx.arc(champ.x, champ.y, champ.attackRange, 0, 2*Math.PI);
			ctx.fill();
			ctx.arc(champ.x, champ.y, champ.attackRange-5, 0, 2*Math.PI);
			ctx.lineWidth=5;
			ctx.stroke();
			ctx.restore();
		}
		//destination marker
		if(champ.aggro)	ctx.strokeStyle="#FF0000";
		else ctx.strokeStyle = "lightgreen";
		if(display.blinktime > 0)	{
			ctx.beginPath();
			ctx.arc(champ.destx, champ.desty, 20*(display.blinktime*4), 0, 2*Math.PI);
			ctx.stroke();
		}

		//draw enemies
		for(i = 0; i < enemy.length; i++)	{
			//enemy
			ctx.beginPath();
			if(champ.target === i) ctx.fillStyle = "red";
			else ctx.fillStyle = "black";
			ctx.arc(enemy[i].x, enemy[i].y, 20, 0, 2*Math.PI);
			ctx.fill();
		}
		requestAnimationFrame(drawLoop);
	}

	//public functions
	return	{
		champ: champ,
		init: init,
		update: update,
		drawLoop: drawLoop,
		inRange: inRange,
		nearestEnemy: nearestEnemy
	}
})();

//start game
AATK.init();