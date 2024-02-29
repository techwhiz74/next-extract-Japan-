import * as fs from "fs";
import { parse } from "csv-parse";
import { NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";
import axios from "axios";
import pLimit from "p-limit";

/* 2023/12/17時点での結果
人材　SaaS　広告　不動産　メディア　製造　施設
並び替えた名詞とカウント: [
  '事業: 85',             '会社: 73',           '---: 65',
  '興味: 45',             '検討: 43',           '規模: 40',
  'A: 40',                'M: 40',              '企業: 38',
  '買収: 36',             '案件: 36',           'サービス: 35',
  '開発: 34',             '売上: 33',           'OK: 28',
  'ネーム: 28',           '弊社: 27',           '領域: 26',
  '運営: 25',             '販売: 25',           'シート: 25',
  '管理: 25',             '希望: 25',           '人材: 24',
  'SaaS: 23',             'ビジネス: 22',       '営業: 22',
  'システム: 21',         '可能: 20',           '利益: 20',
  '広告: 20',             '不動産: 18',         'メディア: 18',
  '業務: 18',             '中心: 17',           '対象: 17',
  'その他: 17',           '展開: 16',           '支援: 16',
  '代理: 16',             '製造: 16',           '提供: 16',
  'ニーズ: 16',           '施設: 16',           '赤字: 15',
  'サイト: 15',           '取得: 15',           'お願い: 14',
  '幸い: 14',             '投資: 14',           '食品: 14',
  '店舗: 14',             '技術: 14',           '経営: 14',
  '自社: 14',             'エリア: 14',         '海外: 14',
  'コンサルティング: 14', 'シナジー: 13',       '処理: 13',
*/

export async function GET(request: NextRequest) {
  // 実行開始時間を取得
  const startTime = new Date();

  // 名詞のカウントを保持するオブジェクト
  const nounCounts: { [key: string]: number } = {};

  // CSVファイルを読み込む CSVにカンマが入っていると動作が止まるので、CSVからカンマが入っているデータを削除する
  const parser = parse({
    columns: ["", "", "", "memo", "", "", ""],
  }); // 先頭行をカラム名としてオブジェクト表示

  parser.on("readable", async () => {
    let record: Record<string, string> | null;
    while ((record = parser.read()) !== null) {
      if (!record || !record.memo) {
        // recordがnullまたはmemoが存在しない場合はスキップ
        continue;
      }

      console.log("record: ", record);

      // memoの名詞を取得する
      const text = record.memo;
      const result = await axios.post("https://bfnz5dx3dtgtqettcjogcrmqru0rhdik.lambda-url.ap-northeast-1.on.aws/", {
        text,
        secret_key: process.env.SECRET_KEY,
      });

      const nouns = result.data.split(" ");
      console.log("nouns: ", nouns);

      nouns.forEach((noun: string) => {
        nounCounts[noun] = (nounCounts[noun] || 0) + 1;
      });
    }
  });

  parser.on("error", (e) => console.log(e.message));
  parser.on("end", async () => {
    const sortedNouns = Object.entries(nounCounts)
      .sort((a, b) => b[1] - a[1])
      .map((entry: [string, number]) => `${entry[0]}: ${entry[1]}`);

    console.log("並び替えた名詞とカウント:", sortedNouns);

    const endTime = new Date();
    const diffTime = endTime.getTime() - startTime.getTime();
    return new Response(
      JSON.stringify({ body: "完了しました。経過時間: " + diffTime + "ms, 名詞カウント: " + sortedNouns.join(", ") })
    );
  });

  // parserを使用して実行
  // fs.createReadStream("/Users/saitoukosuke/company/local/buyer-needs.csv").pipe(parser);
  return new Response(JSON.stringify({ body: "実行中" }));
}
