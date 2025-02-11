// 游戏数据
let enemyHealth = 50;
let enemyAttack = 5; // 敌人基础攻击力
let gold = 0;
let skillCooldown = 0;
let experience = 0;
let level = 1;
let playerHealth = 150; // 玩家当前生命值

// 角色属性
const role = {
    name: "战士",
    attack: 20,
    maxHealth: 150, // 最大生命值
    critRate: 0.1,
    skillDamage: 30
};

// 装备属性
const equipmentTypes = ["武器", "护甲", "饰品", "鞋子"];
const qualities = ["普通", "稀有", "史诗", "传说"];
const randomAttributes = ["攻击力", "生命值", "暴击率", "技能冷却缩减", "生命偷取"];

// 玩家装备
let playerEquipment = {
    weapon: null,
    armor: null,
    accessory: null,
    shoes: null
};

// 背包
let backpack = [];
const backpackCapacity = 20;

// 生成随机装备
function generateRandomEquipment() {
    const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    const quality = qualities[Math.floor(Math.random() * qualities.length)];
    const baseStats = {
        "武器": { attack: 10 },
        "护甲": { defense: 5 }, // 护甲改为防御属性，减少受到的伤害
        "饰品": { skillDamage: 20, critRate: 0.1, lifeSteal: 0.1 }, // 生命偷取
        "鞋子": { dodgeRate: 0.1 } // 闪避率
    };
    const equipment = {
        type: type,
        quality: quality,
        stats: { ...baseStats[type] }
    };

    // 根据品质添加随机属性
    const qualityIndex = qualities.indexOf(quality);
    for (let i = 0; i < qualityIndex; i++) {
        const randomAttr = randomAttributes[Math.floor(Math.random() * randomAttributes.length)];
        equipment.stats[randomAttr] = Math.floor(Math.random() * 10);
    }

    return equipment;
}

// 敌人攻击玩家
function enemyAttackPlayer() {
    if (enemyHealth > 0) {
        // 计算闪避率
        const dodgeRate = playerEquipment.shoes ? playerEquipment.shoes.stats.dodgeRate : 0;
        const isDodge = Math.random() < dodgeRate;
        
        if (!isDodge) {
            // 计算护甲减伤
            const defense = playerEquipment.armor ? playerEquipment.armor.stats.defense : 0;
            const damage = Math.max(enemyAttack - defense, 1); // 至少造成1点伤害
            playerHealth -= damage;
            alert(`敌人对你造成了 ${damage} 点伤害！`);
            
            // 检查玩家是否死亡
            if (playerHealth <= 0) {
                alert("你被击败了！游戏结束。");
                location.reload(); // 重新加载游戏
            }
        } else {
            alert("你成功闪避了敌人的攻击！");
        }
    }
}

// 击败敌人
function defeatEnemy() {
    gold += 10;
    experience += 20;
    
    // 刷新更强的敌人
    enemyHealth = 50 + Math.floor(Math.random() * 50) + (level * 10);
    enemyAttack = 5 + Math.floor(level * 0.5);

    // 检查升级
    if (experience >= 100) {
        level++;
        experience = 0;
        role.attack += 5;
        role.maxHealth += 20;
        playerHealth = role.maxHealth; // 升级后恢复满血
        alert(`升级了！当前等级: ${level}`);
    }

    // 随机掉落装备
    if (Math.random() < 0.5 && backpack.length < backpackCapacity) {
        const newEquipment = generateRandomEquipment();
        backpack.push(newEquipment);
        alert(`获得了 ${newEquipment.quality} ${newEquipment.type}！`);
    }
}

// 更新角色属性
function updateStats() {
    let attack = role.attack;
    let maxHealth = role.maxHealth;
    let skillDamage = role.skillDamage;
    let critRate = role.critRate;

    for (const key in playerEquipment) {
        const item = playerEquipment[key];
        if (item) {
            attack += item.stats.attack || 0;
            maxHealth += item.stats.health || 0;
            skillDamage += item.stats.skillDamage || 0;
            critRate += item.stats.critRate || 0;
        }
    }

    // 更新UI
    document.getElementById('attack').textContent = attack;
    document.getElementById('health').textContent = `${playerHealth}/${maxHealth}`;
    document.getElementById('skillDamage').textContent = skillDamage;
    document.getElementById('critRate').textContent = (critRate * 100).toFixed(0) + "%";
}

// 攻击敌人
function attack() {
    if (enemyHealth > 0) {
        const baseAttack = role.attack + (playerEquipment.weapon ? playerEquipment.weapon.stats.attack : 0);
        const critRate = role.critRate + (playerEquipment.accessory ? playerEquipment.accessory.stats.critRate : 0);
        const isCrit = Math.random() < critRate;
        const damage = isCrit ? baseAttack * 2 : baseAttack;

        enemyHealth -= damage;
        if (enemyHealth <= 0) {
            defeatEnemy();
        }

        // 生命偷取
        const lifeSteal = playerEquipment.accessory ? playerEquipment.accessory.stats.lifeSteal : 0;
        if (lifeSteal > 0) {
            const healAmount = Math.floor(damage * lifeSteal);
            playerHealth = Math.min(playerHealth + healAmount, role.maxHealth);
            alert(`生命偷取: 恢复了 ${healAmount} 点生命值！`);
        }
    }
    updateUI();
}

// 使用技能
function useSkill() {
    if (skillCooldown === 0) {
        const skillDamageValue = role.skillDamage + (playerEquipment.accessory ? playerEquipment.accessory.stats.skillDamage : 0);
        enemyHealth -= skillDamageValue;
        if (enemyHealth <= 0) {
            defeatEnemy();
        }
        skillCooldown = 3;
    }
    updateUI();
}

// 自动战斗
setInterval(() => {
    if (enemyHealth > 0) {
        const attackValue = role.attack + (playerEquipment.weapon ? playerEquipment.weapon.stats.attack : 0);
        enemyHealth -= attackValue;
        if (enemyHealth <= 0) {
            defeatEnemy();
        }
    }
    updateUI();
}, 2000);

// 敌人每3秒攻击一次玩家
setInterval(() => {
    enemyAttackPlayer();
    updateUI();
}, 3000);

// 打开角色界面
function openRolePanel() {
    let roleHTML = "<h2>角色信息</h2>";
    roleHTML += `<p>当前角色: ${role.name}</p>`;
    roleHTML += `<p>攻击力: ${role.attack + (playerEquipment.weapon ? playerEquipment.weapon.stats.attack : 0)}</p>`;
    roleHTML += `<p>生命值: ${playerHealth}/${role.maxHealth + (playerEquipment.armor ? playerEquipment.armor.stats.health : 0)}</p>`;
    roleHTML += `<p>技能伤害: ${role.skillDamage + (playerEquipment.accessory ? playerEquipment.accessory.stats.skillDamage : 0)}</p>`;
    roleHTML += `<p>暴击率: ${((role.critRate + (playerEquipment.accessory ? playerEquipment.accessory.stats.critRate : 0)) * 100).toFixed(0)}%</p>`;
    roleHTML += "<h3>当前装备</h3>";
    roleHTML += "<ul>";
    for (const key in playerEquipment) {
        if (playerEquipment[key]) {
            roleHTML += `<li>${playerEquipment[key].type}: ${playerEquipment[key].quality} (${formatStats(playerEquipment[key].stats)})</li>`;
        }
    }
    roleHTML += "</ul>";
    roleHTML += "<button onclick=\"closeRolePanel()\">关闭角色界面</button>";
    document.getElementById('rolePanel').innerHTML = roleHTML;
    document.getElementById('rolePanel').style.display = 'block';
}

// 关闭角色界面
function closeRolePanel() {
    document.getElementById('rolePanel').style.display = 'none';
}

// 打开背包界面
function openBackpack() {
    let backpackHTML = "<h2>背包</h2>";
    backpackHTML += "<ul>";
    backpack.forEach((item, index) => {
        backpackHTML += `<li>
            ${item.quality} ${item.type} (${formatStats(item.stats)})
            <button onclick="equipItemFromBackpack(${index})">穿戴</button>
            <button onclick="sellItemFromBackpack(${index})">出售</button>
        </li>`;
    });
    backpackHTML += "</ul>";
    backpackHTML += "<button onclick=\"closeBackpack()\">关闭背包</button>";
    document.getElementById('backpack').innerHTML = backpackHTML;
    document.getElementById('backpack').style.display = 'block';
}

// 从背包穿戴装备
function equipItemFromBackpack(index) {
    const item = backpack[index];
    if (playerEquipment[item.type.toLowerCase()]) {
        backpack.push(playerEquipment[item.type.toLowerCase()]); // 卸下当前装备
    }
    playerEquipment[item.type.toLowerCase()] = item;
    backpack.splice(index, 1); // 从背包移除
    updateStats();
    openBackpack();
}

// 从背包出售装备
function sellItemFromBackpack(index) {
    const item = backpack[index];
    gold += 20; // 出售装备获得金币
    backpack.splice(index, 1); // 从背包移除
    updateStats();
    openBackpack();
}

// 关闭背包界面
function closeBackpack() {
    document.getElementById('backpack').style.display = 'none';
}

// 格式化装备属性
function formatStats(stats) {
    let result = [];
    for (const key in stats) {
        switch (key) {
            case "attack":
                result.push(`攻击力: ${stats[key]}`);
                break;
            case "health":
                result.push(`生命值: ${stats[key]}`);
                break;
            case "skillDamage":
                result.push(`技能伤害: ${stats[key]}`);
                break;
            case "critRate":
                result.push(`暴击率: ${(stats[key] * 100).toFixed(0)}%`);
                break;
            case "dodgeRate":
                result.push(`闪避率: ${(stats[key] * 100).toFixed(0)}%`);
                break;
            case "lifeSteal":
                result.push(`生命偷取: ${(stats[key] * 100).toFixed(0)}%`);
                break;
            case "speed":
                result.push(`速度: ${stats[key]}`);
                break;
        }
    }
    return result.join(", ");
}
// 添加日志功能
function addToLog(message, isImportant = false) {
    const logDiv = document.getElementById('log');
    const logMessage = document.createElement('div');
    logMessage.className = 'log-message';
    logMessage.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    if (isImportant) logMessage.style.color = '#ff4444'; // 重要信息用红色
    logDiv.appendChild(logMessage);
    // 自动滚动到底部
    logDiv.scrollTop = logDiv.scrollHeight;
}

// 显示/隐藏日志
function toggleLog() {
    const logDiv = document.getElementById('log');
    logDiv.style.display = logDiv.style.display === 'none' ? 'block' : 'none';
}

// 修改原有逻辑（替换所有alert为addToLog）
// 示例：击败敌人时的日志
function defeatEnemy() {
    gold += 10;
    experience += 20;
    enemyHealth = 50 + Math.floor(Math.random() * 50) + (level * 10);
    enemyAttack = 5 + Math.floor(level * 0.5);
    addToLog(`击败了敌人！获得10金币，20经验值。`, true);

    if (experience >= 100) {
        level++;
        experience = 0;
        role.attack += 5;
        role.maxHealth += 20;
        playerHealth = role.maxHealth;
        addToLog(`升级到 ${level} 级！生命值和攻击力提升了！`, true);
    }

    if (Math.random() < 0.5 && backpack.length < backpackCapacity) {
        const newEquipment = generateRandomEquipment();
        backpack.push(newEquipment);
        addToLog(`获得了 ${newEquipment.quality} ${newEquipment.type}！`);
    }
}

// 敌人攻击玩家（修改后）
function enemyAttackPlayer() {
    if (enemyHealth > 0) {
        const dodgeRate = playerEquipment.shoes ? playerEquipment.shoes.stats.dodgeRate : 0;
        const isDodge = Math.random() < dodgeRate;
        
        if (!isDodge) {
            const defense = playerEquipment.armor ? playerEquipment.armor.stats.defense : 0;
            const damage = Math.max(enemyAttack - defense, 1);
            playerHealth -= damage;
            addToLog(`敌人对你造成了 ${damage} 点伤害！`, true);
            
            if (playerHealth <= 0) {
                addToLog("你被击败了！游戏结束。", true);
                setTimeout(() => location.reload(), 2000);
            }
        } else {
            addToLog("你成功闪避了敌人的攻击！");
        }
    }
}

// 生命偷取提示（修改后）
function attack() {
    if (enemyHealth > 0) {
        // ...（原有逻辑）
        if (lifeSteal > 0) {
            const healAmount = Math.floor(damage * lifeSteal);
            playerHealth = Math.min(playerHealth + healAmount, role.maxHealth);
            addToLog(`生命偷取: 恢复了 ${healAmount} 点生命值！`);
        }
    }
    updateUI();
}