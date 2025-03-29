// module-alias のセットアップ
import 'module-alias/register';

import * as functions from '@google-cloud/functions-framework';
import { execute as executeKaruta } from './application/usecase/karutaScript';
import { execute as executeLiveHistory } from './application/usecase/live-history/liveHistoryScript';
import { Request, Response } from 'express';
import { info, error } from './utils/logger';

// アプリケーション起動時の情報をログ出力
info(`アプリケーションを起動しました`, {
  nodeVersion: process.version,
  environment: process.env.ENVIRONMENT || 'production',
});

/**
 * カルタクイズ用のHTTP関数
 */
functions.http('helloHttp', async (req: Request, res: Response) => {
  try {
    info(`カルタクイズリクエストを受信しました`, {
      method: req.method,
      path: req.path,
      query: req.query,
    });

    const result = await executeKaruta();

    info(`カルタクイズ処理が完了しました`, { result });
    res.status(200).send('Success to post karuta quiz tweet.');
  } catch (err) {
    error(`カルタクイズ処理でエラーが発生しました`, {
      error: err instanceof Error ? err.message : String(err),
    });

    res.status(500).send(`Error: ${err instanceof Error ? err.message : String(err)}`);
  }
});

/**
 * ライブ履歴用のHTTP関数
 */
// functions.http('liveHistory', async (req: Request, res: Response) => {
//   try {
//     info(`ライブ履歴リクエストを受信しました`, {
//       method: req.method,
//       path: req.path,
//       query: req.query,
//     });

//     const result = await executeLiveHistory();

//     info(`ライブ履歴処理が完了しました`, { result });
//     res.status(200).send('Success to post live history tweet.');
//   } catch (err) {
//     error(`ライブ履歴処理でエラーが発生しました`, {
//       error: err instanceof Error ? err.message : String(err),
//     });

//     res.status(500).send(`Error: ${err instanceof Error ? err.message : String(err)}`);
//   }
// });
