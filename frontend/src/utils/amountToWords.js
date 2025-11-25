// Converts e.g. 425.00 -> "Four Hundred Twenty-Five Dinars and 0 Fils"
const ONES = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
 "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

function chunk(n){
  const a=[]; while(n>0){ a.push(n%1000); n=Math.floor(n/1000); } return a;
}
function three(n){
  let s="";
  if(n>=100){ s+=ONES[Math.floor(n/100)]+" Hundred"; n%=100; if(n) s+=" "; }
  if(n>=20){ s+=TENS[Math.floor(n/10)]; n%=10; if(n) s+="-"+ONES[n]; }
  else if(n>0){ s+=ONES[n]; }
  return s || "Zero";
}
export default function amountToWords(num){
  num = Number(num||0).toFixed(2);
  const [d,f] = num.split("."); // dinars, fils
  const scales=[""," Thousand"," Million"," Billion"];
  const parts = chunk(Number(d)).map((c,i)=>c? three(c)+scales[i]:"").filter(Boolean).reverse().join(" ");
  return `${parts} Dinars and ${Number(f)} Fils`;
}
