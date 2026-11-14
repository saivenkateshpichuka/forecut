const {test}=require('node:test'),assert=require('node:assert/strict');
const L=require('../tools/colour-library.js');
test('quoted names, BOM and CRLF parse without corruption',()=>{const x=L.importCSV('\uFEFFcode,name,hex,system\r\n18-0000,"Test, not an official shade",#123456,TCX\r\n');assert.equal(x[0].name,'Test, not an official shade');assert.equal(x[0].system,'TCX');});
test('normalizes code suffix and system aliases',()=>{assert.equal(L.codeValue('PANTONE 18-0000 TCX','TCX'),'18-0000');assert.equal(L.normalizeSystem('c'),'PMS C');});
test('duplicate system and code resolves to last row',()=>{const x=L.importCSV('code,name,hex,system\n18-0000,Test A,#123456,TCX\n18-0000,Test B,#654321,TCX');assert.equal(x.length,1);assert.equal(x[0].name,'Test B');});
test('same code on different materials stays distinct',()=>{const x=L.importCSV('code,name,hex,system\n18-0000,Test A,#123456,TCX\n18-0000,Test B,#654321,TN');assert.equal(x.length,2);});
test('rejects malformed data rather than importing partial library',()=>{assert.throws(()=>L.importCSV('name,hex\nTest,#123456'));assert.throws(()=>L.importCSV('code,name,hex,system\nwrong,Test,#123456,TCX'));assert.throws(()=>L.importCSV('code,name,hex,system\n18-0000,Test,javascript:alert(1),TCX'));assert.throws(()=>L.parseCSV('"unclosed'));});
test('library names are data and cannot supply markup through colour values',()=>{assert.throws(()=>L.validateEntry({code:'18-0000',name:'Test',hex:'red;display:none',system:'TCX'}));});

test('material suffix must match the selected system',()=>{assert.throws(()=>L.codeValue('18-0000 TPG','TCX'));assert.throws(()=>L.codeValue('123 C','PMS U'));});

test('the colour-library module itself bundles no shade data (the TCX screen set loads separately in tools/tcx-ref.js)',()=>{
 assert.deepEqual(L.systems,['TCX','TN','TSX']);
 assert.equal(L.bundled.length,0);
});
test('imports TN and TSX and rejects mismatched textile suffixes',()=>{
 for(const system of ['TN','TSX']){
  assert.equal(L.importCSV('code,name,hex,system\n13-0340 '+system+',Test,#123456,'+system)[0].code,'13-0340');
  assert.throws(()=>L.codeValue('13-0340 '+system,'TCX'));
 }
 assert.throws(()=>L.importCSV('code,name,hex,system\n18-0000,Test,#123456,TPG'));
});
test('library holds only the user\'s imported references and excludes other systems',()=>{
 const custom={code:'11-0601',name:'My white',hex:'#ffffff',system:'TCX'};
 const merged=L.library([custom,{...custom,system:'TPG'}]);
 assert.equal(merged.length,1);assert.equal(merged[0].name,'My white');
 assert.ok(merged.every(c=>L.systems.includes(c.system)));
});
