#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// プロジェクトルートを設定
const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');

// 処理対象のファイルパターン
const filePatterns = [
	'src/**/*.ts',
	'src/**/*.tsx',
	'tests/**/*.ts',
	'tests/**/*.tsx'
];

// 相対パスのインポートを検出する正規表現
const relativeImportRegex = /import\s+(?:(?:{[^}]*})|(?:[^{}\s]*))\s+from\s+['"](\.\.[\/\\][^'"]*)['"]/g;

// ファイルの相対パスを@エイリアスのパスに変換する関数
function convertRelativeToAlias(filePath, content) {
	const fileDir = path.dirname(filePath);

	// ファイル内の相対インポート文を検索して置換
	return content.replace(relativeImportRegex, (match, relativePath) => {
		// 相対パスから絶対パスを計算
		const absolutePath = path.resolve(fileDir, relativePath);

		// srcディレクトリ以下のパスに変換
		const srcRelativePath = path.relative(srcRoot, absolutePath);

		if (!srcRelativePath.startsWith('..')) {
			// @エイリアスを使用したパスに置換
			return match.replace(relativePath, `@/${srcRelativePath}`);
		}

		return match;
	});
}

// ファイルを処理する関数
function processFile(filePath) {
	try {
		const content = fs.readFileSync(filePath, 'utf8');
		const updatedContent = convertRelativeToAlias(filePath, content);

		if (content !== updatedContent) {
			fs.writeFileSync(filePath, updatedContent, 'utf8');
			console.log(`✅ 更新しました: ${filePath}`);
			return true;
		}
		return false;
	} catch (error) {
		console.error(`❌ エラー (${filePath}): ${error.message}`);
		return false;
	}
}

// メイン処理
(async function main() {
	console.log('🔍 相対インポートパスを@エイリアスに変換するのだ...');

	try {
		let totalFiles = 0;
		let updatedFiles = 0;

		// 各ファイルパターンに対して処理を実行
		for (const pattern of filePatterns) {
			const files = await glob(pattern, { cwd: projectRoot });

			for (const file of files) {
				const filePath = path.join(projectRoot, file);
				totalFiles++;
				if (processFile(filePath)) {
					updatedFiles++;
				}
			}
		}

		console.log(`🎉 処理完了! ${totalFiles} ファイル中 ${updatedFiles} ファイルを更新したのだ。`);

	} catch (error) {
		console.error(`❌ エラー: ${error.message}`);
		process.exit(1);
	}
})(); 