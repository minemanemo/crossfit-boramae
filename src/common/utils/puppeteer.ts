import type { Frame, Page } from 'puppeteer';

import { getCafeAttendBookUrl } from './url';
import type { AttendData } from '@common/types/attendance';
import { AttendanceParse, AttendanceParseReturn } from './parser';
import { keys } from 'lodash';

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
): Promise<{ data: AttendData[]; unknown: AttendData[] }> {
  const url = getCafeAttendBookUrl(y, m, d);
  await page.goto(url);

  const iframeSelector = '#main-area iframe';
  const elementHandle = await page.$(iframeSelector);
  const frame = await elementHandle?.contentFrame();
  const totalPageSelector = '.attendance_lst_section .prev-next a';
  const totalPage = await frame?.$$eval(totalPageSelector, (els) => els.length);

  const thumbnailSelector = '.list_attendance li .box_user .pc2w img';
  const nicknameSelector = '.list_attendance li .box_user .p-nick .link_text';
  const commentSelector = '.list_attendance li .cmt .txt';
  const dateSelector = '.list_attendance li .cmt .date';

  const result: AttendanceParseReturn = {
    ATTEND: [],
    CHANGE: [],
    CANCEL: [],
    UNKNOWN: [],
  };

  for (let i = 1; i <= (totalPage || 0); i++) {
    await page.goto(getCafeAttendBookUrl(y, m, d, i));
    const elementHandle = await page.$(iframeSelector);
    const frame = await elementHandle?.contentFrame();

    const thumbnail = await getImageSrcList(frame, thumbnailSelector);
    const nickname = await getInnerHTMLList(frame, nicknameSelector);
    const comment = await getInnerHTMLList(frame, commentSelector);
    const date = await getInnerHTMLList(frame, dateSelector);

    const data = AttendanceParse({ thumbnail, nickname, comment, date });
    result.ATTEND = [...result.ATTEND, ...data.ATTEND];
    result.CHANGE = [...result.CHANGE, ...data.CHANGE];
    result.CANCEL = [...result.CANCEL, ...data.CANCEL];
    result.UNKNOWN = [...result.UNKNOWN, ...data.UNKNOWN];
  }

  // apply change
  result.CHANGE.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  ).forEach((change) => {
    for (let i = 0; i < result.ATTEND.length; i++) {
      if (result.ATTEND[i].name === change.name) {
        const newComment = `${result.ATTEND[i].comment} / ${change.comment}`;
        result.ATTEND[i].comment = newComment;
        result.ATTEND[i].state = 'CANCEL';
      }
    }
    result.ATTEND.push(change);
  });

  // apply cancel
  result.CANCEL.forEach((cancel) => {
    const idx = result.ATTEND.findIndex(
      (attend) => attend.time === cancel.time && attend.name === cancel.name
    );
    if (idx >= 0) {
      const newComment = `${result.ATTEND[idx].comment} / ${cancel.comment}`;
      result.ATTEND[idx].comment = newComment;
      result.ATTEND[idx].state = 'CANCEL';
    }
  });

  // sort result
  const sorted = result.ATTEND.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return { data: sorted, unknown: result.UNKNOWN };
}
