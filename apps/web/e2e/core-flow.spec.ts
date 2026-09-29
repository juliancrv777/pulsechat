import {expect,test,type Page} from '@playwright/test';

async function register(page:Page,name:string,email:string){
  await page.goto('/register');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('E2E-password-123!');
  await page.getByRole('button',{name:'Create account'}).click();
  await expect(page).toHaveURL(/\/app/);
}

async function createWorkspace(page:Page,name:string,slug:string){
  await page.getByPlaceholder('Workspace name').first().fill(name);
  await page.getByPlaceholder('workspace-slug').first().fill(slug);
  await page.getByRole('button',{name:'Create workspace'}).first().click();
  await expect(page.getByRole('button',{name:'# general',exact:true})).toBeVisible();
  await expect(page.getByText('Live',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Send'})).toBeEnabled();
}

test('two users collaborate in realtime and messages persist',async({browser})=>{
  const stamp=Date.now();
  const emailA=`owner-${stamp}@example.com`;
  const emailB=`member-${stamp}@example.com`;
  const team=`Team ${stamp}`;
  const contextA=await browser.newContext();
  const contextB=await browser.newContext();
  const a=await contextA.newPage();
  const b=await contextB.newPage();

  try{
    await register(a,'Owner E2E',emailA);
    await createWorkspace(a,team,`team-${stamp}`);
    await register(b,'Member E2E',emailB);

    a.once('dialog',dialog=>dialog.accept(emailB));
    await a.getByRole('button',{name:'+ Add member'}).click();
    await expect(a.getByText(`Member E2E added to ${team}`,{exact:true})).toBeVisible();

    await b.reload();
    await expect(b.getByRole('button',{name:'# general',exact:true})).toBeVisible();
    await expect(b.getByText('Live',{exact:true})).toBeVisible();
    await expect(b.getByRole('button',{name:'Send'})).toBeEnabled();

    await expect(a.getByText(`${team} · 2 online`,{exact:true})).toBeVisible();
    await expect(b.getByText(`${team} · 2 online`,{exact:true})).toBeVisible();

    const fromA=`hello from A ${stamp}`;
    await a.getByLabel('Message').fill(fromA);
    await a.getByRole('button',{name:'Send'}).click();
    await expect(b.getByText(fromA,{exact:true})).toBeVisible();

    const fromB=`hello from B ${stamp}`;
    await b.getByLabel('Message').fill(fromB);
    await b.getByRole('button',{name:'Send'}).click();
    await expect(a.getByText(fromB,{exact:true})).toBeVisible();

    await b.reload();
    await expect(b.getByText(fromA,{exact:true})).toBeVisible();
    await expect(b.getByText(fromB,{exact:true})).toBeVisible();
  }finally{
    await contextA.close();
    await contextB.close();
  }
});
