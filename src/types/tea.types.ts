// Типы данных для чайного магазина

export interface Ingredient {
    name: string;
    pricePer100: number;
    color: string;
    time: number;
    flavors: string[];
    isBase: boolean;
    maxGrams?: number; // Максимальное количество грамм для ингредиента
}

export interface SelectedIngredient extends Ingredient {
    grams: number;
}

export interface ConstructorState {
    selectedIngredients: Map<number, number>; // index -> grams
    totalGrams: number;
    totalPrice: number;
    brewTime: number;
    flavors: Set<string>;
    blendName: string;
    isNameUserEdited: boolean;
}

export interface CalculatorResult {
    totalGrams: number;
    totalPrice: number;
    brewTime: number;
    flavors: string[];
    selectedItems: Ingredient[];
}

export interface AudioServiceInterface {
    playPourSound(): void;
}