import * as fs from "fs";
import * as path from "path";
import { PDFExtract, PDFExtractOptions } from "pdf.js-extract";
import { createObjectCsvWriter } from "csv-writer";

const pdfExtract = new PDFExtract();
const options: PDFExtractOptions = {};

const directoryPath = "../shoukou-research"; // Update with the path to your directory

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Find the first PDF file in the directory
  const pdfFile = files.find((file) => file.toLowerCase().endsWith(".pdf"));

  if (!pdfFile) {
    console.log("No PDF files found in the directory.");
    return;
  }

  const pdfFilePath = path.join(directoryPath, pdfFile);
  const pdfFileName = path.parse(pdfFilePath).name; // Extract the base name of the PDF file without the extension

  pdfExtract
    .extract(pdfFilePath, options)
    .then((data) => {

      // Define mappings for specific labels
      const labelMappings = []; // Array to store text content from each page

      // Loop through the data and extract the items and values
      for (let i = 0; i < data.pages.length; i++) {
        const pageContent = {
          企業コード: "",
          上場: "",
          "商号(カナ)": "",
          "商号(漢字)": "",
          調査年月日: "",
          代表者カナ: "",
          代表者氏名: "",
          郵便番号: "",
          所在地: "",
          電話番号: "",
          設立年月: "",
          創業年月: "",
          資本金: "",
          従業員数: "",
          業種: "",
          営業種目: "",
          役員: "",
          大株主: "",
          業績: "",
          売上伸長率: "",
          利益伸長率: "",
          "営業所・支店": "",
          仕入先: "",
          販売先: "",
          取引銀行: "",
          概況: "",
          代表者: "",
          現住所: "",
          生年月日: "",
          干支: "",
          出身地: "",
          出身校: "",
        };
        data.pages[i].content.forEach((item, index) => {
          const string = item.str.trim();
          if (string === "企業コード") {
            let j = 1;
            pageContent.企業コード = "";
            while (data.pages[i].content[index + j].str.trim() !== "上場" && index + j < data.pages[i].content.length) {
              pageContent.企業コード += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.企業コード = pageContent.企業コード.trim();
          } else if (string === "上場") {
            let j = 1;
            pageContent.上場 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "調査年月日" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.上場 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.上場 = pageContent.上場.trim();
          } else if (string === "商号（カナ）") {
            let j = 1;
            pageContent["商号(カナ)"] = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "代表者カナ" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent["商号(カナ)"] += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent["商号(カナ)"] = pageContent["商号(カナ)"].trim();
          } else if (string === "商号（漢字）") {
            let j = 1;
            pageContent["商号(漢字)"] = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "代表者氏名" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent["商号(漢字)"] += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent["商号(漢字)"] = pageContent["商号(漢字)"].trim();
          } else if (string === "調査年月日") {
            let j = 1;
            pageContent.調査年月日 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "商号（カナ）" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.調査年月日 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.調査年月日 = pageContent.調査年月日.trim();
          } else if (string === "代表者カナ") {
            let j = 1;
            pageContent.代表者カナ = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "商号（漢字）" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.代表者カナ += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.代表者カナ = pageContent.代表者カナ.trim();
          } else if (string === "代表者氏名") {
            let j = 1;
            pageContent.代表者氏名 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "郵便番号" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.代表者氏名 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.代表者氏名 = pageContent.代表者氏名.trim();
          } else if (string === "郵便番号") {
            let j = 1;
            pageContent.郵便番号 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "所在地" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.郵便番号 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.郵便番号 = pageContent.郵便番号.trim();
          } else if (string === "所在地") {
            let j = 1;
            pageContent.所在地 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "電話番号" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.所在地 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.所在地 = pageContent.所在地.trim();
          } else if (string === "電話番号") {
            let j = 1;
            pageContent.電話番号 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "設立年月" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.電話番号 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.電話番号 = pageContent.電話番号.trim();
          } else if (string === "設立年月") {
            let j = 1;
            pageContent.設立年月 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "創業年月" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.設立年月 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.設立年月 = pageContent.設立年月.trim();
          } else if (string === "創業年月") {
            let j = 1;
            pageContent.創業年月 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "資本金" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.創業年月 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.創業年月 = pageContent.創業年月.trim();
          } else if (string === "資本金") {
            let j = 1;
            pageContent.資本金 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "従業員数" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.資本金 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.資本金 = pageContent.資本金.trim();
          } else if (string === "従業員数") {
            let j = 1;
            pageContent.従業員数 = "";
            while (data.pages[i].content[index + j].str.trim() !== "業種" && index + j < data.pages[i].content.length) {
              pageContent.従業員数 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.従業員数 = pageContent.従業員数.trim();
          } else if (string === "業種") {
            let j = 1;
            pageContent.業種 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "営業種目" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.業種 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.業種 = pageContent.業種.trim();
          } else if (string === "営業種目") {
            let j = 1;
            pageContent.営業種目 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "営業所・支店" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.営業種目 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.営業種目 = pageContent.営業種目.trim();
          } else if (string === "役員") {
            let j = 1;
            pageContent.役員 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "仕入先" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.役員 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.役員 = pageContent.役員.trim();
          } else if (string === "大株主") {
            let j = 1;
            pageContent.大株主 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "販売先" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.大株主 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.大株主 = pageContent.大株主.trim();
          } else if (string === "業績") {
            let j = 1;
            pageContent.業績 = "";
            while (data.pages[i].content[index + j].str.trim() !== "概況" && index + j < data.pages[i].content.length) {
              pageContent.業績 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.業績 = pageContent.業績.trim();
            pageContent.業績 = pageContent.業績.replace(/取引銀行.*?(?=20)/, "");
          } else if (string === "売上伸長率") {
            let j = 1;
            pageContent.売上伸長率 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "利益伸長率" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.売上伸長率 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.売上伸長率 = pageContent.売上伸長率.trim();
          } else if (string === "利益伸長率") {
            let j = 1;
            pageContent.利益伸長率 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "代表者" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.利益伸長率 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.利益伸長率 = pageContent.利益伸長率.trim();
          } else if (string === "営業所・支店") {
            let j = 1;
            pageContent["営業所・支店"] = "";
            while (data.pages[i].content[index + j].str.trim() !== "役員" && index + j < data.pages[i].content.length) {
              pageContent["営業所・支店"] += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent["営業所・支店"] = pageContent["営業所・支店"].trim();
          } else if (string === "仕入先") {
            let j = 1;
            pageContent.仕入先 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "大株主" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.仕入先 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.仕入先 = pageContent.仕入先.trim();
          } else if (string === "販売先") {
            let j = 1;
            pageContent.販売先 = "";
            while (data.pages[i].content[index + j].str.trim() !== "業績" && index + j < data.pages[i].content.length) {
              pageContent.販売先 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.販売先 = pageContent.販売先.trim();
          } else if (string === "取引銀行") {
            let j = 1;
            pageContent.取引銀行 = "";
            while (
              !data.pages[i].content[index + j].str.trim().includes("20") &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.取引銀行 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.取引銀行 = pageContent.取引銀行.trim();
          } else if (string === "概況") {
            let j = 1;
            pageContent.概況 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "売上伸長率" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.概況 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.概況 = pageContent.概況.trim();
          } else if (string === "代表者") {
            let j = 1;
            pageContent.代表者 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "現住所" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.代表者 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.代表者 = pageContent.代表者.trim();
          } else if (string === "現住所") {
            let j = 1;
            pageContent.現住所 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "生年月日" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.現住所 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.現住所 = pageContent.現住所.trim();
          } else if (string === "生年月日") {
            let j = 1;
            pageContent.生年月日 = "";
            while (data.pages[i].content[index + j].str.trim() !== "干支" && index + j < data.pages[i].content.length) {
              pageContent.生年月日 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.生年月日 = pageContent.生年月日.trim();
          } else if (string === "干支") {
            let j = 1;
            pageContent.干支 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "出身地" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.干支 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.干支 = pageContent.干支.trim();
          } else if (string === "出身地") {
            let j = 1;
            pageContent.出身地 = "";
            while (
              data.pages[i].content[index + j].str.trim() !== "出身校" &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.出身地 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.出身地 = pageContent.出身地.trim();
          } else if (string === "出身校") {
            let j = 1;
            pageContent.出身校 = "";
            while (
              !data.pages[i].content[index + j].str.trim().includes("著作権者") &&
              index + j < data.pages[i].content.length
            ) {
              pageContent.出身校 += data.pages[i].content[index + j].str.trim() + " "; // Concatenate the values with a space
              j++;
            }
            pageContent.出身校 = pageContent.出身校.trim();
          }
        });
        labelMappings.push(pageContent); // Store text content of the current page in labelMappings array
      }
      console.log(labelMappings, "labelMappingssss");
      // Create a CSV writer
      const csvWriter = createObjectCsvWriter({
        path: `${pdfFileName}.csv`,
        header: Object.keys(labelMappings[0]).map((key) => ({ id: key, title: key })),
        encoding: "utf8", // Set the encoding to UTF-8 for proper display of Japanese characters
        append: false, // Set append to false to allow overwriting the CSV file
      });

      // Write the data to the CSV file
      csvWriter
        .writeRecords(labelMappings)
        .then(() => console.log("The CSV file was written successfully"))
        .catch((err) => console.error("Error writing CSV file:", err));
    })
    .catch((err) => console.log(err));
});
