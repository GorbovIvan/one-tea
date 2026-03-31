import { Ingredient, ConstructorState } from '../types/tea.types';
import { CalculatorService } from '../services/CalculatorService';
import { NameGeneratorService } from '../services/NameGeneratorService';
import { AudioService } from '../services/AudioService';

export class TeaConstructor {
    private ingredients: Ingredient[];
    private calculator: CalculatorService;
    private nameGenerator: NameGeneratorService;
    private audioService: AudioService;
    private state: ConstructorState;
    
    // DOM элементы
    private tbody: HTMLElement | null;
    private jar: HTMLElement | null;
    private totalPriceSpan: HTMLElement | null;
    private totalTimeSpan: HTMLElement | null;
    private gramCounterSpan: HTMLElement | null;
    private flavorProfileDiv: HTMLElement | null;
    private nameInput: HTMLInputElement | null;
    
    constructor() {
        this.ingredients = [];
        this.calculator = new CalculatorService();
        this.nameGenerator = new NameGeneratorService();
        this.audioService = new AudioService();
        
        this.state = {
            selectedIngredients: new Map(),
            totalGrams: 0,
            totalPrice: 0,
            brewTime: 0,
            flavors: new Set(),
            blendName: '',
            isNameUserEdited: false
        };
        
        // Инициализация DOM элементов
        this.tbody = document.getElementById('ingredients-body');
        this.jar = document.getElementById('visual-jar');
        this.totalPriceSpan = document.getElementById('total-price');
        this.totalTimeSpan = document.getElementById('total-time');
        this.gramCounterSpan = document.getElementById('gram-counter');
        this.flavorProfileDiv = document.getElementById('flavor-profile');
        this.nameInput = document.getElementById('tea-name') as HTMLInputElement;
    }
    
    init(ingredients: Ingredient[]): void {
        this.ingredients = ingredients;
        this.renderIngredientTable();
        this.attachEventListeners();
        this.calculate();
    }
    
    private renderIngredientTable(): void {
        if (!this.tbody) return;
        
        this.tbody.innerHTML = '';
        
        this.ingredients.forEach((ingredient, index) => {
            const tr = document.createElement('tr');
            const maxGrams = ingredient.maxGrams || (ingredient.isBase ? 100 : 25);
            
            tr.innerHTML = `
                <td>${ingredient.name}<span class="limit-info">${ingredient.isBase ? "до 100г" : "до 25г"}</span></td>
                <td>
                    <input type="number" 
                           min="0" 
                           max="${maxGrams}" 
                           value="0" 
                           data-index="${index}" 
                           class="qty-input">
                </td>
            `;
            
            this.tbody!.appendChild(tr);
        });
    }
    
    private attachEventListeners(): void {
        // Слушаем изменения в полях ввода
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.audioService.playPourSound();
                this.handleInputChange(e);
            });
        });
        
        // Слушаем изменение названия
        if (this.nameInput) {
            this.nameInput.addEventListener('input', () => {
                this.state.isNameUserEdited = true;
            });
        }
        
        // Глобальная функция для сброса (для onclick в HTML)
        (window as any).resetCalculator = () => {
            this.reset();
        };
    }
    
    private handleInputChange(e: Event): void {
        const input = e.target as HTMLInputElement;
        const index = parseInt(input.dataset.index || '0');
        let value = parseFloat(input.value) || 0;
        
        const ingredient = this.ingredients[index];
        if (ingredient) {
            value = this.calculator.validateGrams(ingredient, value);
            input.value = value.toString();
        }
        
        this.state.selectedIngredients.set(index, value);
        this.calculate();
    }
    
    private calculate(): void {
        const result = this.calculator.calculate(this.state.selectedIngredients, this.ingredients);
        
        // Обновляем состояние
        this.state.totalGrams = result.totalGrams;
        this.state.totalPrice = result.totalPrice;
        this.state.brewTime = result.brewTime;
        this.state.flavors = new Set(result.flavors);
        
        // Обновляем UI
        this.updateUI(result);
        
        // Генерируем название если нужно
        if (!this.state.isNameUserEdited && this.nameInput) {
            this.state.blendName = this.nameGenerator.generateAutoName(result.selectedItems);
            this.nameInput.value = this.state.blendName;
        }
    }
    
    private updateUI(result: any): void {
        // Обновляем банку
        this.updateJarVisualization();
        
        // Обновляем цену
        if (this.totalPriceSpan) {
            this.totalPriceSpan.textContent = result.totalPrice.toString();
        }
        
        // Обновляем время заварки
        if (this.totalTimeSpan) {
            this.totalTimeSpan.textContent = result.brewTime.toString();
        }
        
        // Обновляем счетчик грамм
        if (this.gramCounterSpan) {
            this.gramCounterSpan.textContent = result.totalGrams.toString();
        }
        
        // Обновляем профиль вкусов
        this.updateFlavorProfile(result.flavors);
    }
    
    private updateJarVisualization(): void {
        if (!this.jar) return;
        
        this.jar.innerHTML = '';
        
        // Создаем слои для каждого ингредиента
        const layers: { color: string; grams: number }[] = [];
        
        for (const [index, grams] of this.state.selectedIngredients) {
            if (grams > 0) {
                const ingredient = this.ingredients[index];
                if (ingredient) {
                    layers.push({ color: ingredient.color, grams });
                }
            }
        }
        
        // Вычисляем общий вес для пропорций
        const totalGrams = this.state.totalGrams;
        
        // Сортируем слои по убыванию грамм (тяжелые ингредиенты внизу)
        layers.sort((a, b) => a.grams - b.grams);
        
        // Создаем визуальные слои
        layers.forEach(layer => {
            const heightPercent = totalGrams > 0 ? (layer.grams / totalGrams) * 100 : 0;
            const layerDiv = document.createElement('div');
            layerDiv.className = 'tea-layer';
            layerDiv.style.height = `${heightPercent}%`;
            layerDiv.style.backgroundColor = layer.color;
            this.jar!.appendChild(layerDiv);
        });
    }
    
    private updateFlavorProfile(flavors: string[]): void {
        if (!this.flavorProfileDiv) return;
        
        if (flavors.length === 0) {
            this.flavorProfileDiv.innerHTML = "Выберите ингредиенты...";
            return;
        }
        
        this.flavorProfileDiv.innerHTML = flavors
            .map(f => `<span class="flavor-tag">${f}</span>`)
            .join('');
    }
    
    reset(): void {
        // Сбрасываем все поля ввода
        document.querySelectorAll('.qty-input').forEach(input => {
            (input as HTMLInputElement).value = '0';
        });
        
        // Сбрасываем состояние
        this.state.selectedIngredients.clear();
        this.state.isNameUserEdited = false;
        
        if (this.nameInput) {
            this.nameInput.value = '';
        }
        
        // Пересчитываем
        this.calculate();
    }
}