import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
// La ruta ahora sube dos niveles (../..) para entrar a src/
import Contacto from '../../src/pages/Contacto';

describe('Pruebas de la página Contacto.tsx', () => {

  it('debe renderizar el formulario con todos sus campos', () => {
    // Arrange
    render(<Contacto />);

    // Act (Buscamos por el texto de la <label>)
    const inputNombre = screen.getByLabelText('Nombre');
    const inputEmail = screen.getByLabelText('Correo Electrónico');
    const botonEnviar = screen.getByRole('button', { name: /Enviar Mensaje/i });

    // Assert
    expect(inputNombre).toBeInTheDocument();
    expect(inputEmail).toBeInTheDocument();
    expect(botonEnviar).toBeInTheDocument();
    expect(inputEmail).toHaveAttribute('type', 'email');
  });
});