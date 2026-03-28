class AetherApp {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('aether_habits')) || [];
        this.completions = JSON.parse(localStorage.getItem('aether_completions')) || {};
        this.energy = 5;
        this.today = this.getToday();
        this.init();
    }

    getToday() {
        return new Date().toISOString().split('T')[0];
    }

    init() {
        this.renderDashboard();
        this.generateCoachingSuggestion();
        this.updateMomentumScore();
    }

    save() {
        localStorage.setItem('aether_habits', JSON.stringify(this.habits));
        localStorage.setItem('aether_completions', JSON.stringify(this.completions));
    }

    createHabit(name, type, easy, normal, hard) {
        const habit = {
            id: Date.now(),
            name: name,
            type: type,
            easy: easy || 'Easy',
            normal: normal || 'Normal',
            hard: hard || 'Hard',
            difficulty: 'normal',
            capability_level: 1,
            created_at: this.today
        };
        this.habits.push(habit);
        this.save();
        this.renderHabits();
        this.renderDashboard();
    }

    deleteHabit(id) {
        this.habits = this.habits.filter(h => h.id !== id);
        this.save();
        this.renderHabits();
    }

    completeHabit(id, difficulty, effort) {
        const key = `${id}-${this.today}`;
        this.completions[key] = {
            difficulty: difficulty,
            effort: effort,
            timestamp: Date.now()
        };
        this.save();
        this.updateMomentumScore();
        this.renderDashboard();
    }

    isCompleted(id, date = this.today) {
        return !!this.completions[`${id}-${date}`];
    }

    updateMomentumScore() {
        const completed = this.habits.filter(h => this.isCompleted(h.id)).length;
        const total = this.habits.length || 1;
        const score = Math.round((completed / total) * 100);
        document.getElementById('momentumScore').textContent = score + '%';
        document.querySelector('.momentum-fill').style.width = score + '%';
    }

    generateCoachingSuggestion() {
        const energy = this.energy;
        let suggestion = '';

        if (energy < 4) {
            suggestion = '💡 Low energy detected. Sage suggests: Focus on easy versions today. Rest is productive!';
        } else if (energy >= 4 && energy <= 6) {
            suggestion = '💡 Moderate energy. Sage suggests: Try normal difficulty. Build steady momentum.';
        } else {
            suggestion = '💡 You\'re energized! Sage suggests: Challenge yourself with hard versions!';
        }

        document.getElementById('coachingSuggestion').textContent = suggestion;
    }

    renderDashboard() {
        const todayList = document.getElementById('todayHabitsList');
        
        if (this.habits.length === 0) {
            todayList.innerHTML = '<p>No habits yet. Create one to get started! 🚀</p>';
            return;
        }

        todayList.innerHTML = this.habits.map(habit => {
            const completed = this.isCompleted(habit.id);
            return `
                <div class="habit-item ${completed ? 'completed' : ''}">
                    <div>
                        <strong>${habit.name}</strong>
                        <p style="font-size: 0.85em; color: #94a3b8;">Level: ${Math.floor(habit.capability_level)} | Type: ${habit.type}</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <select onchange="app.completeHabit(${habit.id}, this.value, ${app.energy})">
                            <option value="">Select...</option>
                            <option value="easy">${habit.easy}</option>
                            <option value="normal">${habit.normal}</option>
                            <option value="hard">${habit.hard}</option>
                        </select>
                        ${completed ? '<span style="color: var(--success);">✅</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderHabits() {
        const habitsList = document.getElementById('habitsList');
        habitsList.innerHTML = this.habits.map(habit => `
            <div class="habit-item">
                <div>
                    <strong>${habit.name}</strong>
                    <p style="font-size: 0.85em; color: #94a3b8;">Type: ${habit.type}</p>
                </div>
                <button onclick="app.deleteHabit(${habit.id})" class="btn-secondary">Delete</button>
            </div>
        `).join('');
    }
}

let app = new AetherApp();

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(viewName).classList.add('active');
    event.target.classList.add('active');
}

function showHabitModal() {
    document.getElementById('habitModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function createHabit(e) {
    e.preventDefault();
    const name = document.getElementById('habitNameInput').value;
    const type = document.getElementById('habitTypeInput').value;
    const easy = document.getElementById('easyInput').value;
    const normal = document.getElementById('normalInput').value;
    const hard = document.getElementById('hardInput').value;
    
    app.createHabit(name, type, easy, normal, hard);
    document.getElementById('habitModal').classList.remove('active');
    document.getElementById('habitNameInput').value = '';
    document.getElementById('easyInput').value = '';
    document.getElementById('normalInput').value = '';
    document.getElementById('hardInput').value = '';
}

function executeSmartAction() {
    alert('🚀 Smart action: Check your habits!');
}

function updateEnergy(value) {
    app.energy = parseInt(value);
    document.getElementById('energyDisplay').textContent = value + '/10';
    app.generateCoachingSuggestion();
}

function exportData() {
    const data = { habits: app.habits, completions: app.completions };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aether-data.json';
    a.click();
}

function clearAllData() {
    if (confirm('Are you sure? This will delete all data.')) {
        localStorage.clear();
        location.reload();
    }
}

window.onclick = function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
}
