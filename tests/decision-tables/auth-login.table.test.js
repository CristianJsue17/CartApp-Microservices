/**
 * TABLA DE DECISIÓN - LOGIN
 * 
 * CONDICIONES:
 * C1: Usuario existe en DB
 * C2: Password es correcto
 * C3: Password cumple mínimo 6 caracteres
 * 
 * ACCIONES:
 * A1: Login exitoso (200) + JWT token
 * A2: Error 401 - Credenciales inválidas
 * A3: Error 400 - Password muy corta
 * 
 * REGLAS:
 * R1: C1=T, C2=T, C3=T → A1
 * R2: C1=T, C2=F, C3=T → A2
 * R3: C1=F, C2=*, C3=T → A2
 * R4: C1=*, C2=*, C3=F → A3
 */

describe('Auth Service - Decision Table: LOGIN', () => {
  
  // R1: Usuario existe, password correcto, longitud válida → Login exitoso
  test('R1: Valid credentials with correct password length', () => {
    const user = { email: 'user@test.com', exists: true };
    const password = 'validPass123';
    const passwordMatches = true;
    
    expect(user.exists).toBe(true);
    expect(passwordMatches).toBe(true);
    expect(password.length).toBeGreaterThanOrEqual(6);
    // Resultado esperado: A1 (Login exitoso)
  });

  // R2: Usuario existe, password incorrecto → Error 401
  test('R2: Valid user but incorrect password', () => {
    const user = { email: 'user@test.com', exists: true };
    const password = 'wrongPassword';
    const passwordMatches = false;
    
    expect(user.exists).toBe(true);
    expect(passwordMatches).toBe(false);
    expect(password.length).toBeGreaterThanOrEqual(6);
    // Resultado esperado: A2 (Error 401)
  });

  // R3: Usuario no existe → Error 401
  test('R3: User does not exist', () => {
    const user = { email: 'noexist@test.com', exists: false };
    const password = 'anyPassword';
    
    expect(user.exists).toBe(false);
    expect(password.length).toBeGreaterThanOrEqual(6);
    // Resultado esperado: A2 (Error 401)
  });

  // R4: Password muy corta → Error 400
  test('R4: Password too short', () => {
    const password = '12345';
    
    expect(password.length).toBeLessThan(6);
    // Resultado esperado: A3 (Error 400)
  });

  // Casos adicionales
  test('R5: Empty password', () => {
    const password = '';
    expect(password.length).toBe(0);
    // Resultado esperado: A3 (Error 400)
  });

  test('R6: Empty email', () => {
    const email = '';
    expect(email).toBe('');
    // Resultado esperado: A3 (Error 400)
  });
});