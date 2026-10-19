const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function cleanNumber(number) {
  if (!Number.isFinite(number)) return null;
  const rounded = Number(number.toPrecision(12));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function grouped(value) {
  if (value === '오류' || value.includes('e')) return value;
  const [integer, fraction] = value.split('.');
  const sign = integer.startsWith('-') ? '-' : '';
  const digits = sign ? integer.slice(1) : integer;
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + formatted + (fraction === undefined ? '' : '.' + fraction);
}

function calculate(a, operator, b) {
  if (operator === '+') return a + b;
  if (operator === '-') return a - b;
  if (operator === '*') return a * b;
  if (operator === '/') return b === 0 ? NaN : a / b;
  return NaN;
}

export class Calculator {
  constructor() { this.clear(); }

  clear() {
    this.current = '0';
    this.previous = null;
    this.operator = null;
    this.waiting = false;
    this.justEvaluated = false;
    this.expression = '';
    this.repeat = null;
    this.error = false;
  }

  digit(digit) {
    if (!/^\d$/.test(digit)) return;
    if (this.error || this.justEvaluated) this.clear();
    if (this.waiting) { this.current = digit; this.waiting = false; return; }
    if (this.current.replace(/\D/g, '').length >= 12) return;
    this.current = this.current === '0' ? digit : this.current + digit;
  }

  decimal() {
    if (this.error || this.justEvaluated) this.clear();
    if (this.waiting) { this.current = '0.'; this.waiting = false; return; }
    if (!this.current.includes('.')) this.current += '.';
  }

  chooseOperator(operator) {
    if (!(operator in symbols) || this.error) return;
    if (this.operator && !this.waiting) {
      const answer = cleanNumber(calculate(this.previous, this.operator, Number(this.current)));
      if (answer === null) { this.setError(); return; }
      this.current = answer;
      this.previous = Number(answer);
    } else if (!this.operator) {
      this.previous = Number(this.current);
    }
    this.operator = operator;
    this.expression = `${grouped(String(this.previous))} ${symbols[operator]}`;
    this.waiting = true;
    this.justEvaluated = false;
    this.repeat = null;
  }

  equals() {
    if (this.error) return;
    let a, operator, b;
    if (this.operator) {
      a = this.previous;
      operator = this.operator;
      b = this.waiting ? a : Number(this.current);
    } else if (this.justEvaluated && this.repeat) {
      a = Number(this.current);
      operator = this.repeat.operator;
      b = this.repeat.operand;
    } else return;

    const answer = cleanNumber(calculate(a, operator, b));
    if (answer === null) { this.setError(); return; }
    this.expression = `${grouped(String(a))} ${symbols[operator]} ${grouped(String(b))} =`;
    this.current = answer;
    this.previous = null;
    this.operator = null;
    this.waiting = false;
    this.justEvaluated = true;
    this.repeat = { operator, operand: b };
  }

  percent() {
    if (this.error) return;
    const answer = cleanNumber(Number(this.current) / 100);
    if (answer === null) { this.setError(); return; }
    this.current = answer;
    this.waiting = false;
    this.justEvaluated = false;
    this.repeat = null;
  }

  sign() {
    if (this.error || this.current === '0') return;
    this.current = this.current.startsWith('-') ? this.current.slice(1) : '-' + this.current;
    this.justEvaluated = false;
    this.repeat = null;
  }

  backspace() {
    if (this.error) { this.clear(); return; }
    if (this.waiting) return;
    this.current = this.current.length <= 1 || (this.current.length === 2 && this.current.startsWith('-')) ? '0' : this.current.slice(0, -1);
    this.justEvaluated = false;
    this.repeat = null;
  }

  setError() {
    this.clear();
    this.current = '오류';
    this.expression = '계산할 수 없습니다';
    this.error = true;
  }

  view() { return { result: grouped(this.current), expression: this.expression, operator: this.waiting ? this.operator : null }; }
}
