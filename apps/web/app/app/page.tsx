'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import type {Session} from '../../lib/auth';
import {validateSession} from '../../lib/auth';
import {WorkspaceShell} from './workspace-shell';

export default function App(){
  const [session,setSession]=useState<Session|null|undefined>(undefined);

  useEffect(()=>{
    let cancelled=false;
    async function restore(){
      const raw=localStorage.getItem('pulsechat.session');
      if(!raw){if(!cancelled)setSession(null);return}
      try{
        const parsed=JSON.parse(raw) as Session;
        const valid=await validateSession(parsed);
        if(cancelled)return;
        if(valid)setSession(parsed);
        else{
          localStorage.removeItem('pulsechat.session');
          setSession(null);
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
  return <WorkspaceShell session={session}/>;
}
