import React, { useRef } from 'react'
import { useEffect } from 'react'
import Phaser from 'phaser'

function GameComponent({ config }) {
   const canvasRef = useRef(null)

   useEffect(() => {
      const newConfig = { ...config, parent: canvasRef.current }
      const game = new Phaser.Game(newConfig)

      return () => {
         game.destroy(true)
      }
   }, [])

   return (
      <>
         <div ref={canvasRef}></div>
         {/* <div
            style={{
               position: 'fixed',
               bottom: '20px',
               left: '20px',
            }}>
            <img
               src={arrowLeft}
               width={40}
               height={40}
               style={{
                  border: '1px solid black',
                  borderRadius: '100%',
                  padding: '10px',
               }}
            />
            <img
               src={arrowRight}
               width={40}
               height={40}
               style={{
                  border: '1px solid black',
                  borderRadius: '100%',
                  padding: '10px',
                  marginLeft: '10px',
               }}
            />
         </div> */}
         {/* <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
            <p style={{ padding: '20px', border: '1px solid black', borderRadius: '40px' }}>Jump</p>
         </div> */}
      </>
   )
}

export default GameComponent
