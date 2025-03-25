import * as functions from '@google-cloud/functions-framework';
import { execute } from './application/usecase/karutaScript';
import { Request, Response } from 'express';
import { info, error } from './utils/logger';

// アプリケーション起動時の情報をログ出力
info(`アプリケーションを起動しました`, {
    nodeVersion: process.version,
    environment: process.env.ENVIRONMENT || 'production'
});

/**
 * HTTP関数のエントリーポイント
 * Cloud Functionsから呼び出されるメイン関数
 */
functions.http('helloHttp', async (req: Request, res: Response) => {
    try {
        info(`リクエストを受信しました`, {
            method: req.method,
            path: req.path,
            query: req.query
        });

        const result = await execute();

        info(`処理が完了しました`, { result });
        res.status(200).send('Success to post tweet.');
    } catch (err) {
        error(`エラーが発生しました`, {
            error: err instanceof Error ? err.message : String(err)
        });

        res.status(500).send(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
});