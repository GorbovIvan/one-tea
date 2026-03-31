import { TeaConstructor } from './components/TeaConstructor';
import { INGREDIENTS } from './data/ingredients';

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const constructor = new TeaConstructor();
    constructor.init(INGREDIENTS);
    
    console.log('One Tea Shop - TypeScript version loaded successfully!');
});