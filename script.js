// Water Drop Game JavaScript

class WaterDropGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameDuration = 30; // Default 30 seconds
        this.gameActive = false;
        this.gameInterval = null;
        this.timerInterval = null;
        this.speedUpInterval = null;
        this.selectedDifficulty = null;
        this.gameEnded = false;
        
        // Difficulty settings
        this.difficultySettings = {
            easy: {
                dropSpawnRate: 800,
                pollutedDropChance: 0.15,
                dropSpeed: 1,
                speedIncrease: 0.15,
                name: 'Easy'
            },
            medium: {
                dropSpawnRate: 600,
                pollutedDropChance: 0.25,
                dropSpeed: 1.3,
                speedIncrease: 0.2,
                name: 'Medium'
            },
            hard: {
                dropSpawnRate: 500,
                pollutedDropChance: 0.30,
                dropSpeed: 1.8,
                speedIncrease: 0.25,
                name: 'Hard'
            }
        };

        this.dropSpeed = 1.3;
        this.dropSpawnRate = 600;
        this.pollutedDropChance = 0.25;
        this.speedIncrease = 0.2;
        
        this.winMessages = [
            "Amazing! You're helping bring clean water to communities! 🌊",
            "Fantastic work! Your score makes a real difference! 💧",
            "Incredible! You've helped fund clean water projects! ✨",
            "Outstanding! Every drop counts in the fight for clean water! 🎉",
            "You're a water hero! Keep spreading awareness! 💙",
            "Brilliant! You're making waves for clean water access! 🌟"
        ];
        
        this.loseMessages = [
            "Good effort! Every attempt helps raise awareness! 💪",
            "Don't give up! Clean water is worth fighting for! 🌊",
            "Keep trying! You're learning to make a difference! 💧",
            "Great attempt! Try again to help more communities! 🎯",
            "You're on the right track! Another round? ❤️",
            "Nice try! Together we can bring clean water to all! 🤝"
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.startBtn = document.getElementById('start-btn');
        this.gameContainer = document.getElementById('game-container');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.gameMessage = document.getElementById('game-message');
        this.difficultySelection = document.getElementById('difficulty-selection');
        this.backBtn = document.getElementById('back-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.timeSlider = document.getElementById('time-slider');
        this.timeLabel = document.querySelector('.time-label');
        
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectDifficulty(btn.dataset.difficulty);
            });
        });
        
        this.timeSlider.addEventListener('input', (e) => {
            this.updateTimeSelection(parseInt(e.target.value));
        });
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.backBtn.addEventListener('click', () => this.showDifficultySelection());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.gameActive && this.selectedDifficulty) {
                e.preventDefault();
                if (!this.playAgainBtn.classList.contains('hidden')) {
                    this.playAgain();
                } else {
                    this.startGame();
                }
            }
        });
    }
    
    updateTimeSelection(seconds) {
        this.gameDuration = seconds;
        this.timeLeft = seconds;
        
        // Update the label
        if (seconds < 60) {
            this.timeLabel.textContent = `${seconds} seconds`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            if (remainingSeconds === 0) {
                this.timeLabel.textContent = `${minutes} minute${minutes > 1 ? 's' : ''}`;
            } else {
                this.timeLabel.textContent = `${minutes}m ${remainingSeconds}s`;
            }
        }
        
        this.updateTimer();
    }
    
    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        const settings = this.difficultySettings[difficulty];
        
        this.resetGameState();
        
        // Update game parameters
        this.dropSpawnRate = settings.dropSpawnRate;
        this.pollutedDropChance = settings.pollutedDropChance;
        this.dropSpeed = settings.dropSpeed;
        this.speedIncrease = settings.speedIncrease;
        
        // Set time from slider
        this.gameDuration = parseInt(this.timeSlider.value);
        this.timeLeft = this.gameDuration;
        
        // Hide difficulty selection and show start button
        this.difficultySelection.style.display = 'none';
        this.startBtn.classList.remove('hidden');
        this.startBtn.style.display = 'block';
        this.startBtn.textContent = `Start ${settings.name} Game`;
        this.backBtn.classList.remove('hidden');
        
        this.updateGameInfo(difficulty);
    }
    
    resetGameState() {
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.speedUpInterval) clearInterval(this.speedUpInterval);
        
        this.gameActive = false;
        this.gameEnded = false;
        this.score = 0;
        this.timeLeft = this.gameDuration;

        this.clearAllDrops();
        
        this.gameMessage.classList.add('hidden');
        this.playAgainBtn.classList.add('hidden');
        if (this.resetBtn) {
            this.resetBtn.classList.add('hidden');
            this.resetBtn.style.display = 'none';
        }
        
        this.updateScore();
        this.updateTimer();
    }
    
    updateGameInfo(difficulty) {
        const gameInfo = document.querySelector('.game-info');
        let difficultyText = '';
        
        switch(difficulty) {
            case 'easy':
                difficultyText = 'Easy Mode: Slower drops, less pollution';
                break;
            case 'medium':
                difficultyText = 'Medium Mode: Balanced challenge';
                break;
            case 'hard':
                difficultyText = 'Hard Mode: Fast drops, more pollution';
                break;
        }
        
        const timeText = this.gameDuration < 60 ? 
            `${this.gameDuration} seconds` : 
            `${Math.floor(this.gameDuration / 60)}m ${this.gameDuration % 60 > 0 ? this.gameDuration % 60 + 's' : ''}`;
        
        gameInfo.innerHTML = `
            <p>Click the clean water drops to collect them!</p>
            <p>Avoid the dark polluted drops - they subtract points!</p>
            <p>Get 20 points to win!</p>
            <p><strong>${difficultyText}</strong></p>
            <p><strong>Duration: ${timeText}</strong></p>
        `;
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.timeLeft = this.gameDuration;
        this.updateScore();
        this.updateTimer();
        
        this.startBtn.style.display = 'none';
        this.playAgainBtn.classList.add('hidden');
        this.backBtn.classList.add('hidden');
        this.gameMessage.classList.add('hidden');
        
        this.clearAllDrops();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        this.gameInterval = setInterval(() => {
            this.createWaterDrop();
        }, this.dropSpawnRate);
        
        this.speedUpInterval = setInterval(() => {
            if (this.dropSpawnRate > 300) {
                this.dropSpawnRate -= (20 * this.speedIncrease);
                clearInterval(this.gameInterval);
                this.gameInterval = setInterval(() => {
                    this.createWaterDrop();
                }, this.dropSpawnRate);
            }
        }, 8000);
    }
    
    createWaterDrop() {
        if (!this.gameActive) return;
        
        const drop = document.createElement('div');
        
        const isPolluted = Math.random() < this.pollutedDropChance;
        drop.classList.add('water-drop');
        
        if (isPolluted) {
            drop.classList.add('polluted');
            drop.setAttribute('data-type', 'polluted');
        } else {
            drop.setAttribute('data-type', 'clean');
        }

        const isMobile = window.innerWidth <= 768;
        const minSize = isMobile ? 50 : 40;
        const maxSize = isMobile ? 90 : 80;
        const size = Math.random() * (maxSize - minSize) + minSize;
        drop.style.width = `${size}px`;
        drop.style.height = `${size}px`;
        
        const containerWidth = this.gameContainer.offsetWidth;
        const maxLeft = containerWidth - size;
        drop.style.left = `${Math.random() * maxLeft}px`;
        drop.style.top = '-60px';
        
        let isRemoving = false;
        let animationId = null;
        
        const fallSpeed = this.dropSpeed + Math.random() * 0.3;
        
        const handleClick = (e) => {
            if (!this.gameActive || this.gameEnded || isRemoving) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            if (drop.classList.contains('clicked') || drop.classList.contains('clicked-polluted')) {
                return;
            }
            
            isRemoving = true;
            
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            drop.style.pointerEvents = 'none';
            const currentTop = drop.style.top;
            drop.style.top = currentTop; 
            
            if (isPolluted) {
                this.score = Math.max(0, this.score - 2);
                drop.classList.add('clicked-polluted');
            } else {
                this.score++;
                drop.classList.add('clicked');
            }
            
            this.updateScore();
            
            setTimeout(() => {
                if (drop.parentNode) {
                    drop.remove();
                }
            }, 400);
        };
        drop.addEventListener('click', handleClick, { once: true });
        drop.addEventListener('touchstart', handleClick, { once: true, passive: false });
        
        drop.addEventListener('contextmenu', (e) => e.preventDefault());
        
        this.gameContainer.appendChild(drop);
        animationId = this.animateDrop(drop, fallSpeed, () => isRemoving);
    }
    
    animateDrop(drop, fallSpeed, isRemovingCheck) {
        let animationId;
        
        const animate = () => {
            if (!this.gameActive || !drop.parentNode || isRemovingCheck()) {
                if (animationId) cancelAnimationFrame(animationId);
                return;
            }
            
            if (drop.classList.contains('clicked') || drop.classList.contains('clicked-polluted')) {
                if (animationId) cancelAnimationFrame(animationId);
                return;
            }
            
            const currentTop = parseInt(drop.style.top) || 0;
            const newTop = currentTop + fallSpeed;
            
            if (newTop >= this.gameContainer.offsetHeight) {
                if (drop.parentNode) {
                    drop.remove();
                }
                if (animationId) cancelAnimationFrame(animationId);
            } else {
                drop.style.top = `${newTop}px`;
                animationId = requestAnimationFrame(animate);
            }
        };
        
        animationId = requestAnimationFrame(animate);
        return animationId;
    }
    
    updateScore() {
        this.scoreDisplay.textContent = this.score;
    }
    
    updateTimer() {
        this.timerDisplay.textContent = this.timeLeft;
    }
    
    clearAllDrops() {
        const drops = this.gameContainer.querySelectorAll('.water-drop');
        drops.forEach(drop => drop.remove());
    }
    
    endGame() {
        this.gameActive = false;
        this.gameEnded = true;

        clearInterval(this.gameInterval);
        clearInterval(this.timerInterval);
        clearInterval(this.speedUpInterval);
        
        this.clearAllDrops();
        
        this.showEndGameMessage();

        setTimeout(() => {
            this.playAgainBtn.classList.remove('hidden');
            this.backBtn.classList.remove('hidden');
        }, 2000);
    }
    
    showEndGameMessage() {
        const isWinner = this.score >= 20;
        const messages = isWinner ? this.winMessages : this.loseMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const difficultyName = this.difficultySettings[this.selectedDifficulty].name;
        
        const resultText = isWinner ? 
            `🎉 Congratulations! 🎉\n\n${randomMessage}\n\nFinal Score: ${this.score} drops\nDifficulty: ${difficultyName}` :
            `💧 Keep Trying! 💧\n\n${randomMessage}\n\nFinal Score: ${this.score} drops\nDifficulty: ${difficultyName}`;
        
        this.gameMessage.textContent = resultText;
        this.gameMessage.className = `game-message ${isWinner ? 'winning' : 'losing'}`;
        this.gameMessage.classList.remove('hidden');
        

        setTimeout(() => {
            this.showDonationSection();
        }, 1500);

        setTimeout(() => {
            this.showResetButton();
        }, 1000);
    }
    
    showResetButton() {
        if (!this.resetBtn) {
            this.resetBtn = document.createElement('button');
            this.resetBtn.id = 'reset-btn';
            this.resetBtn.className = 'reset-button';
            this.resetBtn.textContent = 'Reset Game';
            this.resetBtn.addEventListener('click', () => this.resetGame());
            
            this.resetBtn.style.position = 'absolute';
            this.resetBtn.style.top = '70%';
            this.resetBtn.style.left = '50%';
            this.resetBtn.style.transform = 'translateX(-50%)';
            
            this.gameContainer.appendChild(this.resetBtn);
        }
        
        this.resetBtn.classList.remove('hidden');
        this.resetBtn.style.display = 'block';
    }
    
    showDonationSection() {
        const donationSection = document.getElementById('donation-section');
        if (donationSection) {
            donationSection.classList.remove('hidden');
            donationSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
    
    hideDonationSection() {
        const donationSection = document.getElementById('donation-section');
        if (donationSection) {
            donationSection.classList.add('hidden');
        }
    }
    
    resetGame() {
        this.resetGameState();
        
        this.startBtn.classList.add('hidden');
        this.startBtn.style.display = 'none';
        this.playAgainBtn.classList.add('hidden');
        this.backBtn.classList.add('hidden');
        if (this.resetBtn) {
            this.resetBtn.classList.add('hidden');
            this.resetBtn.style.display = 'none';
        }
        
        this.hideDonationSection();
        
        this.difficultySelection.style.display = 'block';
        this.selectedDifficulty = null;
        
        const gameInfo = document.querySelector('.game-info');
        gameInfo.innerHTML = `
            <p>Click the clean water drops to collect them!</p>
            <p>Avoid the dark polluted drops - they subtract points!</p>
            <p>Get 20 points to win!</p>
        `;
    }
    
    playAgain() {
        this.resetGameState();
        
        this.hideDonationSection();
        
        const settings = this.difficultySettings[this.selectedDifficulty];
        this.startBtn.classList.remove('hidden');
        this.startBtn.style.display = 'block'; // Ensure display is set
        this.startBtn.textContent = `Start ${settings.name} Game`;
        
        this.playAgainBtn.classList.add('hidden');
        this.backBtn.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WaterDropGame();
});
