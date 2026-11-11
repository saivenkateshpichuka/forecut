const {test}=require('node:test'),assert=require('node:assert/strict');
const L=require('../tools/colour-library.js');
test('quoted names, BOM and CRLF parse without corruption',()=>{const x=L.importCSV('\uFEFFcode,name,hex,system\r\n18-0000,"Test, not an official shade",#123456,TCX\r\n');assert.equal(x[0].name,'Test, not an official shade');assert.equal(x[0].system,'TCX');});
test('normalizes code suffix and system aliases',()=>{assert.equal(L.codeValue('PANTONE 18-0000 TCX','TCX'),'18-0000');assert.equal(L.normalizeSystem('c'),'PMS C');});
test('duplicate system and code resolves to last row',()=>{const x=L.importCSV('code,name,hex,system\n18-0000,Test A,#123456,TCX\n18-0000,Test B,#654321,TCX');assert.equal(x.length,1);assert.equal(x[0].name,'Test B');});
test('same code on different materials stays distinct',()=>{const x=L.importCSV('code,name,hex,system\n18-0000,Test A,#123456,TCX\n18-0000,Test B,#654321,TPG');assert.equal(x.length,2);});
test('rejects malformed data rather than importing partial library',()=>{assert.throws(()=>L.importCSV('name,hex\nTest,#123456'));assert.throws(()=>L.importCSV('code,name,hex,system\nwrong,Test,#123456,TCX'));assert.throws(()=>L.importCSV('code,name,hex,system\n18-0000,Test,javascript:alert(1),TCX'));assert.throws(()=>L.parseCSV('"unclosed'));});
test('library names are data and cannot supply markup through colour values',()=>{assert.throws(()=>L.validateEntry({code:'18-0000',name:'Test',hex:'red;display:none',system:'TCX'}));});

test('material suffix must match the selected system',()=>{assert.throws(()=>L.codeValue('18-0000 TPG','TCX'));assert.throws(()=>L.codeValue('123 C','PMS U'));});
