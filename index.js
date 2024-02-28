const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = '1024';
canvas.height = '576';

game = new Game(canvas, c);
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
}


function animate() {
    const animationId = window.requestAnimationFrame(animate);
    game.background.draw();
    game.boundaries.forEach((boundary) => {
        boundary.draw();
    });
    game.battleZones.forEach((battleZone) => {
        battleZone.draw();
    })

    game.player.draw();
    game.foreground.draw();

    let moving = true;
    game.player.animate = false;

    if (game.battleInitiated) return;

    // activate a battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < game.battleZones.length; i++) {
            const battleZone = game.battleZones[i];
            const overlappingArea = (Math.min(game.player.position.x + game.player.width, battleZone.position.x + battleZone.width) - Math.max(game.player.position.x, battleZone.position.x)) *
                (Math.min(game.player.position.y + game.player.height, battleZone.position.y + battleZone.height) - Math.max(game.player.position.y + game.player.height / 2, battleZone.position.y));

            if (game.rectangularCollision({
                rectangle1: game.player,
                rectangle2: battleZone
            }) &&
                overlappingArea > (game.player.width * game.player.height / 2) / 2 && Math.random() < 0.1
            ) {
                window.cancelAnimationFrame(animationId)

                audio.map.stop();
                audio.initBattle.play();
                audio.battle.play();

                game.battleInitiated = true
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                game.battle = new Battle(game);
                                animateBattle();
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4
                                });
                            }
                        });
                    }
                });
                break;
            }
        }
    }

    if (keys.w.pressed && lastKey === 'w') {
        game.player.animate = true;
        game.player.image = game.player.sprites.up;

        for (let i = 0; i < game.boundaries.length; i++) {
            const boundary = game.boundaries[i];
            if (game.rectangularCollision({
                rectangle1: game.player,
                rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y + game.speed
                    }
                }
            })) {
                moving = false;
                break;
            }
        }

        if (moving) {
            game.movables.forEach((movable) => {
                movable.position.y += game.speed;
            });
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        game.player.animate = true;
        game.player.image = game.player.sprites.left;

        for (let i = 0; i < game.boundaries.length; i++) {
            const boundary = game.boundaries[i];
            if (game.rectangularCollision({
                rectangle1: game.player,
                rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x + game.speed,
                        y: boundary.position.y
                    }
                }
            })) {
                moving = false;
                break;
            }
        }

        if (moving) {
            game.movables.forEach((movable) => {
                movable.position.x += game.speed;
            });
        }
    } else if (keys.s.pressed && lastKey === 's') {
        game.player.animate = true;
        game.player.image = game.player.sprites.down;

        for (let i = 0; i < game.boundaries.length; i++) {
            const boundary = game.boundaries[i];
            if (game.rectangularCollision({
                rectangle1: game.player,
                rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y - game.speed
                    }
                }
            })) {
                moving = false;
                break;
            }
        }

        if (moving) {
            game.movables.forEach((movable) => {
                movable.position.y -= game.speed;
            });
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        game.player.animate = true;
        game.player.image = game.player.sprites.right;

        for (let i = 0; i < game.boundaries.length; i++) {
            const boundary = game.boundaries[i];
            if (game.rectangularCollision({
                rectangle1: game.player,
                rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x - game.speed,
                        y: boundary.position.y
                    }
                }
            })) {
                moving = false;
                break;
            }
        }

        if (moving) {
            game.movables.forEach((movable) => {
                movable.position.x -= game.speed;
            });
        }
    }
}

let lastKey = '';
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
        case 'l':
            if (!game.battleInitiated) {
                const monsterListDiv = document.getElementById('monsterInterface');
                if (monsterListDiv.style.display === 'none') {
                    monsterListDiv.style.display = 'block';
                } else monsterListDiv.style.display = 'none';
            }
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
});

let clicked = false;
addEventListener('click', () => {
    if (!clicked) {
        audio.map.play();
        clicked = true;
    }
});
