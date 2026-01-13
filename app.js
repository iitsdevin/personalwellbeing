// Pain scale data
const painLevels = [
    { level: 0, label: 'No Pain', desc: 'I have no pain.' },
    { level: 1, label: 'Minimal', desc: 'My pain is hardly noticeable.' },
    { level: 2, label: 'Mild', desc: 'I have a low level of pain.' },
    { level: 3, label: 'Uncomfortable', desc: 'My pain bothers me but I can ignore it most of the time.' },
    { level: 4, label: 'Moderate', desc: 'I am constantly aware of my pain but I can continue most activities.' },
    { level: 5, label: 'Distracting', desc: 'I think about my pain most of the time.' },
    { level: 6, label: 'Distressing', desc: 'I think about my pain all the time.' },
    { level: 7, label: 'Unmanageable', desc: 'I am in pain all the time.' },
    { level: 8, label: 'Intense', desc: 'My pain is so severe that it is hard to think of anything else.' },
    { level: 9, label: 'Severe', desc: 'My pain is all that I can think about.' },
    { level: 10, label: 'Unable to Move', desc: 'I am in bed and can\'t move due to my pain.' }
];

// Emotion options
const emotions = [
    { id: 'calm', label: 'Calm', icon: '😌' },
    { id: 'happy', label: 'Happy', icon: '😊' },
    { id: 'anxious', label: 'Anxious', icon: '😰' },
    { id: 'sad', label: 'Sad', icon: '😢' },
    { id: 'frustrated', label: 'Frustrated', icon: '😤' },
    { id: 'overwhelmed', label: 'Overwhelmed', icon: '😵' },
    { id: 'content', label: 'Content', icon: '🙂' },
    { id: 'irritable', label: 'Irritable', icon: '😠' }
];

// State
let currentCheckin = null;
let selectedPain = null;
let selectedEmotion = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    renderPainScale();
    renderEmotionGrid();
    setupEventListeners();
    updateCheckinStatus();
    updateHistory();
    updateOverview();
});

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

function renderPainScale() {
    const container = document.getElementById('painScale');
    container.innerHTML = painLevels.map(pain => `
        <div class="pain-option" data-level="${pain.level}" onclick="selectPain(${pain.level})">
            <div class="pain-number">${pain.level}</div>
            <div class="pain-label">
                <strong>${pain.label}</strong>
                <span>${pain.desc}</span>
            </div>
        </div>
    `).join('');
}

function renderEmotionGrid() {
    const container = document.getElementById('emotionGrid');
    container.innerHTML = emotions.map(emotion => `
        <div class="emotion-btn" data-emotion="${emotion.id}" onclick="selectEmotion('${emotion.id}')">
            <div class="emotion-icon">${emotion.icon}</div>
            <div class="emotion-label">${emotion.label}</div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Check-in selection
    document.querySelectorAll('.checkin-card').forEach(card => {
        card.addEventListener('click', () => selectCheckin(card.dataset.checkin));
    });

    // Mental state slider
    const mentalSlider = document.getElementById('mentalSlider');
    mentalSlider.addEventListener('input', (e) => {
        document.getElementById('mentalValue').textContent = e.target.value;
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveCheckin);

    // Tab navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

function selectCheckin(checkin) {
    currentCheckin = checkin;
    document.querySelectorAll('.checkin-card').forEach(card => {
        card.classList.remove('active');
    });
    event.target.closest('.checkin-card').classList.add('active');
    document.getElementById('checkinForm').style.display = 'block';
    
    // Scroll to form
    setTimeout(() => {
        document.getElementById('checkinForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    // Load existing data if available
    loadExistingCheckin(checkin);
}

function loadExistingCheckin(checkin) {
    const today = new Date().toISOString().split('T')[0];
    const data = getStoredData();
    const todayData = data[today];
    
    if (todayData && todayData[checkin]) {
        const checkinData = todayData[checkin];
        selectPain(checkinData.pain);
        document.getElementById('mentalSlider').value = checkinData.mental;
        document.getElementById('mentalValue').textContent = checkinData.mental;
        selectEmotion(checkinData.emotion);
    } else {
        // Reset form
        selectedPain = null;
        selectedEmotion = null;
        document.querySelectorAll('.pain-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.emotion-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('mentalSlider').value = 5;
        document.getElementById('mentalValue').textContent = 5;
    }
}

function selectPain(level) {
    selectedPain = level;
    document.querySelectorAll('.pain-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-level="${level}"]`).classList.add('selected');
}

function selectEmotion(emotionId) {
    selectedEmotion = emotionId;
    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-emotion="${emotionId}"]`).classList.add('selected');
}

function saveCheckin() {
    if (!currentCheckin || selectedPain === null || !selectedEmotion) {
        alert('Please complete all fields before saving.');
        return;
    }

    const mental = parseInt(document.getElementById('mentalSlider').value);
    const today = new Date().toISOString().split('T')[0];
    
    const data = getStoredData();
    if (!data[today]) {
        data[today] = {};
    }
    
    data[today][currentCheckin] = {
        pain: selectedPain,
        mental: mental,
        emotion: selectedEmotion,
        timestamp: new Date().toISOString()
    };
    
    saveData(data);
    updateCheckinStatus();
    
    alert('Check-in saved successfully!');
    
    // Reset selection
    currentCheckin = null;
    document.querySelectorAll('.checkin-card').forEach(card => {
        card.classList.remove('active');
    });
    document.getElementById('checkinForm').style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateCheckinStatus() {
    const today = new Date().toISOString().split('T')[0];
    const data = getStoredData();
    const todayData = data[today] || {};
    
    document.querySelectorAll('.checkin-card').forEach(card => {
        const checkin = card.dataset.checkin;
        if (todayData[checkin]) {
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
        }
    });
}

function updateHistory() {
    const data = getStoredData();
    const dates = Object.keys(data).sort().reverse();
    const container = document.getElementById('historyContent');
    
    if (dates.length === 0) {
        container.innerHTML = '<div class="no-data">No check-ins recorded yet. Start tracking your wellness today!</div>';
        return;
    }
    
    container.innerHTML = dates.map(date => {
        const dayData = data[date];
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const checkins = ['morning', 'midday', 'afternoon', 'evening'];
        const checkinsHtml = checkins.map(checkin => {
            const checkinData = dayData[checkin];
            if (!checkinData) return '';
            
            const emotionObj = emotions.find(e => e.id === checkinData.emotion);
            
            return `
                <div class="checkin-summary">
                    <div class="checkin-summary-time">${checkin.charAt(0).toUpperCase() + checkin.slice(1)}</div>
                    <div class="checkin-summary-value">Pain: ${checkinData.pain}/10</div>
                    <div class="checkin-summary-value">Mental: ${checkinData.mental}/10</div>
                    <div class="checkin-summary-value">${emotionObj ? emotionObj.icon : ''} ${emotionObj ? emotionObj.label : ''}</div>
                </div>
            `;
        }).filter(html => html).join('');
        
        if (!checkinsHtml) return '';
        
        return `
            <div class="day-card">
                <div class="day-card-header">
                    <div>
                        <div class="day-date">${formattedDate}</div>
                        <div class="day-weekday">${dayName}</div>
                    </div>
                </div>
                <div class="checkin-grid">
                    ${checkinsHtml}
                </div>
            </div>
        `;
    }).filter(html => html).join('');
}

function updateOverview() {
    const data = getStoredData();
    const dates = Object.keys(data).sort();
    const last7Days = dates.slice(-7);
    
    if (last7Days.length === 0) {
        document.getElementById('avgPain').textContent = '-';
        document.getElementById('avgMental').textContent = '-';
        document.getElementById('topEmotions').innerHTML = '<span style="color: #7a8a87;">No data yet</span>';
        document.getElementById('painChart').innerHTML = '<div style="text-align: center; color: #7a8a87; padding: 40px;">No data available</div>';
        document.getElementById('mentalChart').innerHTML = '<div style="text-align: center; color: #7a8a87; padding: 40px;">No data available</div>';
        return;
    }
    
    let totalPain = 0;
    let totalMental = 0;
    let painCount = 0;
    let mentalCount = 0;
    const emotionCounts = {};
    
    const painData = [];
    const mentalData = [];
    
    last7Days.forEach(date => {
        const dayData = data[date];
        let dayPainSum = 0;
        let dayPainCount = 0;
        let dayMentalSum = 0;
        let dayMentalCount = 0;
        
        Object.values(dayData).forEach(checkin => {
            if (checkin.pain !== undefined) {
                totalPain += checkin.pain;
                painCount++;
                dayPainSum += checkin.pain;
                dayPainCount++;
            }
            if (checkin.mental !== undefined) {
                totalMental += checkin.mental;
                mentalCount++;
                dayMentalSum += checkin.mental;
                dayMentalCount++;
            }
            if (checkin.emotion) {
                emotionCounts[checkin.emotion] = (emotionCounts[checkin.emotion] || 0) + 1;
            }
        });
        
        painData.push({ date, avg: dayPainCount > 0 ? dayPainSum / dayPainCount : 0 });
        mentalData.push({ date, avg: dayMentalCount > 0 ? dayMentalSum / dayMentalCount : 0 });
    });
    
    // Calculate averages
    const avgPain = painCount > 0 ? (totalPain / painCount).toFixed(1) : '-';
    const avgMental = mentalCount > 0 ? (totalMental / mentalCount).toFixed(1) : '-';
    
    document.getElementById('avgPain').textContent = avgPain;
    document.getElementById('avgMental').textContent = avgMental;
    
    // Top emotions
    const sortedEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    const topEmotionsHtml = sortedEmotions.map(([emotionId, count]) => {
        const emotionObj = emotions.find(e => e.id === emotionId);
        return `<div class="emotion-tag">${emotionObj.icon} ${emotionObj.label} (${count})</div>`;
    }).join('');
    
    document.getElementById('topEmotions').innerHTML = topEmotionsHtml || '<span style="color: #7a8a87;">No data yet</span>';
    
    // Render charts
    renderChart('painChart', painData, 10);
    renderChart('mentalChart', mentalData, 10);
}

function renderChart(containerId, data, maxValue) {
    const container = document.getElementById(containerId);
    
    if (data.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #7a8a87; padding: 40px;">No data available</div>';
        return;
    }
    
    const html = data.map(item => {
        const height = (item.avg / maxValue) * 100;
        const dateObj = new Date(item.date);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `
            <div class="chart-bar" style="height: ${height}%;">
                <div class="chart-bar-value">${item.avg.toFixed(1)}</div>
                <div class="chart-bar-label">${label}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function switchTab(tabName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Refresh data for history and overview tabs
    if (tabName === 'history') {
        updateHistory();
    } else if (tabName === 'overview') {
        updateOverview();
    }
}

// Storage functions
function getStoredData() {
    const stored = localStorage.getItem('wellnessData');
    return stored ? JSON.parse(stored) : {};
}

function saveData(data) {
    localStorage.setItem('wellnessData', JSON.stringify(data));
}