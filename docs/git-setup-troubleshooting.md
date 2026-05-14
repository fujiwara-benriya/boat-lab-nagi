# Git設定トラブルシューティング

## 現在分かっていること

- ブランチは `main`
- remote `origin` は設定済み
- 初回コミットも作成済み
- `.git` がOneDrive配下のReparsePointになっており、Codex側から `.git/index.lock` を作れない
- そのため、Gitの追跡解除やpushなどの操作はユーザー側PowerShellで実行する必要がある

## まずやること

raw HTMLは重くなりやすいため、GitHubには上げない。  
以下のコマンドで「ファイルはPCに残したまま、Gitの追跡だけ外す」。

```powershell
cd "C:\Users\minor\OneDrive\ドキュメント\New project"
git rm --cached -r data/raw/official
git add .gitignore .github docs scripts package.json README.md agents skills data/README.md logs/README.md outputs/README.md
git add data/raw/official/**/*.json data/normalized logs outputs
git commit -m "chore: lighten data collection git tracking"
git push
```

## もし `git rm --cached` でエラーが出る場合

GitHub Desktop、VS Code、SourceTreeなど、Gitを触っていそうなアプリを閉じる。  
その後、PowerShellを新しく開いてもう一度実行する。

## もし `index.lock` があると言われた場合

以下を確認する。

```powershell
cd "C:\Users\minor\OneDrive\ドキュメント\New project"
Test-Path .git\index.lock
```

`True` の場合だけ、Git操作中でないことを確認してから削除する。

```powershell
Remove-Item .git\index.lock
```

## もしpushでログインを求められた場合

ブラウザが開いたらGitHubにログインする。  
Personal Access Tokenを求められた場合は、GitHub Desktopでpushする方が簡単。

## GitHub側の設定

GitHub Actionsが収集結果をcommitするには、以下を設定する。

```text
Settings
Actions
General
Workflow permissions
Read and write permissions
Save
```

## 注意

raw HTMLはGitHub ActionsのArtifactとして14日保存する。  
Gitに残すのは、metadata、正規化JSON、集計、ログを中心にする。
