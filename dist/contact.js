
/* Contact delivery: FormSubmit AJAX; the recipient must activate the form once. */
(() => {
 'use strict';
 const d=window.PORTFOLIO;
 const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){
  return '<div class="contact-page"><div class="page-title"><span class="eyebrow">LET’S CONNECT</span><h1>Good things start<br>with a conversation.</h1><p class="lead">Have a project in mind, a question, or an opportunity? Get in touch.</p></div><section class="two section contact-layout"><div><h2>Let’s make something<br>meaningful.</h2><p>Have an idea or an opportunity? <a class="text-link" href="mailto:'+e(d.email)+'">Send me an email ↗</a></p><dl class="contact-links"><div><dt>Email</dt><dd><a href="mailto:'+e(d.email)+'">'+e(d.email)+'</a></dd></div><div><dt>Phone</dt><dd><a href="tel:'+e(d.phone.replace(/[^\d+]/g,''))+'">'+e(d.phone)+'</a></dd></div><div><dt>Location</dt><dd>'+e(d.location)+'</dd></div><div><dt>GitHub</dt><dd><a href="'+e(d.github)+'" target="_blank" rel="noopener noreferrer">github.com/dianxz17 <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a></dd></div></dl></div><form id="contact-form" action="https://formsubmit.co/'+e(d.email)+'" method="POST" aria-describedby="contact-privacy"><div class="two contact-fields"><div class="field"><label for="name">Name</label><input id="name" name="name" required maxlength="100" autocomplete="name"></div><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required maxlength="254" autocomplete="email"></div></div><div class="field"><label for="subject">Subject</label><input id="subject" name="subject" required maxlength="200"></div><div class="field"><label for="message">Message</label><textarea id="message" name="message" required minlength="10" maxlength="5000" placeholder="Tell me a little about your idea…"></textarea></div><div class="trap" aria-hidden="true"><label for="company">Leave this empty</label><input id="company" name="_honey" tabindex="-1" autocomplete="off"></div><button type="submit" class="button">Send message <span aria-hidden="true">↗</span></button><p id="form-status" class="small-note" role="status" aria-live="polite" aria-atomic="true"></p><p class="small-note" id="contact-privacy">Your details are used to reply to your message. Messages are processed by FormSubmit.</p><noscript><p>Please enable JavaScript or use the email link to get in touch.</p></noscript></form></section></div>';
 }
 function bind(){
  const form=document.querySelector('#contact-form'),status=document.querySelector('#form-status'),button=form.querySelector('button[type=submit]');
  const fields=['name','email','subject','message'].map(id=>form.querySelector('#'+id));
  fields.forEach(field=>field.addEventListener('input',()=>field.setCustomValidity('')));
  let sending=false;
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(sending)return;
   fields.forEach(field=>field.setCustomValidity(field.value.trim()?'':'Please complete this field.'));
   const message=form.querySelector('#message');
   if(message.value.trim()&&message.value.trim().length<10)message.setCustomValidity('Please write at least 10 characters.');
   if(!form.reportValidity())return;
   if(form.querySelector('#company').value)return;
   const payload=Object.fromEntries(fields.map(field=>[field.name,field.value.trim()]));
   payload._subject='Portfolio message: '+payload.subject.replace(/[\r\n]+/g,' ');
   payload._replyto=payload.email;
   payload._template='table';
   payload._honey='';
   payload._url=location.origin+'/contact';
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
   sending=true;button.disabled=true;button.textContent='Sending…';
   fields.forEach(field=>field.disabled=true);
   form.setAttribute('aria-busy','true');status.dataset.state='sending';status.textContent='Sending your message…';
   try{
    const response=await fetch(d.contactEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
    const result=await response.json();
    if(!response.ok||!(result.success===true||result.success==='true'))throw new Error('Submission not accepted');
    status.dataset.state='success';status.textContent='Your message has been submitted. Thank you for getting in touch!';
    form.reset();
   }catch(error){
    status.dataset.state='error';status.textContent=error.name==='AbortError'?'Sending took too long. Your message is still here—please try again or email me directly.':'Your message could not be submitted. Your message is still here—please try again or email me directly.';
   }finally{
    clearTimeout(timeout);sending=false;button.disabled=false;button.innerHTML='Send message <span aria-hidden="true">↗</span>';
    fields.forEach(field=>field.disabled=false);form.setAttribute('aria-busy','false');
   }
  });
 }
 window.CONTACT={render,bind};
})();

