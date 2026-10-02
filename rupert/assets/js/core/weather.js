// Reformat authored forecasts; do not infer missing temperatures, rain types or probabilities.
export function weatherParts(edition) {
  const structured=edition.conditions?.days;
  const days=Array.isArray(structured)?structured.filter(d=>['Saturday','Sunday'].includes(d.day)&&typeof d.forecast==='string').map(d=>({day:d.day,forecast:d.forecast})):[];
  let remainder=edition.conditions?.summary || '',advice=[];
  if(!days.length) {
    const marker=/\b(Saturday|Sunday|Sat\.?|Sun\.?)\b/gi;
    const matches=[...remainder.matchAll(marker)];
    for(let i=0;i<matches.length;i++) {
      const match=matches[i],day=/^sat/i.test(match[1])?'Saturday':'Sunday';
      let forecast=remainder.slice(match.index+match[0].length,matches[i+1]?.index??remainder.length).trim().replace(/^[:;,\s]+|[.;\s]+$/g,'');
      // Keep forecast sentences intact; put explanatory outing advice on its own line.
      const adviceIndex=forecast.search(/\.(?:\s+)(?:The |Use |Keep |Choose |Avoid |Check |A short |Stay |Riverwalk |Thunder|If )/);
      if(adviceIndex>=0){advice.push(forecast.slice(adviceIndex+1).trim());forecast=forecast.slice(0,adviceIndex);}
      if(days.some(d=>d.day===day)) {advice.push(`${day} ${forecast}`);continue;}
      if(forecast)days.push({day,forecast:forecast.replace(/,\s*/g,' · ')});
    }
    if(matches.length) remainder=remainder.slice(0,matches[0].index).trim();
  }
  const headline=edition.flagship?.headline_condition || '';
  for(const day of days){const hints=headline.split(/;\s*/).filter(s=>new RegExp('^\\s*'+(day.day==='Saturday'?'sat(?:urday)?':'sun(?:day)?')+'\\b','i').test(s));const hint=hints.join(' ').match(/(\d+%)\s+(showers|rain|snow|thunderstorms)\b/i);if(hint&&day.forecast.endsWith(hint[1]))day.forecast+=' '+hint[2];}
  const trail=[edition.conditions?.trail_note || headline.split(/;\s*/).filter(s=>!/^\s*(sat|sun|saturday|sunday)\b/i.test(s)).join('; '),...advice].filter(Boolean).join(' · ');
  return {days,context:days.length?remainder:'',forecast:days.length?'':remainder || headline,trail,adverse:edition.flagship?.condition_level==='adverse'};
}
