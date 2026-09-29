'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import type {Session} from '../../lib/auth';
import {validateSession} from '../../lib/auth';
import {WorkspaceShell} from './workspace-shell';

export default function App(){
  const [session,setSession]=useState<Session|null|undefined>(undefined);
  const [unavailable,setUnavailable]=useState(false);

  useEffect(()=>{
    let cancelled=false;
    async function restore(){
      const raw=localStorage.getItem('pulsechat.session');
      if(!raw){if(!cancelled)setSession(null);return}
      try{
        const parsed=JSON.parse(raw) as Session;
        const status=await validateSession(parsed);
        if(cancelled)return;
        if(status==='valid')setSession(parsed);
        else if(status==='invalid'){
          localStorage.removeItem('pulsechat.session');
          setSession(null);
        }else{
          setUnavailable(true);
          setSession(parsed);
        }
      }catch{
        localStorage.removeItem('pulsechat.session');
        if(!cancelled)setSession(null);
      }
    }
    void restore();
    return()=>{cancelled=true};
  },[]);

  if(session===undefined)return <main><section><p>Loading workspace…</p></section></main>;
  if(!session)return <main><section><span>PULSECHAT</span><h1>Sign in required</h1><p>Your session expired or is not available. Sign in again to continue.</p><Link className="cta" href="/login">Sign in</Link></section></main>;
  return <WorkspaceShell session={session} serviceUnavailable={unavailable}/>;
}
