import * as fs from "fs";
import { parse } from "csv-parse";
import { NextRequest } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  // 実行開始時間を取得
  const startTime = new Date();

  // CSVファイルを読み込む CSVにカンマが入っていると動作が止まるので、CSVからカンマが入っているデータを削除する
  const parser = parse({ columns: true }); // 先頭行をカラム名としてオブジェクト表示
  parser.on("readable", async () => {
    let record;
    while ((record = parser.read()) !== null) {
      // record.urlがCompanyテーブルに存在するか確認する
      try {
        const company = await prisma.company.findUnique({
          where: { url: record.url },
        });

        if (!company) {
          // Companyテーブルに挿入する
          await prisma.company.create({
            data: {
              url: record.url,
              memo: "M&Aクラウド買収企業",
            },
          });
        } else {
          // Companyのmemoを更新する
          await prisma.company.update({
            where: { id: company.id },
            data: { memo: "M&Aクラウド買収企業" },
          });
        }

        console.log("record: ", record);
      } catch (err) {
        console.error("Error inserting company:", err);
        continue;
      }
    }
  });

  parser.on("error", (e) => console.log(e.message));
  parser.on("end", () => {
    console.log("完了しました");
  });

  // parserを使用して実行
  // 未上場企業
  // fs.createReadStream("/Users/saitoukosuke/company/local/kokonara_unlisted_companies.csv").pipe(parser);

  // 上場企業
  // fs.createReadStream("/Users/saitoukosuke/company/local/kokonara_listed_companies.csv").pipe(parser);

  // M&Aクラウド買収企業
  // fs.createReadStream("/Users/saitoukosuke/company/local/macloud_companies.csv").pipe(parser);

  // 実行終了時間を取得して差分を取る
  const endTime = new Date();
  const diffTime = endTime.getTime() - startTime.getTime();
  return new Response(JSON.stringify({ body: "完了しました。経過時間: " + diffTime + "ms" }));
}
