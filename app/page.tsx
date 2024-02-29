"use client";
import Script from "next/script";
import React, { Fragment, useEffect } from "react";
import Link from "next/link";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const navigations = [
  { name: "選ばれる理由", href: "#reason" },
  { name: "M&Aの流れ", href: "#flow" },
  { name: "料金体系", href: "#price" },
  { name: "よくある質問", href: "#faq" },
];

const steps = [
  { id: "01", name: "打ち合わせ" },
  { id: "02", name: "リサーチ" },
  { id: "03", name: "Ｍ＆Ａ仲介業務委託契約" },
  { id: "04", name: "譲受候補会社へ提案" },
  { id: "05", name: "条件調整" },
  { id: "06", name: "基本合意" },
  { id: "07", name: "譲渡契約" },
  { id: "08", name: "クロージング" },
  { id: "09", name: "事後フォロー" },
];

const sections = [
  {
    name: "取引金額に応じた報酬料率",
    features: [
      { name: "取引金額が5億円までの部分", tiers: "5%" },
      { name: "取引金額が5億円を超え10億円までの部分", tiers: "4%" },
      { name: "取引金額が10億円を超え50億円までの部分", tiers: "3%" },
      { name: "取引金額が50億円を超え100億円までの部分", tiers: "2%" },
      { name: "取引金額が100億円を超える部分", tiers: "1%" },
    ],
  },
  {
    name: "取引金額が13億円の場合の計算例",
    features: [
      { name: "① 5億円（～5億円部分）× 5% =", tiers: "2,500万円" },
      { name: "② 5億円（5億円～10億円部分）× 4% =", tiers: "2,000万円" },
      { name: "③ 3億円（10億円～13億円部分）× 3% =", tiers: "900万円" },
      { name: "上記①～③の合計", tiers: "5,400万円" },
    ],
  },
];

const faqs = [
  {
    question: <>Q.M&amp;Aで譲渡が決まった場合、社長は事業に関与し続けるのですか？</>,
    answer: <>A.そのようなケースもありますが、退任する場合もあります。社長の意向によります。</>,
  },
  {
    question: <>Q.M&amp;Aの仲介会社を選ぶ時の注意点は何ですか？</>,
    answer: (
      <>
        A.M&amp;Aの仲介会社を選ぶ際には、以下の観点が重要です。
        <ul className="my-2 pl-4 list-disc">
          <li className="pl-2 indent-0">信頼性：会社が信頼できるかどうかを確認してください。</li>
          <li className="pl-2 indent-0">経験と実績：過去に類似の実績があるかを確認してください。</li>
          <li className="pl-2 indent-0">
            サポート：会社が親身になって相談に応じ、貴社の状況を理解してくれるかを確認してください。
          </li>
          <li className="pl-2 indent-0">
            手数料の形態：初期費用が安く、成功報酬型で課金する体系になっているかを確認してください。
          </li>
        </ul>
        また、以下のM&amp;A仲介に関する実行力も重要です。
        <ul className="my-2 pl-4 list-disc">
          <li className="pl-2 indent-0">適切な譲渡先・譲受先候補を見つける能力</li>
          <li className="pl-2 indent-0">交渉プロセスを円滑に進める能力</li>
          <li className="pl-2 indent-0">フェアな譲渡契約を締結する能力</li>
        </ul>
        M&amp;A業界では経験豊富な実務者がまだ不足していますので、選択は慎重に行ってください。
      </>
    ),
  },
  {
    question: <>Q.平日昼間は難しいのですが、土日や夜間でも相談は可能ですか？</>,
    answer: (
      <>
        A.はい、当社では土日や夜間の相談も歓迎しております。
        <br />
        経営者の方が実務に専念できるよう、また秘密保持の観点からも、平日の夜や土日などの休日に相談を行うことを推奨しています。
        <br />
        場所についても、会議室やご自宅など、秘密が保たれる場所での相談が可能です。
        <br />
        M&amp;Aの過程においても秘密保持に最大限の注意を払います。なお、情報漏えいを過度に心配するとM&amp;Aの進行が困難になることもありますので、秘密保持に関する適切な対応については当社からも適宜ご提案させていただきます。
      </>
    ),
  },
  {
    question: <>Q.最近のM&amp;Aはどの業界で多く見られますか？また、人気のある業種や業界は何ですか？</>,
    answer: (
      <>
        A.最近のM&amp;A案件は、調剤薬局、IT・ソフトウェア、物流、不動産（ビルメンテナンス、不動産管理）、建設（電気工事、設備工事）、医療・介護業界などが特に多くなっています。
        <br />
        これらの業種は譲受企業様が多く、相手を見つけやすい傾向にあります。
        <br />
        しかし、人気業種でなくてもM&amp;Aは十分可能で、異業種や遠方の企業とのシナジーが見込めると、M&amp;Aが成立いたします。
      </>
    ),
  },
  {
    question: <>Q.シェアモルM&amp;AにM&amp;Aを依頼した場合、どのように進行しますか？</>,
    answer: (
      <>
        A.当社では、M&amp;Aの業務フローを独自にノウハウ化しており、弊社のフローに従ってM&amp;Aを進行します。
        <br />
        上記により、M&amp;Aが成功する可能性が高まります。 詳細は「
        <Link href="/#flow" className="text-indigo-800 hover:text-rose-800 hover:underline">
          M&amp;Aの流れ
        </Link>
        」をご覧ください。
      </>
    ),
  },
  {
    question: <>Q.近年の中小企業のM&amp;Aトレンドはどのような傾向がありますか？</>,
    answer: (
      <>
        A.近年の中小企業のM&amp;Aでは、事業承継問題だけでなく、成長戦略や業界再編などの理由で譲渡を検討する会社が増えています。
        <br />
        これにより、譲渡企業のオーナーの年齢層が広がり、若い年齢層のオーナーが自社の成長を目指しながらもM&amp;Aを検討する傾向が見られます。
      </>
    ),
  },
  {
    question: <>Q.会社売買において仲介者・アドバイザーが必要な理由は何ですか？</>,
    answer: (
      <>
        A.会社売買の際に仲介者・アドバイザーが必要な理由は主に以下の3つです。
        <ul className="my-2 pl-4 list-disc">
          <li className="pl-2 indent-0">
            M&amp;Aの相手の発掘:
            適切なM&amp;Aパートナーの探索は仲介者のノウハウとネットワークを活用することで効率的に進められます。
          </li>
          <li className="pl-2 indent-0">
            円滑なコミュニケーション:
            仲介者は売り手と買い手の間に立ち、異なる人生観や価値観を持つ両者の間のコミュニケーションを円滑に進めます。
            特に競合の企業間での交渉は、元々ライバル関係にあったことから、感情的な議論に発展し、お互いにメリットがあるディールであったにも関わらず、
            交渉が決裂することも決して稀ではございません。社員への発表のタイミングや方法なども適切にアドバイスします。
          </li>
          <li className="pl-2 indent-0">
            適切な取り決め:
            M&amp;Aでは多岐にわたる取り決めが必要となり、その一つ一つについて公平に決めることは困難です。経験豊富な仲介者が間に入ることで、双方が納得する形で取り決めを進めることが可能となります。これにより後々のトラブルを予防し、リスク管理も行えます。
          </li>
        </ul>
      </>
    ),
  },
  {
    question: <>Q.売られる会社は"赤字"や"債務超過"の会社なのでしょうか？</>,
    answer: (
      <>
        A.実際には、当社への会社譲渡の相談を受ける企業のほとんどは実質的に黒字で、財務状況も良好な企業が多いです。したがって、売られる会社が必ずしも"赤字"や"債務超過"の会社であるわけではありません。
      </>
    ),
  },
  {
    question: <>Q.一般的に譲渡を検討する経営者の年代はどのくらいですか？</>,
    answer: (
      <>
        A.後継者がいないため事業承継を検討する場合、50～60代の経営者が中心となります。しかし成長戦略の一環など、事業承継とは別の理由から、最近では30～40代の経営者からの相談も増えています。
      </>
    ),
  },
  {
    question: <>Q.M&amp;Aの手法にはどのようなものがありますか？</>,
    answer: (
      <>
        A.M&amp;Aの手法には、「株式譲渡」「事業譲渡」「第三者割当増資」「会社分割」「合併」「株式交換」の6つが主にあります。最も一般的な方法は株式譲渡ですが、双方のニーズに応じて最適な方法を提案・サポートします。
      </>
    ),
  },
  {
    question: <>Q.会社を高く売るために事前に準備しておくべきことは何ですか？</>,
    answer: (
      <>
        A.M&amp;Aで会社を高額で売却するためには一番重要なことは、譲渡先の候補会社を複数持っていることです。
        <br />
        そのためには貴社の企業価値を高め、多くの会社に貴社の企業価値を感じてもらえるようにしていくことが最も重要です。
        <br />
        M&amp;Aのための準備は全く必要ございません。普段と変わらず日頃の企業活動に全力投球いただけましたら幸いです。
        <br />
        交渉中に経営数字が悪化すると、譲渡価格がディスカウントされる要因になり得ます。交渉中も経営に集中していただけますよう、弊社一同全力でサポートさせていただきます。
      </>
    ),
  },
  {
    question: <>Q.譲渡後の業績伸長に応じてインセンティブを得るようなM&amp;Aは可能ですか？</>,
    answer: (
      <>
        A.はい、将来的にインセンティブを得られるM&amp;Aは可能です。
        <br />
        二段階譲渡やアーンアウト条項などの手段があります。これらは、譲渡後も引き続き経営に参加し、譲渡後の業績に応じて追加の報酬を得られるようにするものです。
        <br />
        この方法は、創業オーナーのモチベーションを維持し、買い手企業が売り手企業のポテンシャルを最大限に引き出すのに有効です。
      </>
    ),
  },
];

const footerNavigation = [
  { name: "会社概要", href: "https://shpn.me/" },
  { name: "プライバシーポリシー", href: "https://shpn.me/privacy" },
  { name: "SEOに強いAIライティングツールならトランスコープ", href: "https://transcope.io/" },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  useEffect(() => {
    // Facebook Pixel
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init("2451598281689113"); // facebookPixelId
        ReactPixel.track("PageView");
      });
  });

  return (
    <div className="bg-white font-serif text-gray-900">
      <header className="sticky inset-x-0 top-0 z-50 bg-white shadow">
        <nav className="flex items-center justify-between p-3 lg:px-8" aria-label="Global">
          <div className="flex items-center lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 hover:opacity-70">
              <span className="sr-only">シェアモルM&amp;A</span>
              <img
                className="h-7 md:h-10 w-auto"
                src="https://s3.ap-northeast-1.wasabisys.com/sharemall-ma/logo/logo-sharemall-ma-black.png"
                alt="シェアモルM&A logo"
              />
            </Link>
            <div className="hidden space-x-2 md:ml-6 xl:flex">
              {navigations.map((navigation) => (
                <Link
                  key={navigation.name}
                  href={navigation.href}
                  className="text-gray-900 font-semibold text-sm px-2.5 py-2 hover:text-indigo-800"
                >
                  {navigation.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:flex lg:gap-x-12">
            <Link
              href="#contact"
              className="rounded-md bg-indigo-800 px-3.5 py-2.5 text-sm font-semibold text-white sm:text-base max-md:active:bg-rose-800 md:hover:shadow-lg md:hover:bg-rose-800 md:hover:-translate-y-0.5"
            >
              無料で相談する
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative isolate px-4 lg:px-6">
        <img
          src="https://s3.ap-northeast-1.wasabisys.com/sharemall-ma/assets/img-sharemall-ma-top.webp"
          alt="シェアモルM&A"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="mx-auto max-w-5xl py-32 sm:py-48 text-white">
          <div className="text-sm mb-8 flex justify-center sm:text-xl">AIを利用したM&amp;A・事業承継仲介サービス</div>
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-7xl">シェアモルM&amp;A</h1>
            <p className="text-base mt-6 leading-8 sm:text-2xl">売り手ファーストの支援を実現</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="#contact"
                className="rounded-md bg-indigo-800 px-3.5 py-2.5 text-lg font-semibold text-white md:hover:shadow-lg max-md:active:bg-rose-800 md:hover:bg-rose-800 md:hover:-translate-y-0.5"
              >
                無料で相談する
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div id="reason" className="relative bg-gray-50 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <div>
            <h2 className="text-gray-900 sm:text-4xl mt-2 text-3xl font-bold tracking-tight">
              シェアモルM&amp;Aが
              <br className="block md:hidden" />
              選ばれる4つの理由
            </h2>
          </div>
          <div className="relative mt-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative text-left">
              <h4 className="flex items-center">
                <span className="flex-shrink-0 w-10 h-10 flex justify-center items-center bg-indigo-800 text-white rounded-full mr-2">
                  01
                </span>
                <span className="text-xl font-bold tracking-tighter text-gray-900 sm:text-2xl">完全成果報酬型</span>
              </h4>
              <p className="mt-4 text-gray-700 sm:text-base">
                成約までは一切の費用が発生しない、
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  着手金・中間金一切不要の完全成果報酬型
                </strong>
                です。
              </p>
              <p className="mt-4 text-gray-700 sm:text-base">
                売り主様だけでなく、買い主様に関しましても、
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  意向表明時の中間金は一切発生いたしません。
                </strong>
              </p>
              <p className="mt-4 text-gray-700 sm:text-base">
                また負債を含んだ移動総資産ベースではなく、
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  負債を含まない譲渡価格ベースでの報酬算定
                </strong>
                を行っております。
              </p>
            </div>
            <div className="relative mt-10 lg:mt-0">
              <img
                className="relative w-full aspect-w-4 aspect-h-3 max-w-xl mx-auto rounded-lg shadow-lg object-cover"
                src="https://s3.ap-northeast-1.wasabisys.com/sharemall-ma/assets/img-feature-1.webp"
                alt="完全成果報酬型"
              />
            </div>
          </div>
          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative text-left">
              <h4 className="flex items-center">
                <span className="flex-shrink-0 w-10 h-10 flex justify-center items-center bg-indigo-800 text-white rounded-full mr-2">
                  02
                </span>
                <span className="text-xl font-bold tracking-tighter text-gray-900 sm:text-2xl">
                  売り手ファーストの支援
                </span>
              </h4>
              <p className="mt-4 text-gray-700 sm:text-base">
                買い手ではなく
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  売り手ファーストの支援
                </strong>
                を行っており、金額面だけでなく、 引き継ぎ面など、売り手様のご意向に最大限配慮した提案が可能です。
              </p>
              <p className="mt-4 text-gray-700 sm:text-base">
                また譲渡価格の相場として、純資産＋営業利益3年分の相場を提示されていらっしゃる
                M&amp;A仲介会社様が多いですが、弊社では上記の相場にこだわっておりません。
                お客様のビジネスモデルに基づき、
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  売上や利益の蓋然性や伸び率を考慮した譲渡価格の交渉
                </strong>
                が可能です。
              </p>
              <p className="mt-4 text-gray-700 sm:text-base">
                たとえば、過去に弊社が仲介させていただきましたSaaS会社様では、
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  純資産＋営業利益の58年分の譲渡価格
                </strong>
                でクロージングしております。
              </p>
            </div>
            <div className="relative mt-10 lg:mt-0">
              <img
                className="relative w-full aspect-w-4 aspect-h-3 max-w-xl mx-auto rounded-lg shadow-lg object-cover"
                src="https://s3.ap-northeast-1.wasabisys.com/sharemall-ma/assets/img-feature-2.webp"
                alt="売り手ファーストの支援"
              />
            </div>
          </div>
          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative text-left">
              <h4 className="flex items-center">
                <span className="flex-shrink-0 w-10 h-10 flex justify-center items-center bg-indigo-800 text-white rounded-full mr-2">
                  03
                </span>
                <span className="text-xl font-bold tracking-tighter text-gray-900 sm:text-2xl">
                  豊富な経験と知識によるサポート体制
                </span>
              </h4>
              <p className="mt-4 text-gray-700 sm:text-base">
                担当者全員が
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  実際にM&Aで株式譲渡した経験
                </strong>
                を有しており、契約上の落とし穴など、M&amp;Aの実務を熟知しております。
              </p>
              <p className="mt-4 text-gray-700 sm:text-base">
                M&amp;Aマッチングサイトなどを利用して、ネット上で交渉を進めることも可能ですが、
                高額な案件であればあるほど、M&amp;Aマッチングサイトなど
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  インターネット上だけのやり取りでは成約しないのが実情
                </strong>
                です。
              </p>
              <p className="mt-4 text-gray-700 sm:text-base">
                また、例えば同業種間のM&amp;Aの場合、元々の競合関係があるため、感情的な議論になりやすく、
                M&amp;A仲介が入ることにより感情的な議論を避け、
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  買い手様売り手様双方にとって建設的な議論ができるようサポート
                </strong>
                させていただきます。
              </p>
            </div>
            <div className="relative mt-10 lg:mt-0">
              <img
                className="relative w-full aspect-w-4 aspect-h-3 max-w-xl mx-auto rounded-lg shadow-lg object-cover"
                src="https://s3.ap-northeast-1.wasabisys.com/sharemall-ma/assets/img-feature-3.webp"
                alt="豊富な経験と知識"
              />
            </div>
          </div>
          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative text-left">
              <h4 className="flex items-center">
                <span className="flex-shrink-0 w-10 h-10 flex justify-center items-center bg-indigo-800 text-white rounded-full mr-2">
                  04
                </span>
                <span className="text-xl font-bold tracking-tighter text-gray-900 sm:text-2xl">
                  クローズドで丁寧な進行
                </span>
              </h4>
              <p className="mt-4 text-gray-700 sm:text-base">
                案件がインターネットで公開されることなく、
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  非公開でM&Aを進行
                </strong>
                することができます。
              </p>
              <p className="mt-4 text-gray-700 sm:text-base">
                M&amp;Aマッチングサイトなどの場合、インターネット上に匿名情報とはいえ詳細な案件情報が公開されます。
                上記情報を拝見すれば、売り手様の具体的社名・事業が高確率で推定できるのが実情です。
              </p>
              <p className="mt-4 text-gray-700 sm:text-base">
                M&amp;Aはその性質上、水面下で進められたいことも多く、弊社では、
                売り手様が特定可能な情報で、無断で営業活動を行うことは一切ございません。
                <strong className="font-bold bg-gradient-to-t from-yellow-300 via-transparent to-transparent">
                  売り手様のご意向にあわせた丁寧なコミュニケーション
                </strong>
                を心がけております。
              </p>
            </div>
            <div className="relative mt-10 lg:mt-0">
              <img
                className="relative w-full aspect-w-4 aspect-h-3 max-w-xl mx-auto rounded-lg shadow-lg object-cover"
                src="https://s3.ap-northeast-1.wasabisys.com/sharemall-ma/assets/img-feature-4.webp"
                alt="クローズドで進行可能"
              />
            </div>
          </div>
        </div>
      </div>

      <div id="flow" className="relative bg-white py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <h2 className="text-gray-900 sm:text-4xl mt-2 text-3xl font-bold tracking-tight">M&amp;Aの流れ</h2>
        </div>
        <div className="mt-12">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Progress">
            <ol
              role="list"
              className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200"
            >
              {steps.map((step, stepIdx) => (
                <li
                  key={step.id}
                  className="relative overflow-hidden bg-white lg:border-b lg:border-t lg:border-gray-200 lg:flex-1"
                >
                  <div
                    className={classNames(
                      stepIdx === 0 ? "rounded-t-md border-b-0" : "",
                      stepIdx === steps.length - 1 ? "rounded-b-md border-b" : "",
                      "overflow-hidden border-t border-r border-l border-gray-200 lg:border-0"
                    )}
                  >
                    <div className="group">
                      <div
                        className={classNames(
                          stepIdx !== 0 && "lg:pl-9",
                          "flex items-center p-4 text-lg font-medium lg:flex-col lg:justify-center lg:px-6 lg:py-5"
                        )}
                      >
                        <div className="flex-shrink-0">
                          <div className="flex flex-col h-12 w-12 items-center justify-center rounded-full bg-indigo-800">
                            <p className="text-white text-xs">STEP</p>
                            <span className="text-white leading-3">{step.id}</span>
                          </div>
                        </div>
                        <div className="max-lg:ml-4 flex min-w-0 flex-col lg:mt-4 lg:mr-1">
                          <span
                            className="hidden text-lg font-medium text-gray-700 lg:block"
                            style={{ writingMode: "vertical-lr" }}
                          >
                            {step.name}
                          </span>
                          <span className="block text-base font-medium text-gray-700 lg:hidden">{step.name}</span>
                        </div>
                      </div>
                    </div>

                    {stepIdx !== 0 ? (
                      <>
                        {/* Separator */}
                        <div className="hidden absolute inset-0 top-0 left-0 w-3 lg:block" aria-hidden="true">
                          <svg
                            className="h-full w-full text-gray-300"
                            viewBox="0 0 12 82"
                            fill="none"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M0.5 0V31L10.5 41L0.5 51V82"
                              stroke="currentcolor"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        </div>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <div id="price" className="relative bg-gray-50 py-16 lg:py-28">
        <div className="relative">
          <div className="mx-auto max-w-md px-3 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
            <h2 className="text-gray-900 sm:text-4xl mt-2 text-3xl font-bold tracking-tight">料金体系</h2>
            <p className="mx-auto mt-5 max-w-6xl text-base text-gray-700 tracking-tighter sm:text-xl">
              シェアモルM&amp;Aは着手金・中間金一切不要の
              <br className="block md:hidden" />
              完全成果報酬型です。
              <br />
              成果報酬は負債額を加えない譲渡価格をベースに、
              <br className="block md:hidden" />
              以下のレーマン方式で計算します。
              <br />
              最低成果報酬は1,000万円となります。
            </p>
          </div>
          <div className="mt-12 mx-auto max-w-md px-4 text-center sm:max-w-3xl lg:px-8">
            <div className="relative bg-white border border-indigo-900 rounded p-2 md:p-6">
              <table className="min-w-full divide-y divide-gray-300">
                <tbody className="divide-y divide-gray-200">
                  {sections.map((section, sectionIdx) => (
                    <Fragment key={section.name}>
                      <tr>
                        <th
                          scope="colgroup"
                          colSpan={4}
                          className={classNames(
                            sectionIdx === 0 ? "pt-2 md:pt-0" : "pt-6 md:pt-10",
                            "pb-4 text-left text-sm font-bold leading-6 text-gray-900 md:text-lg"
                          )}
                        >
                          {section.name}
                          <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/10" />
                        </th>
                      </tr>
                      {section.features.map((feature) => (
                        <tr key={feature.name}>
                          <th
                            scope="row"
                            className="px-1 py-4 text-left text-xs tracking-tight font-normal leading-6 text-gray-900 md:px-4 md:text-base"
                          >
                            {feature.name}
                            <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/5" />
                          </th>
                          <td className="px-1 py-4 md:px-8">
                            <div className="text-right text-xs tracking-tight leading-6 text-gray-900 md:text-base">
                              {feature.tiers}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div id="adviser" className="relative bg-white py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <h2 className="text-gray-900 sm:text-4xl mt-2 text-3xl font-bold tracking-tight">M&amp;Aアドバイザー紹介</h2>
          <p className="mx-auto mt-5 max-w-6xl text-base text-gray-700 tracking-tighter sm:text-xl">
            他にも経験豊富な多数のアドバイザーが
            <br className="block md:hidden" />
            支援させていただきます。
          </p>
        </div>

        <div className="mt-12 mx-auto max-w-md px-4 text-left sm:max-w-3xl lg:px-8">
          <div className="bg-white border border-gray-200 rounded-md p-4 gap-6 sm:p-6">
            <p className="text-sm md:text-base">
              東京大学教養学部基礎科学科在学中に、半導体(シリコン)のシミュレーションを専攻する傍ら、人材会社にてインターン。
              <br />
              インターン中に人材会社向け業務システムを開発し、大学卒業後の2007年3月に上記システム「マッチングッド」を販売する会社、マッチングッド株式会社を設立。
              <br />
              12年の経営の後、2019年1月に東証プライム上場企業の株式会社じげんに株式譲渡。
              <br />
              売却資金を元手に、シェアモル株式会社を設立。
              <br />
              AIを利用したM&amp;A・事業承継の仲介サービス「シェアモルM&amp;A」と、
              <Link
                href="https://transcope.io/"
                className="text-indigo-800 hover:text-rose-800 hover:underline"
                target="_bland"
              >
                SEOに強い文章をAIが作成する「トランスコープ」
              </Link>
              を展開中。
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="rounded flex items-center justify-center flex-shrink-0">
                <img
                  className="rounded w-16 h-16 md:h-32 md:w-32"
                  src="https://s3.ap-northeast-1.wasabisys.com/transcope/assets/img-saito-kosuke-biz.webp"
                />
              </div>
              <div className="flex-1 text-base text-gray-700">
                <p className="mb-1 text-xs md:text-base font-bold">シェアモル株式会社 代表取締役</p>
                <p className="text-base md:text-xl font-bold">齋藤 康輔</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="faq" className="relative bg-gray-50 py-16 lg:py-28">
        <div className="relative">
          <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
            <h2 className="text-gray-900 sm:text-4xl mt-2 text-3xl font-bold tracking-tight">よくある質問</h2>
          </div>
          <div className="mt-12 mx-auto max-w-md px-4 sm:max-w-5xl lg:px-8">
            {faqs.map((faq, index) => (
              <Accordion
                key={`faq-${index}`}
                sx={{
                  background: "none",
                  boxShadow: "0 1px 0 #ddd",
                  px: 2,
                  "&.Mui-expanded": { my: 0 },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    padding: 0,
                    minHeight: "44px",
                    justifyContent: "space-between",
                    "&.Mui-expanded": { minHeight: "44px" },
                    "& .MuiAccordionSummary-content": {
                      marginTop: 3,
                      marginBottom: 3,
                      alignItems: "center",
                      justifyContent: "flex-start",
                      flexGrow: 0,
                    },
                    "& .MuiAccordionSummary-content.Mui-expanded": { marginTop: 3, marginBottom: 3 },
                  }}
                >
                  <span className="font-bold justify-start pl-[1em] -indent-[1em] md:text-lg">{faq.question}</span>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>
                  <div className="w-full pb-6 pl-[1em] -indent-[1em] text-sm md:text-base">{faq.answer}</div>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </div>
      </div>

      <div id="contact" className="relative bg-white py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <h2 className="text-gray-900 sm:text-4xl mt-2 text-3xl font-bold tracking-tight">
            まずは無料で
            <br className="block md:hidden" />
            ご相談ください。
          </h2>
        </div>
        <div>
          <div className="mx-auto mt-12 px-4 max-w-3xl">
            <div className="flex flex-col">
              <div className="bg-white py-4 px-4 lg:p-8" id="hubspotForm">
                <Script
                  dangerouslySetInnerHTML={{
                    __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  hbspt.forms.create({
                    region: "na1",
                    portalId: "23787199",
                    target: "#hubspotForm",
                    formId: "698ae1d3-f159-4950-a0f9-2ac892dda62a",
                    onFormSubmit: function() {
                      gtag('event', 'conversion', {
                        'send_to': 'AW-993089979/OEb9CJ3Fj4kYELuzxdkD',
                      });
                      gtag("js", new Date());
                      gtag("config", "G-FL4RRHCH46");
                      gtag('event', 'hubspot_form_submit');
                    }
                  });
                  `,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-neutral-800" aria-labelledby="footer-heading">
        <div className="mx-auto max-w-md px-4 pt-12 sm:max-w-7xl lg:px-8 lg:pt-16">
          <div className="xl:grid xl:grid-cols-4 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <Link href="/" passHref className="hover:opacity-70">
                <img
                  className="h-7 md:h-10"
                  src="https://s3.ap-northeast-1.wasabisys.com/sharemall-ma/logo/logo-sharemall-ma-white.png"
                  alt="シェアモルM&A logo"
                />
              </Link>
            </div>

            <div className="mt-6 gap-8 xl:mt-0 xl:col-span-3">
              <div>
                <div className="col-span-4 md:col-span-1">
                  <ul role="list" className="space-y-2">
                    <>
                      {footerNavigation.map((item) => (
                        <li key={item?.name}>
                          <Link
                            href={item.href}
                            target="_blank"
                            className="cursor-pointer text-sm text-white hover:text-gray-200"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 py-8">
            <p className="text-base text-white text-center">&copy; シェアモルM&amp;A.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
