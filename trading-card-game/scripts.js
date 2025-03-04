// 遊戲數據和變數
let userMoney = 1000;
const packPrice = 200;
let userCollection = {};
let currentCardDetail = null;

// 卡牌數據，包含稀有度和價值
const cardData = [
    // 普通卡牌 (70% 機率)
    { id: 1, name: "火焰精靈", rarity: "normal", value: 5, image: "https://via.placeholder.com/90/FF5733/FFFFFF?text=火焰精靈" },
    { id: 2, name: "水之守護", rarity: "normal", value: 5, image: "https://via.placeholder.com/90/33A1FF/FFFFFF?text=水之守護" },
    { id: 3, name: "森林使者", rarity: "normal", value: 10, image: "https://via.placeholder.com/90/33FF57/000000?text=森林使者" },
    { id: 4, name: "石頭巨人", rarity: "normal", value: 5, image: "https://via.placeholder.com/90/A9A9A9/FFFFFF?text=石頭巨人" },
    { id: 5, name: "微風騎士", rarity: "normal", value: 10, image: "https://via.placeholder.com/90/E6E6FA/000000?text=微風騎士" },
    { id: 6, name: "冰霜巫師", rarity: "normal", value: 70, image: "https://via.placeholder.com/90/ADD8E6/000000?text=冰霜巫師" },
    { id: 7, name: "閃電魔導", rarity: "normal", value: 35, image: "https://via.placeholder.com/90/FFFF00/000000?text=閃電魔導" },
    
    // 稀有卡牌 (20% 機率)
    { id: 8, name: "暗影刺客", rarity: "rare", value: 15, image: "https://via.placeholder.com/90/800080/FFFFFF?text=暗影刺客" },
    { id: 9, name: "光明祭司", rarity: "rare", value: 60, image: "https://via.placeholder.com/90/FFFF99/000000?text=光明祭司" },
    { id: 10, name: "時間旅者", rarity: "rare", value: 75, image: "https://via.placeholder.com/90/4682B4/FFFFFF?text=時間旅者" },
    { id: 11, name: "龍騎士", rarity: "rare", value: 150, image: "https://via.placeholder.com/90/8B0000/FFFFFF?text=龍騎士" },
    
    // 超稀有卡牌 (8% 機率)
    { id: 12, name: "虛空領主", rarity: "ultra-rare", value: 300, image: "https://via.placeholder.com/90/4B0082/FFFFFF?text=虛空領主" },
    { id: 13, name: "宇宙女神", rarity: "ultra-rare", value: 800, image: "https://via.placeholder.com/90/9932CC/FFFFFF?text=宇宙女神" },
    { id: 14, name: "幻獸大師", rarity: "ultra-rare", value: 450, image: "https://via.placeholder.com/90/FF1493/FFFFFF?text=幻獸大師" },
    
    // 王冠卡牌 (2% 機率)
    { id: 15, name: "創世神", rarity: "crown", value: 5000, image: "https://via.placeholder.com/90/FFD700/000000?text=創世神明" },
    { id: 16, name: "混沌魔王", rarity: "crown", value: 3500, image: "https://via.placeholder.com/90/000000/FFD700?text=混沌魔王" }
];

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    updateUserMoney();
    
    // 為開包按鈕添加點擊事件
    document.getElementById('open-pack-btn').addEventListener('click', openPack);
    
    // 標籤切換功能
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // 賣出卡牌按鈕
    document.getElementById('sell-card-btn').addEventListener('click', sellCurrentCard);
    
    // 關閉模態框
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // 稀有度過濾器
    document.getElementById('rarity-filter').addEventListener('change', filterCollection);
    
    // 載入示範卡牌到收藏夾
    addInitialCards();
});

// 添加一些初始卡牌到玩家收藏
function addInitialCards() {
    // 添加幾張初始卡牌
    addCardToCollection(cardData[0], 3); // 3張火焰精靈
    addCardToCollection(cardData[1], 2); // 2張水之守護
    addCardToCollection(cardData[7], 1); // 1張暗影刺客
    
    updateCollectionDisplay();
}

// 開啟卡包
function openPack() {
    if (userMoney < packPrice) {
        alert('金幣不足！');
        return;
    }
    
    // 扣除開包費用
    userMoney -= packPrice;
    updateUserMoney();
    
    // 隨機獲取5張卡牌
    const drawnCards = drawRandomCards(5);
    
    // 清空結果區域
    const resultContainer = document.getElementById('cards-result');
    resultContainer.innerHTML = '';
    
    // 顯示獲得的卡牌
    setTimeout(() => {
        drawnCards.forEach((card, index) => {
            setTimeout(() => {
                const cardElement = createCardElement(card);
                cardElement.classList.add('card-reveal');
                resultContainer.appendChild(cardElement);
                
                // 添加到收藏
                addCardToCollection(card);
            }, index * 300);
        });
        
        // 更新收藏顯示
        setTimeout(() => {
            updateCollectionDisplay();
        }, 1600);
    }, 500);
}

// 隨機抽取卡牌
function drawRandomCards(count) {
    const cards = [];
    
    for (let i = 0; i < count; i++) {
        const randomNum = Math.random() * 100;
        let card;
        
        if (randomNum < 2) { // 2% 王冠
            card = getRandomCardByRarity('crown');
        } else if (randomNum < 10) { // 8% 超稀有
            card = getRandomCardByRarity('ultra-rare');
        } else if (randomNum < 30) { // 20% 稀有
            card = getRandomCardByRarity('rare');
        } else { // 70% 普通
            card = getRandomCardByRarity('normal');
        }
        
        cards.push(card);
    }
    
    return cards;
}

// 根據稀有度獲取隨機卡牌
function getRandomCardByRarity(rarity) {
    const cardsOfRarity = cardData.filter(card => card.rarity === rarity);
    const randomIndex = Math.floor(Math.random() * cardsOfRarity.length);
    return cardsOfRarity[randomIndex];
}

// 創建卡牌元素
function createCardElement(card, count = null) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.rarity}`;
    cardElement.dataset.cardId = card.id;
    
    cardElement.innerHTML = `
        <div class="card-header">
            <h3>${card.name}</h3>
        </div>
        <div class="card-body">
            <img src="${card.image}" alt="${card.name}" class="card-image">
        </div>
        <div class="card-footer">
            <span class="card-price">${card.value} 金幣</span>
        </div>
    `;
    
    // 如果有數量，顯示數量標記
    if (count !== null && count > 1) {
        const countElement = document.createElement('div');
        countElement.className = 'card-count';
        countElement.textContent = count;
        cardElement.appendChild(countElement);
    }
    
    // 添加點擊事件查看詳情
    cardElement.addEventListener('click', () => showCardDetails(card));
    
    return cardElement;
}

// 添加卡牌到收藏
function addCardToCollection(card, count = 1) {
    const cardId = card.id;
    
    if (userCollection[cardId]) {
        userCollection[cardId].count += count;
    } else {
        userCollection[cardId] = {
            cardData: card,
            count: count
        };
    }
}

// 更新收藏顯示
function updateCollectionDisplay() {
    const collectionContainer = document.getElementById('collection-container');
    collectionContainer.innerHTML = '';
    
    const selectedRarity = document.getElementById('rarity-filter').value;
    
    for (const cardId in userCollection) {
        const item = userCollection[cardId];
        
        // 如果選擇了過濾，且稀有度不匹配，則跳過
        if (selectedRarity !== 'all' && item.cardData.rarity !== selectedRarity) {
            continue;
        }
        
        const cardElement = createCardElement(item.cardData, item.count);
        collectionContainer.appendChild(cardElement);
    }
    
    // 更新銷售區域
    updateSellDisplay();
}

// 更新銷售區域顯示
function updateSellDisplay() {
    const sellContainer = document.getElementById('sell-container');
    sellContainer.innerHTML = '';
    
    for (const cardId in userCollection) {
        const item = userCollection[cardId];
        if (item.count > 0) {
            const cardElement = createCardElement(item.cardData, item.count);
            sellContainer.appendChild(cardElement);
        }
    }
}

// 過濾收藏
function filterCollection() {
    updateCollectionDisplay();
}

// 顯示卡牌詳情
function showCardDetails(card) {
    currentCardDetail = card;
    
    const modal = document.getElementById('card-modal');
    const detailsContainer = document.getElementById('modal-card-details');
    
    detailsContainer.innerHTML = `
        <div class="card ${card.rarity}" style="margin: 0 auto; width: 200px; height: 280px;">
            <div class="card-header">
                <h2>${card.name}</h2>
            </div>
            <div class="card-body">
                <img src="${card.image}" alt="${card.name}" class="card-image" style="width: 120px; height: 120px;">
            </div>
            <div class="card-footer">
                <p>稀有度: ${translateRarity(card.rarity)}</p>
                <p>價值: ${card.value} 金幣</p>
                <p>數量: ${userCollection[card.id]?.count || 0}</p>
            </div>
        </div>
    `;
    
    // 根據卡牌數量啟用或禁用銷售按鈕
    const sellBtn = document.getElementById('sell-card-btn');
    if (userCollection[card.id] && userCollection[card.id].count > 0) {
        sellBtn.disabled = false;
    } else {
        sellBtn.disabled = true;
    }
    
    modal.style.display = 'block';
}

// 售出當前選中的卡牌
function sellCurrentCard() {
    if (!currentCardDetail) return;
    
    const cardId = currentCardDetail.id;
    
    if (userCollection[cardId] && userCollection[cardId].count > 0) {
        userCollection[cardId].count--;
        userMoney += currentCardDetail.value;
        updateUserMoney();
        
        // 關閉模態框
        closeModal();
        
        // 更新收藏顯示
        updateCollectionDisplay();
    }
}

// 關閉模態框
function closeModal() {
    document.getElementById('card-modal').style.display = 'none';
}

// 切換標籤
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 更新用戶金幣顯示
function updateUserMoney() {
    document.getElementById('user-money').textContent = `金幣: ${userMoney}`;
}

// 翻譯稀有度到中文
function translateRarity(rarity) {
    const translations = {
        'normal': '普通',
        'rare': '稀有',
        'ultra-rare': '超稀有',
        'crown': '王冠'
    };
    
    return translations[rarity] || rarity;
}
