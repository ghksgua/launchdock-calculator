const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function calculate(left, operator, right) {
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '*') return left * right;
  if (operator === '/') return right === 0 ? null : left / right;
  return right;
}

function format(value) {
  if (value === null || !Number.isFinite(value)) return '오류';
  const rounded = Number(value.toPrecision(12));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export class Calculator {
  constructor() { this.clear(); }

  clear() {
    this.display = '0';
    this.expression = '';
    this.stored = null;
    this.operator = null;
    this.fresh = false;
    this.lastOperator = null;
    this.lastOperand = null;
  }

  press(key) {
    if (key === 'clear') { this.clear(); return this.snapshot(); }
    if (this.display === '오류') this.clear();
    if (/^[0-9]$/.test(key)) this.digit(key);
    else if (key === '.') this.decimal();
    else if (Object.hasOwn(symbols, key)) this.chooseOperator(key);
    else if (key === '=') this.equals();
    else if (key === 'sign') this.sign();
    else if (key === 'percent') this.percent();
    else if (key === 'backspace') this.backspace();
    return this.snapshot();
  }

  snapshot() { return { display: this.display, expression: this.expression }; }

  digit(value) {
    if (this.fresh) { this.display = value; this.fresh = false; }
    else if (this.display === '0') this.display = value;
    else if (this.display.replace(/[^0-9]/g, '').length < 12) this.display += value;
    if (!this.operator) this.expression = '';
  }

  decimal() {
    if (this.fresh) { this.display = '0.'; this.fresh = false; }
    else if (!this.display.includes('.')) this.display += '.';
    if (!this.operator) this.expression = '';
  }

  chooseOperator(next) {
    if (this.operator && !this.fresh) {
      const result = calculate(this.stored, this.operator, Number(this.display));
      if (result === null) return this.error('0으로 나눌 수 없습니다');
      this.display = format(result);
    }
    this.stored = Number(this.display);
    this.operator = next;
    this.expression = `${this.display} ${symbols[next]}`;
    this.fresh = true;
    this.lastOperator = null;
  }

  equals() {
    if (this.operator) {
      const right = this.fresh ? this.stored : Number(this.display);
      const left = this.stored;
      const result = calculate(left, this.operator, right);
      if (result === null) return this.error('0으로 나눌 수 없습니다');
      this.expression = `${format(left)} ${symbols[this.operator]} ${format(right)} =`;
      this.lastOperator = this.operator;
      this.lastOperand = right;
      this.display = format(result);
      this.operator = null;
      this.stored = null;
      this.fresh = true;
    } else if (this.lastOperator) {
      const left = Number(this.display);
      const result = calculate(left, this.lastOperator, this.lastOperand);
      if (result === null) return this.error('0으로 나눌 수 없습니다');
      this.expression = `${format(left)} ${symbols[this.lastOperator]} ${format(this.lastOperand)} =`;
      this.display = format(result);
      this.fresh = true;
    }
  }

  sign() {
    if (Number(this.display) === 0) return;
    this.display = this.display.startsWith('-') ? this.display.slice(1) : `-${this.display}`;
    this.fresh = false;
  }

  percent() {
    this.display = format(Number(this.display) / 100);
    this.fresh = false;
  }

  backspace() {
    if (this.fresh) return;
    this.display = this.display.length <= 1 || (this.display.length === 2 && this.display.startsWith('-'))
      ? '0' : this.display.slice(0, -1);
  }

  error(message) {
    this.clear();
    this.display = '오류';
    this.expression = message;
  }
}
