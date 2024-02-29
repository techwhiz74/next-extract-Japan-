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

      // Define label configurations for extraction
      const labelConfigurations = [
        { label: "企業コード", nextLabel: "上場" },
        { label: "上場", nextLabel: "調査年月日" },
        { label: "商号（カナ）", nextLabel: "代表者カナ" },
        { label: "商号（漢字）", nextLabel: "代表者氏名" },
        { label: "調査年月日", nextLabel: "商号（カナ）" },
        { label: "代表者カナ", nextLabel: "商号（漢字）" },
        { label: "代表者氏名", nextLabel: "郵便番号" },
        { label: "郵便番号", nextLabel: "所在地" },
        { label: "所在地", nextLabel: "電話番号" },
        { label: "電話番号", nextLabel: "設立年月" },
        { label: "設立年月", nextLabel: "創業年月" },
        { label: "創業年月", nextLabel: "資本金" },
        { label: "資本金", nextLabel: "従業員数" },
        { label: "従業員数", nextLabel: "業種" },
        { label: "業種", nextLabel: "営業種目" },
        { label: "営業種目", nextLabel: "営業所・支店" },
        { label: "役員", nextLabel: "仕入先" },
        { label: "大株主", nextLabel: "販売先" },
        { label: "業績", nextLabel: "概況" },
        { label: "売上伸長率", nextLabel: "利益伸長率" },
        { label: "利益伸長率", nextLabel: "代表者" },
        { label: "営業所・支店", nextLabel: "役員" },
        { label: "仕入先", nextLabel: "大株主" },
        { label: "販売先", nextLabel: "業績" },
        { label: "取引銀行", nextLabel: "20" },
        { label: "概況", nextLabel: "売上伸長率" },
        { label: "代表者", nextLabel: "現住所" },
        { label: "現住所", nextLabel: "生年月日" },
        { label: "生年月日", nextLabel: "干支" },
        { label: "干支", nextLabel: "出身地" },
        { label: "出身地", nextLabel: "出身校" },
        { label: "出身校", nextLabel: "著作権者" },
      ];

      const labelMappings = []; // Array to store text content from each page

      interface PageContent {
				[key: string]: string;
			}

			// Loop through the data and extract the items and values based on label configurations
			for (let i = 0; i < data.pages.length; i++) {
				const pageContent: PageContent = {}; // Object to store extracted values

				for (const config of labelConfigurations) {
					const { label, nextLabel } = config;
					const labelIndex = data.pages[i].content.findIndex((item) => item.str.trim() === label);

					if (labelIndex !== -1) {
						let j = 1;
						let value = "";
						while (
							!data.pages[i].content[labelIndex + j]?.str.trim().includes(nextLabel) &&
							labelIndex + j < data.pages[i].content.length
						) {
							value += data.pages[i].content[labelIndex + j].str.trim() + " ";
							j++;
						}
						pageContent[label] = value.trim();
						if(label === "業績") {
							pageContent[label] = pageContent[label].replace(/取引銀行.*?(?=20)/, "");
						}
					}
				}

				labelMappings.push(pageContent); // Store extracted values for the current page
			}
			console.log(labelMappings, 'labelMappings');

      // Create a CSV writer
      const csvWriter = createObjectCsvWriter({
        path: `${pdfFileName}.csv`,
        header: Object.keys(labelMappings[0]).map((key) => ({ id: key, title: key })),
        encoding: "utf8",
        append: false,
      });

      // Write the data to the CSV file
      csvWriter
        .writeRecords(labelMappings)
        .then(() => console.log("The CSV file was written successfully"))
        .catch((err) => console.error("Error writing CSV file:", err));
    })
    .catch((err) => console.log(err));
});
