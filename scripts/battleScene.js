
class Battle {
    constructor(game) {
        this.game = game;
        this.battleBackgroundImage = new Image();
        this.battleBackgroundImage.src = './Images/battleBackground.png';
        this.battleBackground = new Sprite({
            position: {
                x: 0,
                y: 0
            },
            image: this.battleBackgroundImage
        });

        this.game.battleInitiated = true;
        document.querySelector('#userInterface').style.display = 'block';
        document.querySelector('#attacksBox').replaceChildren();
        document.querySelector('#optionsBox').replaceChildren();
        document.querySelector('#switchBox').replaceChildren();
        document.getElementById('monsterInterface').style.display = 'none';

        showOptionsBox();

        this.idleMonsters = game.globalPlayerMonsters;
        this.found = false;

        const index = this.idleMonsters.findIndex(monster => monster.health > 0);
        if (index !== -1) {
            this.playerMonster = this.idleMonsters.splice(index, 1)[0];
            this.found = true;
        }

        this.enemyMonster = new Monster(monsters.Draggle, {
            x: 800,
            y: 100
        },
            true
        );

        this.renderedSprites = [this.enemyMonster, this.playerMonster];
        this.queue = [];

        document.querySelector('#enemyHealthBar').style.width = this.enemyMonster.health + '%';
        document.querySelector('#playerHealthBar').style.width = this.playerMonster.health + '%';
        document.getElementById("playerName").innerHTML = this.playerMonster.name;
        document.getElementById("enemyName").innerHTML = this.enemyMonster.name;


        createOptionButtons(this);
        createAttackButtons(this)
        this.createIdleList();

        document.querySelector('#dialogueBox').addEventListener('click', (e) => {
            if (this.queue.length > 0) {
                this.queue[0]();
                this.queue.shift();
            } else if (this.queue.length === 0 && this.enemyMonster.health > 0) {
                e.currentTarget.style.display = 'none';
                if (this.playerMonster.health > 0) {
                    showOptionsBox();
                }
            }
        });
    }
    createIdleList() {
        document.querySelector('#switchBox').replaceChildren();
        this.idleMonsters.forEach((monster, index) => {
            if (monster.health > 0) {
                const button = document.createElement('button');
                button.innerHTML = monster.name;
                button.addEventListener('click', () => {
                    button.innerHTML = this.playerMonster.name;
                    let newPlayerMonster = this.idleMonsters[index];
                    this.idleMonsters.splice(index, 1, this.playerMonster)
                    this.playerMonster = newPlayerMonster;
                    this.renderedSprites.splice(1, 1, this.playerMonster)
                    document.getElementById("playerName").innerHTML = this.playerMonster.name;
                    showOptionsBox();
                    document.getElementById('playerHealthBar').style.width = this.playerMonster.health + '%'
                });
                document.querySelector('#switchBox').append(button);
            }
        });
    }
}

let battleAnimationId
function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    game.battle.battleBackground.draw();
    game.battle.renderedSprites.forEach((sprite) => {
        sprite.draw();
    });
}
animate();

// game.battle = new Battle(game);
// animateBattle();
