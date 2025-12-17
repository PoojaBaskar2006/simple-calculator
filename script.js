// State variables
let currentInput = '0';
let history = '';
let lastActionWasEquals = false;

// DOM elements
const displayElement = document.getElementById('display');
const historyElement = document.getElementById('history');

function updateDisplay() {
    displayElement.textContent = currentInput;
    historyElement.textContent = history.replace(/\*/g, '×').replace(/\//g, '÷');
    historyElement.scrollTop = historyElement.scrollHeight;
}

function appendNumber(number) {
    if (lastActionWasEquals) {
        currentInput = String(number);
        history = '';
        lastActionWasEquals = false;
    } else if (currentInput === '0' || currentInput === 'Error' || currentInput.startsWith('Error:')) {
        currentInput = String(number);
    } else {
        if (currentInput.length < 15) {
            currentInput += String(number);
        }
    }
    updateDisplay();
}

function appendDecimal() {
    if (lastActionWasEquals || currentInput.startsWith('Error')) {
        currentInput = '0.';
        history = '';
        lastActionWasEquals = false;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

function appendOperator(operator) {
    lastActionWasEquals = false;

    if (currentInput.startsWith('Error')) {
        clearDisplay();
        return;
    }

    let inputToUse = currentInput.endsWith('.') ? currentInput.slice(0, -1) : currentInput;
    const validOperators = ['+', '-', '*', '/', '%'];

    if (history === '') {
        history = inputToUse + operator;
    } else {
        const lastChar = history.slice(-1);
        if (validOperators.includes(lastChar)) {
            history = history.slice(0, -1) + operator;
        } else {
            const result = calculateIntermediateResult(true);
            if (result.startsWith('Error')) {
                currentInput = result;
                history = '';
            } else {
                history = result + operator;
            }
        }
    }
    currentInput = '0';
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    history = '';
    lastActionWasEquals = false;
    updateDisplay();
}

function calculateIntermediateResult(isIntermediate = false) {
    let fullExpression = history + currentInput;

    if (!isIntermediate) {
        const lastChar = fullExpression.slice(-1);
        if (['+', '-', '*', '/', '%'].includes(lastChar)) {
            fullExpression += currentInput;
        }
    }

    try {
        const result = eval(fullExpression);
        if (!isFinite(result)) return 'Error: Div by Zero';

        let formattedResult = result.toString();
        if (formattedResult.length > 15 && !formattedResult.includes('e')) {
            formattedResult = parseFloat(result.toFixed(10)).toString();
        }
        return formattedResult;
    } catch (e) {
        return 'Error';
    }
}

function calculateResult() {
    if (currentInput.startsWith('Error')) {
        clearDisplay();
        return;
    }
    if (lastActionWasEquals) return;

    const finalResult = calculateIntermediateResult(false);

    if (finalResult.startsWith('Error')) {
        currentInput = finalResult;
        history = '';
    } else {
        history = history + currentInput + '=';
        currentInput = finalResult;
    }

    lastActionWasEquals = true;
    updateDisplay();
}

// Keyboard Support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/[0-9]/.test(key)) appendNumber(parseInt(key));
    else if (['+', '-', '*', '/', '%'].includes(key)) appendOperator(key);
    else if (key === '.') appendDecimal();
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateResult();
    } else if (key === 'Escape' || key === 'Delete') clearDisplay();
});

// Init
updateDisplay();