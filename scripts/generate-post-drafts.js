import { mkdir, writeFile } from "node:fs/promises";

const draft = `# 水面解析ナギのボートメモ DRY_RUN

このメモはサンプルです。的中や利益を保証するものではありません。

## 見送り判断

水面、風、展示、モーター気配の条件がそろわない場合は、買わない判断も価値があります。

## 健全利用

生活費とは分けた予算内で楽しみましょう。
`;

await mkdir("outputs", { recursive: true });
await writeFile("outputs/draft-sample.md", draft, "utf8");
console.log("[DRY_RUN] Wrote outputs/draft-sample.md");
