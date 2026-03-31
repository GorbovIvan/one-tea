import { Ingredient, CalculatorResult } from '../types/tea.types';

export class CalculatorService {
    
    calculate(selections: Map<number, number>, ingredients: Ingredient[]): CalculatorResult {
        let totalGrams = 0;
        let totalPrice = 0;
        let maxTime = 0;
        const flavors = new Set<string>();
        const selectedItems: Ingredient[] = [];
        
        // Сначала считаем общий вес
        for (const [_, grams] of selections) {
            if (grams > 0) {
                totalGrams += grams;
            }
        }
        
        // Если превышает 100г, корректируем
        let excess = 0;
        if (totalGrams > 100) {
            excess = totalGrams - 100;
            totalGrams = 100;
        }
        
        // Пересчитываем с учетом коррекции
        let correctedTotal = 0;
        for (const [idx, originalGrams] of selections) {
            let grams = originalGrams;
            const ingredient = ingredients[idx];
            
            if (!ingredient) continue;
            
            // Корректируем последний ингредиент если есть превышение
            if (excess > 0 && correctedTotal + grams > totalGrams) {
                grams = totalGrams - correctedTotal;
            }
            
            if (grams > 0) {
                correctedTotal += grams;
                totalPrice += (ingredient.pricePer100 / 100) * grams;
                
                if (ingredient.time > maxTime) {
                    maxTime = ingredient.time;
                }
                
                ingredient.flavors.forEach(f => flavors.add(f));
                selectedItems.push(ingredient);
            }
        }
        
        return {
            totalGrams: Math.round(correctedTotal),
            totalPrice: Math.ceil(totalPrice),
            brewTime: maxTime,
            flavors: Array.from(flavors),
            selectedItems
        };
    }
    
    validateGrams(ingredient: Ingredient, grams: number): number {
        const maxGrams = ingredient.maxGrams || (ingredient.isBase ? 100 : 25);
        return Math.min(Math.max(0, grams), maxGrams);
    }
}