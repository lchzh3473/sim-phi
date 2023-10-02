function e(e,o){const t=new MutationObserver((()=>{const n=document.getElementById(e);n&&(console.log(n),o(n),t.disconnect())}));t.observe(document.body,{childList:!0,subtree:!0})}export{e as w};
//# sourceMappingURL=waitForElementById-46893270.js.map
