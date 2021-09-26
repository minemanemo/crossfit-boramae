import chromium from 'chrome-aws-lambda';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getAttendanceSourceBook, naverLogin } from '@common/utils/puppeteer';
import type { ReadAttendDataListBody } from '@common/types/attendance';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadAttendDataListBody>
) {
  const crawler = async () => {
    const browser = await chromium.puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const y = Number(req.query.y);
    const m = Number(req.query.m);
    const d = Number(req.query.d);

    const page = await browser.newPage();

    try {
      await naverLogin(page);
      const { data, unknown } = await getAttendanceSourceBook(page, y, m, d);

      res.status(200).json({ data, unknown });
    } catch (e) {
      res.status(500).statusMessage = (e as Object).toString();
    }
    await browser.close();
  };

  crawler();
}
