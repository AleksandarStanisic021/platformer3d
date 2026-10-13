# Platformer 3D (React Three Fiber)

Requires Node.js 18+ (https://nodejs.org).

    npm install
    npm run dev

Controls: WASD / arrow keys to move, Space to jump, R to restart.

Collect every coin to advance through all 5 similar platforming levels.
Falling restarts the current level. Finish the last level to unlock the replay
button.

## Structure

    src/
      main.jsx              entry point
      App.jsx               canvas + game state (collected coins)
      game/
        constants.js        speed, jump, gravity, camera settings
        level.js            the five platform and coin layouts
        physics.js          collision and movement logic
      hooks/
        useKeyboard.js      keyboard state and input mapping
      components/
        Scene.jsx           lights, fog, and everything inside the canvas
        Platforms.jsx       renders the platforms
        Player.jsx          player cube, game loop, camera follow
        Coin.jsx            spinning coin
        Hud.jsx             level progress, restart, and victory overlay
        CoinPickupEffect.jsx animated coin-collection burst
