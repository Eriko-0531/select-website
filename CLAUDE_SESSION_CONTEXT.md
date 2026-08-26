# Claude引き継ぎメモ（内部用・次のセッション向け）

このファイルは人間向けではなく、**次にこのフォルダを触るClaude（Cowork等の別セッション）が状況を素早く把握するための引き継ぎメモ**です。エンジニア向けの資料は同フォルダの `G-SELECT_引き継ぎ資料_20260822.md` を参照してください。

作成日：2026-08-22（Claude Codeセッションにて）

## プロジェクトの現状

G-SELECT（グランド工房のガーデン&エクステリア厳選アイテムサイト）のWebページ制作。ユーザー（kishimoto@ground-f.com）が自分の作業範囲は完了と判断し、エンジニアへの引き継ぎフェーズに入っている。

## 今日までに完成した範囲（すべて `g-select_sample/` 直下）

- **TOPページ**：`index_sample_pattern3.html`（「ハイエンド・ミニマル」デザイン。他のindex_sample*.htmlは全部削除済み、これが唯一の最終版）
- **TASTE STYLE**：`taste_style.html`（一覧）＋ `style_cool/natural_cool/natural_warm/cute/hotel/resort/botanical/vintage/japandi/japanese.html`（詳細10種）
- **STORY STYLE**：`story_style.html`（一覧）＋ `style_relax/green/frame/night/cafe/gather/hobby/play_wellness.html`（詳細8種）
- **SELECT ITEM**：`product_sample.html`。Googleスプレッドシート連携（`SHEET_URLS`）で72商品を表示。**デザインはエンジニアのオリジナル**。今回はヘッダー・ナビ部分だけTOP/TASTE/STORYと統一し、カード自体の見た目（CSS）は意図的に触っていない。

## 絶対に踏まえてほしい決定事項

1. **施工事例グリッドの枚数はカテゴリ種別で固定**：TASTE STYLEはDAILY（COOL/NATURAL COOL/NATURAL WARM/CUTE）=15枚(5×3)、UNIQUE（HOTEL LIKE/RESORT/BOTANICAL/VINTAGE/JAPANDI/JAPANESE）=10枚(5×2)。STORY STYLEは全カテゴリ共通12枚(4×3)。この差は`.case-grid`をページごとの`<style>`で上書きして実現している。
2. **ブランドカラーは正式なもの（ユーザー提供のブランドガイドPDFから抽出済み）**：ブルー`#6abadc`、オレンジ`#e9b779`（薄いアクセント用に`#f5dfc3`、背景用に`#faedde`などの派生色あり）。これ以外の色（`#6bc4e8`や`#f1bc7c`等）は途中で使っていた推測値で、すでに全ファイル置き換え済み。もし別の色が使われていたら古いままなので直すこと。
3. **TASTE STYLEとSTORY STYLEはあえて見た目が違う**：TASTE側の「このスタイルについて」はカードデザイン（白背景・角丸）のまま、STORY側はカードを使わずボーダーレス・罫線区切りのデザイン。これは複数回のユーザー指示による意図的な差異で、揃える必要はない。
4. **SELECT ITEMのデザイン刷新はエンジニアに任せる方針で確定**。Claudeが勝手にカードのCSSをpattern3寄りに変更しないこと（本番共有CSSへの影響範囲が不明なため）。
5. **`images/taste/<カテゴリ>/`・`images/story/<カテゴリ>/`は`01.jpg`が一覧サムネイル**。実写真は本人が現場写真から選んで配置済み。`images/_originals_backup/`は元データのバックアップだったが、ユーザーが既に削除済み。
6. **共有CSS（`g-select_sample.css`）とpattern3専用の`g-select_sample_pattern3-overrides.css`は別ファイル**。前者は全ページ共通、後者はTOPページのみ。

## まだやっていないこと・提案中のこと

- ページごとに重複しているカスタム`<style>`ブロック（こんな方にレイアウト、配色テーマ等）の共通CSSへの統合（提案済み、未着手）
- SELECT ITEMのデザインをpattern3に合わせる作業（今はエンジニア用に下書きを作る方向で検討中。ユーザーの直近の意向を必ず確認すること）
- モバイル実機での通し確認は未実施（ローカルサーバーでの確認のみ）
- Gitへのコミットは今日の分、まだ実施していない可能性あり（要確認）

## 作業する上での注意点

- **画像の枚数・ファイル名は変更しない**：`01.jpg`〜`NN.jpg`の連番は各ページのHTMLと一致している。
- **既存の分岐（TASTE/STORYで異なる列数・レイアウト等）を安易に「揃えよう」としない**：これまでの経緯で意図的に分けている箇所が複数ある。
- 詳しい経緯・理由は、可能であれば `C:\Users\owner\.claude\projects\` 以下のこのプロジェクトのメモリファイル（Claude Codeの自動メモリ機能）も参照すると、今日1日の詳細な意思決定の経緯が追える（ただしCowork環境からは参照できない可能性が高い）。
