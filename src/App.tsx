"use client";
import { useState, useRef } from "react";
import { ArrowRight, ArrowLeft, Check, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Donation, { fundraiser } from "./Donation";

const steps = ["Goals", "Food", "Routine", "Kitchen", "Details"];
const diets = ["No preferences", "Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Dairy-free", "High-protein"];
const fieldLabels:Record<string,string> = {name:'Name',location:'City and postal code',household:'People per visit',goals:'Food goals',diet:'Dietary preferences',allergies:'Allergies and intolerances',cuisines:'Favorite cuisines',notes:'Other food preferences',day:'Weekend day',time:'Time of day',frequency:'Visit frequency',mealTypes:'Meal types',meals:'Meals per person per visit',start:'Desired start',groceries:'Who buys groceries',shoppingNotes:'Grocery preferences',budget:'Budget per visit',access:'Home logistics'};
export default function Home() {
 const [step,setStep]=useState(0), [done,setDone]=useState(false), [busy,setBusy]=useState(false), [error,setError]=useState("");
 const [form,setForm]=useState({household:"2",diet:[] as string[],notes:"",day:"Either works",frequency:"Every week",meals:"4–5 meals",name:"",email:"",location:"",goals:[] as string[],allergies:"",cuisines:[] as string[],mealTypes:[] as string[],time:"",start:"",groceries:"",shoppingNotes:"",budget:"",access:""});
 const panel = useRef<HTMLDivElement>(null);
 function move(next:number){setStep(next);setError("");requestAnimationFrame(()=>panel.current?.focus());}
 const update=(key:string,value:unknown)=>setForm(f=>({...f,[key]:value}));
 const chooseDiet=(d:string)=>update("diet",form.diet.includes(d)?form.diet.filter(x=>x!==d):d==="No preferences"?[d]:[...form.diet.filter(x=>x!=="No preferences"),d]);
 async function submit(e:React.FormEvent<HTMLFormElement>) { e.preventDefault(); if(step<steps.length-1){move(step+1);return;} setBusy(true);setError("");try{const r=await fetch('https://formsubmit.co/ajax/antonyltran@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({...Object.fromEntries(Object.entries(form).map(([key,value])=>[fieldLabels[key]||key,Array.isArray(value)?value.join(', ')||'Not specified':value||'Not specified'])),email:form.email,_subject:'New CREME interest',_template:'table'})});const result=await r.json();if(!r.ok||(result.success!==true&&result.success!=='true'))throw Error();setDone(true);}catch{setError("We couldn’t submit your interest. Your answers are still here — please try again.");}finally{setBusy(false);} }
 function choices(key:keyof typeof form,values:string[]){return <div className="choices">{values.map(v=><Button type="button" variant="outline" key={v} aria-pressed={form[key]===v} className={form[key]===v?"choice selected":"choice"} onClick={()=>update(key,v)}>{v}{form[key]===v&&<Check size={14}/>}</Button>)}</div>}
 function multi(key:"goals"|"cuisines"|"mealTypes",values:string[]){return <div className="choices">{values.map(v=><Button key={v} type="button" variant="outline" aria-pressed={form[key].includes(v)} className={form[key].includes(v)?'choice selected':'choice'} onClick={()=>update(key,form[key].includes(v)?form[key].filter(x=>x!==v):[...form[key],v])}>{v}{form[key].includes(v)&&<Check size={14}/>}</Button>)}</div>}
 function note(key:keyof typeof form,title:string,placeholder:string){return <div className="question"><label htmlFor={key}>{title} <span>Optional</span></label><Textarea id={key} value={String(form[key])} onChange={e=>update(key,e.target.value)} maxLength={2000} placeholder={placeholder}/></div>}
 function single(key:keyof typeof form,title:string,values:string[],hint?:string){return <fieldset className="question"><legend>{title}</legend>{hint&&<p>{hint}</p>}{choices(key,values)}</fieldset>}
 function multiple(key:"goals"|"cuisines"|"mealTypes",title:string,values:string[]){return <fieldset className="question"><legend>{title}</legend><p>Select all that apply. Optional.</p>{multi(key,values)}</fieldset>}
 return <main className="site"><header><a className="wordmark" href="./" aria-label="CREME home">CREME</a><span className="header-note">A little weekend prep. A whole lot of living.</span>{fundraiser.paymentUrl ? <a className="support-link" href="#support">Support CREME <ArrowRight size={15}/></a> : <span className="header-tag">PRIVATE CHEF, PERSONAL TOUCH</span>}</header>
 <div className="layout"><section className="story"><div className="eyebrow"><span/> THE WEEK AHEAD, TAKEN CARE OF</div><h1>Your kitchen. <br/>Your chef.<br/><em>Your weekend back.</em></h1><p className="intro">A private chef comes to your home on the weekend and preps meals around you. Good food, ready for real life.</p><div className="photo"><img src="./creme-food.png" alt="Fresh seasonal meals being prepared with colorful vegetables and herbs"/><div className="photo-caption"><ChefHat size={20}/><span>Made in your kitchen.<br/><strong>Made for your week.</strong></span></div></div><div className="story-footer"><span>PERSONAL MENUS</span><span>IN-HOME COOKING</span><span>WEEKEND PREP</span></div></section>
 <section className="form-side" aria-label="CREME interest form">{done?<div className="success" role="status"><div className="success-mark"><Check size={30}/></div><p className="eyebrow">YOU’RE ON THE LIST</p><h2>A better week<br/>is on the menu.</h2><p>Thanks, {form.name.split(' ')[0]}. Your interest has been submitted. CREME can reach you at <strong>{form.email}</strong> to discuss availability and next steps.</p><p className="fine">This is an expression of interest, not a confirmed booking.</p></div>:<><div className="form-intro"><div className="eyebrow">LET’S MAKE ROOM FOR GOOD FOOD</div><h2>A table set for <em>you.</em></h2><p>Tell us what good food and a good week look like for you. You can leave optional answers blank.</p></div><ol className="progress">{steps.map((s,i)=><li key={s} className={i<=step?'active':''} aria-current={i===step?'step':undefined}><span>{i<step?<Check size={13}/>:String(i+1).padStart(2,'0')}</span>{s}</li>)}</ol>
 <form onSubmit={submit}><div className="step-content" key={step} ref={panel} tabIndex={-1} aria-label={steps[step]}><p className="step-caption">Step {step+1} of {steps.length} · {steps[step]}</p>
 {step===0&&<>
 {single('household','How many are we cooking for?',['1','2','3','4','5+'],'Count everyone who’ll be eating the prepared meals.')}
 {multiple('goals','What would you like meal prep to help with?',['Save time','Eat more consistently','Eat more vegetables','Get more protein','Support training','Weight management','Less takeout','Try new foods','Feed the family','Reduce food waste'])}
 </>}
 {step===1&&<>
 <fieldset className="question"><legend>How do you like to eat?</legend><p>Select any dietary preferences. Optional.</p><div className="choices diets">{diets.map(d=><Button key={d} type="button" variant="outline" aria-pressed={form.diet.includes(d)} className={form.diet.includes(d)?'choice selected':'choice'} onClick={()=>chooseDiet(d)}>{d}{form.diet.includes(d)&&<Check size={14}/>}</Button>)}</div></fieldset>
 {note('allergies','Any food allergies or intolerances?','List ingredients to avoid and any cross-contact concerns. You can also discuss these directly with your chef.')}
 <p className="fine">Allergies and kitchen suitability must be confirmed with your chef before any cooking.</p>
 {multiple('cuisines','Which flavors do you enjoy?',['Mediterranean','Italian','Mexican','East Asian','South Asian','Middle Eastern','American comfort food','Open to anything'])}
 {note('notes','Anything else about your food preferences?','Ingredient quality preferences, menu variety, or requests we haven’t covered…')}
 </>}
 {step===2&&<>
 {single('day','Which weekend day works?',['Saturday','Sunday','Either works'])}
 {single('time','What time of day is best?',['Morning','Afternoon','Flexible'])}
 {single('frequency','How often would you like a chef?',['Every week','Every other week','Occasionally'])}
 {multiple('mealTypes','Which meals should we cover?',['Breakfast','Lunch','Dinner','Snacks'])}
 {single('meals','How many meals per person, per visit?',['2–3 meals','4–5 meals','6+ meals','Not sure yet'],'One meal means one portion for one person. We’ll confirm the total together.')}
 {single('start','When would you want to start?',['As soon as available','Within a month','In 1–3 months','Just exploring'])}
 </>}
 {step===3&&<>
 {single('groceries','Who should handle the groceries?',['Chef shops and brings groceries','I buy from the chef’s shopping list','I arrange grocery delivery','Let’s decide together'],'Tell us your preference. Shopping arrangements and costs will be confirmed before booking.')}
 {note('shoppingNotes','Any grocery shopping preferences?','Preferred stores, organic ingredients, pantry items to use, or a grocery spending limit…')}
 <div className="question"><label htmlFor="budget">What budget feels comfortable per visit? <span>Optional</span></label><Input id="budget" value={form.budget} onChange={e=>update('budget',e.target.value)} maxLength={150} placeholder="For example: $200–$300, or not sure yet"/></div>
 {note('access','Anything to plan for at your home?','Parking, stairs, pets, shared kitchen, access arrangements, or equipment limitations. Please don’t share door codes.')}
 </>}
 {step===4&&<><div className="question"><label htmlFor="name">Your name</label><Input id="name" autoComplete="name" placeholder="First and last name" required maxLength={120} value={form.name} onChange={e=>update('name',e.target.value)}/></div><div className="question"><label htmlFor="email">Email address</label><Input id="email" autoComplete="email" type="email" placeholder="you@example.com" required maxLength={254} value={form.email} onChange={e=>update('email',e.target.value)}/></div><div className="question"><label htmlFor="location">City & ZIP / postal code</label><Input id="location" autoComplete="postal-code" placeholder="Where would we be cooking?" required maxLength={180} value={form.location} onChange={e=>update('location',e.target.value)}/><p className="fine">This helps us understand where there’s interest.</p></div><p className="fine">By joining, you agree to be contacted by CREME about your interest. Your answers are sent to CREME through FormSubmit.</p></>}
 </div>{error&&<p role="alert" className="error">{error}</p>}<div className="form-actions">{step>0&&<Button type="button" variant="ghost" onClick={()=>move(step-1)} disabled={busy}><ArrowLeft/> Back</Button>}<Button className="next" type="submit" disabled={busy}>{busy?'Submitting…':step===4?'Join the interest list':'Continue'}<ArrowRight size={18}/></Button></div><p className="form-footnote">{step===4?'No commitment. Just the start of something delicious.':'About 3–5 minutes · No commitment'}</p></form></>}</section></div>{fundraiser.paymentUrl && <Donation/>}<footer><span className="mini-logo">CREME</span><span>Well fed. More present.</span><span>WEEKEND COOKING. WEEKDAY LIVING.</span></footer></main>
}
