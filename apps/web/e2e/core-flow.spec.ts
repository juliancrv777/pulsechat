import {expect,test} from '@playwright/test';

test('registers, creates a workspace, sends and restores a message',async({page})=>{
  const stamp=Date.now();
  const email=`e2e-${stamp}@example.com`;
  const workspace=`E2E ${stamp}`;
  const slug=`e2e-${stamp}`;
  const message=`persistent message ${stamp}`;

  await page.goto('/register');
  await page.getByLabel('Name').fill('E2E User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('E2E-password-123!');
  await page.getByRole('button',{name:'Create account'}).click();

  await expect(page).toHaveURL(/\/app/);
  await page.getByPlaceholder('Workspace name').first().fill(workspace);
  await page.getByPlaceholder('workspace-slug').first().fill(slug);
  await page.getByRole('button',{name:'Create workspace'}).first().click();

  await expect(page.getByRole('button',{name:'# general',exact:true})).toBeVisible();
  await expect(page.getByText('Live',{exact:true})).toBeVisible();

  await page.getByLabel('Message').fill(message);
  await page.getByRole('button',{name:'Send'}).click();
  await expect(page.getByText(message,{exact:true})).toBeVisible();

  await page.reload();
  await expect(page.getByText(message,{exact:true})).toBeVisible();
});
