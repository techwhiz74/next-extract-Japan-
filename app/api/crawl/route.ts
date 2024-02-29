import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import axios from "axios";
import pLimit from "p-limit";

/*
export async function GET(request: Request) {
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const product = await res.json()
  
  return Response.json({ product });
}*/

import { NextRequest } from "next/server";
import { Company } from "@prisma/client";

// メイン処理を非同期関数として定義
async function processCompany(company: Company) {
  // 本番: https://mfmzbanezv4tithnhcjlbqqx2y0htgzx.lambda-url.ap-northeast-1.on.aws/
  // ローカル: http://localhost:9000/lambda-url/crawl/
  const result = await axios.post("https://mfmzbanezv4tithnhcjlbqqx2y0htgzx.lambda-url.ap-northeast-1.on.aws/", {
    url: company.url,
    secret_key: process.env.SECRET_KEY,
  });
  console.log("解析結果:", result.data);

  const emails = result.data["emails"] || [];
  for (const email of emails) {
    // 重複チェック
    const emailObj = await prisma.email.findUnique({
      where: { email },
    });
    if (!emailObj) {
      await prisma.email.create({
        data: {
          companyId: company.id,
          email,
        },
      });
    }
  }

  const contactFormUrl = result.data["contact_form_url"] || "";
  const title = result.data["title"] || "";
  const metaDescription = result.data["meta_description"] || "";

  await prisma.company.update({
    where: { id: company.id },
    data: { contactFormUrl, title, metaDescription, lastCrawledAt: new Date() },
  });

  console.log(company.url);
}

export async function GET(request: NextRequest) {
  // 実行開始時間を取得
  const startTime = new Date();

  // lastCrawledAtがnullのレコードを取得
  const companies = await prisma.company.findMany({
    where: { lastCrawledAt: null },
  });

  const limit = pLimit(100);

  // companiesをmapで回し、Promiseの配列を作成する
  const promises = companies.map((company) => {
    return limit(() => processCompany(company));
  });

  // すべての処理が完了するのを待つ
  await Promise.all(promises);

  // 実行終了時間を取得して差分を取る
  const endTime = new Date();
  const diffTime = endTime.getTime() - startTime.getTime();
  return new Response(JSON.stringify({ body: "完了しました。経過時間: " + diffTime + "ms" }));
}
