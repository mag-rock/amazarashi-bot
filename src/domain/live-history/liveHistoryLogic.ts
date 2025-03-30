import { LiveHistory, LivePerformance, SheetRows } from '@/types';
import { tryCatch } from '@/utils/errorHandler';
import { info } from '@/utils/logger';
import twitterText from 'twitter-text';

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
    liveId: row[1], // B列(1)がライブID
    tourId: row[0], // A列(0)がツアーID
    liveName: row[4], // E列(4)がツアー名
    date: row[3], // D列(3)が日付
    venue: row[6], // G列(6)が会場
  }));

  const liveHistory: LiveHistory = {
    songId,
    title,
    performances,
    performanceCount: performances.length,
  };

  // 曲情報が提供された場合、追加情報を設定
  if (songInfo) {
    liveHistory.setlistCountOfTour = Number(songInfo[6]); // G列(6)がセトリ入り公演数（ツアー、単発）
    liveHistory.setlistCountOfFes = Number(songInfo[7]); // H列(7)が	セトリ入り公演数（フェス）
  }

  return liveHistory;
}

/**
 * ツアー情報のテキストをTwitterの文字数制限に合わせて分割する
 * @param tourTexts ツアー情報のテキスト配列
 * @returns ツイート用の分割されたテキスト配列
 */
export function splitTourTextsIntoTweets(tourTexts: string[]): string[] {
  const posts: string[] = [];

  // Twitterの制限に収まるようにツアー情報を分割
  let currentPost = '';
  // Twitterの重み付け文字数を考慮した分割
  const MAX_WEIGHTED_LENGTH = 280; // 現在のTwitterの文字数制限

  for (const tourText of tourTexts) {
    // 現在のポストに追加したテキストを用意
    const tentativePost = currentPost ? `${currentPost}\n\n${tourText}` : tourText;

    // twitter-textを使って文字数をチェック
    const parsedTweet = twitterText.parseTweet(tentativePost);

    if (parsedTweet.weightedLength > MAX_WEIGHTED_LENGTH && currentPost) {
      // 重み付け文字数が制限を超えるなら、現在のポストを確定し、新しいポストを開始
      posts.push(currentPost);
      currentPost = tourText;
    } else {
      // 制限内なら、ポストに追加
      currentPost = tentativePost;
    }
  }

  // 最後のポストがあれば追加
  if (currentPost) {
    posts.push(currentPost);
  }

  // TODO: 単体で長すぎるテキストの場合、そのまま1つのツイートとして返してしまうため、
  // 実際のユースケースでは280文字を超えるような長いテキストが単体で渡されないようにする必要がある
  // 今後の改善として、単体テキストも分割できるように機能を拡張することを検討する

  return posts;
}

/**
 * ライブ履歴情報を投稿用のテキストに変換する
 * @param liveHistory ライブ履歴情報
 * @returns 投稿用テキストの配列（複数ツイートに分割）
 */
function formatLiveHistoryPosts(liveHistory: LiveHistory): string[] {
  const posts: string[] = [];

  // 最初のツイート：曲名と各種カウント情報
  let firstPost = `『${liveHistory.title}』のライブ演奏履歴\n`;

  firstPost += `■ツアー、単発公演のセトリ入り：${liveHistory.setlistCountOfTour ?? 0}回`;
  firstPost += `\n■フェスのセトリ入り：${liveHistory.setlistCountOfFes ?? 0}回`;
  firstPost += `\n■総演奏回数：${liveHistory.performanceCount}回`;

  posts.push(firstPost);

  // 2つ目以降のツイート：ツアー別ライブ履歴
  // ツアーIDで分類
  const performancesByTour = new Map<string, LivePerformance[]>();

  liveHistory.performances.forEach((performance) => {
    const tourId = performance.tourId || 'unknown';
    if (!performancesByTour.has(tourId)) {
      performancesByTour.set(tourId, []);
    }
    performancesByTour.get(tourId)?.push(performance);
  });

  // ツアー情報をツアー開始日（最古の公演日）の降順で並べ替え
  const sortedTours: { tourId: string; performances: LivePerformance[]; startDate: string }[] = [];

  performancesByTour.forEach((performances, tourId) => {
    if (performances.length === 0) return;

    // 各ツアー内の公演を日付昇順でソート
    performances.sort((a, b) => a.date.localeCompare(b.date));

    // ツアー開始日 = 最古の公演日
    const startDate = performances[0].date;

    sortedTours.push({
      tourId,
      performances,
      startDate,
    });
  });

  // ツアー開始日の降順でソート
  sortedTours.sort((a, b) => b.startDate.localeCompare(a.startDate));

  // ツアーごとにテキストを生成
  const tourTexts: string[] = [];

  sortedTours.forEach((tour) => {
    const tourName = tour.performances[0].liveName;
    const performances = tour.performances;
    let tourText = '';

    if (performances.length === 1) {
      // 公演数が1の場合: ツアー名(日付)
      tourText = `${tourName}（${performances[0].date}）`;
    } else if (performances.length <= 3) {
      // 公演数が2または3の場合: ツアー名(日付, 日付, 日付)
      const venueTexts = performances.map((p) => `${p.date}`);
      tourText = `${tourName}（${venueTexts.join(', ')}）`;
    } else {
      // 公演数が4以上の場合: ツアー名(最初の日付 - 最後の日付 n回)
      const firstDate = performances[0].date;
      const lastDate = performances[performances.length - 1].date;
      const count = performances.length;
      tourText = `${tourName}（${firstDate} - ${lastDate} ${count}回）`;
    }

    tourTexts.push(tourText);
  });

  // ツアー情報をツイートに分割して追加
  const tourPosts = splitTourTextsIntoTweets(tourTexts);
  posts.push(...tourPosts);

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
  return songList.filter((song) => {
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
