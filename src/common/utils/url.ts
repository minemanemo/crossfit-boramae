export function getCafeAttendBookUrl(
  y: number,
  m: number,
  d: number,
  page?: number
): string {
  const base = 'https://cafe.naver.com/AttendanceView.nhn';
  const clubid = '27959802';
  const menuid = '28';
  const urlWithDatetime = `${base}?search.clubid=${clubid}&search.menuid=${menuid}&search.attendyear=${y}&search.attendmonth=${m}&search.attendday=${d}`;

  if (page === undefined) {
    urlWithDatetime;
  }

  return `${urlWithDatetime}&search.page=${page}`;
}
