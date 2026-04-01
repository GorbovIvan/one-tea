// Типы данных
interface Ingredient {
    name: string;
    pricePer100: number;
    color: string;
    time: number;
    flavors: string[];
    isBase: boolean;
    maxGrams: number;
}

let ingredients: Ingredient[] = [];
let userEditedName = false;
let teaAudio: HTMLAudioElement;

// DOM элементы
const tbody = document.getElementById('ingredients-body');
const jar = document.getElementById('visual-jar');
const nameInput = document.getElementById('tea-name') as HTMLInputElement;
const resetBtn = document.getElementById('reset-btn');

// Загрузка данных из JSON
async function loadData() {
    try {
        const response = await fetch('data/ingredients.json');
        const data = await response.json();
        ingredients = data.ingredients;
        renderTable();
        setupEventListeners();
        calculate();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Отрисовка таблицы из данных JSON
function renderTable() {
    if (!tbody) return;
    tbody.innerHTML = '';
    
    ingredients.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${item.name}
                <span class="limit-info">${item.isBase ? "до 100г" : "до 25г"}</span>
            </td>
            <td>
                <input type="number" 
                       min="0" 
                       max="${item.maxGrams}" 
                       value="0" 
                       data-index="${index}" 
                       class="qty-input">
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Звук
    teaAudio = new Audio('pour.mp3');
    teaAudio.volume = 0.5;
    
    // Поля ввода
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('input', () => {
            playPourSound();
            calculate();
        });
    });
    
    // Поле названия
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            userEditedName = true;
        });
    }
    
    // Кнопка сброса
    if (resetBtn) {
        resetBtn.addEventListener('click', resetCalculator);
    }
}

function playPourSound() {
    if (teaAudio) {
        teaAudio.currentTime = 0;
        teaAudio.play().catch(() => {});
    }
}

// Генерация названия
const adjectives = ["Горный", "Таёжный", "Солнечный", "Утренний", "Магический", "Лесной", "Бархатный", "Изумрудный", "Королевский", "Янтарный", "Золотой", "Дикий", "Тихий", "Бодрящий", "Звездный"];
const nouns = ["Сбор", "Секрет", "Шепот", "Купаж", "Рассвет", "Момент", "Вечер", "Заповедник", "Бриз", "Ритуал", "Сказка", "Поток", "Туман", "Остров", "Сад"];

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

    return adjectives[Math.floor(Math.random() * adjectives.length)] + " " + nouns[Math.floor(Math.random() * nouns.length)];
}

// Основная функция расчета
function calculate() {
    const inputs = document.querySelectorAll('.qty-input');
    let totalGrams = 0, totalPrice = 0, maxTime = 0;
    const flavors = new Set<string>();
    const selectedItems: Ingredient[] = [];
    
    if (jar) jar.innerHTML = '';
    
    inputs.forEach(input => {
        const idx = parseInt((input as HTMLInputElement).dataset.index || '0');
        let val = parseFloat((input as HTMLInputElement).value) || 0;
        const ingredient = ingredients[idx];
        if (!ingredient) return;
        
        // Ограничения
        if (!ingredient.isBase && val > 25) {
            val = 25;
            (input as HTMLInputElement).value = '25';
        }
        
        totalGrams += val;
        
        // Коррекция если больше 100г
        if (totalGrams > 100) {
            val -= (totalGrams - 100);
            totalGrams = 100;
            (input as HTMLInputElement).value = Math.max(0, val).toString();
        }
        
        if (val > 0) {
            totalPrice += (ingredient.pricePer100 / 100) * val;
            if (ingredient.time > maxTime) maxTime = ingredient.time;
            ingredient.flavors.forEach(f => flavors.add(f));
            selectedItems.push(ingredient);
            
            if (jar) {
                const layer = document.createElement('div');
                layer.className = 'tea-layer';
                layer.style.height = `${val}%`;
                layer.style.backgroundColor = ingredient.color;
                jar.appendChild(layer);
            }
        }
    });
    
    // Обновление UI
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

// Сброс калькулятора
function resetCalculator() {
    document.querySelectorAll('.qty-input').forEach(input => {
        (input as HTMLInputElement).value = '0';
    });
    userEditedName = false;
    if (nameInput) nameInput.value = '';
    calculate();
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});