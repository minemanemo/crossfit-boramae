import type { Frame, Page } from 'puppeteer';

import { getCafeAttendBookUrl } from './url';
import type { AttendData } from '@common/types/attendance';
import { AttendanceParse } from './parser';

export async function naverLogin(page: Page) {
  const naver_id = process.env.NAVER_ID || '';
  const naver_pw = process.env.NAVER_PW || '';

  process.env.NODE_ENV === 'production' && console.log(process.env);

  const setIdPw = (id: string, pw: string) => {
    (document.querySelector('#id') as HTMLInputElement).value = id;
    (document.querySelector('#pw') as HTMLInputElement).value = pw;
  };

  await page.goto('https://nid.naver.com/nidlogin.login');
  await page.evaluate(setIdPw, naver_id, naver_pw);

  await page.click('.btn_login');

  let login_state = '';
  await page.waitForResponse((_res) => {
    const secureCheckUrl = 'https://nid.naver.com/user2/help/idSafetyRelease';
    if (_res.url().startsWith(secureCheckUrl)) {
      login_state = 'fail - ID is Secure';
      return true;
    }

    const urlCheck = _res.url().startsWith('https://www.naver.com/');
    const statusCheck = _res.status() === 200;
    login_state = 'success';
    return urlCheck && statusCheck;
  });

  if (login_state !== 'success') {
    throw new Error(login_state);
  }
}

// Frame with Null
type NFrame = Frame | null | undefined;

async function getInnerHTMLList(_f: NFrame, _sel: string): Promise<string[]> {
  if (_f === null) {
    throw new Error('Frame is invalid!!!');
  }

  if (_f === undefined) {
    throw new Error('Frame is invalid!!!');
  }

  return await _f.$$eval(_sel, (elements) =>
    elements.map((element) => {
      const txt = document.createElement('textarea');
      txt.innerHTML = element.innerHTML;
      return txt.value;
    })
  );
}

async function getImageSrcList(_f: NFrame, _sel: string): Promise<string[]> {
  if (_f === null) {
    throw new Error('Frame is invalid!!!');
  }

  if (_f === undefined) {
    throw new Error('Frame is invalid!!!');
  }

  return await _f.$$eval(_sel, (elements) =>
    elements.map((element) => (element as HTMLImageElement).src)
  );
}

export async function getAttendanceSourceBook(
  page: Page,
  y: number,
  m: number,
  d: number
): Promise<AttendData[]> {
  const url = getCafeAttendBookUrl(y, m, d);
  await page.goto(url);

  const iframeSelector = '#main-area iframe';
  const elementHandle = await page.$(iframeSelector);
  const frame = await elementHandle?.contentFrame();
  const totalPageSelector = '.attendance_lst_section .prev-next a';
  const totalPage = await frame?.$$eval(totalPageSelector, (els) => els.length);

  let result: AttendData[] = [];
  const thumbnailSelector = '.list_attendance li .box_user .pc2w img';
  const nicknameSelector = '.list_attendance li .box_user .p-nick .link_text';
  const commentSelector = '.list_attendance li .cmt .txt';
  const dateSelector = '.list_attendance li .cmt .date';

  for (let i = 1; i <= (totalPage || 0); i++) {
    await page.goto(getCafeAttendBookUrl(y, m, d, i));
    const elementHandle = await page.$(iframeSelector);
    const frame = await elementHandle?.contentFrame();

    const thumbnail = await getImageSrcList(frame, thumbnailSelector);
    const nickname = await getInnerHTMLList(frame, nicknameSelector);
    const comment = await getInnerHTMLList(frame, commentSelector);
    const date = await getInnerHTMLList(frame, dateSelector);

    const data = AttendanceParse({ thumbnail, nickname, comment, date });

    result = [...result, ...data];
  }

  return result;
}
