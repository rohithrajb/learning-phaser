export class GameScene extends Phaser.Scene {
   constructor() {
      super('game')
      this.score = 0
      this.gameOver = false
      this.width = window.innerWidth * window.devicePixelRatio
      this.height = window.innerHeight * window.devicePixelRatio
   }

   preload() {
      this.load.image('sky', 'assets/sky.png')
      this.load.image('ground', 'assets/platform.png')
      this.load.image('star', 'assets/star.png')
      this.load.image('bomb', 'assets/bomb.png')
      this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })
      this.load.image('arrowLeft', 'assets/arrowLeft.svg')
      this.load.image('arrowRight', 'assets/arrowRight.svg')
   }

   create() {
      this.add.image(400, 300, 'sky').setScale(8)

      this.platforms = this.physics.add.staticGroup()

      this.platforms
         .create(200 * 6, this.height - 32 * 3, 'ground')
         .setScale(6)
         .refreshBody()
      this.platforms
         .create(this.width - 100, (this.height * 7) / 10, 'ground')
         .setScale(2)
         .refreshBody()
      this.platforms
         .create(0, (this.height * 5) / 10, 'ground')
         .setScale(2)
         .refreshBody()
      this.platforms
         .create(this.width, (this.height * 3) / 10, 'ground')
         .setScale(2)
         .refreshBody()

      this.player = this.physics.add.sprite(200, (this.height * 2) / 3, 'dude').setScale(4)
      this.player.setCollideWorldBounds(true)

      // player animations
      this.anims.create({
         key: 'left',
         frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
         frameRate: 10,
         repeat: -1,
      })
      this.anims.create({
         key: 'turn',
         frames: [{ key: 'dude', frame: 4 }],
         frameRate: 20,
      })
      this.anims.create({
         key: 'right',
         frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
         frameRate: 10,
         repeat: -1,
      })

      // creating stars
      this.stars = this.physics.add.group({
         key: 'star',
         repeat: 7,
         setXY: { x: 36, y: 200, stepX: 160 },
      })
      // randomizing their bounce and scaling them
      this.stars.children.iterate((child) => {
         child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4)).setScale(3)
      })

      // adding touch buttons for mobile
      //
      // 1. placing button images in canvas and using input events on approximately where the button is to capture click event right on the button
      // problem: for different resolutions, the area of the button could be wrong
      // this.add.image(100, this.height - 100, 'arrowLeft')
      // this.input.on(
      //    'pointerdown', () => {
      //       const { x, y } = this.input.activePointer
      //       if (x > 19 && x < 185 && y > 2362 && y < 2510) {
      //          // console.log(x + ' ' + y)
      //          this.moveLeft(this.player)
      //       }
      //    },
      //    this
      // )

      // 2. creating eventlisteners in the scene and emitting those events from react.
      // problem: cant access scene.events using onClick as scene is instantiated in useEffect(). check if there is a way to do that
      // this.events.addListener('touchMovements', event => {
      //    if(event.action === 'runLeft') {
      //       this.moveLeft(this.player)
      //    }
      // })

      // 3. placing buttons on top of canvas and using pointerdownoutside events to determine clicks. but again, to determine which button was clicked, we have to use the button's supposed location to figure which button it is
      // problem: same as problem 1
      // this.input.on(
      //    'pointerdownoutside',
      //    () => {
      //       const { x, y } = this.input.activePointer
      //       console.log(x + ' ' + y)
      //    },
      //    this
      // )

      // 4. create buttons as interactive game objects and use GAMEOBJECT_POINTER_DOWN to listen to events on specific game objects.
      // problem: Although the actions are perfectly read, mouse and touch behave differently to keyboard. keyboard has a isDown event which I couldn't find for gameobject/pointer
      this.leftButton = this.add.image(100, this.height - 100, 'arrowLeft').setInteractive()
      this.rightButton = this.add.image(300, this.height - 100, 'arrowRight').setInteractive()
      this.jumpButton = this.add
         .text(this.width - 350, this.height - 170, 'Jump', {
            color: 'black',
            fontSize: '128px',
         })
         .setInteractive()

      this.leftButton.on('pointerdown', () => {
         this.moveLeft(this.player)
      })
      this.rightButton.on('pointerdown', () => {
         this.moveRight(this.player)
      })
      this.jumpButton.on('pointerdown', () => {
         this.jump(this.player)
      })

      // 5. TODO: experimenting with input.mouse to see if any useful functions are there
      // this.input.mouse.disableContextMenu()


      // this.cursors = this.input.keyboard.createCursorKeys()

      this.scoreText = this.add.text(32, 32, 'score: 0', { fontSize: '96px', fill: '#000' })

      this.bombs = this.physics.add.group()

      this.physics.add.collider(this.player, this.platforms)
      this.physics.add.collider(this.stars, this.platforms)
      this.physics.add.collider(this.bombs, this.platforms)

      this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

      this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this)
   }

   update() {
      if (this.gameOver) {
         return
      }

      // removed keyboard events
      // if (this.cursors.left.isDown) {
      //    this.moveLeft(this.player)
      // } else if (this.cursors.right.isDown) {
      //    this.moveRight(this.player)
      // }
      // else {
      //    this.stop(this.player)
      // }
      // if (this.cursors.up.isDown && this.player.body.touching.down) {
      //    this.jump(this.player)
      // }

      // TODO: the player shouldn't be facing left on start

      // using the GAMEOBJECT_UP event to stop player from moving
      this.input.on('gameobjectup', () => {
         this.stop(this.player)
      })
   }

   // created movement functions seperately so they can be used with both keyboard inputs and pointer events
   moveLeft(player) {
      player.setVelocityX(-360)

      player.anims.play('left', true)
   }

   moveRight(player) {
      player.setVelocityX(360)

      player.anims.play('right', true)
   }

   stop(player) {
      player.setVelocityX(0)

      player.anims.play('turn')
   }

   jump(player) {
      if (this.player.body.touching.down) {
         player.setVelocityY(-2000)
      }
   }

   collectStar(player, star) {
      star.disableBody(true, true)

      this.score += 10
      this.scoreText.setText('Score: ' + this.score)

      // once no more stars, reset stars
      if (this.stars.countActive(true) === 0) {
         this.stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true)
         })
      }

      // for every three stars achieved, drop a bomb
      if (this.score % 3 == 0) {
         const x =
            player.x < this.width / 2
               ? Phaser.Math.Between(this.width / 2, this.width)
               : Phaser.Math.Between(0, this.width / 2)

         const bomb = this.bombs.create(x, 0, 'bomb')
         console.log(player.x + ' ' + x)
         bomb.setBounce(1).setCollideWorldBounds(true).setVelocity(Phaser.Math.Between(-100, 200), 10)
      }
   }

   hitBomb(player, bomb) {
      this.physics.pause()

      player.setTint(0xff0000)

      player.anims.play('turn')

      this.gameOver = true
   }
}
