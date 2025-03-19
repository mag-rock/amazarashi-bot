import json
import os
import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

# パッケージ依存関係を読み込む
with open('package.json', 'r') as f:
    package_data = json.load(f)

# 依存関係グラフを作成
G = nx.DiGraph()

# 依存関係を追加
if 'dependencies' in package_data:
    for dep, version in package_data['dependencies'].items():
        G.add_edge('amazarashi-bot', dep, type='dependency')

if 'devDependencies' in package_data:
    for dep, version in package_data['devDependencies'].items():
        G.add_edge('amazarashi-bot', dep, type='devDependency')

# ノードの色を設定
node_colors = []
for node in G.nodes():
    if node == 'amazarashi-bot':
        node_colors.append('lightblue')
    elif any(G[u][node]['type'] == 'dependency' for u in G.predecessors(node)):
        node_colors.append('lightgreen')
    else:
        node_colors.append('lightcoral')

# グラフを描画
plt.figure(figsize=(12, 10))
pos = nx.spring_layout(G, k=0.3, iterations=50)
nx.draw_networkx_nodes(G, pos, node_size=2000, node_color=node_colors, alpha=0.8)
nx.draw_networkx_labels(G, pos, font_size=10, font_family='sans-serif')

# エッジの色を設定
edge_colors = []
for u, v in G.edges():
    if G[u][v]['type'] == 'dependency':
        edge_colors.append('green')
    else:
        edge_colors.append('red')

nx.draw_networkx_edges(G, pos, width=1.0, alpha=0.5, edge_color=edge_colors, 
                      connectionstyle='arc3,rad=0.1', arrowsize=15)

# 凡例を追加
from matplotlib.lines import Line2D
legend_elements = [
    Line2D([0], [0], marker='o', color='w', label='プロジェクト', markerfacecolor='lightblue', markersize=15),
    Line2D([0], [0], marker='o', color='w', label='依存パッケージ', markerfacecolor='lightgreen', markersize=15),
    Line2D([0], [0], marker='o', color='w', label='開発依存パッケージ', markerfacecolor='lightcoral', markersize=15),
    Line2D([0], [0], color='green', lw=2, label='依存関係'),
    Line2D([0], [0], color='red', lw=2, label='開発依存関係')
]
plt.legend(handles=legend_elements, loc='upper right')

plt.axis('off')
plt.title('amazarashi-bot パッケージ依存関係', fontsize=16)
plt.tight_layout()
plt.savefig('package-dependencies.png', dpi=300, bbox_inches='tight')
print("依存関係グラフを 'package-dependencies.png' に保存しました")

# ソースコードの依存関係を可視化
src_graph = nx.DiGraph()

# ソースディレクトリを走査
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts'):
            file_path = os.path.join(root, file)
            module_name = os.path.relpath(file_path, 'src').replace('\\', '/').replace('.ts', '')
            
            # ファイルの内容を読み込む
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # importステートメントを探す
            import_lines = [line.strip() for line in content.split('\n') if line.strip().startswith('import ')]
            
            for line in import_lines:
                # 相対パスのインポートを処理
                if 'from' in line and ("'./" in line or "'../" in line or '"./' in line or '"../' in line):
                    parts = line.split('from')
                    if len(parts) > 1:
                        imported_path = parts[1].strip().strip("'").strip('"')
                        if imported_path.startswith('./') or imported_path.startswith('../'):
                            # 相対パスを絶対パスに変換
                            current_dir = os.path.dirname(file_path)
                            abs_path = os.path.normpath(os.path.join(current_dir, imported_path))
                            rel_path = os.path.relpath(abs_path, 'src').replace('\\', '/')
                            
                            # .tsファイル拡張子を追加（ファイルが存在する場合）
                            if not os.path.exists(abs_path) and not os.path.exists(abs_path + '.ts'):
                                # index.tsを試す
                                if os.path.exists(os.path.join(abs_path, 'index.ts')):
                                    rel_path = rel_path + '/index'
                            
                            src_graph.add_edge(module_name, rel_path)

# グラフを描画
plt.figure(figsize=(14, 12))
pos = nx.spring_layout(src_graph, k=0.3, iterations=50)

# ノードの色を設定（ディレクトリ構造に基づく）
node_colors = []
for node in src_graph.nodes():
    if 'application' in node:
        node_colors.append('lightblue')
    elif 'domain' in node:
        node_colors.append('lightgreen')
    elif 'infrastructure' in node:
        node_colors.append('lightcoral')
    else:
        node_colors.append('yellow')

nx.draw_networkx_nodes(src_graph, pos, node_size=2000, node_color=node_colors, alpha=0.8)
nx.draw_networkx_labels(src_graph, pos, font_size=8, font_family='sans-serif')
nx.draw_networkx_edges(src_graph, pos, width=1.0, alpha=0.5, 
                      connectionstyle='arc3,rad=0.1', arrowsize=15)

# 凡例を追加
legend_elements = [
    Line2D([0], [0], marker='o', color='w', label='アプリケーション層', markerfacecolor='lightblue', markersize=15),
    Line2D([0], [0], marker='o', color='w', label='ドメイン層', markerfacecolor='lightgreen', markersize=15),
    Line2D([0], [0], marker='o', color='w', label='インフラストラクチャ層', markerfacecolor='lightcoral', markersize=15),
    Line2D([0], [0], marker='o', color='w', label='その他', markerfacecolor='yellow', markersize=15),
]
plt.legend(handles=legend_elements, loc='upper right')

plt.axis('off')
plt.title('amazarashi-bot ソースコード依存関係', fontsize=16)
plt.tight_layout()
plt.savefig('source-dependencies.png', dpi=300, bbox_inches='tight')
print("ソースコード依存関係グラフを 'source-dependencies.png' に保存しました")