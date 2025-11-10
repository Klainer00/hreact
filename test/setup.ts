// test/setup.ts

// Esta línea importa los matchers (como .toBeInTheDocument)
// y los añade a 'expect' automáticamente gracias a "globals: true".
import '@testing-library/jest-dom'; 

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el JSDOM después de cada prueba
afterEach(() => {
  cleanup();
});