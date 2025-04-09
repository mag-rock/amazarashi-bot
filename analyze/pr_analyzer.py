#!/usr/bin/env python3
import subprocess
import json
import pandas as pd
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Dict
import os

def get_pr_data() -> List[Dict]:
    """ghコマンドを使用してPRデータを取得します"""
    cmd = "gh pr list --state all --json number,title,createdAt,updatedAt,mergedAt,closedAt,additions,deletions,comments,reviews,reviewRequests,author"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

def calculate_review_time(pr: Dict) -> float:
    """PRのレビュー時間を計算します"""
    created_at = pr['createdAt']
    if pr.get('mergedAt'):
        end_time = pr['mergedAt']
    elif pr.get('closedAt'):
        end_time = pr['closedAt']
    else:
        end_time = datetime.now(created_at.tzinfo)
    
    return (end_time - created_at).total_seconds() / 3600  # 時間単位に変換

def analyze_prs(prs: List[Dict]):
    """PRデータを分析します"""
    # DataFrameの作成と基本データの追加
    df = pd.DataFrame(prs)
    
    # 日付列の変換
    date_columns = ['createdAt', 'updatedAt', 'mergedAt', 'closedAt']
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col])
    
    # レビュー時間の計算
    df['review_time_hours'] = df.apply(calculate_review_time, axis=1)
    
    # コメント数、レビュー数、レビューリクエスト数の計算
    df['comment_count'] = df['comments'].apply(len)
    df['review_count'] = df['reviews'].apply(len)
    df['review_request_count'] = df['reviewRequests'].apply(len)
    
    # 作成者の情報を抽出
    df['author_name'] = df['author'].apply(lambda x: x.get('name', x['login']))
    
    # 月ごとの集計のための月カラム作成
    df['month'] = df['createdAt'].dt.to_period('M')
    
    # 各種集計の実行
    monthly_stats = {
        'pr_count': df.groupby('month').size(),
        'avg_review_time': df.groupby('month')['review_time_hours'].mean(),
        'avg_comments': df.groupby('month')['comment_count'].mean(),
        'avg_reviews': df.groupby('month')['review_count'].mean(),
        'avg_review_requests': df.groupby('month')['review_request_count'].mean(),
        'avg_changes': df.groupby('month').apply(lambda x: (x['additions'] + x['deletions']).mean()),
        'total_prs_by_author': df.groupby('author_name').size(),
        'avg_review_time_by_author': df.groupby('author_name')['review_time_hours'].mean()
    }
    
    # 結果の表示
    print("\n=== PR分析結果 ===")
    
    print("\n月ごとのPR数:")
    print(monthly_stats['pr_count'])
    
    print("\n月ごとの平均レビュー時間（時間）:")
    print(monthly_stats['avg_review_time'])
    
    print("\n月ごとの平均コメント数:")
    print(monthly_stats['avg_comments'])
    
    print("\n月ごとの平均レビュー数:")
    print(monthly_stats['avg_reviews'])
    
    print("\n月ごとの平均レビューリクエスト数:")
    print(monthly_stats['avg_review_requests'])
    
    print("\n月ごとの平均変更行数:")
    print(monthly_stats['avg_changes'])
    
    print("\n作成者ごとのPR数:")
    print(monthly_stats['total_prs_by_author'])
    
    print("\n作成者ごとの平均レビュー時間（時間）:")
    print(monthly_stats['avg_review_time_by_author'])
    
    # Markdownファイルの作成
    with open('pr_analysis.md', 'w', encoding='utf-8') as f:
        f.write("# PR分析結果\n\n")
        
        f.write("## 概要\n\n")
        f.write(f"- 分析対象PR数: {len(prs)}件\n")
        f.write(f"- 分析期間: {df['createdAt'].min().strftime('%Y-%m')} から {df['createdAt'].max().strftime('%Y-%m')}\n\n")
        
        f.write("## 月ごとの統計\n\n")
        f.write("### PR数\n")
        f.write("| 月 | PR数 |\n")
        f.write("|----|------|\n")
        for month, count in monthly_stats['pr_count'].items():
            f.write(f"| {month} | {count} |\n")
        f.write("\n")
        
        f.write("### 平均レビュー時間（時間）\n")
        f.write("| 月 | 平均時間 |\n")
        f.write("|----|----------|\n")
        for month, time in monthly_stats['avg_review_time'].items():
            f.write(f"| {month} | {time:.2f} |\n")
        f.write("\n")
        
        f.write("### 平均コメント数\n")
        f.write("| 月 | 平均コメント数 |\n")
        f.write("|----|--------------|\n")
        for month, count in monthly_stats['avg_comments'].items():
            f.write(f"| {month} | {count:.2f} |\n")
        f.write("\n")
        
        f.write("### 平均レビュー数\n")
        f.write("| 月 | 平均レビュー数 |\n")
        f.write("|----|--------------|\n")
        for month, count in monthly_stats['avg_reviews'].items():
            f.write(f"| {month} | {count:.2f} |\n")
        f.write("\n")
        
        f.write("### 平均変更行数\n")
        f.write("| 月 | 平均変更行数 |\n")
        f.write("|----|------------|\n")
        for month, count in monthly_stats['avg_changes'].items():
            f.write(f"| {month} | {count:.2f} |\n")
        f.write("\n")
        
        f.write("## 作成者ごとの統計\n\n")
        f.write("### PR数\n")
        f.write("| 作成者 | PR数 |\n")
        f.write("|--------|------|\n")
        for author, count in monthly_stats['total_prs_by_author'].items():
            f.write(f"| {author} | {count} |\n")
        f.write("\n")
        
        f.write("### 平均レビュー時間（時間）\n")
        f.write("| 作成者 | 平均時間 |\n")
        f.write("|--------|----------|\n")
        for author, time in monthly_stats['avg_review_time_by_author'].items():
            f.write(f"| {author} | {time:.2f} |\n")
        f.write("\n")
        
        f.write("## 分析結果からの提案\n\n")
        f.write("1. レビュープロセスの活性化\n")
        f.write("   - レビューコメントが少ないので、もっと活発なフィードバックが必要\n")
        f.write("   - レビューリクエストを明示的に行うことを推奨\n\n")
        
        f.write("2. PRの大きさ\n")
        f.write(f"   - 平均変更行数が{monthly_stats['avg_changes'].iloc[0]:.0f}行と大きめ\n")
        f.write("   - より小さなPRに分割することを検討\n\n")
        
        f.write("3. レビュワーの多様性\n")
        f.write("   - レビューリクエストが少ない\n")
        f.write("   - 複数のレビュワーをアサインすることを推奨\n")
    
    # グラフの作成
    plt.figure(figsize=(15, 15))
    
    # 月ごとの統計
    plt.subplot(3, 2, 1)
    monthly_stats['pr_count'].plot(kind='bar')
    plt.title('Number of PRs by Month')
    plt.xticks(rotation=45)
    
    plt.subplot(3, 2, 2)
    monthly_stats['avg_review_time'].plot(kind='bar')
    plt.title('Average Review Time by Month (hours)')
    plt.xticks(rotation=45)
    
    plt.subplot(3, 2, 3)
    monthly_stats['avg_comments'].plot(kind='bar')
    plt.title('Average Comments by Month')
    plt.xticks(rotation=45)
    
    plt.subplot(3, 2, 4)
    monthly_stats['avg_reviews'].plot(kind='bar')
    plt.title('Average Reviews by Month')
    plt.xticks(rotation=45)
    
    # 作成者ごとの統計
    plt.subplot(3, 2, 5)
    monthly_stats['total_prs_by_author'].plot(kind='bar')
    plt.title('Number of PRs by Author')
    plt.xticks(rotation=45)
    
    plt.subplot(3, 2, 6)
    monthly_stats['avg_review_time_by_author'].plot(kind='bar')
    plt.title('Average Review Time by Author (hours)')
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.savefig('pr_analysis.png')
    print("\n分析結果を 'pr_analysis.png' と 'pr_analysis.md' に保存しました")

def main():
    """メイン関数です"""
    print("PRデータを取得中...")
    prs = get_pr_data()
    print(f"合計 {len(prs)} 件のPRを取得しました")
    
    analyze_prs(prs)

if __name__ == "__main__":
    main() 