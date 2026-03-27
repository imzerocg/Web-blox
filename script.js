const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const popDisplay = document.getElementById('pop-count');
const toolDisplay = document.getElementById('current-tool');

canvas.width = window.innerWidth - 250;
canvas.height = window.innerHeight;

let people = [];
let currentPower = 'spawn';

function setPower(power) {
    currentPower = power;
    toolDisplay.innerText = power.toUpperCase();
}

class Person {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 100;
        this.size = 6;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`; // Random Factions
        this.hasFire = false;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;
    }

    draw() {
        ctx.fillStyle = this.hasFire ? '#ff4500' : this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 5, this.y - 10, 10, 2);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x - 5, this.y - 10, (this.hp / 100) * 10, 2);
    }

    update() {
        // Move randomly
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Fight logic
        people.forEach(other => {
            if (other !== this && this.getDist(other) < 15) {
                if (this.color !== other.color) {
                    let damage = this.hasFire ? 2 : 0.5;
                    other.hp -= damage;
                }
            }
        });
    }

    getDist(other) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }
}

// Handle God Clicks
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (currentPower === 'spawn') {
        people.push(new Person(mouseX, mouseY));
    } else {
        people.forEach(p => {
            const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
            if (dist < 30) {
                if (currentPower === 'fire') p.hasFire = true;
                if (currentPower === 'heal') p.hp = 100;
                if (currentPower === 'strike') p.hp -= 80;
            }
        });
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Filter out dead people
    people = people.filter(p => p.hp > 0);
    popDisplay.innerText = people.length;

    people.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
