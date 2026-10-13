# Platformer 3D (React Three Fiber)

Requires Node.js 18+ (https://nodejs.org).

    npm install
    npm run dev

Controls: WASD / arrow keys to move, Space to jump.

## Structure

    src/
      main.jsx              entry point
      App.jsx               canvas + game state (collected coins)
      game/
        constants.js        speed, jump, gravity, camera settings
        level.js            PLATFORMS and COINS (edit the level here)
        physics.js          collision and movement logic
      hooks/
        useKeyboard.js      keyboard state and input mapping
      components/
        Scene.jsx           lights, fog, and everything inside the canvas
        Platforms.jsx       renders the platforms
        Player.jsx          player cube, game loop, camera follow
        Coin.jsx            spinning coin
        Hud.jsx             coin counter overlay
