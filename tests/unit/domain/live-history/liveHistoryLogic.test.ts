import twitterText from 'twitter-text';
import { splitTourTextsIntoTweets } from '../../../../src/domain/live-history/liveHistoryLogic';

describe('liveHistoryLogic', () => {
  describe('splitTourTextsIntoTweets', () => {
    // 基本機能テスト
    it('空の配列を渡すと空の配列を返す', () => {
      const result = splitTourTextsIntoTweets([]);
      expect(result).toEqual([]);
    });

    it('空文字列の配列は空の配列を返す', () => {
      const result = splitTourTextsIntoTweets(['']);
      expect(result).toEqual([]);
    });

    it('単一の短いテキストは1つのツイートになる', () => {
      const tourTexts = ['テストツアー（2023/01/01@テスト会場）'];
      const result = splitTourTextsIntoTweets(tourTexts);
      
      expect(result.length).toBe(1);
      expect(result[0]).toBe('テストツアー（2023/01/01@テスト会場）');
    });

    it('複数の短いテキストは1つのツイートに結合される', () => {
      const tourTexts = [
        'テストツアー1（2023/01/01@テスト会場1）',
        'テストツアー2（2023/02/01@テスト会場2）',
        'テストツアー3（2023/03/01@テスト会場3）'
      ];
      
      const result = splitTourTextsIntoTweets(tourTexts);
      
      expect(result.length).toBe(1);
      expect(result[0]).toBe(
        'テストツアー1（2023/01/01@テスト会場1）\n' +
        'テストツアー2（2023/02/01@テスト会場2）\n' +
        'テストツアー3（2023/03/01@テスト会場3）'
      );
    });

    it('文字数制限を超える長いテキストは複数のツイートに分割される', () => {
      // 長いツアー名を複数作成
      const longTourTexts = [];
      
      // 仮想的な長いツアー名を10個生成
      for (let i = 1; i <= 10; i++) {
        longTourTexts.push(
          `長いツアー名${i}（2023/0${i}/01@非常に長い会場名の例としてこのようなテキストを設定します。` +
          `これは意図的に長くしています。複数の会場を含める例も追加しておきましょう。` +
          `2023/0${i}/02@二つ目の会場, 2023/0${i}/03@三つ目の会場, 2023/0${i}/04@四つ目の会場）`
        );
      }
      
      const result = splitTourTextsIntoTweets(longTourTexts);
      
      // 複数のツイートに分割されることを確認
      expect(result.length).toBeGreaterThan(1);
      
      // 全てのツイートがTwitterの文字数制限内に収まっていることを確認
      result.forEach(tweet => {
        const parsedTweet = twitterText.parseTweet(tweet);
        expect(parsedTweet.valid).toBe(true);
        expect(parsedTweet.weightedLength).toBeLessThanOrEqual(280);
      });
    });

    it('単一の長いテキストはそのまま返される', () => {
      const veryLongTourText = [
        '非常に長いツアー名（2023/01/01@長い会場名1, 2023/01/02@長い会場名2, 2023/01/03@長い会場名3, ' +
        '2023/01/04@長い会場名4, 2023/01/05@長い会場名5, 2023/01/06@長い会場名6, 2023/01/07@長い会場名7, ' +
        '2023/01/08@長い会場名8, 2023/01/09@長い会場名9, 2023/01/10@長い会場名10, 2023/01/11@長い会場名11, ' +
        '2023/01/12@長い会場名12, 2023/01/13@長い会場名13, 2023/01/14@長い会場名14, 2023/01/15@長い会場名15）'
      ];
      
      const result = splitTourTextsIntoTweets(veryLongTourText);
      
      // 単体で長すぎるテキストの場合、そのまま1つのツイートとして返す
      // （このような状況は実際のユースケースでは発生させないようにする）
      expect(result.length).toBe(1);
      expect(result[0]).toBe(veryLongTourText[0]);
    });

    // 境界値テスト - 厳選した重要ケースのみ
    it('ちょうど境界値（280文字）のテキストは1つのツイートになる', () => {
      // 280文字のテキスト
      const text280 = 'a'.repeat(280);
      const result = splitTourTextsIntoTweets([text280]);
      
      expect(result.length).toBe(1);
      
      const parsedTweet = twitterText.parseTweet(result[0]);
      expect(parsedTweet.weightedLength).toBe(280);
      expect(result[0]).toBe(text280);
    });
    
    it('テキスト結合時に改行文字が1つ追加される', () => {
      const text1 = 'テスト1';
      const text2 = 'テスト2';
      
      const result = splitTourTextsIntoTweets([text1, text2]);
      
      expect(result.length).toBe(1);
      expect(result[0]).toBe(`${text1}\n${text2}`);
      
      // 改行文字数をカウント
      let newlineCount = 0;
      for (let i = 0; i < result[0].length; i++) {
        if (result[0].charCodeAt(i) === 10) { // \n の文字コード
          newlineCount++;
        }
      }
      expect(newlineCount).toBe(1);
    });
    
    it('278字+1字（英数）は280字になり1つのツイートになる', () => {
      const baseText = 'a'.repeat(278);
      const additionalChar = '1';
      
      const result = splitTourTextsIntoTweets([baseText, additionalChar]);
      
      // 278 + 改行1 + 1 = 280（ちょうど制限の境界）
      expect(result.length).toBe(1);
      
      const parsedTweet = twitterText.parseTweet(result[0]);
      expect(parsedTweet.weightedLength).toBe(280);
    });
    
    it('279字+1字（英数）は281字になり分割される', () => {
      const baseText = 'a'.repeat(279);
      const additionalChar = '1';
      
      const result = splitTourTextsIntoTweets([baseText, additionalChar]);
      
      // 279 + 改行1 + 1 = 281（制限を超える）
      expect(result.length).toBe(2);
      
      // 各ツイートが制限以下であることを確認
      result.forEach(tweet => {
        const parsedTweet = twitterText.parseTweet(tweet);
        expect(parsedTweet.weightedLength).toBeLessThanOrEqual(280);
      });
      
      // 期待される分割
      expect(result[0]).toBe(baseText);
      expect(result[1]).toBe(additionalChar);
    });
    
    it('278字+1字（マルチバイト）は281字になり分割される', () => {
      const baseText = 'a'.repeat(278);
      const additionalChar = 'あ'; // 重み付き2
      
      const result = splitTourTextsIntoTweets([baseText, additionalChar]);
      
      // 278 + 改行1 + 2 = 281（制限を超える）
      expect(result.length).toBe(2);
      
      expect(result[0]).toBe(baseText);
      expect(result[1]).toBe(additionalChar);
    });
    
    it('特殊文字や絵文字を含むテキストも適切に処理される', () => {
      const emojiText = [
        '絵文字テスト🎵（2023/01/01@テスト会場🎸）',
        '特殊文字テスト♪♫（2023/02/01@テスト会場👨‍🎤）'
      ];
      
      const result = splitTourTextsIntoTweets(emojiText);
      
      // 特殊文字や絵文字を含むテキストも1つのツイートになることを確認
      expect(result.length).toBe(1);
      
      // 文字数制限内に収まっていることを確認
      const parsedTweet = twitterText.parseTweet(result[0]);
      expect(parsedTweet.weightedLength).toBeLessThanOrEqual(280);
      
      // 絵文字や特殊文字が維持されていることを確認
      expect(result[0]).toContain('🎵');
      expect(result[0]).toContain('🎸');
      expect(result[0]).toContain('♪♫');
      expect(result[0]).toContain('👨‍🎤');
    });
  });
}); 