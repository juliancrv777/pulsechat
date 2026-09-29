export type Session={accessToken:string;user:{id:string;email:string;name:string}};
export type SessionStatus='valid'|'invalid'|'unavailable';
const API=process.env.NEXT_PUBLIC_API_URL??'http://localhost:4000/api';

export async function authenticate(mode:'login'|'register',payload:Record<string,string>):Promise<Session>{
  const response=await fetch(`${API}/auth/${mode}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload),
  });
  if(!response.ok){
    const data=await response.json().catch(()=>({}));
    throw new Error(data.message?.toString()??'Authentication failed');
  }
  return response.json();
}

export async function validateSession(session:Session):Promise<SessionStatus>{
  try{
    const response=await fetch(`${API}/auth/me`,{
      headers:{Authorization:`Bearer ${session.accessToken}`},
      cache:'no-store',
    });
    if(response.ok)return 'valid';
    if(response.status===401||response.status===403)return 'invalid';
    return 'unavailable';
  }catch{
    return 'unavailable';
  }
}
