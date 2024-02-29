use dotenv::dotenv;
use lambda_http::{run, service_fn, Body, Error, Request, RequestPayloadExt, Response};
use once_cell::sync::Lazy;
use regex::{Regex, RegexBuilder};
use reqwest::StatusCode;
use serde::Deserialize;
use serde_json::{self, json};
use spider::tokio;
use spider::website::Website;
use std::collections::HashSet;
use std::env;
use std::time::{Duration, Instant};
use url::Url;

// Ref. https://github.com/Sonic0/cdk-python-rust-lambda-tests/blob/62aa911f391fba944d7fe35ad4a8ba1de72693d5/cdk_lambda_rust/runtime/src/main.rs
#[derive(Deserialize, Debug)]
struct EventBody {
    secret_key: String,
    url: String,
}

static RE_SHIFT_JIS: Lazy<Regex> = Lazy::new(|| {
    RegexBuilder::new(r#"<meta[^>]*?charset=["']?(shift_jis|sjis|x-sjis)["']?[^>]*?>"#)
        .case_insensitive(true)
        .build()
        .unwrap()
});

static RE_EUC_JP: Lazy<Regex> = Lazy::new(|| {
    RegexBuilder::new(r#"<meta[^>]*?charset=["']?euc-jp["']?[^>]*?>"#)
        .case_insensitive(true)
        .build()
        .unwrap()
});

fn is_shift_jis(html: &str) -> bool {
    RE_SHIFT_JIS.is_match(html)
}

fn is_euc_jp(html: &str) -> bool {
    RE_EUC_JP.is_match(html)
}

static EMAIL_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"[a-zA-Z0-9._%+-]+(★|☆|※|●|○|\[at\]|\(at\)|\{at\}|＠|@)(?:<[^>]+>)*[a-zA-Z0-9.-]+(?:<[^>]+>)*\.[a-zA-Z]{2,}").unwrap()
});

fn extract_emails(html: &str) -> Vec<String> {
    let exclude_domains = [
        "sample",
        "example",
        "group.calendar.google.com",
        "sentry-next.wixpress.com",
        "sentry.wixpress.com",
    ];

    let exclude_extensions = [
        ".png", ".gif", ".jpg", ".webp", ".jpeg", ".pdf", ".doc", ".docx",
    ];

    let emails: Vec<String> = EMAIL_REGEX
        .find_iter(html)
        .map(|m| replace_at_alternatives(m.as_str()))
        .filter(|email| {
            !exclude_domains.iter().any(|domain| email.contains(domain))
                && !exclude_extensions.iter().any(|ext| email.ends_with(ext))
        })
        .collect(); // Vec<String>への変換

    emails // すでにVec<String>なので再変換は不要
}

fn replace_at_alternatives(input: &str) -> String {
    let replacements = [
        ("★", "@"),
        ("☆", "@"),
        ("※", "@"),
        ("●", "@"),
        ("○", "@"),
        ("[at]", "@"),
        ("(at)", "@"),
        ("{at}", "@"),
        ("＠", "@"),
    ];

    let mut result = input.to_string();
    for (from, to) in &replacements {
        result = result.replace(from, to);
    }

    result
}

// <form> タグを検出するための正規表現を遅延初期化
// 検索を除外するために入力要素は二個以上
static FORM_REGEX: Lazy<Regex> = Lazy::new(|| {
    RegexBuilder::new(r#"<form\b[^>]*>.*?(<input\b[^>]*>|<select\b[^>]*>|<textarea\b[^>]*>).*?(<input\b[^>]*>|<select\b[^>]*>|<textarea\b[^>]*>).*?</form>"#)
        .case_insensitive(true)
        .dot_matches_new_line(true)
        .build()
        .unwrap()
});

fn contains_form_tag(html: &str) -> bool {
    FORM_REGEX.is_match(html)
}

fn strip_without_tags(text: &str) -> String {
    // CSSタグを削除
    let re = regex::Regex::new(r#"(?si)<style.*?>.*?</style>"#).unwrap(); // (?s)は改行を含む (?s)は大文字小文字無視
    let text = re.replace_all(text, "").into_owned();
    // sctriptタグを削除
    let re = regex::Regex::new(r#"(?si)<script.*?>.*?</script>"#).unwrap(); // (?s)は改行を含む (?s)は大文字小文字無視
    let text = re.replace_all(&text, "").into_owned();
    // { }タグを削除
    let re = regex::Regex::new(r#"\{[^\}]*\}"#).unwrap();
    let text = re.replace_all(&text, "").into_owned();
    // &nbsp;を半角スペースに置換
    let re = regex::Regex::new(r#"&nbsp;"#).unwrap();
    let text = re.replace_all(&text, " ").into_owned();
    // \n\tを半角スペースに置換
    let re = regex::Regex::new(r#"\n\t"#).unwrap();
    let text = re.replace_all(&text, " ").into_owned();
    // 全角スペースを半角スペースに置換
    let re = regex::Regex::new(r#"　"#).unwrap();
    let text = re.replace_all(&text, " ").into_owned();
    // 連続する複数の半角スペースを1つの半角スペースに置換
    let re = regex::Regex::new(r#"\s+"#).unwrap();
    let text = re.replace_all(&text, " ").into_owned();
    return text.trim().to_string();
}

fn strip(text: &str) -> String {
    let text = strip_without_tags(text);
    // < >タグを削除
    let re = regex::Regex::new(r#"<[^>]*>"#).unwrap();
    let text = re.replace_all(&text, "").into_owned();
    return text.trim().to_string();
}

fn urls_are_equal(url1: &str, url2: &str) -> bool {
    let normalized_url1 = normalize_url(url1);
    let normalized_url2 = normalize_url(url2);

    normalized_url1 == normalized_url2
}

fn normalize_url(raw_url: &str) -> String {
    let url = Url::parse(raw_url).expect("Failed to parse URL");

    // 末尾の/を取り除く
    let path = if url.path().ends_with('/') {
        url.path().trim_end_matches('/').to_string()
    } else {
        url.path().to_string()
    };

    // クエリ部分の取得
    let query = if let Some(q) = url.query() {
        format!("?{}", q)
    } else {
        "".to_string()
    };

    // ホスト名からwwwを取り除く
    let host = url.host_str().unwrap_or("").replace("www.", "");

    // httpまたはhttpsのスキームを除去して、残りの部分を文字列として返す
    format!("{}://{}{}{}", "ignored_scheme", host, path, query)
}

fn generate_both_urls(url: &str) -> (String, String) {
    let url_with_www = if !url.starts_with("http://www.") && !url.starts_with("https://www.") {
        if url.starts_with("http://") {
            url.replacen("http://", "http://www.", 1)
        } else {
            url.replacen("https://", "https://www.", 1)
        }
    } else {
        url.to_string()
    };

    let url_without_www = if url.starts_with("http://www.") || url.starts_with("https://www.") {
        url.replacen("www.", "", 1)
    } else {
        url.to_string()
    };

    (url_with_www, url_without_www)
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
            url: "".to_string(),
            secret_key: "".to_string(),
        }),
        Err(err) => panic!("{}", err.to_string()),
    };
    println!("url -> {}", body.url);

    // check secret key
    if secret_key != body.secret_key {
        return Ok(Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .body(Body::from("Unauthorized"))
            .unwrap());
    }

    //let url = "https://hiroden-inc.com";
    // let url = "https://hoken.kakaku.com/health_check/blood_pressure/";
    // let url = "https://shpn.me";

    // 通常メールテスト: https://hiroden-inc.com
    // タグ入りメールテスト: https://kesennuma-pg.or.jp/
    // メアド偽装メールテスト: https://kyouseicc.com/
    // フォームテスト: https://samejima.site/
    // wwwありなしテスト: https://www.parame.co.jp/
    let (url_with_www, url_without_www) = generate_both_urls(&body.url);
    let urls = [url_with_www, url_without_www];
    println!("urls: {:?}", urls);
    let mut extracted_emails: Vec<String> = Vec::new(); // 1. emailの配列を保存するためのVector
    let mut contact_form_url: Option<String> = None; // 2. 最初のフォームURLを保存するための変数
    let mut title = "".to_string();
    let mut meta_description = "".to_string();

    for url in urls.iter() {
        let mut website: Website = Website::new(&url);
        website
            .with_subdomains(true)
            .with_budget(Some(spider::hashbrown::HashMap::from([("*", 100)])));

        website.scrape().await;

        for page in website.get_pages().unwrap().iter() {
            // HTMLの取得
            let mut html = page.get_html();
            if is_shift_jis(&html) || is_euc_jp(&html) {
                let bytes = match page.get_bytes() {
                    Some(bytes) => bytes,
                    None => {
                        // エラー処理。エラーメッセージを表示するなど
                        println!(
                            "Error: Bytes not found for this page. {}",
                            page.get_url_final()
                        );
                        continue;
                    }
                };
                if is_shift_jis(&html) {
                    let (res, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
                    html = res.into_owned();
                } else if is_euc_jp(&html) {
                    let (res, _, _) = encoding_rs::EUC_JP.decode(&bytes);
                    html = res.into_owned();
                }
            }

            // 引数のURLの場合は、title meta descriptionの取得
            if urls_are_equal(page.get_url_final(), &body.url) {
                let stripped_html: String = strip_without_tags(&html);
                let document = scraper::Html::parse_document(&stripped_html);

                let title_element = document
                    .select(&scraper::Selector::parse("title").unwrap())
                    .next();
                title = match title_element {
                    Some(s) => s.inner_html(),
                    None => "".to_string(),
                };
                let meta_description_element = document
                    .select(&scraper::Selector::parse("meta[name='description']").unwrap())
                    .next();
                meta_description = match meta_description_element {
                    Some(s) => s.value().attr("content").unwrap_or_default().to_string(),
                    None => "".to_string(),
                };

                println!("title: {:?}", title);
                println!("meta_description: {:?}", meta_description);
            }

            // メールアドレスの読み取り
            // shiokaze@<br class="br-pc" />kesennuma-pg.or.jpのようなケースやタグ内にメールアドレスが存在するケースがある
            // タグを許容してメールアドレスを取得して後からタグを削除する
            let emails = extract_emails(&html);
            for email in emails {
                println!("email {}", strip(&email).to_string());
                extracted_emails.push(strip(&email).to_string());
            }

            // 登録フォームがあるかどうかの判定
            // https://samejima.site/recruit_detail.php?id=2 や
            // https://samejima.site/recruit_detail.php?id=9 のような例があるので、
            // 最初に引っかかったものだけを残す
            if contains_form_tag(&html) && contact_form_url.is_none() {
                println!("The HTML contains a <form> tag.");
                println!("url {}", page.get_url_final());
                contact_form_url = Some(page.get_url_final().to_string());
            }

            println!("crawl url {}", page.get_url_final());
            //println!("crawl html {}", html);
        }
    }

    // 重複を削除
    let extracted_emails: Vec<String> = extracted_emails
        .into_iter()
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let result = json!({
        "emails": extracted_emails,
        "contact_form_url": contact_form_url,
        "title": title,
        "meta_description": meta_description,
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
