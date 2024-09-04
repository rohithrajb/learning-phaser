import React from 'react'
import { useEffect } from 'react'
import Phaser from 'phaser'

function GameComponent({ config }) {
   useEffect(() => {
      const game = new Phaser.Game(config)

      return () => {
         game.destroy(true)
      }
   }, [])

   return <div id='phaser-container'></div>
}

export default GameComponent
