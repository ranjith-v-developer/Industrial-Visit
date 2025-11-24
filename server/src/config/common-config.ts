import { dateOptions } from './common.interface';
import * as dayjs from 'dayjs';

export const checkDate = (date: string, obj: dateOptions): boolean => {
  const formattedDate = dayjs(date).format('DD-MM-YYYY');
  const reversedDate = dayjs(`${formattedDate.split('-').reverse().join('-')}`);
  const currentDate = dayjs().startOf('day');
  let checkCondition = false;

  if (obj.checkSame) {
    checkCondition = currentDate.isSame(reversedDate);
  }
  if (obj.checkAfter) {
    checkCondition = currentDate.isAfter(reversedDate);
  }
  if (obj.checkSameOrAfter) {
    checkCondition =
      currentDate.isSame(reversedDate) || currentDate.isAfter(reversedDate);
  }
  if (obj.checkBefore) {
    checkCondition = currentDate.isBefore(reversedDate);
  }
  if (obj.checkSameOrBefore) {
    checkCondition =
      currentDate.isSame(reversedDate) || currentDate.isBefore(reversedDate);
  }
  return checkCondition;
};

export const getCSVBase64URL = (content: string) => {
  const base64String = btoa(unescape(encodeURIComponent(content)));
  return `data:text/csv;base64,${base64String}`;
};
