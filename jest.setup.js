/**
 * consoleの出力を抑制するためのセットアップファイル
 * テスト実行時にconsole.log, console.infoなどの出力を抑制します
 */

// オリジナルのconsole関数を保存
const originalWarn = global.console.warn;
const originalError = global.console.error;

global.console = {
  ...console,
  log: jest.fn(),     
  info: jest.fn(),    
  warn: originalWarn, 
  error: originalError, 
  debug: jest.fn(),   
};
