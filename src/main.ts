// src/main.ts - TypeScript версия вашего оригинального калькулятора

interface Ingredient {
    name: string;
    pricePer100: number;
    color: string;
    time: number;
    flavors: string[];
    isBase: boolean;
}

const db: Ingredient[] = [
    { name: "Черный чай", pricePer100: 110, color: "#483C32", time: 5, flavors: ["Терпкость", "Солод"], isBase: true },
    { name: "Зеленый чай", pricePer100: 120, color: "#74823d", time: 3, flavors: ["Свежесть", "Травы"], isBase: true },
    { name: "Иван чай", pricePer100: 220, color: "#556b2f", time: 7, flavors: ["Мед", "Цветы"], isBase: true },
    { name: "Мята", pricePer100: 180, color: "#98ff98", time: 5, flavors: ["Прохлада"], isBase: false },
    { name: "Цедра апельсина", pricePer100: 170, color: "#ffa500", time: 8, flavors: ["Цитрус", "Горчинка"], isBase: false },
    { name: "Лаванда", pricePer100: 350, color: "#e6e6fa", time: 5, flavors: ["Аромат", "Свежесть"], isBase: false }
];

const teaAudio = new Audio('pour.mp3');
let userEditedName: boolean = false;

function playPourSound(): void {
    teaAudio.currentTime = 0;
    teaAudio.volume = 0.5;
    teaAudio.play().catch(() => {});
}

const adj: string[] = ["Горный", "Таёжный", "Солнечный", "Утренний", "Магический", "Лесной", "Бархатный", "Изумрудный", "Королевский", "Янтарный", "Золотой", "Дикий", "Тихий", "Бодрящий", "Звездный"];
const nouns: string[] = ["Сбор", "Секрет", "Шепот", "Купаж", "Рассвет", "Момент", "Вечер", "Заповедник", "Бриз", "Ритуал", "Сказка", "Поток", "Туман", "Остров", "Сад"];

function getAutoName(selected: Ingredient[]): string {
    if (selected.length === 0) return "";
    if (selected.length === 1) return `Чистый ${selected[0].name}`;

    const base = selected.find(i => i.isBase);
    const hasMint = selected.some(i => i.name === "Мята");
    const hasLavender = selected.some(i => i.name === "Лаванда");
    const hasCitrus = selected.some(i => i.name === "Цедра апельсина");

    if (hasMint && hasLavender) {
        const relaxing = ["Прованский Вечер", "Сон в летнюю ночь", "Лавандовый Бриз", "Горное Спокойствие", "Мятная Дымка"];
        return relaxing[Math.floor(Math.random() * relaxing.length)];
    }

    if (hasCitrus) {
        const citrusNames = ["Цитрусовый Драйв", "Оранжевое Солнце", "Бодрость Цедры", "Яркий Рассвет"];
        return citrusNames[Math.floor(Math.random() * citrusNames.length)];
    }

    if (base && Math.random() > 0.4) {
        const baseThemes: Record<string, string[]> = {
            "Черный чай": ["Крепость Традиций", "Английский Завтрак", "Индийское Лето"],
            "Зеленый чай": ["Дыхание Востока", "Зеленый Дракон", "Источник Энергии"],
            "Иван чай": ["Сила Предков", "Медовый Поля", "Русская Душа"]
        };
        const themes = baseThemes[base.name];
        if (themes) return themes[Math.floor(Math.random() * themes.length)];
    }

    return adj[Math.floor(Math.random() * adj.length)] + " " + nouns[Math.floor(Math.random() * nouns.length)];
}

// Создание таблицы
const tbody = document.getElementById('ingredients-body');
const jar = document.getElementById('visual-jar');
const nameInput = document.getElementById('tea-name') as HTMLInputElement;

if (tbody) {
    db.forEach((item, index) => {
        const tr = document.createElement('tr');
        const maxGrams = item.isBase ? 100 : 25;
        tr.innerHTML = `
            <td>${item.name}<span class="limit-info">${item.isBase ? "до 100г" : "до 25г"}</span></td>
            <td><input type="number" min="0" max="${maxGrams}" value="0" data-index="${index}" class="qty-input"></td>
        `;
        tbody.appendChild(tr);
    });
}

if (nameInput) {
    nameInput.addEventListener('input', () => { userEditedName = true; });
}

function calculate(e?: Event): void {
    if (e && e.type === 'input' && e.target !== nameInput) playPourSound();
    const inputs = document.querySelectorAll('.qty-input');
    let totalGrams = 0, totalPrice = 0, maxTime = 0;
    const flavors = new Set<string>();
    const selectedItems: Ingredient[] = [];
    
    if (jar) jar.innerHTML = '';
    
    inputs.forEach(input => {
        let val = parseFloat((input as HTMLInputElement).value) || 0;
        const data = db[parseInt((input as HTMLInputElement).dataset.index || '0')];
        if (!data.isBase && val > 25) { val = 25; (input as HTMLInputElement).value = '25'; }
        totalGrams += val;
        if (totalGrams > 100) { val -= (totalGrams - 100); totalGrams = 100; (input as HTMLInputElement).value = Math.max(0, val).toString(); }
        if (val > 0) {
            totalPrice += (data.pricePer100 / 100) * val;
            if (data.time > maxTime) maxTime = data.time;
            data.flavors.forEach(f => flavors.add(f));
            selectedItems.push(data);
            if (jar) {
                const l = document.createElement('div');
                l.className = 'tea-layer';
                l.style.height = `${val}%`;
                l.style.backgroundColor = data.color;
                jar.appendChild(l);
            }
        }
    });

    const totalPriceSpan = document.getElementById('total-price');
    const totalTimeSpan = document.getElementById('total-time');
    const gramCounterSpan = document.getElementById('gram-counter');
    const flavorProfileDiv = document.getElementById('flavor-profile');
    
    if (totalPriceSpan) totalPriceSpan.innerText = Math.ceil(totalPrice).toString();
    if (totalTimeSpan) totalTimeSpan.innerText = maxTime.toString();
    if (gramCounterSpan) gramCounterSpan.innerText = totalGrams.toFixed(0);
    
    if (nameInput && !userEditedName) {
        nameInput.value = getAutoName(selectedItems);
    }

    if (flavorProfileDiv) {
        flavorProfileDiv.innerHTML = flavors.size > 0 
            ? Array.from(flavors).map(f => `<span class="flavor-tag">${f}</span>`).join('') 
            : "Выберите ингредиенты...";
    }
}

// Добавляем обработчики
document.querySelectorAll('.qty-input').forEach(i => i.addEventListener('input', calculate));

// Глобальная функция для кнопки сброса
(window as any).resetCalculator = function(): void {
    document.querySelectorAll('.qty-input').forEach(i => (i as HTMLInputElement).value = '0');
    userEditedName = false;
    if (nameInput) nameInput.value = "";
    calculate();
};

// Первоначальный расчет
calculate();