import * as fs from "fs";
import { parse } from "csv-parse";
import { NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";
import axios from "axios";
import pLimit from "p-limit";

/* 
国税庁のCSVをインポートするプログラム
郵便番号だけの入力に留めている
*/

interface UpdateData {
  name?: string;
  zip?: string;
}

// メイン処理を非同期関数として定義
async function processHoujin(houjinBangou: string, companyName: string, zip: string) {
  console.log("processHoujin", houjinBangou, companyName, zip);

  // result.data.urlがCompanyテーブルに存在するか確認する
  // TODO: 法人番号が重複しており、法人番号で重複チェックしたほうがいい
  try {
    const companies = await prisma.company.findMany({
      where: { houjinBangou },
    });

    // TODO: いったん追加は無視して更新だけ行う
    for (let company of companies) {
      let updateData: UpdateData = {};

      if (company.name === "") {
        updateData.name = companyName;
      }
      if (company.zip === "") {
        updateData.zip = zip;
      }

      // Companyが存在する場合は、名前を更新し、SalesNowを追加または更新する
      await prisma.company.update({
        where: { id: company.id },
        data: updateData,
      });
      console.log("record存在: ", houjinBangou, companyName, zip);
    }
  } catch (err) {
    console.error("Error inserting company:", err);
  }
}

export async function GET(request: NextRequest) {
  // 実行開始時間を取得
  const startTime = new Date();

  // CSVファイルを読み込む CSVにカンマが入っていると動作が止まるので、CSVからカンマが入っているデータを削除する
  const parser = parse({
    columns: [
      "",
      "houjin_bangou",
      "",
      "",
      "",
      "",
      "name",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "zip",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
  }); // 先頭行をカラム名としてオブジェクト表示

  parser.on("readable", async () => {
    let record: any;
    while ((record = parser.read()) !== null) {
      if (!record || !record.houjin_bangou) {
        // recordがnullまたはhoujin_bangouが存在しない場合はスキップ
        continue;
      }

      console.log("record: ", record);

      // record.houjin_bangou の値を非同期関数の引数として渡す
      const houjinBangou = record.houjin_bangou;
      const companyName = record.name;
      const zip = record.zip;

      // 最初pLimit=30で実行したが、CSVの読み取りは最後までできるが、DBへの書き込みが途中からできなかった
      // エラーは吐かず、処理が途中で止まるのみ　ブラウザで再実行ができず、nodeが止まっているような挙動だった
      // なのでparserのpauseとresumeを使って、処理中は読み込みを一時停止し、処理完了後に再開することで上記問題を解決した
      parser.pause(); // データ処理中は読み込みを一時停止
      processHoujin(houjinBangou, companyName, zip);
      parser.resume(); // 処理完了後、読み込みを再開
    }
  });

  parser.on("error", (e) => console.log(e.message));
  parser.on("end", async () => {
    console.log("完了しました");
    const endTime = new Date();
    const diffTime = endTime.getTime() - startTime.getTime();
    return new Response(JSON.stringify({ body: "完了しました。経過時間: " + diffTime + "ms" }));
  });

  // parserを使用して実行
  // fs.createReadStream("/Users/saitoukosuke/company/local/00_zenkoku_all_20231031.csv").pipe(parser);
  return new Response(JSON.stringify({ body: "実行中" }));
}
