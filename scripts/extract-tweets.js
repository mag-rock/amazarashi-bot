#!/usr/bin/env node

const fs = require('fs');

function extractTweets(logContent) {
    // モックツイート行を検出する正規表現
    const tweetPattern = /\[.*?\] \[INFO\] モックツイートを実行します (\{.*\})/g;
    
    // マッチする行からJSONを抽出
    const matches = [...logContent.matchAll(tweetPattern)];
    
    const tweets = [];
    for (const match of matches) {
        try {
            // JSONをパース
            const tweetData = JSON.parse(match[1]);
            // textフィールドを取得
            if (tweetData.text) {
                tweets.push(tweetData.text);
            }
        } catch (error) {
            console.error(`JSONの解析に失敗しました: ${match[1]}`);
        }
    }
    
    return tweets;
}

function getOutputFilepath(inputFilepath) {
    if (!inputFilepath) {
        return "extracted-output.txt";
    }
    
    const dirname = require('path').dirname(inputFilepath);
    const filename = require('path').basename(inputFilepath);
    const outputFilename = `extracted-${filename}`;
    
    return require('path').join(dirname, outputFilename);
}

function isLiveHistoryTweet(tweet) {
    return tweet.includes('ライブ演奏履歴');
}

function main() {
    // 入力ファイルパス
    let inputFilepath = null;
    let logContent = '';
    
    if (process.argv.length > 2) {
        inputFilepath = process.argv[2];
        try {
            logContent = fs.readFileSync(inputFilepath, 'utf8');
        } catch (error) {
            console.error(`ファイルの読み込みに失敗しました: ${inputFilepath}`);
            process.exit(1);
        }
    } else {
        // 標準入力から読み込む
        logContent = fs.readFileSync(0, 'utf8');
    }
    
    // 出力ファイルパスを生成
    const outputFilepath = getOutputFilepath(inputFilepath);
    
    // ツイートのテキストを抽出
    const tweets = extractTweets(logContent);
    
    // 結果をファイルに出力
    const output = tweets.map((tweet, index) => {
        // ライブ演奏履歴のツイートの場合は=を、それ以外は-を使用
        const separator = isLiveHistoryTweet(tweet) ? '\n' + '='.repeat(40) : '-'.repeat(40);
        return `${separator}\n${tweet}`;
    }).join('\n');
    
    fs.writeFileSync(outputFilepath, output, 'utf8');
    
    console.log(`結果を ${outputFilepath} に保存しました`);
}

main(); 