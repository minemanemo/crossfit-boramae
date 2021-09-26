import type { AttendData } from '@common/types/attendance';

type Data = {
  thumbnail: string[];
  nickname: string[];
  comment: string[];
  date: string[];
};

// prettier-ignore
const regexMapper = [
  {
    // {시간 - 9시00분, 9시 00분, 12시00분, 12시 00분} {이름 - 2~3글자} {번호} {추가 코맨트}
    finder: /^[0-9]{1,2}시[ ]?[0-9]{2}분[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}[ ]?[0-9]{4,5}/,
    changer: /^([0-9]{1,2})시[ ]?([0-9]{2})분[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})[ ]?([0-9]{4,5})(.*)/,
    result: '$1:$2 $3 $4 $5',
  },
  {
    // {시간 - 9시00분, 9시 00분, 12시00분, 12시 00분} {이름 - 2~3글자} {추가 코맨트} 😢 번호 없음...
    finder: /^[0-9]{1,2}시[ ]?[0-9]{2}분[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}/,
    changer: /^([0-9]{1,2})시[ ]?([0-9]{2})분[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})(.*)/,
    result: '$1:$2 $3 0000 $4',
  },
  {
    // {시간 - 9시, 9시, 12시, 12시} {이름 - 2~3글자} {번호} {추가 코맨트}
    finder: /^[0-9]{1,2}시[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}[ ]?[0-9]{4,5}/,
    changer: /^([0-9]{1,2})시[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})[ ]?([0-9]{4,5})(.*)/,
    result: '$1:00 $2 $3 $4',
  },
  {
    // {시간 - 9시, 9시, 12시, 12시} {이름 - 2~3글자} {추가 코맨트} 😢 번호 없음...
    finder: /^[0-9]{1,2}시[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}/,
    changer: /^([0-9]{1,2})시[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})(.*)/,
    result: '$1:00 $2 0000 $3',
  },
  {
    // {시간 - 12:00} {이름 - 2~3글자} {번호} {추가 코맨트}
    finder: /^[0-2][0-9][:; ]+[0-9]{2}[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}[ ]?[0-9]{4,5}/,
    changer: /^([0-2][0-9])[:; ]+([0-9]{2})[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})[ ]?([0-9]{4,5})(.*)/,
    result: '$1:$2 $3 $4 $5',
  },
  {
    // {시간 - 12:00} {이름 - 2~3글자} {번호} {추가 코맨트} 😢 번호 없음...
    finder: /^[0-2][0-9][:; ]+[0-9]{2}[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}/,
    changer: /^([0-2][0-9])[:; ]+([0-9]{2})[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})(.*)/,
    result: '$1:$2 $3 0000 $4',
  },
  {
    // {시간 - 2:30} {이름 - 2~3글자} {번호} {추가 코맨트}
    finder: /^[0-9][:; ]+[0-9]{2}[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}[ ]?[0-9]{4,5}/,
    changer: /^([0-9])[:; ]+([0-9]{2})[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})[ ]?([0-9]{4,5})(.*)/,
    result: '$1:$2 $3 $4 $5',
  },
  {
    // {시간 - 2:30} {이름 - 2~3글자} {추가 코맨트} 😢 번호 없음...
    finder: /^[0-9][:; ]+[0-9]{2}[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}/,
    changer: /^([0-9])[:; ]+([0-9]{2})[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})(.*)/,
    result: '$1:$2 $3 0000 $4',
  },
  {
    // {시간 - 0900} {이름 - 2~3글자} {번호} {추가 코맨트}
    finder: /^[0-2][0-9]{3}[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}[ ]?[0-9]{4,5}/,
    changer: /^([0-2][0-9])([0-9]{2})[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})[ ]?([0-9]{4,5})(.*)/,
    result: '$1:$2 $3 $4 $5',
  },
  {
    // {시간 - 0900} {이름 - 2~3글자} {추가 코맨트} 😢 번호 없음...
    finder: /^[0-2][0-9]{3}[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}/,
    changer: /^([0-2][0-9])([0-9]{2})[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})(.*)/,
    result: '$1:$2 $3 0000 $4',
  },
  {
    // {시간 - 900} {이름 - 2~3글자} {번호} {추가 코맨트}
    finder: /^[0-9]{3}[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}[ ]?[0-9]{4,5}/,
    changer: /^([0-9])([0-9]{2})[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})[ ]?([0-9]{4,5})(.*)/,
    result: '0$1:$2 $3 $4 $5',
  },
  {
    // {시간 - 900} {이름 - 2~3글자} {번호} {추가 코맨트} 😢 번호 없음...
    finder: /^[0-9]{3}[ ]?[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3}/,
    changer: /^([0-9])([0-9]{2})[ ]?([ㄱ-ㅎ|ㅏ-ㅣ|가-힣]{2,3})(.*)/,
    result: '0$1:$2 $3 0000 $4',
  },
  // {
  //   finder: ,
  //   changer: ,
  //   result: ,
  // },
];

function checkState(_comment: string): AttendData['state'] {
  if (_comment.indexOf('취소') >= 0) {
    return 'CANCEL';
  }
  if (_comment.indexOf('변경') >= 0) {
    return 'CHANGE';
  }
  return 'ATTEND';
}

type ParseComment = Pick<
  AttendData,
  'name' | 'time' | 'phone' | 'comment' | 'raw_comment' | 'state'
>;
function parseComment(_comment: string): ParseComment {
  const raw_comment = _comment
    .replace(/<br>/g, '')
    .replace(/\s/g, ' ')
    .replace(/[ ]+/g, ' ')
    .trim();

  for (let i = 0; i < regexMapper.length; i++) {
    const { finder, changer, result } = regexMapper[i];
    if (finder.test(raw_comment) === false) {
      continue;
    }

    const [time, name, phone, ...rest] = raw_comment
      .replace(changer, result)
      .split(' ');

    const comment = rest.join(' ');
    const state = checkState(comment);

    return { time, name, phone, comment, raw_comment, state };
  }

  // unknown format
  return {
    time: '',
    name: '',
    phone: '',
    comment: raw_comment,
    raw_comment,
    state: 'UNKNOWN',
  };
}

function filterComment(_user: string, _comment: string): boolean {
  const isCoach = _user.indexOf('코치');

  if (_comment.indexOf('현황') >= 0) {
    return true;
  }
  if (_comment.indexOf('공지') >= 0) {
    return true;
  }
  if (isCoach && /즐거운/.test(_comment) && /주말/.test(_comment)) {
    return true;
  }
  if (isCoach && /^[- ]+$/.test(_comment)) {
    return true;
  }

  return false;
}
export type AttendanceParseReturn = {
  ATTEND: AttendData[];
  CHANGE: AttendData[];
  CANCEL: AttendData[];
  UNKNOWN: AttendData[];
};

export function AttendanceParse(data: Data): AttendanceParseReturn {
  const { thumbnail, nickname, comment, date } = data;

  if (nickname.length !== thumbnail.length) {
    throw new Error('Crawling is invalid!!!');
  }
  if (nickname.length !== comment.length) {
    throw new Error('Crawling is invalid!!!');
  }
  if (nickname.length !== date.length) {
    throw new Error('Crawling is invalid!!!');
  }

  const size = nickname.length;
  const result: AttendanceParseReturn = {
    ATTEND: [],
    CHANGE: [],
    CANCEL: [],
    UNKNOWN: [],
  };

  for (let i = 0; i < size; i++) {
    const _user = nickname[i];
    const _thumbnail = thumbnail[i];
    const _comment = comment[i];
    const _date = date[i];

    if (filterComment(_user, _comment)) {
      continue;
    }

    const parsed = parseComment(_comment);
    if (parsed.state === 'UNKNOWN') {
      console.log('🚀 :', _user, ` // "${parsed.raw_comment}"`);
    }

    result[parsed.state].push({
      ...parsed,
      user: _user,
      thumbnail: _thumbnail,
      date: _date,
    });
  }
  return result;
}
