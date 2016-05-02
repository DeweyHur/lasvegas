
export function shuffle (a) {
  let i;
  let m = a.length;
  while (m) 
    [a[m],a[i]] = [a[i=~~(Math.random()*m--)], a[m]];
  return a;
}
