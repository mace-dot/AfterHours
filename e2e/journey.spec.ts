import {test,expect} from '@playwright/test';
test('adult access, opt in, private logging, disclosure, persistence, and deletion',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Enter the demo'}).click();
 await page.getByRole('button',{name:'Opt into tonight'}).click();await page.getByRole('checkbox',{name:'I choose to participate'}).check();await page.getByRole('button',{name:'Join tonight',exact:true}).click();
 await page.getByRole('button',{name:'Log activity',exact:false}).click();await page.getByRole('button',{name:'Kissing 2 pts when eligible',exact:true}).click();await page.getByRole('button',{name:'Save private activity'}).click();await page.getByRole('button',{name:'Done / skip'}).click();
 await expect(page.getByText('Private · excluded')).toBeVisible();await expect(page.locator('.hero-score>strong')).toHaveText('0');
 await page.getByRole('button',{name:'Add memory',exact:true}).click();await page.getByRole('checkbox',{name:'Everyone pictured'}).check();
 await page.locator('input[type=file]').setInputFiles({name:'memory.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});
 await expect(page.getByText('1 temporary memories attached.')).toBeVisible();await page.getByRole('button',{name:'Done / skip'}).click();await page.getByRole('checkbox',{name:'Share memory only'}).check();await expect(page.locator('.hero-score>strong')).toHaveText('0');
 await page.getByRole('button',{name:'View memory',exact:true}).click();await expect(page.getByRole('img',{name:'Party memory'})).toBeVisible();await page.getByRole('button',{name:'Close viewer'}).click();
 await page.getByRole('button',{name:'Share activity',exact:true}).click();await page.getByRole('checkbox',{name:'Include in score',exact:true}).check();await expect(page.locator('.hero-score>strong')).toHaveText('2');
 await page.reload();await expect(page.locator('.hero-score>strong')).toHaveText('2');await expect(page.getByRole('button',{name:'View memory',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Delete',exact:true}).click();await expect(page.locator('.hero-score>strong')).toHaveText('0');
 await page.getByRole('button',{name:'Morning review & recap'}).click();await expect(page.getByRole('heading',{name:'Morning review',exact:true})).toBeVisible();await page.getByRole('button',{name:'My Stats',exact:true}).click();await expect(page.getByText('NIGHTS ENTERED')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);await page.screenshot({path:'/tmp/afterhours-mobile.png',fullPage:true});
});
