use dotenv::dotenv;
use lambda_http::{run, service_fn, Body, Error, Request, RequestPayloadExt, Response};
use reqwest::StatusCode;
use scraper::{ElementRef, Html, Selector};
use serde::Deserialize;
use serde_json::{self, json};
use std::env;
use std::time::{Duration, Instant};

// Ref. https://github.com/Sonic0/cdk-python-rust-lambda-tests/blob/62aa911f391fba944d7fe35ad4a8ba1de72693d5/cdk_lambda_rust/runtime/src/main.rs
#[derive(Deserialize, Debug)]
struct EventBody {
    secret_key: String,
    houjin_bangou: String,
}

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let start = Instant::now();

    // Get environment variables
    dotenv().ok();
    let secret_key = env::var("SECRET_KEY").unwrap_or("".to_string());

    let body: EventBody = match event.payload() {
        Ok(serialized_body) => serialized_body.unwrap_or(EventBody {
            houjin_bangou: "".to_string(),
            secret_key: "".to_string(),
        }),
        Err(err) => panic!("{}", err.to_string()),
    };
    println!("houjin bangou -> {}", body.houjin_bangou);

    // check secret key
    if secret_key != body.secret_key {
        return Ok(Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .body(Body::from("Unauthorized"))
            .unwrap());
    }

    // URLからHTMLを取得
    let url = format!("https://salesnow.jp/db/companies/{}", body.houjin_bangou);
    let html = reqwest::get(&url).await?.text().await?;
    // println!("html -> {:?}", html);

    // HTMLをパース
    let document = Html::parse_document(&html);

    // 「企業HP」テキストを持つpタグに対するセレクター
    let p_selector = Selector::parse("p").expect("セレクターの解析エラー");

    // 結果を保持する変数
    let mut prefecture = String::new();
    let mut address = String::new();
    let mut incorporated_at = String::new();
    let mut found_url = String::new();
    let mut houjin_bangou = String::new();
    let mut listing_status = String::new();
    let mut industry = String::new();
    let mut sub_industry = String::new();
    let mut capital = String::new();
    let mut revenue = String::new();
    let mut employee_number = String::new();

    // p要素を走査
    for p in document.select(&p_selector) {
        if p.inner_html().contains("都道府県") {
            // 次の兄弟要素を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素の中のaタグからテキストを取得
                    if let Some(a_tag) = element.select(&Selector::parse("a").unwrap()).next() {
                        prefecture = a_tag.inner_html();
                    }
                }
            }
        }

        if p.inner_html().contains("本社所在地") {
            // 次の兄弟要素を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素の中のaタグから本社所在地を取得
                    if let Some(a_tag) = element.select(&Selector::parse("a").unwrap()).next() {
                        address = a_tag.inner_html();
                    }
                }
            }
        }

        if p.inner_html().contains("設立年月日") {
            // 次の兄弟要素（次のpタグ）を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素（ここではpタグ）から設立年月日を取得
                    incorporated_at = element.text().collect::<Vec<_>>().concat();
                }
            }
        }

        if p.inner_html().contains("法人番号") {
            // 次の兄弟要素を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素の中のaタグから法人番号を取得
                    if let Some(a_tag) = element.select(&Selector::parse("a").unwrap()).next() {
                        houjin_bangou = a_tag.inner_html();
                    }
                }
            }
        }

        if p.inner_html().contains("上場区分") {
            // 次の兄弟要素（次のpタグ）を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素（ここではpタグ）から上場区分を取得
                    listing_status = element.text().collect::<Vec<_>>().concat();
                }
            }
        }

        if p.inner_html().contains("大業界") {
            // 次の兄弟要素（次のpタグ）を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素（ここではpタグ）から上場区分を取得
                    industry = element.text().collect::<Vec<_>>().concat();
                }
            }
        }

        if p.inner_html().contains("小業界") {
            // 次の兄弟要素（次のpタグ）を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素（ここではpタグ）から上場区分を取得
                    sub_industry = element.text().collect::<Vec<_>>().concat();
                }
            }
        }

        if p.inner_html().contains("資本金") {
            // 次の兄弟要素（次のpタグ）を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素（ここではpタグ）から上場区分を取得
                    capital = element.text().collect::<Vec<_>>().concat();
                }
            }
        }

        if p.inner_html().contains("売上") {
            // 次の兄弟要素（次のpタグ）を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素（ここではpタグ）から上場区分を取得
                    revenue = element.text().collect::<Vec<_>>().concat();
                }
            }
        }

        if p.inner_html().contains("企業HP") {
            // 次の兄弟要素（次のpタグ）を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次のpタグ内のaタグからURLを抽出
                    if let Some(a) = element.select(&Selector::parse("a").unwrap()).next() {
                        if let Some(url) = a.value().attr("href") {
                            found_url = url.to_string();
                        }
                    }
                }
            }
        }

        if p.inner_html().contains("従業員数") {
            // 次の兄弟要素（次のpタグ）を取得
            if let Some(next_sibling) = p.next_sibling() {
                if let Some(element) = ElementRef::wrap(next_sibling) {
                    // 次の要素（ここではpタグ）から上場区分を取得
                    employee_number = element.inner_html();
                }
            }
        }
    }
    let result = serde_json::json!({
        "prefecture": prefecture,
        "address": address,
        "incorporated_at": incorporated_at,
        "houjin_bangou": houjin_bangou,
        "listing_status": listing_status,
        "industry": industry,
        "sub_industry": sub_industry,
        "capital": capital,
        "revenue": revenue,
        "url": found_url,
        "employee_number": employee_number,
    })
    .to_string();
    println!("result -> {:?}", result);

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(Body::Text(result))
        .map_err(Box::new)?;

    let end = start.elapsed();
    println!(
        "{}.{:03}秒経過しました。",
        end.as_secs(),
        end.subsec_nanos() / 1_000_000,
    );
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        // disable printing the name of the module in every log line.
        .with_target(false)
        // disabling time is handy because CloudWatch will add the ingestion time.
        .without_time()
        .init();

    run(service_fn(function_handler)).await
}
