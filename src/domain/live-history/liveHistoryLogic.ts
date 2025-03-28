import { LiveHistory, LivePerformance, SheetRows } from '@/types';
import { tryCatch } from '@/utils/errorHandler';
import { info } from '@/utils/logger';

/**
 * スプレッドシートの行データからライブ履歴情報を作成する
 * @param rows スプレッドシートの行データ
 * @param songId 曲ID
 * @param songInfo 曲情報（メタデータ含む）
 * @returns ライブ履歴情報
 */
function makeLiveHistory(rows: SheetRows, songId: string, songInfo: string[] | null): LiveHistory {
  // 1行目のデータから曲名を取得
  const title = rows[0][8]; // I列(8)が曲名

  // 各行から必要な情報を抽出してパフォーマンス情報を作成
  const performances = rows.map((row) => ({
    liveId: row[1],      // B列(1)がライブID
    tourId: row[0],      // A列(0)がツアーID
    liveName: row[4],    // E列(4)がツアー名
    date: row[3],        // D列(3)が日付
    venue: row[6],       // G列(6)が会場
  }));

  const liveHistory: LiveHistory = {
    songId,
    title,
    performances,
    performanceCount: performances.length,
  };

  // 曲情報が提供された場合、追加情報を設定
  if (songInfo) {
    liveHistory.setlistCount = Number(songInfo[6]); // G列(6)がセトリ入り公演数
    liveHistory.setlistCountExcludingFes = Number(songInfo[7]); // H列(7)がセトリ入り公演数（フェスを除く）
  }

  return liveHistory;
}

/**
 * ライブ履歴情報を投稿用のテキストに変換する
 * @param liveHistory ライブ履歴情報
 * @returns 投稿用テキストの配列（複数ツイートに分割）
 */
function formatLiveHistoryPosts(liveHistory: LiveHistory): string[] {
  const posts: string[] = [];

  // 最初のツイート：曲名と各種カウント情報
  let firstPost = `『${liveHistory.title}』のライブ履歴\n`;
  firstPost += `演奏回数：${liveHistory.performanceCount}回`;
  
  if (liveHistory.setlistCount !== undefined) {
    firstPost += `\nセトリ入り公演数：${liveHistory.setlistCount}公演`;
  }
  
  if (liveHistory.setlistCountExcludingFes !== undefined) {
    firstPost += `\nセトリ入り公演数（フェスを除く）：${liveHistory.setlistCountExcludingFes}公演`;
  }
  
  posts.push(firstPost);

  // 2つ目以降のツイート：ツアー別ライブ履歴
  // ツアーIDでグループ化
  const performancesByTour = new Map<string, LivePerformance[]>();
  
  liveHistory.performances.forEach(performance => {
    const tourId = performance.tourId || 'unknown';
    if (!performancesByTour.has(tourId)) {
      performancesByTour.set(tourId, []);
    }
    performancesByTour.get(tourId)?.push(performance);
  });

  // ツアーごとにテキストを生成
  const tourTexts: string[] = [];
  
  performancesByTour.forEach((performances, tourId) => {
    if (performances.length === 0) return;
    
    const tourName = performances[0].liveName;
    const venues = performances.map(p => `${p.date}@${p.venue}`);
    
    tourTexts.push(`${tourName}（${venues.join('/')}）`);
  });
  
  // 140文字以内に収まるようにツアー情報を分割
  let currentPost = '';
  const MAX_LENGTH = 140;
  
  for (const tourText of tourTexts) {
    // 現在のポストに追加してみて、140文字を超えるかチェック
    const tentativePost = currentPost ? `${currentPost}\n\n${tourText}` : tourText;
    
    if (tentativePost.length > MAX_LENGTH && currentPost) {
      // 140文字を超えるなら、現在のポストを確定し、新しいポストを開始
      posts.push(currentPost);
      currentPost = tourText;
    } else {
      // 140文字以内なら、ポストに追加
      currentPost = tentativePost;
    }
  }
  
  // 最後のポストがあれば追加
  if (currentPost) {
    posts.push(currentPost);
  }

  return posts;
}

/**
 * 指定された曲IDのライブ履歴情報を取得する
 * @param performances 演奏データ（フィルタリング済み）
 * @param songId 曲ID
 * @param songInfo 曲情報（セトリ入り公演数などのメタデータ）
 * @returns ライブ履歴情報
 */
async function liveHistoryOf(
  performances: SheetRows,
  songId: string,
  songInfo: string[] | null = null
): Promise<LiveHistory | null> {
  return tryCatch(async () => {
    if (!performances || performances.length === 0) {
      throw new Error(`Song with ID ${songId} has no performance history`);
    }

    // フィルタリング済みの演奏データからライブ履歴を作成
    info('曲IDの演奏履歴を処理します', { songId, count: performances.length });
    return makeLiveHistory(performances, songId, songInfo);
  }, 'ライブ履歴の処理中にエラーが発生しました');
}

/**
 * 曲一覧からライブ履歴がある曲をフィルタリングする
 * 演奏回数（F列=インデックス5）が0より大きい曲を抽出
 */
function filterSongsWithLiveHistory(songList: SheetRows): SheetRows {
  return songList.filter(song => {
    // 演奏回数（F列=インデックス5）があり、0より大きい曲
    const playCount = Number(song[5]);
    return !isNaN(playCount) && playCount > 0;
  });
}

/**
 * 曲一覧からランダムに1曲を選定する
 */
function selectRandomSong(songsWithLiveHistory: SheetRows): string[] {
  const randomIndex = Math.floor(Math.random() * songsWithLiveHistory.length);
  return songsWithLiveHistory[randomIndex];
}

export { filterSongsWithLiveHistory, formatLiveHistoryPosts, liveHistoryOf, selectRandomSong };
