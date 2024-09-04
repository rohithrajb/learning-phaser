import Phaser from 'phaser'
import './App.css'
import GameComponent from './components/GameComponent'

class Example extends Phaser.Scene {
   constructor() {
      super('game')
      this.platforms
      this.player
      this.cursors
      this.stars
      this.score = 0
      this.scoreText
      this.bombs
      this.gameOver
      this.width = window.innerWidth * window.devicePixelRatio
      this.height = window.innerHeight * window.devicePixelRatio
      this.buttonLeft
   }

   preload() {
      this.load.image('sky', 'assets/sky.png')
      this.load.image('ground', 'assets/platform.png')
      this.load.image('star', 'assets/star.png')
      this.load.image('bomb', 'assets/bomb.png')
      this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })
      this.load.image('button-left', 'assets/buttons/button-left.png')
      this.load.image('button-right', 'assets/buttons/button-right.png')
      this.load.image('button-up', 'assets/buttons/button-up.png')
      this.load.scenePlugin({
         key: 'rexgesturesplugin',
         url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexgesturesplugin.min.js',
         sceneKey: 'rexGestures',
      })
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

      // this.player.setBounce(0.2)
      this.player.setCollideWorldBounds(true)

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

      // buttonLeft
      this.buttonLeft = this.add.rectangle(500, 500, 100, 100, Phaser.Math.Between(0, 0x1000000))

      

      // buttonLeft.on('pressstart', () => {
      //    console.log('pressed')
      //    this.player.setVelocityX(-360)
      // })

      // buttonLeft.on('pressend', () => {
      //    console.log('left')
      //    this.player.setVelocityX(0)
      // })

      // creating stars
      this.stars = this.physics.add.group({
         key: 'star',
         repeat: 7,
         setXY: { x: 36, y: 200, stepX: 160 },
      })
      // modifying their bounce and scale
      this.stars.children.iterate((child) => {
         child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4)).setScale(3)
      })

      this.cursors = this.input.keyboard.createCursorKeys()

      this.scoreText = this.add.text(32, 32, 'score: 0', { fontSize: '96px', fill: '#000' })

      this.bombs = this.physics.add.group()

      this.physics.add.collider(this.player, this.platforms)
      this.physics.add.collider(this.stars, this.platforms)
      this.physics.add.collider(this.bombs, this.platforms)

      this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

      this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this)
   }

   update() {
      // button events
      this.rexGestures.add
         .press(this.buttonLeft)
         .on('pressstart', () => {
            console.log('pressed')
            this.player.setVelocityX(-360)

            this.player.anims.play('left', true)
         })
         .on('pressend', function (press) {
            console.log('left')
            // colorTag.setVisible(false)
         })

      if (this.gameOver) {
         return
      }
      if (this.cursors.left.isDown) {
         this.player.setVelocityX(-360)

         this.player.anims.play('left', true)
      } else if (this.cursors.right.isDown) {
         this.player.setVelocityX(360)

         this.player.anims.play('right', true)
      } else {
         this.player.setVelocityX(0)

         this.player.anims.play('turn')
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
         this.player.setVelocityY(-2000)
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

      // for every two stars achieved, drop a bomb
      if (this.score % 30 == 0) {
         const x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)

         const bomb = this.bombs.create(x, 0, 'bomb')
         bomb.setBounce(1)
         bomb.setCollideWorldBounds(true)
         bomb.setVelocity(Phaser.Math.Between(-100, 200), 10)
      }
   }

   hitBomb(player, bomb) {
      this.physics.pause()

      player.setTint(0xff0000)

      player.anims.play('turn')

      this.gameOver = true
   }
}

function App() {
   const config = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: window.innerWidth * window.devicePixelRatio,
      height: window.innerHeight * window.devicePixelRatio,
      scale: {
         mode: Phaser.Scale.FIT,
         autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: Example,
      physics: {
         default: 'arcade',
         arcade: {
            gravity: { y: 3000 },
            debug: false,
         },
      },
   }

   return (
      <>
         <GameComponent config={config} />
      </>
   )
}

export default App
