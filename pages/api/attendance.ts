import type { NextApiRequest, NextApiResponse } from 'next';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer';
import type { Page } from 'puppeteer';
import { decode } from 'html-entities';

function getUrl(y: number, m: number, d: number, page?: number): string {
  const base = 'https://cafe.naver.com/AttendanceView.nhn';
  const clubid = '27959802';
  const menuid = '28';
  const urlWithDatetime = `${base}?search.clubid=${clubid}&search.menuid=${menuid}&search.attendyear=${y}&search.attendmonth=${m}&search.attendday=${d}`;

  if (page === undefined) {
    urlWithDatetime;
  }

  return `${urlWithDatetime}&search.page=${page}`;
}

async function login(page: Page) {
  const naver_id = process.env.NAVER_ID || '';
  const naver_pw = process.env.NAVER_PW || '';

  const setIdPw = (id: string, pw: string) => {
    (document.querySelector('#id') as HTMLInputElement).value = id;
    (document.querySelector('#pw') as HTMLInputElement).value = pw;
  };

  await page.goto('https://nid.naver.com/nidlogin.login');
  await page.evaluate(setIdPw, naver_id, naver_pw);

  await page.click('.btn_login');
  await page.waitForResponse((_res) => {
    const urlCheck = _res.url().startsWith('https://www.naver.com/');
    const statusCheck = _res.status() === 200;
    return urlCheck && statusCheck;
  });
}

async function getAttendanceBook(
  page: Page,
  y: number,
  m: number,
  d: number
): Promise<string[]> {
  const url = getUrl(y, m, d);
  await page.goto(url);

  const iframeSelector = '#main-area iframe';
  const elementHandle = await page.$(iframeSelector);
  const frame = await elementHandle?.contentFrame();
  const totalPageSelector = '.attendance_lst_section .prev-next a';
  const totalPage = await frame?.$$eval(totalPageSelector, (els) => els.length);

  let result: string[] = [];
  const attendanceSelector = '.list_attendance li .cmt .txt';
  for (let i = 1; i <= (totalPage || 0); i++) {
    await page.goto(getUrl(y, m, d, i));

    const elementHandle = await page.$(iframeSelector);
    const frame = await elementHandle?.contentFrame();
    const data = await frame?.$$eval(attendanceSelector, (els) =>
      els.map((el) => el.innerHTML)
    );
    result = [...result, ...(data || [])];
  }

  return result?.map((d) => decode(d.replace(/\s/g, ' ')));
}

type Data = {
  data: Reserve[];
};

export type Reserve = {
  time: string;
  name: string;
  num: string;
  comment: string;
  cancel?: boolean;
};

const splitStrToObj = (str: string): Reserve => {
  const sp = str.split(' ');
  const [time, name, num, ...comment] = sp.filter((s) => s !== '');
  return {
    time,
    name,
    num: num || '????',
    comment: comment.join(' '),
    cancel: false,
  };
};

function parseResult(data: string[]): Reserve[] {
  const attend: string[] = [];
  const cancel: string[] = [];

  data.forEach((d) => {
    const str = d
      .replace(/<br>/g, '')
      .replace(/\n/g, ' ')
      .replace(/^([0-9][0-9])시([0-5][0-9])분(.*)/, '$1:$2 $3')
      .replace(/^([0-9])시([0-5][0-9])분(.*)/, '$1:$2 $3')
      .replace(/^([0-9])시(.*)/, '$1:$2 $3')
      .replace(/^([0-9][0-9])[:]?([0-9][0-9])(.*)/, '$1:$2 $3')
      .replace(/([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{3})([0-9]{4})/g, '$1 $2')
      .replace(/\s/g, ' ')
      .replace(/[ ]+/, ' ');

    if (/^([1-9]|[01][0-9]|2[0-3]):([0-5][0-9])/.test(str)) {
      if (str.indexOf('취소') < 0) {
        attend.push(str);
      } else {
        cancel.push(str);
      }
    }
  });

  const _attend = attend.sort().map((d) => splitStrToObj(d));
  const _cancel = cancel.sort().map((d) => splitStrToObj(d));

  _cancel.forEach((c) => {
    const findIndex = _attend.findIndex(
      (a) => a.time === c.time && a.name === c.name && a.num === c.num
    );
    if (findIndex >= 0) {
      const newComment = `${_attend[findIndex].comment} / ${c.comment}`;
      _attend[findIndex].comment = newComment;
      _attend[findIndex].cancel = true;
    }
  });
  return _attend;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const crawler = async () => {
    const browser = await chromium.puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: process.env.NODE_ENV === 'production',
      ignoreHTTPSErrors: true,
    });

    const y = Number(req.query.y);
    const m = Number(req.query.m);
    const d = Number(req.query.d);

    const page = await browser.newPage();
    await login(page);
    const result = await getAttendanceBook(page, y, m, d);
    await browser.close();

    const parsed = parseResult(result);
    res.status(200).json({ data: parsed });
  };

  crawler();
}
