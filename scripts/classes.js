
class Boundary {
    static width = 48;
    static height = 48;
    constructor({ position }) {
        this.position = position;
        this.width = 48;
        this.height = 48;
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0.2)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Sprite {
    constructor({ image, position, frames = { max: 1, hold: 10 }, sprites, animate = false, isEnemy = false, rotation = 0, name }) {
        this.position = position;
        this.image = new Image();
        this.frames = { ...frames, val: 0, elapsed: 0 };
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }
        this.image.src = image.src;
        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation;
    }

    draw() {
        c.save();
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        c.rotate(this.rotation);
        c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
        c.globalAlpha = this.opacity;
        c.drawImage(this.image,
            this.frames.val * this.width, 0,
            this.image.width / this.frames.max, this.image.height,
            this.position.x, this.position.y,
            this.image.width / this.frames.max, this.image.height,
        );
        c.restore();

        if (!this.animate) return;
        if (this.frames.max > 1) {
            this.frames.elapsed++;
        }
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 0;
        }
    }
}

class Monster extends Sprite {
    constructor({ image, frames = { max: 1, hold: 10 }, sprites, animate = false, rotation = 0, name, attacks }, position, isEnemy = false) {
        super({ image, position, frames, sprites, animate, rotation })
        this.name = name;
        this.isEnemy = isEnemy;
        this.health = 100;
        this.attacks = attacks;
        this.level = 5;
        this.exp = 0;
    }

    faint() {
        document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!';
        gsap.to(this.position, {
            y: this.position.y + 20
        });
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop();
        audio.victory.play();
    }
    attack({ attack, recipient, renderedSprites }) {
        document.querySelector('#dialogueBox').style.display = 'block';
        document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name;

        let attackerHealthBar = '#playerHealthBar';
        let defenderHealthBar = '#enemyHealthBar';

        if (this.isEnemy) {
            attackerHealthBar = '#enemyHealthBar';
            defenderHealthBar = '#playerHealthBar';

        }

        let rotation = 1
        if (this.isEnemy) rotation = -1;
        recipient.health -= attack.damage * this.level / 5;
        recipient.health = Math.max(recipient.health, 0);
        this.health -= attack.recoil;

        let movementDistance;

        switch (attack.name) {
            case 'Firebarrage':
                audio.initFireball.play();
                const initialX = this.position.x;
                const initialY = this.position.y;
                for (let i = 0; i < 5; i++) {
                    const fireballImage = new Image();
                    fireballImage.src = './Images/fireball.png'
                    const fireball = new Sprite({
                        position: {
                            x: initialX,
                            y: initialY
                        },
                        image: fireballImage,
                        frames: {
                            max: 4,
                            hold: 10,
                        },
                        animate: true,
                        rotation
                    });
                    renderedSprites.splice(1, 0, fireball)

                    const motionPath = {
                        path: [
                            { x: initialX, y: initialY },
                            { x: initialX + i * 100, y: initialY - 300 + 50 * i},
                            { x: recipient.position.x, y: recipient.position.y }
                        ],
                        curviness: 2
                    };

                    gsap.to(fireball.position, {
                        duration: 1,
                        motionPath: motionPath,
                        ease: "power2.in",
                        onComplete: () => {
                            audio.fireballHit.play();
                            gsap.to(defenderHealthBar, {
                                width: recipient.health + '%'
                            })
                            gsap.to(recipient.position, {
                                x: recipient.position.x + 10,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.1
                            });
                            gsap.to(recipient, {
                                opacity: 0,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.1
                            });
                            const index = renderedSprites.indexOf(fireball);
                            if (index !== -1) {
                                renderedSprites.splice(index, 1);
                            }
                        }
                    });
                }
                break;

            case 'Fireball':
                const fireballImage = new Image();
                fireballImage.src = './Images/fireball.png'
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10,
                    },
                    animate: true,
                    rotation
                });

                renderedSprites.splice(1, 0, fireball)

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        audio.fireballHit.play();
                        gsap.to(defenderHealthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.1
                        });
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.1
                        });
                        renderedSprites.splice(1, 1);
                    }
                });
                break;

            case 'Tackle':
                const tl = gsap.timeline();

                movementDistance = 20;
                if (this.isEnemy) movementDistance = -20

                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        audio.tackleHit.play();
                        gsap.to(defenderHealthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.1
                        });
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.1
                        });
                    }
                }).to(this.position, {
                    x: this.position.x
                });
                break;

            case 'Takedown':
                const tl2 = gsap.timeline();

                movementDistance = 20;
                if (this.isEnemy) movementDistance = -20

                tl2.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        audio.tackleHit.play();
                        gsap.to(defenderHealthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(attackerHealthBar, {
                            width: this.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.1
                        });
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.1
                        });
                    }
                }).to(this.position, {
                    x: this.position.x
                });
                break;
        }
    }
}