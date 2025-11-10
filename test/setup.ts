import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extiende Vitest con los comandos de jest-dom (ej: .toBeInTheDocument)
expect.extend(matchers);

// Limpia el JSDOM después de cada prueba
afterEach(() => {
  cleanup();
});