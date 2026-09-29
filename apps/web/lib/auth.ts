export type Session={accessToken:string;user:{id:string;email:string;name:string}};
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

export async function validateSession(session:Session):Promise<boolean>{
  try{
    const response=await fetch(`${API}/auth/me`,{
      headers:{Authorization:`Bearer ${session.accessToken}`},
      cache:'no-store',
    });
    return response.ok;
  }catch{
    return false;
  }
}
