import {afterEach,describe,expect,it,vi} from 'vitest';
import {validateSession,type Session} from './auth';

const session:Session={accessToken:'token',user:{id:'1',email:'test@example.com',name:'Test'}};

afterEach(()=>vi.unstubAllGlobals());

describe('validateSession',()=>{
  it('returns valid for an authenticated session',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,status:200}));
    await expect(validateSession(session)).resolves.toBe('valid');
  });

  it('returns invalid for an expired token',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:401}));
    await expect(validateSession(session)).resolves.toBe('invalid');
  });

  it('returns unavailable when the API cannot be reached',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));
    await expect(validateSession(session)).resolves.toBe('unavailable');
  });
});
