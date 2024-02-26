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
let idleMonsters;
let battleAnimationId;
let queue;

function initBattle() {
    document.querySelector('#optionsBox').style.display = 'grid';
    document.querySelector('#userInterface').style.display = 'block';
    document.querySelector('#dialogueBox').style.display = 'none';
    document.querySelector('#enemyHealthBar').style.width = '100%';
    document.querySelector('#attacksBox').replaceChildren();
    document.querySelector('#optionsBox').replaceChildren();
    document.querySelector('#switchBox').replaceChildren();

    document.querySelector('#switchBox').style.display = 'none';
    document.querySelector('#attackType').style.display = 'none';
    document.querySelector('#attacksBox').style.display = 'none';

    let idleMonsters = globalPlayerMonsters;

    let found = false;

    const index = idleMonsters.findIndex(monster => monster.health > 0);
    if (index !== -1) {
        playerMonster = idleMonsters.splice(index, 1)[0];
        found = true;
    }

    if (!found) {
        console.log("No monster with health > 0 found.");
    } else {
        console.log("Monster with health > 0 picked:", playerMonster);
    }
    enemyMonster = new Monster(monsters.Draggle, position = {
        x: 800,
        y: 100
    },
        isEnemy = true
    );

    renderedSprites = [enemyMonster, playerMonster];
    queue = [];

    document.querySelector('#playerHealthBar').style.width = playerMonster.health + '%';
    document.getElementById("playerName").innerHTML = playerMonster.name;
    document.getElementById("enemyName").innerHTML = enemyMonster.name;

    // screen to choose what to do
    options = [
        { name: "Attack" },
        { name: "Run" },
        { name: "Switch pokemon" },
        { name: "Nothing" },
    ]

    // choose a move
    const attackButton = document.createElement('button');
    attackButton.innerHTML = options[0].name;
    attackButton.addEventListener('click', (e) => {
        document.querySelector('#optionsBox').style.display = 'none';
        document.querySelector('#attacksBox').style.display = 'grid';
        document.querySelector('#attackType').style.display = 'flex';
    })
    document.querySelector('#optionsBox').append(attackButton);

    playerMonster.attacks.forEach((attack) => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        button.classList.add('attacks');
        document.querySelector('#attacksBox').append(button);
    });

    // choose which pokemon to switch
    const switchButton = document.createElement('button');
    switchButton.innerHTML = options[2].name;
    switchButton.addEventListener('click', () => {
        let found = false;
        for (let i = 0; i < idleMonsters.length; i++) {
            if (idleMonsters[i].health > 0) {
                found = true;
                break;
            }
        }
        if (found) {
            document.querySelector('#optionsBox').style.display = 'none';
            document.querySelector('#switchBox').style.display = 'grid';
        } else {
            document.querySelector('#dialogueBox').style.display = 'block';
            document.querySelector('#dialogueBox').innerHTML = 'No pokemon left';
        }
    })
    document.querySelector('#optionsBox').append(switchButton);

    function createIdleList() {
        document.querySelector('#switchBox').replaceChildren();
        idleMonsters.forEach((monster, index) => {
            if (monster.health > 0) {
                const button = document.createElement('button');
                button.innerHTML = monster.name;
                button.addEventListener('click', () => {
                    button.innerHTML = playerMonster.name;
                    let newPlayerMonster = idleMonsters[index];
                    idleMonsters.splice(index, 1, playerMonster)
                    playerMonster = newPlayerMonster;
                    renderedSprites.splice(1, 1, playerMonster)
                    document.getElementById("playerName").innerHTML = playerMonster.name;
                    document.querySelector('#optionsBox').style.display = 'grid';
                    document.querySelector('#switchBox').style.display = 'none';
                    document.getElementById('playerHealthBar').style.width = playerMonster.health + '%'
                });
                document.querySelector('#switchBox').append(button);
            }
        });
    }
    createIdleList();

    // choose to leave the battle
    const runButton = document.createElement('button');
    runButton.innerHTML = options[1].name;
    runButton.addEventListener('click', (e) => {
        globalPlayerMonsters = [playerMonster, ...idleMonsters];
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
                            globalPlayerMonsters = [playerMonster, ...idleMonsters];
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
                    const index = idleMonsters.findIndex(monster => monster.health > 0);
                    if (index !== -1) {
                        document.querySelector('#optionsBox').style.display = 'none';
                        document.querySelector('#switchBox').style.display = 'grid';
                        setTimeout(() => createIdleList(), 5000)
                        // createIdleList();
                    } else {
                        queue.push(() => {
                            gsap.to('#overlappingDiv', {
                                opacity: 1,
                                onCopmlete: () => {
                                    globalPlayerMonsters = [playerMonster, ...idleMonsters];
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
initBattle();
animateBattle();

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift();
    } else {
        e.currentTarget.style.display = 'none';
        if (playerMonster.health > 0) {
            document.querySelector('#optionsBox').style.display = 'grid';
        }
        document.querySelector('#attacksBox').style.display = 'none';
        document.querySelector('#attackType').style.display = 'none';
    }
});