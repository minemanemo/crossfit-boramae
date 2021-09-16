// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import type { Page } from 'puppeteer';
import { decode } from 'html-entities';

async function login(page: Page) {
  const naver_id = 'borame-crossfit-bot';
  const naver_pw = 'Qhfkao1!';

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

async function getAttendanceBook(page: Page): Promise<string[]> {
  const url = `https://cafe.naver.com/AttendanceView.nhn?search.clubid=27959802&search.menuid=28&search.attendyear=2021&search.attendmonth=9&search.attendday=15`;

  await page.goto(url);

  const iframeSelector = '#main-area iframe';
  const elementHandle = await page.$(iframeSelector);
  const frame = await elementHandle?.contentFrame();

  const attendanceSelector = '.list_attendance li .cmt .txt';
  const data = await frame?.$$eval(attendanceSelector, (els) =>
    els.map((el) => el.innerHTML)
  );

  const result = data
    ?.map((d) => decode(d))
    .filter((d) => d.indexOf('수업현황') < 0);

  return result || [];
}

type Data = {
  result: string[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const crawler = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await login(page);

    const result = await getAttendanceBook(page);
    res.status(200).json({ result: result });

    await browser.close();
  };

  crawler();
}
