# Platformer 3D (React Three Fiber)

Requires Node.js 18+ (https://nodejs.org).

    npm install
    npm run dev

Controls: WASD / arrow keys to move, Space to jump, R to restart.
The HUD sound toggle controls original synthesized arcade effects for jumps,
coin pickups, hazards, and level completion. Audio starts after the first
keyboard or sound-button interaction to comply with browser autoplay rules;
procedural rain ambience also follows the storm cycle and sound toggle.
Nearby voxel enemies make distinct quiet procedural sounds: squelches, fiery
growls, and airy chimes.

Collect every coin to advance through infinitely many platforming levels.
The first five levels have handcrafted themes; subsequent levels use
deterministic random layouts and rotate through the biomes. Each biome features
a block-built orc enemy, alongside the existing slime, blaze, and wisp foes.
Animated procedural shader patterns add pulsing spots, fire bands, spectral
waves, and glowing orc runes to their voxel bodies.
Enemies, wildlife, plants, and castle structures cast detailed soft shadows
onto platforms and nearby surfaces.
Voxel farm and forest animals—including pigs, cows, sheep, chickens, wolves,
cats, rabbits, foxes, pandas, horses, turtles, and frogs—appear as harmless,
randomized wildlife. Platform widths,
depths, and voxel trees, grass, and flowers are randomized per level; the castle
also grows a randomized mix of blocky plants. These choices stay fixed when the
same level is restarted. Avoid the moving enemies; touching one or falling
restarts the current level.
Earth, animated-water, and wooden-plank platform surfaces are procedurally
shaded. Between two and four platforms move on each level, carrying their coins
and supporting the player while they move.
The voxel sky drifts through day, sunset, night, and overcast weather, with
animated rain during storms.

## Structure

    src/
      main.jsx              entry point
      App.jsx               canvas + game state (collected coins)
      game/
        constants.js        speed, jump, gravity, camera settings
        level.js            themed platform, coin, and enemy layouts
        physics.js          collision and movement logic
        enemies.js          enemy patrol and collision calculations
        platforms.js        platform movement and attached coin positions
        weather.js          time-of-day and storm cycle
        audio.js            original synthesized game sound effects
      hooks/
        useKeyboard.js      keyboard state and input mapping
      components/
        Scene.jsx           lights, fog, and everything inside the canvas
        Sky.jsx             day/night sky, sunrise, stars, and weather tint
        VoxelClouds.jsx     drifting block clouds
        Rain.jsx            instanced storm rain
        Castle.jsx          climb-alongside voxel castle backdrop
        Platforms.jsx       renders the platforms
        VoxelFlora.jsx      blocky trees, flowers, and grass
        Player.jsx          original sponge-like hero, movement, and camera follow
        Coin.jsx            spinning coin
        Hud.jsx             level progress, restart, and victory overlay
        CoinPickupEffect.jsx animated coin-collection burst
        Enemy.jsx           patrolling slime, blaze, and wisp hazards
        VoxelAnimal.jsx     harmless block-built farm and forest wildlife
