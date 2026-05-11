# Report Notes - Penalty Shootout Challenge

## What Is the Game?

Penalty Shootout Challenge is a 2D browser-based Canvas football game where the player takes penalties, controls the goalkeeper during opponent penalties, and tries to win a shootout tournament.

## Objective

Score more goals than the opponent in a penalty shootout. Win matches to earn bonus points and progress into harder matches.

## How the Game Works

The player selects a club, enters a match preview, then starts the shootout. The player shoots first by locking Direction, Height, and Power controls. After the whistle, the player runs up and kicks the ball. Then the opponent shoots, and the player clicks inside the goal to choose the goalkeeper dive position. A short glove hint may show the opponent shot target before the save attempt.

## Rules

- Each side takes five penalties.
- A player goal gives 100 points.
- A goalkeeper save gives 50 points.
- A match win gives a 500 point bonus.
- Misses, posts, and crossbar hits do not score.
- If the match is tied after five penalties each, sudden death begins.
- Difficulty increases after winning matches.

## Graphics Concepts Used

- **Animation:** run-up, kick, goalkeeper dive, ball travel, spin, net ripple, impact effects, and glove hint.
- **Translation:** moving characters, ball, goalkeeper, crowd details, and UI indicators.
- **Rotation:** ball spin, kicking leg motion, goalkeeper body lean, and pose changes.
- **Scaling:** ball perspective, glove hint pulse, depth effects, and character size relationships.
- **Collision/save detection:** goal area checks, goalkeeper save distance, post hits, crossbar hits, and misses.
- **Rendering loop:** Canvas is updated and redrawn continuously with `requestAnimationFrame`.
- **User interaction:** mouse clicks for bars and goalkeeper dive, Space key for control locking, menu buttons, and sound toggle.
- **Perspective-style 2D drawing:** behind-the-player camera, field perspective, goal frame, and rear net.
- **Audio feedback:** crowd ambience, whistle before shots, and sound on/off control.

## Screenshot List

- Main menu
- Team selection
- Match preview
- Gameplay with player shot controls
- Opponent glove hint
- Goalkeeper save or goal result
- Final result screen

## Contributions

- Team Member 1: [Add name and contribution]
- Team Member 2: [Add name and contribution]

## What Was Learned

- How to build a complete interactive Canvas game loop.
- How to use 2D drawing techniques to create depth and perspective.
- How animation timing affects gameplay clarity.
- How to connect input, rendering, scoring, and feedback into one playable flow.
- How to keep browser audio controlled by user interaction.

## Improvements With More Time

- More detailed player and goalkeeper animations.
- More varied crowd and stadium presentation.
- Additional sound effects for saves, posts, and goals.
- More advanced AI behavior for the opponent and goalkeeper.
- More screen-size tuning for smaller devices.
