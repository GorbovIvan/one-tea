import { Ingredient } from '../types/tea.types';

export class NameGeneratorService {
    private readonly adjectives: string[] = [
        "Горный", "Таёжный", "Солнечный", "Утренний", "Магический", 
        "Лесной", "Бархатный", "Изумрудный", "Королевский", "Янтарный", 
        "Золотой", "Дикий", "Тихий", "Бодрящий", "Звездный"
    ];
    
    private readonly nouns: string[] = [
        "Сбор", "Секрет", "Шепот", "Купаж", "Рассвет", "Момент", 
        "Вечер", "Заповедник", "Бриз", "Ритуал", "Сказка", "Поток", 
        "Туман", "Остров", "Сад"
    ];
    
    private readonly relaxingNames: string[] = [
        "Прованский Вечер", "Сон в летнюю ночь", "Лавандовый Бриз", 
        "Горное Спокойствие", "Мятная Дымка"
    ];
    
    private readonly citrusNames: string[] = [
        "Цитрусовый Драйв", "Оранжевое Солнце", "Бодрость Цедры", "Яркий Рассвет"
    ];
    
    private readonly baseThemes: Record<string, string[]> = {
        "Черный чай": ["Крепость Традиций", "Английский Завтрак", "Индийское Лето"],
        "Зеленый чай": ["Дыхание Востока", "Зеленый Дракон", "Источник Энергии"],
        "Иван чай": ["Сила Предков", "Медовый Поля", "Русская Душа"]
    };
    
    generateAutoName(selectedItems: Ingredient[]): string {
        if (selectedItems.length === 0) return "";
        
        if (selectedItems.length === 1) {
            return `Чистый ${selectedItems[0].name}`;
        }
        
        const hasMint = selectedItems.some(i => i.name === "Мята");
        const hasLavender = selectedItems.some(i => i.name === "Лаванда");
        const hasCitrus = selectedItems.some(i => i.name === "Цедра апельсина");
        const base = selectedItems.find(i => i.isBase);
        
        if (hasMint && hasLavender) {
            return this.getRandomItem(this.relaxingNames);
        }
        
        if (hasCitrus) {
            return this.getRandomItem(this.citrusNames);
        }
        
        if (base && Math.random() > 0.4) {
            const themes = this.baseThemes[base.name];
            if (themes) {
                return this.getRandomItem(themes);
            }
        }
        
        return this.getRandomItem(this.adjectives) + " " + this.getRandomItem(this.nouns);
    }
    
    private getRandomItem<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
}