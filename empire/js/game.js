// 遊戲狀態
const gameState = {
    // 資源
    resources: {
        food: 50,
        wood: 50,
        gold: 25,
        stone: 0
    },
    
    // 人口
    population: {
        farmer: 5,
        soldier: 0,
        archer: 0,
        knight: 0,
        limit: 100
    },
    
    // 資源分配
    assignments: {
        food: 5,
        wood: 0,
        gold: 0,
        stone: 0
    },
    
    // 科技等級
    tech: {
        farming: 1,
        lumbering: 1,
        mining: 1,
        military: 1
    },
    
    // 資源產出效率
    efficiency: {
        food: 1,
        wood: 1,
        gold: 1,
        stone: 1
    },
    
    // 單位成本
    unitCosts: {
        farmer: { food: 50 },
        soldier: { food: 80, gold: 20 },
        archer: { food: 40, wood: 50, gold: 20 },
        knight: { food: 100, gold: 60, wood: 20 }
    },
    
    // 科技升級成本
    techCosts: {
        farming: { food: 200, wood: 100 },
        lumbering: { wood: 200, food: 100 },
        mining: { stone: 100, wood: 150, gold: 50 },
        military: { food: 300, gold: 150, wood: 100 }
    },
    
    // 強度值歷史
    history: {
        power: [0],
        resources: [0],
        tech: [1]
    },
    
    // 當前回合
    turn: 0
};

// 初始化遊戲
function initGame() {
    updateResourceDisplay();
    updatePopulationDisplay();
    updateAssignmentDisplay();
    updateButtonStates();
    
    // 添加事件監聽器
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.addEventListener('click', () => produceUnit(btn.dataset.unit));
    });
    
    document.querySelectorAll('.tech-btn').forEach(btn => {
        btn.addEventListener('click', () => upgradeTech(btn.dataset.tech));
    });
    
    document.querySelectorAll('.assign-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const resource = this.closest('tr').dataset.resource;
            const action = this.dataset.action;
            assignWorker(resource, action);
        });
    });
    
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateChart(this.dataset.chart);
        });
    });
    
    // 開始遊戲循環
    gameLoop();
}

// 遊戲主循環
function gameLoop() {
    setTimeout(() => {
        collectResources();
        gameState.turn++;
        
        // 每5回合更新歷史數據
        if (gameState.turn % 5 === 0) {
            updateHistory();
            updateChart(document.querySelector('.chart-tab.active').dataset.chart);
        }
        
        updateResourceDisplay();
        updateButtonStates();
        gameLoop();
    }, 1000); // 每秒更新一次
}

// 收集資源
function collectResources() {
    const { assignments, efficiency } = gameState;
    
    gameState.resources.food += assignments.food * efficiency.food;
    gameState.resources.wood += assignments.wood * efficiency.wood;
    gameState.resources.gold += assignments.gold * efficiency.gold;
    gameState.resources.stone += assignments.stone * efficiency.stone;
    
    logMessage(`收集: 食物 +${assignments.food * efficiency.food}, 木材 +${assignments.wood * efficiency.wood}, 黃金 +${assignments.gold * efficiency.gold}, 石頭 +${assignments.stone * efficiency.stone}`);
}

// 生產單位
function produceUnit(unitType) {
    const { unitCosts, population, resources } = gameState;
    const cost = unitCosts[unitType];
    
    // 檢查資源是否足夠
    for (const [resource, amount] of Object.entries(cost)) {
        if (resources[resource] < amount) {
            logMessage(`無法生產${getUnitName(unitType)}：資源不足`);
            return;
        }
    }
    
    // 檢查人口上限
    const currentPopulation = getTotalPopulation();
    if (currentPopulation >= population.limit) {
        logMessage(`無法生產${getUnitName(unitType)}：人口已達上限`);
        return;
    }
    
    // 扣除資源
    for (const [resource, amount] of Object.entries(cost)) {
        resources[resource] -= amount;
    }
    
    // 增加單位
    population[unitType]++;
    
    logMessage(`生產了1個${getUnitName(unitType)}`);
    updateResourceDisplay();
    updatePopulationDisplay();
    updateButtonStates();
}

// 升級科技
function upgradeTech(techType) {
    const { techCosts, tech, resources } = gameState;
    const currentTechLevel = tech[techType];
    const cost = {};
    
    // 科技成本隨著等級增加
    for (const [resource, amount] of Object.entries(techCosts[techType])) {
        cost[resource] = Math.floor(amount * Math.pow(1.5, currentTechLevel - 1));
    }
    
    // 檢查資源是否足夠
    for (const [resource, amount] of Object.entries(cost)) {
        if (resources[resource] < amount) {
            logMessage(`無法升級${getTechName(techType)}：資源不足`);
            return;
        }
    }
    
    // 扣除資源
    for (const [resource, amount] of Object.entries(cost)) {
        resources[resource] -= amount;
    }
    
    // 升級科技
    tech[techType]++;
    
    // 更新效率
    updateEfficiency();
    
    logMessage(`升級了${getTechName(techType)}到等級${tech[techType]}`);
    updateResourceDisplay();
    updateButtonStates();
}

// 分配工人
function assignWorker(resource, action) {
    const { assignments, population } = gameState;
    
    if (action === 'add') {
        // 檢查是否有閒置農民
        const assignedFarmers = assignments.food + assignments.wood + assignments.gold + assignments.stone;
        if (assignedFarmers >= population.farmer) {
            logMessage(`無法分配更多農民：沒有閒置農民`);
            return;
        }
        assignments[resource]++;
    } else if (action === 'remove') {
        if (assignments[resource] > 0) {
            assignments[resource]--;
        } else {
            return;
        }
    }
    
    updateAssignmentDisplay();
    logMessage(`現在有${assignments[resource]}個農民在${getResourceName(resource)}`);
}

// 更新效率
function updateEfficiency() {
    const { tech } = gameState;
    
    gameState.efficiency.food = tech.farming;
    gameState.efficiency.wood = tech.lumbering;
    gameState.efficiency.gold = tech.mining;
    gameState.efficiency.stone = tech.mining;
}

// 獲取總人口
function getTotalPopulation() {
    const { population } = gameState;
    return population.farmer + population.soldier + population.archer + population.knight;
}

// 獲取軍事實力
function getMilitaryPower() {
    const { population, tech } = gameState;
    return (population.soldier * 2 + population.archer * 3 + population.knight * 5) * tech.military;
}

// 獲取資源生產力
function getResourcePower() {
    const { assignments, efficiency } = gameState;
    return assignments.food * efficiency.food + 
           assignments.wood * efficiency.wood + 
           assignments.gold * efficiency.gold * 2 + 
           assignments.stone * efficiency.stone * 3;
}

// 更新歷史數據
function updateHistory() {
    gameState.history.power.push(getMilitaryPower());
    gameState.history.resources.push(getResourcePower());
    gameState.history.tech.push((gameState.tech.farming + gameState.tech.lumbering + gameState.tech.mining + gameState.tech.military) / 4);
    
    // 只保留最近10個數據點
    if (gameState.history.power.length > 10) {
        gameState.history.power.shift();
        gameState.history.resources.shift();
        gameState.history.tech.shift();
    }
}

// 輔助函數：更新資源顯示
function updateResourceDisplay() {
    const { resources } = gameState;
    for (const resource in resources) {
        document.querySelector(`#${resource} span`).textContent = Math.floor(resources[resource]);
    }
}

// 輔助函數：更新人口顯示
function updatePopulationDisplay() {
    const { population } = gameState;
    document.getElementById('population-count').textContent = getTotalPopulation();
    
    for (const unit in population) {
        if (unit !== 'limit') {
            document.getElementById(`${unit}-count`).textContent = population[unit];
        }
    }
}

// 輔助函數：更新工人分配顯示
function updateAssignmentDisplay() {
    const { assignments } = gameState;
    for (const resource in assignments) {
        document.querySelector(`tr[data-resource="${resource}"] .assigned-count`).textContent = assignments[resource];
    }
}

// 輔助函數：更新按鈕狀態
function updateButtonStates() {
    const { resources, unitCosts, techCosts, tech, population } = gameState;
    const currentPopulation = getTotalPopulation();
    
    // 更新單位生產按鈕狀態
    document.querySelectorAll('.unit-btn').forEach(btn => {
        const unitType = btn.dataset.unit;
        const cost = unitCosts[unitType];
        let canProduce = currentPopulation < population.limit;
        
        for (const [resource, amount] of Object.entries(cost)) {
            if (resources[resource] < amount) {
                canProduce = false;
                break;
            }
        }
        
        btn.disabled = !canProduce;
    });
    
    // 更新科技升級按鈕狀態
    document.querySelectorAll('.tech-btn').forEach(btn => {
        const techType = btn.dataset.tech;
        const currentTechLevel = tech[techType];
        const cost = {};
        
        for (const [resource, amount] of Object.entries(techCosts[techType])) {
            cost[resource] = Math.floor(amount * Math.pow(1.5, currentTechLevel - 1));
        }
        
        let canUpgrade = true;
        for (const [resource, amount] of Object.entries(cost)) {
            if (resources[resource] < amount) {
                canUpgrade = false;
                break;
            }
        }
        
        btn.disabled = !canUpgrade;
    });
}

// 遊戲日誌
function logMessage(message) {
    const logContent = document.getElementById('log-content');
    const logEntry = document.createElement('p');
    logEntry.textContent = `第 ${gameState.turn} 回合: ${message}`;
    logContent.prepend(logEntry);
    
    // 只保留最近10條日誌
    while (logContent.children.length > 10) {
        logContent.removeChild(logContent.lastChild);
    }
}

// 初始化圖表
let powerChart;
function initCharts() {
    const ctx = document.getElementById('power-chart').getContext('2d');
    powerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 10 }, (_, i) => i),
            datasets: [{
                label: '軍事力量',
                data: gameState.history.power,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 更新圖表
function updateChart(chartType) {
    if (!powerChart) return;
    
    let label, data, color;
    
    switch(chartType) {
        case 'power':
            label = '軍事力量';
            data = gameState.history.power;
            color = 'rgb(75, 192, 192)';
            break;
        case 'resources':
            label = '資源生產';
            data = gameState.history.resources;
            color = 'rgb(255, 159, 64)';
            break;
        case 'tech':
            label = '科技水平';
            data = gameState.history.tech;
            color = 'rgb(153, 102, 255)';
            break;
    }
    
    powerChart.data.datasets[0].label = label;
    powerChart.data.datasets[0].data = data;
    powerChart.data.datasets[0].borderColor = color;
    powerChart.update();
}

// 輔助函數：獲取單位名稱
function getUnitName(unitType) {
    const names = {
        farmer: '農民',
        soldier: '士兵',
        archer: '弓箭手',
        knight: '騎士'
    };
    return names[unitType] || unitType;
}

// 輔助函數：獲取科技名稱
function getTechName(techType) {
    const names = {
        farming: '農業',
        lumbering: '伐木',
        mining: '採礦',
        military: '軍事'
    };
    return names[techType] || techType;
}

// 輔助函數：獲取資源名稱
function getResourceName(resource) {
    const names = {
        food: '採集食物',
        wood: '伐木',
        gold: '採金',
        stone: '採石'
    };
    return names[resource] || resource;
}

// 啟動遊戲
document.addEventListener('DOMContentLoaded', initGame);
