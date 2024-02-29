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
    let url = format!("https://houjin.jp/c/{}", body.houjin_bangou);
    let html = reqwest::get(&url).await?.text().await?;
    // println!("html -> {:?}", html);

    // HTMLをパース
    let document = Html::parse_document(&html);

    // URLを保持する変数
    let mut houjin_bangou = String::new();
    let mut url = String::new();
    let mut tel = String::new();
    let mut incorporated_at = String::new();
    let mut industry = String::new();

    // `th` と `td` タグのためのセレクタを作成
    let th_selector = Selector::parse("th").unwrap();

    // `th` タグを反復処理
    for th in document.select(&th_selector) {
        if th.text().collect::<Vec<_>>().contains(&"法人番号") {
            // 「法人番号」の次のノードを取得
            if let Some(next_sibling) = th.next_sibling() {
                // 次のノードを `ElementRef` に変換
                if let Some(td_element) = ElementRef::wrap(next_sibling) {
                    // 次のノードが `td` タグかどうかを確認
                    if td_element.value().name() == "td" {
                        houjin_bangou = td_element.text().collect::<Vec<_>>().concat();
                    }
                }
            }
        }

        if th.text().collect::<Vec<_>>().contains(&"URL") {
            // 「URL」の次のノードを取得
            if let Some(next_sibling) = th.next_sibling() {
                // 次のノードを `ElementRef` に変換
                if let Some(td_element) = ElementRef::wrap(next_sibling) {
                    // 次のノードが `td` タグかどうかを確認
                    if td_element.value().name() == "td" {
                        // `a` タグを探し、`href` 属性を取得
                        if let Some(a_tag) =
                            td_element.select(&Selector::parse("a").unwrap()).next()
                        {
                            if let Some(href) = a_tag.value().attr("href") {
                                url = href.to_string();
                            }
                        }
                    }
                }
            }
        }

        if th.text().collect::<Vec<_>>().contains(&"電話番号") {
            // 「法人番号」の次のノードを取得
            if let Some(next_sibling) = th.next_sibling() {
                // 次のノードを `ElementRef` に変換
                if let Some(td_element) = ElementRef::wrap(next_sibling) {
                    // 次のノードが `td` タグかどうかを確認
                    if td_element.value().name() == "td" {
                        tel = td_element.text().collect::<Vec<_>>().concat();
                    }
                }
            }
        }

        if th.text().collect::<Vec<_>>().contains(&"設立") {
            // 「法人番号」の次のノードを取得
            if let Some(next_sibling) = th.next_sibling() {
                // 次のノードを `ElementRef` に変換
                if let Some(td_element) = ElementRef::wrap(next_sibling) {
                    // 次のノードが `td` タグかどうかを確認
                    if td_element.value().name() == "td" {
                        let original_date = td_element.text().collect::<Vec<_>>().concat(); // 例: "2015年11月"

                        // "年", "月", "日" をそれぞれ "-" または空文字列に置換
                        let formatted_date = original_date
                            .replace("年", "-")
                            .replace("月", "-")
                            .replace("日", "");

                        // splitの結果を一時変数に格納
                        let split_date = formatted_date.split('-').collect::<Vec<_>>();

                        // 空の要素を除去し、必要に応じてデフォルト値 "01" を追加
                        let mut date_parts: Vec<_> = split_date
                            .into_iter()
                            .filter(|&part| !part.is_empty())
                            .collect();

                        if date_parts.len() == 1 {
                            date_parts.push("01");
                            date_parts.push("01");
                        } else if date_parts.len() == 2 {
                            date_parts.push("01");
                        }

                        // 組み立てられた日付
                        incorporated_at = date_parts.join("-");
                    }
                }
            }
        }

        if th.text().collect::<Vec<_>>().contains(&"業種") {
            // 「業種」の次のノードを取得
            if let Some(next_sibling) = th.next_sibling() {
                // 次のノードを `ElementRef` に変換
                if let Some(td_element) = ElementRef::wrap(next_sibling) {
                    // 次のノードが `td` タグかどうかを確認
                    if td_element.value().name() == "td" {
                        industry = td_element.text().collect::<Vec<_>>().join(" ");
                    }
                }
            }
        }
    }

    let result = json!({
        "houjin_bangou": houjin_bangou,
        "url": url,
        "tel": tel,
        "incorporated_at": incorporated_at,
        "industry": industry,
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
