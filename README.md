# Penalty Shootout Challenge

Penalty Shootout Challenge is a browser-based football penalty shootout game built for a Computer Graphics final project. The player selects a team, takes penalties with timing-based controls, controls the goalkeeper during opponent shots, and tries to win matches across increasing difficulty.

## Technologies Used

- HTML
- CSS
- JavaScript
- HTML5 Canvas

## How to Play

1. Open the game and click `PLAY`.
2. Select one of the available clubs. Your player kit uses that team's colors.
3. Start the match preview. The opponent is selected automatically.
4. For your penalty, lock the `Direction`, `Height`, and `Power` bars by clicking the active bar or pressing `Space`.
5. Wait for the whistle, then watch the run-up and shot.
6. During the opponent penalty, watch for the glove hint and click inside the goal to choose the goalkeeper dive spot.
7. Each side takes five penalties. If the score is tied, the match continues into sudden death.

## Game Features

- Main menu, How to Play screen, team selection, match preview, gameplay, and final result screen.
- 20 selectable clubs with team-colored player kits.
- Random opponent selection.
- Direction, Height, and Power control bars.
- Player run-up, kick animation, ball flight, spin, scaling, rebounds, and net feedback.
- Goalkeeper dive control during opponent penalties.
- Decreasing glove hint duration for opponent shots.
- Crowd ambience, whistle sound, and global sound toggle.
- Scoring, penalty indicators, match wins, increasing difficulty, and sudden death.

## Computer Graphics Concepts Used

- **Animation:** player run-up, ball flight, goalkeeper dive, crowd movement, glove hint, net ripple, and impact effects.
- **Translation:** moving the ball, goalkeeper, player pose elements, and crowd details across the canvas.
- **Rotation:** ball spin, player kick pose, goalkeeper lean, and body part movement.
- **Scaling:** ball perspective size, glove hint pulse, character proportions, and depth effects.
- **Collision/save detection:** shot target evaluation, goalkeeper save distance, post/crossbar hits, goals, and misses.
- **Rendering loop:** continuous Canvas update and draw cycle using `requestAnimationFrame`.
- **User interaction:** mouse clicks, keyboard Space control locking, team selection, goalkeeper targeting, and sound toggle.
- **Perspective-style 2D drawing:** field lines, goal depth, player view from behind, and ball depth scaling.
- **Audio feedback:** crowd loop, whistle timing, and short feedback tones.

## Run Locally

```bash
py -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## GitHub Pages

GitHub Pages Link: [Add final link here]

## Screenshot Suggestions

- Main menu
- Team selection
- Gameplay shot
- Opponent glove hint
- Final result screen
