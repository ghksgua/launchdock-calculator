import { Calculator } from './calculator.mjs';

const calculator = new Calculator();
const display = document.querySelector('#display');
const expression = document.querySelector('#expression');

function update(state) {
  display.textContent = state.display;
  expression.textContent = state.expression || '\u00a0';
}

document.querySelector('.keys').addEventListener('click', event => {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  update(calculator.press(button.dataset.key));
});

document.addEventListener('keydown', event => {
  const key = event.key;
  let action = key;
  if (key === 'Enter') action = '=';
  else if (key === 'Escape' || key === 'Delete') action = 'clear';
  else if (key === 'Backspace') action = 'backspace';
  else if (key === 'x' || key === 'X') action = '*';
  else if (key === ',') action = '.';
  else if (key === '%') action = 'percent';
  if (!/^[0-9]$/.test(action) && !['.', '+', '-', '*', '/', '=', 'clear', 'backspace', 'percent'].includes(action)) return;
  event.preventDefault();
  update(calculator.press(action));
});
