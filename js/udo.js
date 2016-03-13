(function udo() {

	var player;
	var platforms;
	var cursors;

	var docs;
	var gdocs;
	var score = 0;
	var scoreText;
	var docText;

	var docTitles = ['Project charter', 'Operation Manual', ' Risk Analysis',
					 'Project plan', 'Budget'];

	function resetLevel() {
		game.allDocsCollected = false;
		game.udoExiting = false;
		game.nowExit = false;
		game.nextLevel = false;
	}

	function setupControls() {
 		cursors = game.input.keyboard.createCursorKeys();
 	}

	var stateLoad = {

		preload: function() {

			var loadingLabel = game.add.text(80, 150, 'Loading...', {font: '30px Courier', fill: '#ffffff'});

			game.load.image('udo-bg', 'assets/udo.png');
		    game.load.image('sky', 'assets/sky.png');
			game.load.image('daytime', 'assets/daytime.png');
		    game.load.image('ground', 'assets/platform.png');
		    game.load.image('doc', 'assets/doc.png');
			game.load.image('exit', 'assets/exit.png');
		    game.load.spritesheet('dude', 'assets/dude2.png', 50, 50);
			game.load.spritesheet('gate', 'assets/gate.png', 45, 60);
			game.load.audio('jump', 'assets/jump.mp3');
			game.load.audio('music', 'assets/music.mp3');
			game.load.audio('open', 'assets/open.mp3');
			game.load.audio('gling', 'assets/gling.mp3');
			game.load.audio('win', 'assets/win.mp3');
			setupControls();
		},

		create: function() {
			game.state.start('intro');
		}
	};

	function click2start(level) {
		if(cursors.left.isDown || cursors.right.isDown ||
		   cursors.down.isDown || cursors.up.isDown     ) {
			   game.state.start(level);
		   }
	}


	var stateIntro = {
		create: function() {
			game.add.sprite(0, 0, 'udo-bg');
		},

		update: function() {
			click2start('play1');
		}
	};

	function setupGameWorld(width, height, bgpic){

		game.world.setBounds(0, 0, width, height);

		//  We're going to be using physics, so enable the Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//  A simple background for our game
		game.add.sprite(0, 0, bgpic);

		//  The platforms group contains the ground and the 2 ledges we can jump on
		platforms = game.add.group();

		//  We will enable physics for any object that is created in this group
		platforms.enableBody = true;

		// Here we create the ground.
		var ground = platforms.create(0, game.world.height - 100, 'ground');

		//  Scale it to fit the width of the game (the original sprite is 400x32 in size)
		ground.scale.setTo(2, 2);

		//  This stops it from falling away when you jump on it
		ground.body.immovable = true;

		//  Now let's create two ledges
		var ledge = platforms.create(400, 400, 'ground');
		ledge.body.immovable = true;

		ledge = platforms.create(-150, 250, 'ground');
		ledge.body.immovable = true;
	}

	function setupUdo() {
		// The player and its settings
		player = game.add.sprite(32, game.world.height - 150, 'dude');

		//  We need to enable physics on the player
		game.physics.arcade.enable(player);

		//  Player physics properties. Give the little guy a slight bounce.
		player.body.bounce.y = 0.2;
		player.body.gravity.y = 400;

		player.body.collideWorldBounds = true;

		//  Our two animations, walking left and right.
		player.animations.add('left', [0, 1, 2, 3], 10, true);
		player.animations.add('right', [5, 6, 7, 8], 10, true);

	}

	function setupGate() {
		gate = game.add.sprite(740, game.world.height - 160, 'gate');
		gate.animations.add('open', [1, 2, 3, 4], 100, false);
		gate.frame = 0;
		// To detect the collision with Udo at the end of the level
		game.physics.arcade.enable(gate);
		gate.body.immovable = true;
	}

	function setupDocs() {
		docs = game.add.group();
		// A group for the doc ghosts
		gdocs = game.add.group();

		//  We will enable physics for any doc that is created in this group
		docs.enableBody = true;

		//  Here we'll create 5 of them evenly spaced apart
		for (var i = 0; i < 5; i++)
		{
			//  Create a doc inside of the 'docs' group
			var doc = docs.create(i * 160, 0, 'doc');

			//  Let gravity do its thing
			doc.body.gravity.y = 300;

			//  This just gives each doc a slightly random bounce value
			doc.body.bounce.y = 0.5 + Math.random() * 0.15;
		}
	}

	function setupText() {
		scoreText = game.add.text(16, 16, 'score: 0', {  font: '14px Quantico', fill: '#00ff00'});
		docText = game.add.text(670, 16, '', {  font: '14px Quantico', fill: '#00ff00'});
		docText.align = 'right';
	}

	function setupAudio() {
		// sounds
		audioWin = game.add.audio('win');
		audioDoor = game.add.audio('open');
		audioGling = game.add.audio('gling');
		audioJump = game.add.audio('jump');
		audioBg = game.add.audio('music', 1, true);
		audioBg.play();
	}

	function collectDoc (player, doc) {

		// Removes the doc from the screen
		var gx = doc.x;
		var gy = doc.y;
		doc.kill();
		audioGling.play();

		var docGhost = gdocs.create(gx, gy, 'doc');
		game.add.tween(docGhost.scale).to({x:0, y:0}, 150).start();
		game.add.tween(docGhost).to({y:(doc.y)-50}, 150).start();

		//  Add and update the score
		score += 10;
		scoreText.text = 'Score: ' + score;

		var i = (score / 10) - 1;
		if (i < docTitles.length) {
			docText.text += docTitles[i] + '\n';
		}
		if (i == (docTitles.length-1)) {
			game.allDocsCollected = true;

			gate.animations.play('open');
			audioDoor.play();

			exitLight = game.add.sprite(760, game.world.height - 180, 'exit');
			exitLight.anchor.setTo(0.5);
			game.add.tween(exitLight.scale).to({x : 0.5, y : 0.5},500,null,true,0,100,true);
		}
	}

	function endLevelCb (player, gate) {
		if (game.allDocsCollected) {
			//docText.text = "Well Done!";
			game.nowExit = true;
		}
	}

	function ifUdoMiddleDoor (player, gate) {
		// Checks that Udo goes farther than the collision point
		return ((735 < player.x) && (player.x < 745));
	}

	function levelCompleted(){
		//player.destroy();
		audioBg.stop();
		var style = { font: "90px Bangers", fill: "#ffffff", align: "center" };
		var text = game.add.text(game.world.centerX, game.world.centerY, "Well done,\nUdo!", style);
		text.anchor.set(0.5);
		audioWin.play();
		game.nextLevel = true;
	}

	function setupCamera() {
		game.camera.follow(player);
	}

	var statePlay1 = {

		create: function() {
			setupGameWorld(800, 600, 'sky');
		    setupGate();
			setupUdo();
			setupDocs();
			setupText();
			setupAudio();
			//setupControls();
		},

		update: function() {

			game.physics.arcade.collide(player, platforms);

			if (!game.nowExit) {
				//  Collide the player and the docs with the platforms
			    game.physics.arcade.collide(docs, platforms);

			    //  Checks to see if the player overlaps with any of the docs, if he does call the collectDoc function
			    game.physics.arcade.overlap(player, docs, collectDoc, null, this);

				//game.physics.arcade.collide(player, gate);
				game.physics.arcade.overlap(player, gate, endLevelCb, ifUdoMiddleDoor, this);

			    //  Reset the players velocity (movement)
			    player.body.velocity.x = 0;

				//  Allow the player to jump if they are touching the ground.
			    if (cursors.up.isDown && player.body.touching.down)
			    {
			        player.body.velocity.y = -350;
					audioJump.play();
			    }

			    if (cursors.left.isDown)
			    {
			        //  Move to the left
			        player.body.velocity.x = -150;
			        player.animations.play('left');
			    }
			    else if (cursors.right.isDown)
			    {
			        //  Move to the right
			        player.body.velocity.x = 150;
			        player.animations.play('right');
			    }
			    else
			    {
			        //  Stand still
			        player.animations.stop();
			        player.frame = 4;
			    }
			}
			else {
				if(!game.udoExiting) {
					player.animations.stop();
					player.frame = 9;
					var disappears = game.add.tween(player.scale).to({x:0.7, y:0.7}).start();
					disappears.onComplete.addOnce(levelCompleted);
					game.udoExiting = true;
				}
			}

			if (game.nextLevel) {
				click2start('play2');
			}

		}
	};

	var statePlay2 = {

		create: function() {
			resetLevel();
			setupGameWorld(1024, 800, 'daytime');
		    setupGate();
			setupUdo();
			setupCamera();
			setupDocs();
			setupText();
			setupAudio();
			setupControls();
		},

		update: function() {

			game.physics.arcade.collide(player, platforms);

			if (!game.nowExit) {
				//  Collide the player and the docs with the platforms
			    game.physics.arcade.collide(docs, platforms);

			    //  Checks to see if the player overlaps with any of the docs, if he does call the collectDoc function
			    game.physics.arcade.overlap(player, docs, collectDoc, null, this);

				//game.physics.arcade.collide(player, gate);
				game.physics.arcade.overlap(player, gate, endLevelCb, ifUdoMiddleDoor, this);

			    //  Reset the players velocity (movement)
			    player.body.velocity.x = 0;

				//  Allow the player to jump if they are touching the ground.
			    if (cursors.up.isDown && player.body.touching.down)
			    {
			        player.body.velocity.y = -350;
					audioJump.play();
			    }

			    if (cursors.left.isDown)
			    {
			        //  Move to the left
			        player.body.velocity.x = -150;
			        player.animations.play('left');
			    }
			    else if (cursors.right.isDown)
			    {
			        //  Move to the right
			        player.body.velocity.x = 150;
			        player.animations.play('right');
			    }
			    else
			    {
			        //  Stand still
			        player.animations.stop();
			        player.frame = 4;
			    }
			}
			else {
				if(!game.udoExiting) {
					player.animations.stop();
					player.frame = 9;
					var disappears = game.add.tween(player.scale).to({x:0.7, y:0.7}).start();
					disappears.onComplete.addOnce(levelCompleted);
					game.udoExiting = true;
				}
			}

		}
	};

	var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
	game.state.add('load', stateLoad);
	game.state.add('intro', stateIntro);
	game.state.add('play1', statePlay1);
	game.state.add('play2', statePlay2);

	game.state.start('load');

})();
