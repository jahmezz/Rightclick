var AATK = (function()	{

	//champion object
	var champ = {
		cooldown: 1700,
		moveSpeed: 160, //move speed in pixels per second
		travelTime: 0,
		blinktime: 0,
		speedx: 0,
		speedy: 0,
		attackRange: 200,
		target: null,
		aMove: false,
		state: "",
		stop: function()	{
			this.destx=this.x;
			this.desty=this.y;
			this.speedx=this.speedy=this.travelTime=0;
			this.aggro=false;
			display.blinktime=0;
			this.stopped=true;
			this.target=-1;
			this.showRange=false;
		},

	};

	function Enemy(x, y)	{
		this.x = x;
		this.y = y;
	};

	//heads-up display object
	var display = 	{
		cooldown: champ.cooldown
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
	canvas.onselectstart = function(e)	{return false;};

	function clickListener(e)	{
		var clickx = e.pageX;
		var clicky = e.pageY;
		switch(e.which)	{
			case 1:
				if(champ.showRange)	{
					champ.showRange = false;
					champ.state="aMove";
					registerMove(clickx, clicky);
				}
				break;

			case 3:
				champ.showRange = false;
				champ.state = "move";
				champ.target = clickedEnemy(clickx, clicky);
				champ.state = (champ.target > -1) ? "attack" : "move";
				registerMove(clickx, clicky);
			break;
		}
	};

	function clickedEnemy(x, y)	{
		for(var i = 0; i < enemy.length; i++)	{
			if(Math.abs(enemy[i].x-x) <= 20 && Math.abs(enemy[i].y-y) <= 20)	{
				champ.target = i;
				return i;
			}
		}
		return -1;
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
			var distancex = Math.abs(enemy[i].x-champ.x)-20;
			var distancey = Math.abs(enemy[i].y-champ.y)-20;
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

	//inputs click location as move
	function registerMove(x, y)	{
		//set up champ move
		champ.destx = x;
		champ.desty = y;
		var distancex = champ.destx-champ.x;
		var distancey = champ.desty-champ.y;
		total = Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2));
		champ.travelTime = total/champ.moveSpeed;
		champ.speedx=distancex/champ.travelTime;
		champ.speedy=distancey/champ.travelTime;

		//add destination marker
		display.blinkx=champ.destx;
		display.blinky=champ.desty;
		display.blinkTime = 0.25;

	};

	//returns whether champ's target is in range
	function targetInRange(target)	{
		if(target < 0) return false;
		var distancex = Math.abs(enemy[target].x-champ.x)-20;
		var distancey = Math.abs(enemy[target].y-champ.y)-20;
		var distance = Math.sqrt(Math.pow(distancex,2)+Math.pow(distancey,2));
		if(distance <= champ.attackRange)	{
			return true;
		}
		return false;
	};

	//update game logic
	function update(secondsPassed)	{

		display.blinkTime -= secondsPassed;
		//attack
		switch(champ.state)	{
			//right-click enemy
			case "attack":
				//in range
				if(targetInRange(champ.target) && champ.canShoot)	{
					//begin shot
					champ.speedx=champ.speedy=0;
					display.attackCast += secondsPassed*1000;
					if(display.attackCast >= champ.cooldown*.2)	{
						champ.canShoot=false;
						display.cooldown=0;
						display.attackCast=0;
					}
				}
				//not in range
				else {
					//move towards destination
					moveStep(secondsPassed);
				}
				break;
			//move
			case "move":
				//move towards destination
				moveStep(secondsPassed);
				break;
			//idle
			case "idle":
				break;
			//attack move
			case"aMove":
				moveStep(secondsPassed);
				break;
			//stop
			case "stop":
				break;
		}
		//reach destination
		if(champ.travelTime <= 0)	{
			champ.state==="idle";
			champ.travelTime=0;
			champ.speedx=champ.speedy=0;
		}

//		if(champ.state==="aMove" && champ.target === -1)	{
//			champ.target = findTarget(champ.x, champ.y);
//		}
		
		//display logic
		//cooldown
		if(display.cooldown < champ.cooldown)	{
			display.cooldown += secondsPassed*1000;
		}
		else {
			display.cooldown=champ.cooldown;
			champ.canShoot = true;
		}
		display.percentCd = display.cooldown/champ.cooldown;
	};

	//represents moving for a certain amount of time
	function moveStep(secondsPassed)	{
		champ.x += champ.speedx*secondsPassed;
		champ.y += champ.speedy*secondsPassed;
		champ.travelTime -= secondsPassed;
	}

	//draw game
	function drawLoop()	{
		//refresh screen
		ctx.clearRect(0,0,canvas.width, canvas.height);
		//attack casting time
		if(display.attackCast > 0)	{
			//box
			ctx.beginPath();
			ctx.strokeStyle="black";
			//progress

		}
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
		if(champ.state === "aMove" || champ.state === "attack")	ctx.strokeStyle="#FF0000";
		else ctx.strokeStyle = "lightgreen";
		if(display.blinkTime > 0)	{
			ctx.beginPath();
			ctx.arc(display.blinkx, display.blinky, 20*(display.blinkTime*4), 0, 2*Math.PI);
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

	var fps = 50;
	//main game loop
	function gameLoop()	{
		var now = Date.now();
		var msElapsed = now - then;

		update(msElapsed/1000)
		then = now;

		// Constant
		setTimeout(gameLoop, 1000/fps);
	};

	//Set current time
	var then = Date.now();

	//initialize champ location
	function init()	{
		champ.x = canvas.width/2;
		champ.y = canvas.height/2;
		champ.destx = champ.x;
		champ.desty = champ.y;
		champ.canShoot = true;
		champ.showRange = false;
		display.attackCast = 0;
		requestAnimationFrame(drawLoop);
		initEnemies();
		gameLoop();
	};

	//public functions
	return	{
		champ: champ,
		display: display,
		init: init,
		update: update,
		drawLoop: drawLoop,
		inRange: inRange,
		nearestEnemy: nearestEnemy
	}
})();

//start game
AATK.init();
