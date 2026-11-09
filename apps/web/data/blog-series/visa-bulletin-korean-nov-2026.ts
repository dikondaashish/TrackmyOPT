import { defineArticle, source } from './shared';
import type { ArticleSource, ArticleTable } from './types';
import {
  familyMovement,
  novemberBulletin,
  novemberDatesForFiling,
  novemberFinalAction,
  octoberBulletin,
  uscisCharts,
} from './visa-bulletin-december-2026';

// Korean summary of the official November 2026 Visa Bulletin. Korea has no
// column of its own, so every table uses "All Chargeability Areas Except Those
// Listed". All dates were re-checked against travel.state.gov on November 9, 2026.

const SLUG = 'visa-bulletin-november-2026-korean';
const EN_SLUG = 'november-2026-visa-bulletin-predictions-opt-workers';

const septemberBulletin: ArticleSource = {
  label: 'Visa Bulletin for September 2026',
  publisher: 'U.S. Department of State',
  url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-september-2026.html',
};

const processingTimes: ArticleSource = {
  label: 'Check Case Processing Times',
  publisher: 'USCIS',
  url: 'https://egov.uscis.gov/processing-times/',
};

const KO_MONTHS: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

// "Apr 1, 2025" -> "2025년 4월 1일"; "C" -> "C (커런트)".
const koDate = (value: string) =>
  value === 'C'
    ? 'C (커런트)'
    : value.replace(
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (\d{4})/g,
        (_match, month: string, day: string, year: string) =>
          `${year}년 ${KO_MONTHS[month]}월 ${day}일`
      );

const koMovement = (value: string) =>
  value
    .replace('No change', '변동 없음')
    .replace('+1 month', '+1개월')
    .replace('+1 year', '+1년');

const KO_CATEGORY: Record<string, string> = {
  'EB-1': 'EB-1 (취업이민 1순위)',
  'EB-2': 'EB-2 (취업이민 2순위)',
  'EB-3': 'EB-3 (취업이민 3순위)',
  'EB-3 Other Workers': 'EB-3 비숙련 (Other Workers)',
  'EB-4': 'EB-4 (특수 이민)',
  'EB-5 Unreserved': 'EB-5 일반 (Unreserved)',
};

// Column 1 of the shared tables is "All other countries" = All Chargeability.
const allChargeability = (table: ArticleTable, caption: string): ArticleTable => ({
  caption,
  columns: ['카테고리', '한국 포함 기타 모든 국가'],
  rows: table.rows.map((row) => [KO_CATEGORY[row[0]] ?? row[0], koDate(row[1])]),
});

const koFinalAction = allChargeability(
  novemberFinalAction,
  '2026년 11월 비자 블러틴, 취업이민 최종 승인일(Final Action Dates), All Chargeability 열 (공식).'
);

const koDatesForFiling = allChargeability(
  {
    ...novemberDatesForFiling,
    // EB-4 is not in the shared table; Jan 1, 2025 verified on the November bulletin.
    rows: [...novemberDatesForFiling.rows.slice(0, 4), ['EB-4', 'Jan 1, 2025'], ...novemberDatesForFiling.rows.slice(4)],
  },
  '2026년 11월 비자 블러틴, 취업이민 서류 접수일(Dates for Filing), All Chargeability 열 (공식). USCIS는 11월 신분조정 접수에 이 차트를 지정했습니다.'
);

// September, October and November 2026 Final Action Dates, All Chargeability,
// as printed in each official bulletin.
const koThreeMonths: ArticleTable = {
  caption: '취업이민 최종 승인일, 한국 포함 기타 모든 국가: 2026년 9월·10월·11월 (공식).',
  columns: ['카테고리', '2026년 9월', '2026년 10월', '2026년 11월'],
  rows: [
    ['EB-1', 'C (커런트)', 'C (커런트)', 'C (커런트)'],
    ['EB-2', 'C (커런트)', '2025년 1월 1일', '2025년 4월 1일'],
    ['EB-3', '2024년 9월 1일', '2024년 5월 15일', '2024년 6월 15일'],
    ['EB-3 비숙련 (Other Workers)', '2022년 4월 1일', '2022년 1월 1일', '2022년 6월 1일'],
  ],
};

// Family F1 to F4, All Chargeability, from the shared October-November table,
// plus the November Dates for Filing (verified on the November bulletin).
const FAMILY_KO: Record<string, string> = {
  F1: 'F1 (시민권자의 미혼 자녀, 21세 이상)',
  F2A: 'F2A (영주권자의 배우자·미성년 자녀)',
  F2B: 'F2B (영주권자의 미혼 자녀, 21세 이상)',
  F3: 'F3 (시민권자의 기혼 자녀)',
  F4: 'F4 (성인 시민권자의 형제자매)',
};
const FAMILY_DFF: Record<string, string> = {
  F1: '2021년 2월 1일',
  F2A: 'C (커런트)',
  F2B: '2020년 9월 1일',
  F3: '2015년 11월 1일',
  F4: '2012년 11월 1일',
};
const koFamily: ArticleTable = {
  caption:
    '가족이민, 한국 포함 기타 모든 국가: 최종 승인일 10월→11월과 11월 서류 접수일 (공식). USCIS는 11월 가족이민 신분조정에도 서류 접수일 차트를 지정했습니다.',
  columns: ['카테고리', '10월 최종 승인일', '11월 최종 승인일', '변동', '11월 서류 접수일'],
  rows: familyMovement.rows
    .filter((row) => FAMILY_KO[row[0]])
    .map((row) => [
      FAMILY_KO[row[0]],
      koDate(row[1]),
      koDate(row[2]),
      koMovement(row[3]),
      FAMILY_DFF[row[0]],
    ]),
};

export const visaBulletinKoreanNov2026 = defineArticle({
  slug: SLUG,
  lang: 'ko',
  translations: { en: EN_SLUG },
  title: '2026년 11월 영주권 문호 정리: 취업이민·가족이민 우선일자 (한국 출생자 기준)',
  seoTitle: '2026년 11월 영주권 문호: 취업이민·가족이민 우선일자 정리',
  description:
    '미국 국무부 2026년 11월 비자 블러틴(영주권 문호)의 공식 날짜를 한국 출생자 기준으로 정리했습니다. 취업이민 최종 승인일과 서류 접수일, 가족이민 날짜, USCIS의 11월 차트 선택, OPT·STEM OPT 근로자가 알아야 할 점.',
  category: '영주권 문호',
  tags: [
    '2026년 11월 영주권 문호',
    '영주권 문호',
    '우선일자',
    '취업이민',
    '가족이민',
    '비자 블러틴',
  ],
  readTime: '읽는 시간 6분',
  publishedDate: '2026-11-09',
  modifiedDate: '2026-11-09',
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT 표지: 2026년 11월 영주권 문호, 한국 포함 기타 모든 국가 기준 취업이민 최종 승인일.',
  imageCaption: '2026년 11월 비자 블러틴 공식 표로 만든 표지입니다.',
  reviewLabel: '2026년 11월 9일 국무부·USCIS 공식 페이지로 확인',
  showContents: true,
  statusNote:
    '2026년 11월 9일 확인: 국무부 비자 블러틴 목록의 현재 블러틴은 2026년 11월호이고, 12월호는 아직 게시되지 않았습니다. USCIS의 12월 차트 안내도 "coming soon" 상태입니다. 이 페이지의 날짜는 모두 11월호 공식 표에서 옮겼습니다.',
  directAnswer:
    '2026년 11월 영주권 문호에서 한국 출생자는 "기타 모든 국가(All Chargeability)" 열을 봅니다. 취업이민 최종 승인일은 EB-1 커런트, EB-2 2025년 4월 1일, EB-3 2024년 6월 15일, EB-3 비숙련 2022년 6월 1일입니다. 10월호보다 EB-2는 3개월, EB-3는 1개월, 비숙련은 5개월 앞당겨졌습니다. USCIS는 11월 신분조정(I-485) 접수에 취업이민과 가족이민 모두 서류 접수일(Dates for Filing) 차트를 지정했고, 이 차트로는 EB-2 2026년 3월 15일, EB-3 2024년 8월 1일입니다. 12월호는 11월 중순에 나올 것으로 보입니다.',
  keyTakeaways: [
    '한국은 별도 열이 없습니다. 비자 블러틴의 "All Chargeability Areas Except Those Listed" 열이 한국 출생자에게 적용됩니다.',
    '11월 취업이민 최종 승인일: EB-1 커런트, EB-2 2025년 4월 1일, EB-3 2024년 6월 15일, 비숙련 2022년 6월 1일.',
    'USCIS는 11월에 취업이민·가족이민 모두 서류 접수일 차트를 쓰도록 했습니다. 우선일자가 EB-2 2026년 3월 15일, EB-3 2024년 8월 1일보다 빠르면 I-485 접수를 검토할 수 있습니다.',
    '우선일자와 OPT·STEM OPT EAD는 서로 다른 시계입니다. 문호가 열려도 EAD 기간은 늘어나지 않습니다.',
  ],
  sections: [
    {
      heading: '한국 출생자는 어느 열을 보나요',
      paragraphs: [
        '비자 블러틴은 중국, 인도, 멕시코, 필리핀만 따로 표시합니다. 한국은 따로 표시되지 않으므로 "All Chargeability Areas Except Those Listed"(한국 포함 기타 모든 국가) 열을 봅니다. 국가 배정(chargeability)은 보통 국적이 아니라 출생 국가 기준입니다. 배우자 출생국을 적용하는 예외 등은 담당 변호사와 확인하세요.',
        '우선일자(priority date)는 대기 순번입니다. 노동 허가(PERM)가 필요한 경우 보통 PERM 접수일, NIW처럼 PERM이 없는 경우 보통 I-140 접수일입니다. 내 우선일자가 표의 날짜보다 빨라야 해당 단계로 진행할 수 있습니다. "C"는 커런트, 즉 대기 없이 진행 가능하다는 뜻입니다.',
      ],
      sources: [novemberBulletin],
    },
    {
      heading: '취업이민 최종 승인일 (Final Action Dates)',
      paragraphs: [
        '최종 승인일은 영주권을 실제로 승인받거나 이민비자를 발급받을 수 있는 기준입니다. 11월호 공식 표에서 한국 출생자에게 적용되는 날짜는 아래와 같습니다. 국무부는 10월 5일까지 접수된 수요를 기준으로 11월 날짜를 정했습니다.',
      ],
      table: koFinalAction,
      sources: [novemberBulletin],
    },
    {
      heading: '9월·10월·11월 비교',
      paragraphs: [
        '2026년 9월호에서는 EB-2가 커런트였고 EB-3는 2024년 9월 1일이었습니다. 10월에 2027 회계연도가 시작되면서 EB-2와 EB-3 모두 뒤로 밀렸습니다. 11월호는 그중 일부를 되찾았습니다. EB-2는 3개월, EB-3는 1개월, 비숙련은 5개월 앞당겨졌습니다. EB-2와 EB-3는 아직 9월 수준에 못 미치지만, 비숙련은 9월(2022년 4월 1일)보다 앞선 2022년 6월 1일이 됐습니다.',
      ],
      table: koThreeMonths,
      note: '움직임을 추세선으로 읽지 마세요. 국무부는 연간·분기별 한도에 맞춰 매달 숫자를 배정하므로, 몇 달 멈췄다가 크게 움직이거나 앞당겨졌다가 다시 밀릴 수 있습니다.',
      sources: [septemberBulletin, octoberBulletin, novemberBulletin],
    },
    {
      heading: '서류 접수일 (Dates for Filing)과 USCIS 차트 선택',
      paragraphs: [
        '미국 안에서 신분조정(I-485)을 하려면 국무부 날짜뿐 아니라 USCIS가 그달에 어떤 차트를 허용했는지가 중요합니다. USCIS는 2026년 11월 취업이민과 가족이민 모두 서류 접수일 차트를 쓰도록 지정했습니다. 우선일자가 아래 날짜보다 빠르면 최종 승인일 기준으로는 아직 차례가 아니어도 I-485를 접수하고 EAD와 여행 허가(advance parole)를 함께 신청할 수 있습니다.',
        'USCIS 안내에 따르면 어떤 카테고리가 최종 승인일 차트에서 커런트이거나 최종 승인일이 서류 접수일보다 늦은 날짜이면, 그달에는 최종 승인일 차트로 접수할 수 있습니다.',
      ],
      table: koDatesForFiling,
      sources: [novemberBulletin, uscisCharts],
    },
    {
      heading: '가족이민 날짜',
      paragraphs: [
        '가족이민은 11월에 크게 움직였습니다. 한국 포함 기타 모든 국가 기준으로 F1, F2B, F3, F4가 1년씩, F2A가 1개월 앞당겨졌습니다. 신분조정 접수에는 USCIS가 지정한 서류 접수일 차트를 쓰고, F2A는 서류 접수일 기준 커런트입니다.',
      ],
      table: koFamily,
      sources: [octoberBulletin, novemberBulletin, uscisCharts],
    },
    {
      heading: '한국인 OPT·STEM OPT 근로자에게 의미하는 것',
      paragraphs: [
        '영주권 문호와 F-1 취업 허가는 서로 다른 시계로 움직입니다. 우선일자가 커런트가 되어도 OPT나 STEM OPT EAD 기간이 늘어나지 않고, EAD가 끝나도 우선일자는 그대로 유지됩니다. 두 일정을 따로 기록하세요.',
        'OPT EAD를 기다리는 중이라면 USCIS 처리 기간 도구에서 I-765와 내 카테고리를 확인하세요. 참고로 TrackMyOPT 커뮤니티에 보고된 사례 기준(2026년 11월 8일), 프리미엄 프로세싱 없이 완료된 최초 OPT는 접수부터 승인까지 중앙값 125일(1,546건), STEM OPT 연장은 중앙값 183일(585건)이었습니다. USCIS 공식 수치가 아니며 개별 사건을 예측하지 않습니다.',
      ],
      bullets: [
        'I-140 승인 통지서나 접수증에서 카테고리와 우선일자를 확인하고 회사 측 변호사와 맞춰 두세요.',
        '우선일자가 11월 서류 접수일보다 빠르다면 I-485 준비 서류를 미리 물어보세요.',
        'I-765(OPT·STEM OPT), I-140, I-485 접수번호(receipt number)는 각각 따로 추적하세요.',
        'SEVP 포털 보고는 영주권 진행과 상관없이 계속 최신으로 유지하세요.',
      ],
      links: [
        { label: '2026년 11월 비자 블러틴: 공식 날짜와 예측 비교 (영문)', href: `/blog/${EN_SLUG}` },
        { label: 'EAD 카드 상태 확인: 메시지별 의미 (영문)', href: '/blog/ead-card-status-check' },
        { label: 'OPT 결정 시점 추정 도구 (영문)', href: '/tools/opt-decision-window' },
      ],
      sources: [processingTimes, source.opt],
    },
    {
      heading: '12월 영주권 문호는 언제 나오나요',
      paragraphs: [
        '국무부는 보통 적용 월의 전달 중순에 블러틴을 게시합니다. 2026년 12월호는 11월 중순에 나올 것으로 보이지만 정해진 날짜는 없습니다. 게시되면 국무부 날짜와 함께 USCIS가 12월에 어떤 차트를 허용하는지도 확인하세요.',
      ],
      links: [
        { label: '2026년 12월 비자 블러틴 예측 (영문)', href: '/blog/december-2026-visa-bulletin-predictions' },
      ],
      sources: [source.visaBulletin, uscisCharts],
    },
  ],
  checklist: [
    'I-140 서류로 카테고리, 출생 국가, 우선일자를 확인하세요.',
    '"기타 모든 국가(All Chargeability)" 열에서 내 날짜를 비교하세요.',
    'USCIS가 그달 지정한 차트(최종 승인일 또는 서류 접수일)를 확인하세요.',
    'OPT·STEM OPT 기한과 SEVP 보고는 따로 관리하세요.',
  ],
  mistakes: [
    '국무부 블러틴만 보고 USCIS 차트 선택을 확인하지 않는 것.',
    '우선일자가 커런트면 EAD가 끝난 뒤에도 일할 수 있다고 생각하는 것.',
    '예측 사이트의 날짜를 공식 날짜로 공유하는 것.',
  ],
  faq: [
    {
      question: '2026년 11월 EB-2 영주권 문호는 한국 기준으로 언제인가요?',
      answer:
        '최종 승인일은 2025년 4월 1일, 서류 접수일은 2026년 3월 15일입니다. USCIS는 11월 신분조정 접수에 서류 접수일 차트를 지정했습니다.',
    },
    {
      question: '2026년 11월 EB-3 영주권 문호는요?',
      answer:
        '최종 승인일은 2024년 6월 15일, 서류 접수일은 2024년 8월 1일입니다. EB-3 비숙련(Other Workers)은 최종 승인일 2022년 6월 1일, 서류 접수일 2022년 7월 1일입니다.',
    },
    {
      question: '2026년 9월 영주권 문호는 어땠나요?',
      answer:
        '9월호에서 한국 포함 기타 모든 국가의 최종 승인일은 EB-1과 EB-2가 커런트, EB-3가 2024년 9월 1일, 비숙련이 2022년 4월 1일이었습니다. 10월에 새 회계연도가 시작되며 EB-2와 EB-3가 뒤로 밀렸습니다.',
    },
    {
      question: 'OPT EAD 카드는 얼마나 걸리나요?',
      answer:
        '공식 수치는 USCIS 처리 기간 도구에서 I-765와 내 카테고리로 확인합니다. TrackMyOPT 커뮤니티 보고 기준(2026년 11월 8일) 최초 OPT 중앙값은 125일, STEM OPT는 183일이었습니다. 승인 후 카드 제작과 배송은 별도입니다.',
    },
    {
      question: '12월 영주권 문호는 언제 나오나요?',
      answer:
        '보통 전달 중순에 나오므로 11월 중순으로 예상되지만 정해진 날짜는 없습니다. 국무부 공식 목록과 USCIS 차트 페이지를 함께 확인하세요.',
    },
  ],
  dataNote:
    '모든 날짜는 2026년 11월 9일 국무부 비자 블러틴(9월·10월·11월호)과 USCIS 신분조정 차트 페이지에서 확인했습니다. 커뮤니티 처리 기간은 TrackMyOPT 사용자 보고 자료(2026년 11월 8일 기준)이며 USCIS 자료가 아닙니다. 일반 정보이며 법률 자문이 아닙니다.',
  sources: [novemberBulletin, octoberBulletin, septemberBulletin, uscisCharts, source.visaBulletin, processingTimes],
  related: [
    { label: '2026년 11월 비자 블러틴: 공식 날짜와 예측 비교 (영문)', href: `/blog/${EN_SLUG}` },
    { label: '2026년 12월 비자 블러틴 예측 (영문)', href: '/blog/december-2026-visa-bulletin-predictions' },
    { label: 'EAD 카드 상태 확인 (영문)', href: '/blog/ead-card-status-check' },
  ],
});
