// mobile-fix.js — исправляет развёртку на телефоне
(function(){
    // 1. Добавляем/проверяем viewport
    let viewport = document.querySelector('meta[name="viewport"]');
    if(!viewport){
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');

    // 2. Добавляем стили в head
    const styles = `
        * {
            max-width: 100vw;
            box-sizing: border-box;
        }
        body {
            overflow-x: hidden !important;
            width: 100% !important;
            margin: 0 auto;
        }
        img, video, iframe, embed, object, svg {
            max-width: 100% !important;
            height: auto !important;
        }
        table {
            display: block !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch;
            width: 100% !important;
        }
        .container, .wrapper, [class*="container"], [class*="wrapper"] {
            max-width: 100% !important;
            overflow-x: hidden !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
        }
        .row, [class*="row"], .flex, [class*="flex"] {
            flex-wrap: wrap !important;
        }
        p, h1, h2, h3, h4, h5, h6, li, a, span {
            word-break: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
        }
        input, button, textarea, select {
            max-width: 100% !important;
            font-size: 16px !important;
        }
        @media (max-width: 768px) {
            body {
                font-size: 16px;
            }
            [style*="position: fixed"], .fixed, .sticky {
                left: 0 !important;
                right: 0 !important;
                max-width: 100vw !important;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // 3. Автоматически оборачиваем все таблицы в div с прокруткой
    function fixTables(){
        document.querySelectorAll('table').forEach(table => {
            let parent = table.parentNode;
            if(parent && !parent.classList.contains('table-wrapper') && getComputedStyle(parent).overflowX !== 'auto'){
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper';
                wrapper.style.overflowX = 'auto';
                wrapper.style.width = '100%';
                wrapper.style.webkitOverflowScrolling = 'touch';
                parent.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    // 4. Исправляем фиксированные элементы
    function fixFixedElements(){
        if(window.innerWidth <= 768){
            document.querySelectorAll('[style*="position: fixed"], .fixed, .sticky').forEach(el => {
                if(el.getBoundingClientRect().width > window.innerWidth){
                    el.style.maxWidth = '100%';
                    el.style.left = '0';
                    el.style.right = '0';
                    el.style.margin = '0 auto';
                }
            });
        }
    }

    // 5. Проверяем горизонтальный скролл
    function checkOverflow(){
        if(document.body.scrollWidth > window.innerWidth){
            document.body.style.overflowX = 'hidden';
        }
    }

    // 6. Добавляем класс mobile для удобства
    function setMobileClass(){
        if(window.innerWidth <= 768){
            document.body.classList.add('is-mobile');
        } else {
            document.body.classList.remove('is-mobile');
        }
    }

    // Запускаем всё после загрузки DOM
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => {
            fixTables();
            fixFixedElements();
            checkOverflow();
            setMobileClass();
        });
    } else {
        fixTables();
        fixFixedElements();
        checkOverflow();
        setMobileClass();
    }

    // Следим за изменениями в DOM (для динамических таблиц)
    if(window.MutationObserver){
        const observer = new MutationObserver(() => {
            fixTables();
            fixFixedElements();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // При повороте экрана перепроверяем
    window.addEventListener('resize', () => {
        fixFixedElements();
        checkOverflow();
        setMobileClass();
    });
})();
