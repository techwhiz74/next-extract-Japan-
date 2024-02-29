import * as fs from "fs";
import { parse } from "csv-parse";
import { NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";
import axios from "axios";
import pLimit from "p-limit";

// pLimitのインスタンスを作成（同時に実行する非同期タスクの最大数を10とする）
// 10だとかなり安定　もう少し増やしていいかもしれない
// SalesNowは30でもかなり安定している
const limit = pLimit(30);

// 日付文字列が適切な形式かどうかを確認する関数
function isValidDate(dateString: string) {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // yyyy-mm-dd 形式
  return dateString.match(regex) !== null;
}

// メイン処理を非同期関数として定義
async function processHoujin(houjinBangou: string, companyName: string) {
  // sales-nowのAPIを叩く
  // 本番: https://7uirqs7pcteyc2qwppbxgpfnxa0ihxpq.lambda-url.ap-northeast-1.on.aws/
  // ローカル: http://localhost:9000/lambda-url/sales-now/
  const result = await axios.post("https://7uirqs7pcteyc2qwppbxgpfnxa0ihxpq.lambda-url.ap-northeast-1.on.aws/", {
    houjin_bangou: houjinBangou,
    secret_key: process.env.SECRET_KEY,
  });
  console.log("解析結果:", result.data);

  // result.data.urlが空の場合はスキップする
  if (!result.data.url) {
    console.log("urlが空のためスキップします");
    return;
  }

  // result.data.urlがCompanyテーブルに存在するか確認する
  try {
    const company = await prisma.company.findUnique({
      where: { url: result.data.url },
    });

    // Companyが存在しない場合は作成し、SalesNowも追加する
    // TODO: incorporatedAtはyyyy-mm形式にも対応する
    if (!company) {
      await prisma.company.create({
        data: {
          name: companyName, // 法人名
          prefecture: result.data.prefecture, // 都道府県
          address: result.data.address, // 住所
          incorporatedAt: isValidDate(result.data.incorporated_at) ? new Date(result.data.incorporated_at) : null, // 設立日
          houjinBangou: result.data.houjin_bangou, // 法人番号
          listingStatus: result.data.listing_status, // 上場状況
          capital: result.data.capital, // 資本金
          revenue: result.data.revenue, // 売上高
          url: result.data.url,
          employeeNumber: result.data.employee_number, // 従業員数
          memo: "Sales Now",
          salesNow: {
            create: {
              // SalesNowに関するデータをここに追加
              industry: result.data.industry,
              subIndustry: result.data.sub_industry,
            },
          },
        },
      });
      console.log("record登録: ", result.data.url);
    } else {
      // Companyが存在する場合は、名前を更新し、SalesNowを追加または更新する
      await prisma.company.update({
        where: { id: company.id },
        data: {
          name: companyName, // 法人名
          prefecture: result.data.prefecture, // 都道府県
          address: result.data.address, // 住所
          incorporatedAt: isValidDate(result.data.incorporated_at) ? new Date(result.data.incorporated_at) : null, // 設立日
          houjinBangou: result.data.houjin_bangou, // 法人番号
          listingStatus: result.data.listing_status, // 上場状況
          capital: result.data.capital, // 資本金
          revenue: result.data.revenue, // 売上高
          url: result.data.url,
          employeeNumber: result.data.employee_number, // 従業員数
          memo: "Sales Now",
          salesNow: {
            upsert: {
              create: {
                // SalesNowに関するデータをここに追加
                industry: result.data.industry,
                subIndustry: result.data.sub_industry,
              },
              update: {
                // 既存のSalesNowレコードを更新するデータ
                industry: result.data.industry,
                subIndustry: result.data.sub_industry,
              },
              where: { companyId: company.id },
            },
          },
        },
      });
      console.log("record存在: ", result.data.url);
    }
  } catch (err) {
    console.error("Error inserting company:", err);
    return;
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
      "",
    ],
  }); // 先頭行をカラム名としてオブジェクト表示

  const promises: Promise<any>[] = [];

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
      const promise = limit(() => processHoujin(houjinBangou, companyName));
      promises.push(promise);
    }
  });

  parser.on("error", (e) => console.log(e.message));
  parser.on("end", async () => {
    // すべての処理が完了するのを待つ
    await Promise.all(promises);

    console.log("完了しました");
    const endTime = new Date();
    const diffTime = endTime.getTime() - startTime.getTime();
    return new Response(JSON.stringify({ body: "完了しました。経過時間: " + diffTime + "ms" }));
  });

  // parserを使用して実行
  // fs.createReadStream("/Users/saitoukosuke/company/local/00_zenkoku_all_20231031.csv").pipe(parser);
  return new Response(JSON.stringify({ body: "実行中" }));
}
