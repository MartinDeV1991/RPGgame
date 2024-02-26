const battleBackgroundImage = new Image();
battleBackgroundImage.src = './Images/battleBackground.png';
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
});

let enemyMonster;
let playerMonster;
let renderedSprites;
let battleAnimationId;
let queue;

function initBattle(playerMonsters) {
    document.querySelector('#userInterface').style.display = 'block';
    document.querySelector('#dialogueBox').style.display = 'none';
    document.querySelector('#enemyHealthBar').style.width = '100%';
    document.querySelector('#playerHealthBar').style.width = '100%';
    document.querySelector('#attacksBox').replaceChildren();
    document.querySelector('#optionsBox').replaceChildren();
    // document.querySelector('#optionsBox').style.display = 'grid';
    document.querySelector('#attackType').style.display = 'none';
    document.querySelector('#attacksBox').style.display = 'none';

    enemyMonster = new Monster(monsters.Draggle, position = {
        x: 800,
        y: 100
    });
    playerMonster = new Monster(playerMonsters[2], position = {
        x: 280,
        y: 325
    });
    renderedSprites = [enemyMonster, playerMonster];
    queue = [];

    document.getElementById("playerName").innerHTML = playerMonster.name;
    document.getElementById("enemyName").innerHTML = enemyMonster.name;

    playerMonster.attacks.forEach((attack) => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        button.classList.add('attacks');
        document.querySelector('#attacksBox').append(button);
    });

    options = [
        { name: "Attack" },
        { name: "Run" },
        { name: "Nothing" },
        { name: "Nothing" },
    ]

    const attackButton = document.createElement('button');
    attackButton.innerHTML = options[0].name;
    attackButton.addEventListener('click', (e) => {
        document.querySelector('#optionsBox').style.display = 'none';
        document.querySelector('#attacksBox').style.display = 'grid';
        document.querySelector('#attackType').style.display = 'flex';
    })
    document.querySelector('#optionsBox').append(attackButton);

    const runButton = document.createElement('button');
    runButton.innerHTML = options[1].name;
    runButton.addEventListener('click', (e) => {
        cancelAnimationFrame(battleAnimationId);
        animate();
        document.querySelector('#userInterface').style.display = 'none';
        gsap.to('#overlappingDiv', {
            opacity: 0
        });
        battle.initiated = false;
        audio.map.play();
    })
    document.querySelector('#optionsBox').append(runButton);

    // eventlisteners for buttons (attack)
    document.querySelectorAll('button.attacks').forEach((button) => {
        button.addEventListener('click', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            playerMonster.attack({
                attack: selectedAttack,
                recipient: enemyMonster,
                renderedSprites
            });

            if (enemyMonster.health <= 0) {
                queue.push(() => {
                    enemyMonster.faint();
                });
                queue.push(() => {
                    gsap.to('#overlappingDiv', {
                        opacity: 1,
                        onCopmlete: () => {
                            cancelAnimationFrame(battleAnimationId);
                            animate();
                            document.querySelector('#userInterface').style.display = 'none';
                            gsap.to('#overlappingDiv', {
                                opacity: 0
                            });
                            battle.initiated = false;
                            audio.map.play();
                        }
                    });
                });
                return;
            }
            const randomAttack = enemyMonster.attacks[Math.floor(Math.random() * enemyMonster.attacks.length)];

            queue.push(() => {
                enemyMonster.attack({
                    attack: randomAttack,
                    recipient: playerMonster,
                    renderedSprites
                });

                if (playerMonster.health <= 0) {
                    queue.push(() => {
                        playerMonster.faint();
                    });
                    queue.push(() => {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            onCopmlete: () => {
                                cancelAnimationFrame(battleAnimationId);
                                animate();
                                document.querySelector('#userInterface').style.display = 'none';
                                gsap.to('#overlappingDiv', {
                                    opacity: 0
                                });
                                battle.initiated = false;
                                audio.map.play();
                            }
                        });
                    });
                }
            })
        });
        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector('#attackType').innerHTML = selectedAttack.type;
            document.querySelector('#attackType').style.color = selectedAttack.color;
        })
    });
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
    renderedSprites.forEach((sprite) => {
        sprite.draw();
    });
}

// animate();
initBattle(playerMonsters);
animateBattle();

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift();
    } else {
        e.currentTarget.style.display = 'none';
        document.querySelector('#optionsBox').style.display = 'grid';
        document.querySelector('#attacksBox').style.display = 'none';
        document.querySelector('#attackType').style.display = 'none';
    }
});