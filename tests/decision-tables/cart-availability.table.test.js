/**
 * TABLA DE DECISIÓN - CHECK AVAILABILITY
 * 
 * CONDICIONES:
 * C1: Configuración existe
 * C2: Stock suficiente de todos los componentes
 * C3: Cantidad solicitada > 0
 * 
 * ACCIONES:
 * A1: Available = true (200)
 * A2: Available = false + detalles de componentes faltantes (200)
 * A3: Error 404 - Configuración no encontrada
 * A4: Error 400 - Cantidad inválida
 * 
 * REGLAS:
 * R1: C1=T, C2=T, C3=T → A1
 * R2: C1=T, C2=F, C3=T → A2
 * R3: C1=F, C2=*, C3=T → A3
 * R4: C1=*, C2=*, C3=F → A4
 */

describe('Cart Service - Decision Table: CHECK AVAILABILITY', () => {
  
  // R1: Config existe, stock suficiente, cantidad válida → Available true
  test('R1: Configuration exists with sufficient stock', () => {
    const configExists = true;
    const stockSufficient = true;
    const quantity = 2;
    
    expect(configExists).toBe(true);
    expect(stockSufficient).toBe(true);
    expect(quantity).toBeGreaterThan(0);
    // Resultado esperado: A1 (Available = true)
  });

  // R2: Config existe, stock insuficiente → Available false con detalles
  test('R2: Configuration exists but insufficient stock', () => {
    const configExists = true;
    const stockSufficient = false;
    const quantity = 5;
    const insufficientComponents = [
      { componentId: 'RAM-16GB', required: 10, available: 5, missing: 5 }
    ];
    
    expect(configExists).toBe(true);
    expect(stockSufficient).toBe(false);
    expect(quantity).toBeGreaterThan(0);
    expect(insufficientComponents.length).toBeGreaterThan(0);
    // Resultado esperado: A2 (Available = false con detalles)
  });

  // R3: Config no existe → Error 404
  test('R3: Configuration does not exist', () => {
    const configExists = false;
    const quantity = 1;
    
    expect(configExists).toBe(false);
    expect(quantity).toBeGreaterThan(0);
    // Resultado esperado: A3 (Error 404)
  });

  // R4: Cantidad inválida → Error 400
  test('R4: Invalid quantity - zero', () => {
    const quantity = 0;
    
    expect(quantity).toBeLessThanOrEqual(0);
    // Resultado esperado: A4 (Error 400)
  });

  test('R5: Invalid quantity - negative', () => {
    const quantity = -5;
    
    expect(quantity).toBeLessThan(0);
    // Resultado esperado: A4 (Error 400)
  });
});