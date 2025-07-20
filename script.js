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
        
        // Current game settings (will be set based on difficulty)
        this.dropSpeed = 1.3;
        this.dropSpawnRate = 600;
        this.pollutedDropChance = 0.25;
        this.speedIncrease = 0.2;
        
        // Arrays of win/lose messages
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
        
        // Add difficulty selection event listeners
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectDifficulty(btn.dataset.difficulty);
            });
        });
        
        // Add time slider event listener
        this.timeSlider.addEventListener('input', (e) => {
            this.updateTimeSelection(parseInt(e.target.value));
        });
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.backBtn.addEventListener('click', () => this.showDifficultySelection());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        // Add keyboard support
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
        
        // Update timer display
        this.updateTimer();
    }
    
    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        const settings = this.difficultySettings[difficulty];
        
        // Reset game state
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
        
        // Update game info based on difficulty
        this.updateGameInfo(difficulty);
    }
    
    resetGameState() {
        // Clear all intervals
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.speedUpInterval) clearInterval(this.speedUpInterval);
        
        // Reset game variables
        this.gameActive = false;
        this.gameEnded = false;
        this.score = 0;
        this.timeLeft = this.gameDuration;
        
        // Clear all drops
        this.clearAllDrops();
        
        // Hide messages and buttons
        this.gameMessage.classList.add('hidden');
        this.playAgainBtn.classList.add('hidden');
        if (this.resetBtn) {
            this.resetBtn.classList.add('hidden');
            this.resetBtn.style.display = 'none';
        }
        
        // Update displays
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
        
        // Clear any existing drops
        this.clearAllDrops();
        
        // Start timer countdown
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Start spawning water drops
        this.gameInterval = setInterval(() => {
            this.createWaterDrop();
        }, this.dropSpawnRate);
        
        // Speed up drop spawning as game progresses (based on difficulty)
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
        
        // Determine if this is a polluted drop
        const isPolluted = Math.random() < this.pollutedDropChance;
        drop.classList.add('water-drop');
        
        if (isPolluted) {
            drop.classList.add('polluted');
            drop.setAttribute('data-type', 'polluted');
        } else {
            drop.setAttribute('data-type', 'clean');
        }
        
        // Larger sizes for easier clicking (40-80px on desktop, 50-90px on mobile)
        const isMobile = window.innerWidth <= 768;
        const minSize = isMobile ? 50 : 40;
        const maxSize = isMobile ? 90 : 80;
        const size = Math.random() * (maxSize - minSize) + minSize;
        drop.style.width = `${size}px`;
        drop.style.height = `${size}px`;
        
        // Random horizontal position
        const containerWidth = this.gameContainer.offsetWidth;
        const maxLeft = containerWidth - size;
        drop.style.left = `${Math.random() * maxLeft}px`;
        drop.style.top = '-60px';
        
        // Track if drop is being removed to prevent multiple clicks
        let isRemoving = false;
        let animationId = null;
        
        // Store the original fall speed to prevent speed changes
        const fallSpeed = this.dropSpeed + Math.random() * 0.3;
        
        // Add multiple event listeners for better responsiveness
        const handleClick = (e) => {
            if (!this.gameActive || this.gameEnded || isRemoving) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent multiple clicks on same drop
            if (drop.classList.contains('clicked') || drop.classList.contains('clicked-polluted')) {
                return;
            }
            
            // Mark as being removed
            isRemoving = true;
            
            // Immediately stop fall animation
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            // Stop the drop from falling immediately and lock its position
            drop.style.pointerEvents = 'none';
            const currentTop = drop.style.top;
            drop.style.top = currentTop; // Lock current position
            
            if (isPolluted) {
                // Polluted drop - subtract points
                this.score = Math.max(0, this.score - 2);
                drop.classList.add('clicked-polluted');
            } else {
                // Clean drop - add points
                this.score++;
                drop.classList.add('clicked');
            }
            
            this.updateScore();
            
            // Remove drop after animation completes
            setTimeout(() => {
                if (drop.parentNode) {
                    drop.remove();
                }
            }, 400);
        };
        
        // Add both click and touch events
        drop.addEventListener('click', handleClick, { once: true });
        drop.addEventListener('touchstart', handleClick, { once: true, passive: false });
        
        // Prevent context menu on long press
        drop.addEventListener('contextmenu', (e) => e.preventDefault());
        
        this.gameContainer.appendChild(drop);
        animationId = this.animateDrop(drop, fallSpeed, () => isRemoving);
    }
    
    animateDrop(drop, fallSpeed, isRemovingCheck) {
        let animationId;
        
        const animate = () => {
            // Check if drop is being removed
            if (!this.gameActive || !drop.parentNode || isRemovingCheck()) {
                if (animationId) cancelAnimationFrame(animationId);
                return;
            }
            
            // Stop animation if drop has click classes (double check)
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
        
        // Clear all intervals
        clearInterval(this.gameInterval);
        clearInterval(this.timerInterval);
        clearInterval(this.speedUpInterval);
        
        // Remove all remaining drops
        this.clearAllDrops();
        
        // Show end game message
        this.showEndGameMessage();
        
        // Show play again and back buttons after delay
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
        
        // Show reset button after showing the message
        setTimeout(() => {
            this.showResetButton();
        }, 1000);
    }
    
    showResetButton() {
        // Create reset button if it doesn't exist
        if (!this.resetBtn) {
            this.resetBtn = document.createElement('button');
            this.resetBtn.id = 'reset-btn';
            this.resetBtn.className = 'reset-button';
            this.resetBtn.textContent = 'Reset Game';
            this.resetBtn.addEventListener('click', () => this.resetGame());
            
            // Position the button below the game message
            this.resetBtn.style.position = 'absolute';
            this.resetBtn.style.top = '70%';
            this.resetBtn.style.left = '50%';
            this.resetBtn.style.transform = 'translateX(-50%)';
            
            this.gameContainer.appendChild(this.resetBtn);
        }
        
        // Show the reset button
        this.resetBtn.classList.remove('hidden');
        this.resetBtn.style.display = 'block';
    }
    
    resetGame() {
        // Reset everything completely
        this.resetGameState();
        
        // Hide all buttons
        this.startBtn.classList.add('hidden');
        this.startBtn.style.display = 'none';
        this.playAgainBtn.classList.add('hidden');
        this.backBtn.classList.add('hidden');
        if (this.resetBtn) {
            this.resetBtn.classList.add('hidden');
            this.resetBtn.style.display = 'none';
        }
        
        // Show difficulty selection
        this.difficultySelection.style.display = 'block';
        this.selectedDifficulty = null;
        
        // Reset game info
        const gameInfo = document.querySelector('.game-info');
        gameInfo.innerHTML = `
            <p>Click the clean water drops to collect them!</p>
            <p>Avoid the dark polluted drops - they subtract points!</p>
            <p>Get 20 points to win!</p>
        `;
    }
    
    playAgain() {
        // Reset game state but keep the same difficulty
        this.resetGameState();
        
        // Show start button with current difficulty
        const settings = this.difficultySettings[this.selectedDifficulty];
        this.startBtn.classList.remove('hidden');
        this.startBtn.style.display = 'block'; // Ensure display is set
        this.startBtn.textContent = `Start ${settings.name} Game`;
        
        // Hide play again button
        this.playAgainBtn.classList.add('hidden');
        this.backBtn.classList.remove('hidden');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WaterDropGame();
});
