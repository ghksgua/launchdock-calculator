import { Calculator } from './core.mjs';

const calculator = new Calculator();
const result = document.querySelector('#result');
const expression = document.querySelector('#expression');
const buttons = document.querySelectorAll('.key');

function render() {
  const view = calculator.view();
  result.textContent = view.result;
  result.classList.toggle('compact', view.result.length > 11);
  expression.textContent = view.expression || '\u00a0';
  buttons.forEach(button => button.classList.toggle('selected', button.dataset.action === 'operator' && button.dataset.value === view.operator));
}

function act(action, value) {
  if (action === 'digit') calculator.digit(value);
  else if (action === 'decimal') calculator.decimal();
  else if (action === 'operator') calculator.chooseOperator(value);
  else if (action === 'equals') calculator.equals();
  else if (action === 'clear') calculator.clear();
  else if (action === 'percent') calculator.percent();
  else if (action === 'sign') calculator.sign();
  else if (action === 'backspace') calculator.backspace();
  render();
}

document.querySelector('.keypad').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (button) act(button.dataset.action, button.dataset.value);
});

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLButtonElement && (event.key === 'Enter' || event.key === ' ')) return;
  let action, value;
  if (/^\d$/.test(event.key)) { action = 'digit'; value = event.key; }
  else if (event.key === '.' || event.key === ',') action = 'decimal';
  else if (['+', '-', '*', '/', 'x', 'X'].includes(event.key)) { action = 'operator'; value = event.key === 'x' || event.key === 'X' ? '*' : event.key; }
  else if (event.key === 'Enter' || event.key === '=') action = 'equals';
  else if (event.key === 'Escape' || event.key === 'Delete') action = 'clear';
  else if (event.key === 'Backspace') action = 'backspace';
  else if (event.key === '%') action = 'percent';
  if (action) { event.preventDefault(); act(action, value); }
});

render();
