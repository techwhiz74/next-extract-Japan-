"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var pdf_js_extract_1 = require("pdf.js-extract");
var csv_writer_1 = require("csv-writer");
var pdfExtract = new pdf_js_extract_1.PDFExtract();
var options = {};
var directoryPath = "../shoukou-research"; // Update with the path to your directory
fs.readdir(directoryPath, function (err, files) {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }
    // Find the first PDF file in the directory
    var pdfFile = files.find(function (file) { return file.toLowerCase().endsWith(".pdf"); });
    if (!pdfFile) {
        console.log("No PDF files found in the directory.");
        return;
    }
    var pdfFilePath = path.join(directoryPath, pdfFile);
    var pdfFileName = path.parse(pdfFilePath).name; // Extract the base name of the PDF file without the extension
    pdfExtract
        .extract(pdfFilePath, options)
        .then(function (data) {
        var _a;
        // Define label configurations for extraction
        var labelConfigurations = [
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
        var labelMappings = []; // Array to store text content from each page
        // Loop through the data and extract the items and values based on label configurations
        for (var i = 0; i < data.pages.length; i++) {
            var pageContent = {}; // Object to store extracted values
            var _loop_1 = function (config) {
                var label = config.label, nextLabel = config.nextLabel;
                var labelIndex = data.pages[i].content.findIndex(function (item) { return item.str.trim() === label; });
                if (labelIndex !== -1) {
                    var j = 1;
                    var value = "";
                    while (!((_a = data.pages[i].content[labelIndex + j]) === null || _a === void 0 ? void 0 : _a.str.trim().includes(nextLabel)) &&
                        labelIndex + j < data.pages[i].content.length) {
                        value += data.pages[i].content[labelIndex + j].str.trim() + " ";
                        j++;
                    }
                    pageContent[label] = value.trim();
                    if (label === "業績") {
                        pageContent[label] = pageContent[label].replace(/取引銀行.*?(?=20)/, "");
                    }
                }
            };
            for (var _i = 0, labelConfigurations_1 = labelConfigurations; _i < labelConfigurations_1.length; _i++) {
                var config = labelConfigurations_1[_i];
                _loop_1(config);
            }
            labelMappings.push(pageContent); // Store extracted values for the current page
        }
        console.log(labelMappings, 'labelMappings');
        // Create a CSV writer
        var csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: "".concat(pdfFileName, ".csv"),
            header: Object.keys(labelMappings[0]).map(function (key) { return ({ id: key, title: key }); }),
            encoding: "utf8",
            append: false,
        });
        // Write the data to the CSV file
        csvWriter
            .writeRecords(labelMappings)
            .then(function () { return console.log("The CSV file was written successfully"); })
            .catch(function (err) { return console.error("Error writing CSV file:", err); });
    })
        .catch(function (err) { return console.log(err); });
});
