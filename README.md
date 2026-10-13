# Platformer 3D (React Three Fiber)

Requires Node.js 18+ (https://nodejs.org).

    npm install
    npm run dev

Controls: WASD / arrow keys to move, Space to jump, R to restart.
The HUD sound toggle controls original synthesized arcade effects for jumps,
coin pickups, hazards, and level completion. Audio starts after the first
keyboard or sound-button interaction to comply with browser autoplay rules.

Collect every coin to advance through five differently themed platforming
levels. Avoid the moving enemies; touching one or falling restarts the current
level. Finish the last level to unlock the replay button.

## Structure

    src/
      main.jsx              entry point
      App.jsx               canvas + game state (collected coins)
      game/
        constants.js        speed, jump, gravity, camera settings
        level.js            themed platform, coin, and enemy layouts
        physics.js          collision and movement logic
        enemies.js          enemy patrol and collision calculations
        audio.js            original synthesized game sound effects
      hooks/
        useKeyboard.js      keyboard state and input mapping
      components/
        Scene.jsx           lights, fog, and everything inside the canvas
        Sky.jsx             animated sky gradient and square sun
        VoxelClouds.jsx     drifting block clouds
        Platforms.jsx       renders the platforms
        Player.jsx          player cube, game loop, camera follow
        Coin.jsx            spinning coin
        Hud.jsx             level progress, restart, and victory overlay
        CoinPickupEffect.jsx animated coin-collection burst
        Enemy.jsx           patrolling slime, blaze, and wisp hazards
