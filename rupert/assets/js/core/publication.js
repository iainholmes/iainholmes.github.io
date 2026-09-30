// Publication evidence is owned by the official land manager. Secondary sources cannot unlock it.
export function accessProblem(edition, checks, officialHosts) {
  if(edition.status!=='published')return null;
  const check=checks.find(c=>c.place_id===edition.flagship.place_id);
  if(!check)return 'Missing official access check.';
  let url;try{url=new URL(check.official_url);}catch{return 'Invalid official source URL.';}
  if(url.protocol!=='https:' || !officialHosts.includes(url.hostname))return 'Source is not an approved land manager; AllTrails is secondary only.';
  if(check.status!=='open')return 'Official access is closed or unverified.';
  if(check.discrepancy)return 'Resolve the disagreement between official and secondary sources.';
  const age=(new Date(edition.published_at)-new Date(check.checked+'T00:00:00-04:00'))/86400000;
  if(!Number.isFinite(age)||age< -1||age>7)return 'Refresh the official check within seven days before publication.';
  return null;
}
