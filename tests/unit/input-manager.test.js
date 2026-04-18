import { InputManager } from '../../src/input/input-manager.js';

function fakeKeyEvent(key) {
  return { key, preventDefault: () => {} };
}

describe('T007 — InputManager speed key handling', () => {
  test('key "1" sets speedSelection to 1', () => {
    const input = new InputManager();
    input._onKeyDown(fakeKeyEvent('1'));
    expect(input.getSpeedSelection()).toBe(1);
  });

  test('keys 2–5 each set speedSelection to the correct integer', () => {
    const input = new InputManager();
    for (let i = 2; i <= 5; i++) {
      input._onKeyDown(fakeKeyEvent(String(i)));
      expect(input.getSpeedSelection()).toBe(i);
    }
  });

  test('direction keys do not affect speedSelection', () => {
    const input = new InputManager();
    input._onKeyDown(fakeKeyEvent('ArrowLeft'));
    expect(input.getSpeedSelection()).toBeNull();
  });

  test('direction key after speed key does not overwrite speedSelection', () => {
    const input = new InputManager();
    input._onKeyDown(fakeKeyEvent('3'));
    input._onKeyDown(fakeKeyEvent('ArrowUp'));
    expect(input.getSpeedSelection()).toBe(3);
  });

  test('clearSpeedSelection resets to null', () => {
    const input = new InputManager();
    input._onKeyDown(fakeKeyEvent('2'));
    input.clearSpeedSelection();
    expect(input.getSpeedSelection()).toBeNull();
  });

  test('initial speedSelection is null', () => {
    const input = new InputManager();
    expect(input.getSpeedSelection()).toBeNull();
  });
});
