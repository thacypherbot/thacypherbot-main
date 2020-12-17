// This function is used to convert unixMS (or any ms really)
// into a text format
// removing any of them that's < 0 (eg. 0 hours, 15 min, 0 sec => 15 min and 0 sec)
// Can also be extended to support days, months, etc.
// But since reps are per 24 hours, there's no need to.
const convertMS = function (ms) {
  let h, m, s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;
  h = h % 24;
  const stxt =
    s > 1
      ? `${s.toLocaleString("en")} seconds`
      : `${s.toLocaleString("en")} second`;
  const mtxt =
    m > 1
      ? `${m.toLocaleString("en")} minutes`
      : `${m.toLocaleString("en")} minute`;
  const htxt =
    h > 1
      ? `${h.toLocaleString("en")} hours`
      : `${h.toLocaleString("en")} hour`;
  const periodsTXT = [htxt, mtxt, stxt];
  const periods = [h, m, s];
  const result = [];
  for (let i = 0; i < periods.length; i++) {
    if (periods[i] > 0) {
      for (let j = i; j < periodsTXT.length; j++) {
        result.push(periodsTXT[j]);
      }
      break;
    }
  }
  return result.join(" ");
};
module.exports = convertMS;
