export default {};
export const readFileSync = () => { throw new Error("fs.readFileSync is not available in the browser."); };
export const writeFileSync = () => { throw new Error("fs.writeFileSync is not available in the browser."); };
export const existsSync = () => false;
