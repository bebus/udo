(function udo() {

    var player;
    var platforms;
    var cursors;

    var docs;
    var gdocs;
    var score = 0;
    var scoreGlobal = 0;
    var scoreText;
    var docText;
    var virtualInput = {right: false, left: false, up: false, down: false};
    var virtualInputTm;

    var docTitles = ['Project charter', 'Operation Manual', ' Risk Analysis',
        'Project plan', 'Budget'
    ];

    function resetLevel() {
        game.allDocsCollected = false;
        game.udoExiting = false;
        game.nowExit = false;
        game.nextLevel = false;
        score = 0;
        bugs = 0;
    }

    function onTap(pointer, doubleTap) {
        if (player) {
            clearTimeout(virtualInputTm);
            if (!doubleTap) {
                if (pointer.x > (player.x + 20)) {
                    virtualInput.right = true;
                    virtualInput.left = false;
                }
                else if (pointer.x < (player.x - 20)) {
                    virtualInput.left = true;
                    virtualInput.right = false;
                }
                else {
                    virtualInput.left = false;
                    virtualInput.right = false;
                }
            }
            else {
                virtualInput.up = true;
            }
            virtualInputTm = setTimeout(function(){
                virtualInput.left = false;
                virtualInput.right = false;
                virtualInput.up = false;

            }, 200);
        }
        else {
            virtualInput.up = true;
        }
    }

    function onHold (pointer) {
        if (player) {
            if (pointer.x > (player.x + 20)) {
                virtualInput.target = pointer.x;
                virtualInput.right = true;
                virtualInput.left = false;
            }
            else if (pointer.x < (player.x - 20)) {
                virtualInput.target = pointer.x;
                virtualInput.left = true;
                virtualInput.right = false;
            }
        }
    }

    function mergedInputs() {
        var mergedInput = {};
        if (player) {
            if(virtualInput.hasOwnProperty('target')) {
                if (player.x < (virtualInput.target - 10)) {
                    mergedInput.left = false;
                    mergedInput.right = true;
                }
                else if (player.x > (virtualInput.target + 10)) {
                    mergedInput.left = true;
                    mergedInput.right = false;
                }
                else {
                    mergedInput.left = false;
                    mergedInput.right = false;
                    delete(virtualInput.target)
                }
            }
        }
        mergedInput.left = virtualInput.left | cursors.left.isDown;
        mergedInput.right = virtualInput.right | cursors.right.isDown;
        mergedInput.up = virtualInput.up | cursors.up.isDown;
        return mergedInput;
    }

    function click2start(level) {
        var control = mergedInputs();
        if (control.left || control.right ||
            control.up) {
            game.state.start(level);
        }
    }

    function setupControls() {
        cursors = game.input.keyboard.createCursorKeys();
        game.input.onTap.add(onTap, this);
        game.input.onHold.add(onHold, this);
        virtualInput.left = false;
        virtualInput.right = false;
        virtualInput.up = false;
    }

    var stateLoad = {

        preload: function() {

            var loadingLabel = game.add.text(80, 150, 'Loading...', {
                font: '30px Courier',
                fill: '#ffffff'
            });

            game.load.image('udo-bg', 'assets/udo.png');
            game.load.image('sky', 'assets/sky.png');
            game.load.image('daytime', 'assets/daytime.png');
            game.load.image('night', 'assets/night.png');
            game.load.image('ground', 'assets/platform.png');
            game.load.image('doc', 'assets/doc.png');
            game.load.image('exit', 'assets/exit.png');
            game.load.image('bug', 'assets/bug.png');
            game.load.spritesheet('dude', 'assets/dude2.png', 50, 50);
            game.load.spritesheet('gate', 'assets/gate.png', 45, 60);
            game.load.audio('jump', 'assets/jump.mp3');
            game.load.audio('music', 'assets/music.mp3');
            game.load.audio('open', 'assets/open.mp3');
            game.load.audio('gling', 'assets/gling.mp3');
            game.load.audio('win', 'assets/win.mp3');
            //setupControls();
        },

        create: function() {
            game.state.start('intro');
        }
    };


    var stateIntro = {
        create: function() {
            game.add.sprite(0, 0, 'udo-bg');
            setupControls();
        },

        update: function() {
            click2start('play1');
        }
    };

    function setupGameWorld(width, height, bgpic, ledgeConf) {

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
        var ground = platforms.create(0, game.world.height - 50, 'ground');

        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        var factor = width / 400; // size of platform.png
        ground.scale.setTo(factor, factor);

        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;

        //  Now let's create x ledges
        var ledge;
        for (var i = 0; i < ledgeConf.length; i++) {
            var conf = ledgeConf[i];
            ledge = platforms.create(conf.x, conf.y, conf.type);
            ledge.body.immovable = true;
        }
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
        gate = game.add.sprite(game.world.width - 60, game.world.height - 110, 'gate');
        gate.animations.add('open', [1, 2, 3, 4], 100, false);
        gate.frame = 0;
        // To detect the collision with Udo at the end of the level
        game.physics.arcade.enable(gate);
        gate.body.immovable = true;
    }

    function setupDocs(number) {
        docs = game.add.group();
        // A group for the doc ghosts
        gdocs = game.add.group();

        //  We will enable physics for any doc that is created in this group
        docs.enableBody = true;

        //  Here we'll create 5 of them evenly spaced apart
        for (var i = 0; i < number; i++) {
            //  Create a doc inside of the 'docs' group
            var doc = docs.create(i * (game.world.width / 5.1), 0, 'doc');

            //  Let gravity do its thing
            doc.body.gravity.y = 300;

            //  This just gives each doc a slightly random bounce value
            doc.body.bounce.y = 0.5 + Math.random() * 0.15;
        }
    }

    function setupBugs(number) {
      bugs = game.add.group();
      bugs.enableBody = true;
      for (var i=0; i<number; i++) {
        bug = bugs.create(800*Math.random(), 0, 'bug');
        bug.body.gravity.y = 5;
        bug.body.bounce.y = 0.5 + Math.random() * 0.15;
        bug.body.velocity.x = 20;
        bug.flyingright = true;
        bug.anchor.set(0.5, 0.5);
        bug.prevBugTime = game.time.now;
      }
    }

    function setupText() {
        scoreText = game.add.text(16, 16, 'score: 0', {
            font: '14px Quantico',
            fill: '#00ff00'
        });
        docText = game.add.text(670, 16, '', {
            font: '14px Quantico',
            fill: '#00ff00'
        });
        docText.align = 'right';
        scoreText.fixedToCamera = true;
        docText.fixedToCamera = true;
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

    function addScoreGlobal(val){
      scoreGlobal += val;
      scoreText.text = 'Score: ' + scoreGlobal;
    }

    function collectDoc(player, doc) {

        // Removes the doc from the screen
        var gx = doc.x;
        var gy = doc.y;
        doc.kill();
        audioGling.play();

        var docGhost = gdocs.create(gx, gy, 'doc');
        game.add.tween(docGhost.scale).to({
            x: 0,
            y: 0
        }, 150).start();
        game.add.tween(docGhost).to({
            y: (doc.y) - 50
        }, 150).start();

        //  Add and update the score
        score += 1;
        addScoreGlobal(10);

        if (score <= docTitles.length) {
            docText.text += docTitles[score - 1] + '\n';
        }
        if (score == docTitles.length) {
            game.allDocsCollected = true;

            gate.animations.play('open');
            audioDoor.play();

            exitLight = game.add.sprite((game.world.width - 40), game.world.height - 130, 'exit');
            exitLight.anchor.setTo(0.5);
            game.add.tween(exitLight.scale).to({
                x: 0.5,
                y: 0.5
            }, 500, null, true, 0, 100, true);
        }
    }

    function endLevelCb(player, gate) {
        if (game.allDocsCollected) {
            //docText.text = "Well Done!";
            game.nowExit = true;
        }
    }

    function ifUdoMiddleDoor(player, gate) {
        // Checks that Udo goes farther than the collision point
        return (((game.world.width - 65) < player.x) && (player.x < (game.world.width - 55)));
    }

    function levelCompleted() {
        //player.destroy();
        audioBg.stop();
        var style = {
            font: "90px Bangers",
            fill: "#ffffff",
            align: "center"
        };
        var text = game.add.text(game.camera.position.x, game.camera.position.y, "Well done,\nUdo!", style);
        text.anchor.set(0.5);
        //text.fixedToCamera = true;
        audioWin.play();
        game.nextLevel = true;
    }

    function setupCamera() {
        game.camera.follow(player);
    }

    function updateBugs() {
      if(bugs) {
        for (var i = 0, len = bugs.children.length; i < len; i++) {
          updateBug(bugs.children[i]);
        }
      }
    }

    function updateBug(mybug) {
        if ((game.time.now - mybug.prevBugTime) >= 200) {
          mybug.prevBugTime = game.time.now;
          if (mybug.y > player.y) {
            mybug.body.velocity.y -= 11 - 8*Math.random() ;
          }
          else {
            mybug.body.velocity.y += 14 - 8*Math.random() ;;
          }
          var v = mybug.body.velocity.x;
          var d = mybug.x - player.x;
          v -= (d/800)*22-4*Math.random();
          v = Math.max(v, -20);
          v = Math.min(v, 20);
          mybug.body.velocity.x = v;
          if (v<0 && mybug.flyingright) {
            mybug.scale.setTo(-1,1);
            mybug.flyingright = false;
          }
          else if (v>0 && !mybug.flyingright) {
            mybug.scale.setTo(1,1);
            mybug.flyingright = true;
          }
        }
    }

    function sufferBugBites() {
      if(!player.suffering) {
        var t = game.add.tween(player).to({alpha: 0}, 100).yoyo(true).repeat(4).start();
        t.onComplete.add(function(){
            player.suffering = false;
        })
        addScoreGlobal(-1);
        player.suffering = true;
      }
    }



    function updateRoutine() {

        var control = mergedInputs();

        game.physics.arcade.collide(player, platforms);

        if (!game.nowExit) {
            //  Collide the player and the docs with the platforms
            game.physics.arcade.collide(docs, platforms);
            game.physics.arcade.collide(bugs, platforms);
            updateBugs();

            //  Checks to see if the player overlaps with any of the docs, if he does call the collectDoc function
            game.physics.arcade.overlap(player, docs, collectDoc, null, this);
            game.physics.arcade.overlap(player, bugs, sufferBugBites, null, this);

            //game.physics.arcade.collide(player, gate);
            game.physics.arcade.overlap(player, gate, endLevelCb, ifUdoMiddleDoor, this);

            //  Reset the players velocity (movement)
            player.body.velocity.x = 0;

            //  Allow the player to jump if they are touching the ground.
            if (control.up && player.body.touching.down) {
                player.body.velocity.y = -350;
                audioJump.play();
            }

            if (control.left) {
                //  Move to the left
                player.body.velocity.x = -150;
                player.animations.play('left');
            } else if (control.right) {
                //  Move to the right
                player.body.velocity.x = 150;
                player.animations.play('right');
            } else {
                //  Stand still
                player.animations.stop();
                player.frame = 4;
            }
        } else {
            if (!game.udoExiting) {
                player.animations.stop();
                player.frame = 9;
                var disappears = game.add.tween(player.scale).to({
                    x: 0.7,
                    y: 0.7
                }).start();
                disappears.onComplete.addOnce(levelCompleted);
                game.udoExiting = true;
            }
        }
    }

    var statePlay1 = {

        create: function() {
            setupGameWorld(800, 600, 'sky', [{
                'x': -150,
                'y': 250,
                'type': "ground"
            }, {
                'x': 400,
                'y': 400,
                'type': "ground"
            }]);
            setupGate();
            setupUdo();
            setupDocs(5);
            setupBugs(1);
            setupText();
            setupAudio();
            addScoreGlobal(0);
            setupControls();
        },

        update: function() {

            updateRoutine();
            if (game.nextLevel) {
                click2start('play2');
            }
        }
    };

    var statePlay2 = {

        create: function() {
            resetLevel();
            setupGameWorld(1024, 800, 'daytime', [{
                'x': -150,
                'y': 320,
                'type': "ground"
            }, {
                'x': 400,
                'y': 470,
                'type': "ground"
            }, {
                'x': 150,
                'y': 600,
                'type': "ground"
            }, ]);
            setupGate();
            setupUdo();
            setupCamera();
            setupDocs(5);
            setupBugs(2);
            setupText();
            setupAudio();
            addScoreGlobal(0);
            setupControls();
        },

        update: function() {
            updateRoutine();
            if (game.nextLevel) {
                click2start('play3');
            }
        }
    };

    var statePlay3 = {

        create: function() {
            resetLevel();
            setupGameWorld(1500, 990, 'night', [{
                'x': -80,
                'y': 110,
                'type': "ground"
            }, {
                'x': 350,
                'y': 250,
                'type': "ground"
            }, {
                'x': 200,
                'y': 400,
                'type': "ground"
            }, {
                'x': 520,
                'y': 500,
                'type': "ground"
            }, {
                'x': 770,
                'y': 500,
                'type': "ground"
            }, {
                'x': 1220,
                'y': 650,
                'type': "ground"
            }, {
                'x': 820,
                'y': 800,
                'type': "ground"
            }]);
            setupGate();
            setupUdo();
            setupCamera();
            setupDocs(5);
            setupBugs(3);
            setupText();
            setupAudio();
            addScoreGlobal(0);
            setupControls();
        },

        update: function() {
            updateRoutine();
            if (game.nextLevel) {
                //click2start('play3');
            }
        }
    };

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
    game.state.add('load', stateLoad);
    game.state.add('intro', stateIntro);
    game.state.add('play1', statePlay1);
    game.state.add('play2', statePlay2);
    game.state.add('play3', statePlay3);

    game.state.start('load');

})();
