    const display = document.getElementById('display');

    function appendValue(value) {
      display.value += value;
    }

    function clearDisplay() {
      display.value = '';
    }

    function deleteLast() {
      display.value = display.value.slice(0, -1);
    }

    function calculateResult() {
      try {
        const expression = display.value.replace(/%/g, '/100');
        display.value = eval(expression);
      } catch {
        display.value = 'Error';
      }
    }