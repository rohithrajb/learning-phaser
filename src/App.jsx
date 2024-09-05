import Phaser from 'phaser'
import './App.css'
import GameComponent from './components/GameComponent'
import { GameScene } from './components/GameScene'

function App() {
   const config = {
      type: Phaser.AUTO,
      // parent: 'phaser-container',
      width: window.innerWidth * window.devicePixelRatio,
      height: window.innerHeight * window.devicePixelRatio,
      scale: {
         mode: Phaser.Scale.FIT,
         autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: GameScene,
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
