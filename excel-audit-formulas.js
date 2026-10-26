/* Excel owns the arithmetic after download. The app still owns engineering
 * classification, geometry/library selection and source-review eligibility. */
(function (root) {
  'use strict';
  function apply(workbook, summary, groups, options) {
    const X = root.XLSX;
    const service = workbook.Sheets['Piping Service Cost'];
    const partB = workbook.Sheets['Service Cost Part B'];
    const quote = name => `'${name.replace(/'/g, "''")}'`;
    const inputStyle = {fill:{patternType:'solid',fgColor:{rgb:'FFF2CC'}},font:{color:{rgb:'17365D'}},numFmt:'#,##0.00'};
    const formulaStyle = {font:{color:{rgb:'172B4D'}},numFmt:'#,##0.00'};
    const put = (sheet, address, value, formula) => {
      const old = sheet[address] || {};
      sheet[address] = {...old,t:typeof value==='number'?'n':'s',v:value,
        s:formula ? {...old.s,...formulaStyle,fill:{patternType:'solid',fgColor:{rgb:'FFFFFF'}}} : old.s || inputStyle};
      if(formula) sheet[address].f=formula;
      else delete sheet[address].f;
    };
    const link = (sheet,address,ref,value) => put(sheet,address,value,ref);
    const sum = refs => refs.length ? `SUM(${refs.join(',')})` : '0';
    const itemRefs = new Map();
    for(const group of groups) group.groupItems.forEach((item,i)=>itemRefs.set(item,{sheet:quote(group.sheetName),row:i+6}));
    for(const group of groups){
      const sheet=workbook.Sheets[group.sheetName];
      const header=label=>Object.keys(sheet).find(key=>/^[A-Z]+5$/.test(key)&&sheet[key].v===label)?.replace(/5$/,'');
      group.groupItems.forEach((item,i)=>{
        const r=i+6,cost=item.componentCost||{};
        if(!Number.isFinite(cost.medianUnitRate)||cost.sourceReviewRequired)return;
        const cell=label=>{const col=header(label);return col?`${col}${r}`:null;};
        if(cost.boltingConstruction){
          const stud=cell('Stud Weight kg'),nut=cell('One Nut Weight kg'),count=cell('Nuts / Unit'),nuts=cell('Included Nuts Weight kg'),weight=cell('Unit Weight kg');
          const studRate=cell('Stud Raw Rs/kg'),nutRate=cell('Nut Raw Rs/kg');
          for(const address of [stud,nut,count])if(address)sheet[address].s=inputStyle;
          if(nuts&&nut&&count)put(sheet,nuts,cost.totalNutMassKg,`${nut}*${count}`);
          if(weight&&stud&&nuts)put(sheet,weight,cost.massPerUnitKg,`${stud}+${nuts}`);
          if(stud&&nuts&&studRate&&nutRate)put(sheet,`I${r}`,cost.rawCostPerUnit,`${stud}*${studRate}+${nuts}*${nutRate}`);
        }else if(cost.gasketWeightBased){
          const parts=[['Primary kg (original)','Primary Rs/kg (original)'],['Filler kg (original)','Filler Rs/kg (original)'],['Inner Ring kg (original)','Inner Ring Rs/kg (original)'],['Outer Ring kg (original)','Outer Ring Rs/kg (original)']];
          const refs=parts.map(([kg,rate])=>[cell(kg),cell(rate)]).filter(([kg,rate])=>kg&&rate);
          const yieldCell=cell('Yield % (original)'),mass=cell('Unit Weight kg (original)');
          for(const address of [...refs.flat(),yieldCell])if(address)sheet[address].s=inputStyle;
          if(refs.length&&yieldCell){
            const raw=sum(refs.map(([kg,rate])=>`${kg}*${rate}`));
            put(sheet,`I${r}`,cost.rawCostPerUnit,`${raw}/(${yieldCell}/100)`);
            if(mass)put(sheet,mass,cost.massPerUnitKg,sum(refs.map(([kg])=>kg)));
            const rawAudit=cell('Purchased Raw Rs/No (original)');if(rawAudit)link(sheet,rawAudit,`I${r}`,cost.rawCostPerUnit);
            if(mass)put(sheet,`F${r}`,cost.rawSteel,`${raw}/${mass}`);
          }
        }else if(item.group!=='Pipe Group'&&Number.isFinite(cost.rawSteel)&&cost.rawSteel>0){
          const base=sheet[`I${r}`]?.v;
          if(typeof base==='number'){
            // Geometry/pressure effects are selected by the app; raw price is an Excel driver.
            const col=X.utils.decode_range(sheet['!ref']).e.c+1;
            // One shared appended column, not one new column per item.
            let basisCol=header('Selected Raw Cost Coefficient');
            if(!basisCol){basisCol=X.utils.encode_col(col);put(sheet,`${basisCol}5`,'Selected Raw Cost Coefficient');sheet['!cols'][col]={wch:28};const range=X.utils.decode_range(sheet['!ref']);range.e.c=col;sheet['!ref']=X.utils.encode_range(range);}
            const address=`${basisCol}${r}`;
            put(sheet,address,base/cost.rawSteel);
            put(sheet,`I${r}`,base,`${address}*F${r}`);
          }
        }
      });
      put(sheet,'A3','Yellow cells are editable inputs. White calculated cells contain formulas. Quantity, raw-price and factor edits recalculate costs. Selected engineering geometry/library eligibility must be regenerated in the app after specification changes.');
      if(group.groupItems.some(item=>item.componentCost?.gasketWeightBased))put(sheet,`B${group.totalRow+2}`,'Gasket base raw cost = SUM(constituent kg x constituent Rs/kg) / (yield % / 100). Unit price = base raw cost x factor. Totals = unit price x quantity; P90 = normal total x P90 ratio. Yellow constituent weights/rates/yield are inputs. Original geometry/source descriptions remain export-time references.');
    }
    const rows = summary.rows;
    const serviceRefs = new Map(rows.map((row,i)=>[row.item,i+7]));
    const scopeRefs = (scope,col) => rows.flatMap((row,i)=>row.status==='READY'&&row.scope===scope?[`'Piping Service Cost'!${col}${i+7}`]:[]);
    const allReady = col => rows.length ? [`${col}7:${col}${rows.length+6}`] : [];
    // Expose numeric NPS and joint assumptions without asking Excel to parse BOM text.
    ['NPS in (selected)','Stock Length m','Joint Allowance','Ends per Component','Scope'].forEach((h,i)=>put(service,X.utils.encode_cell({r:5,c:18+i}),h));
    rows.forEach((row,i)=>{
      if(row.status!=='READY')return; // A spreadsheet edit must not silently price unsupported items.
      const r=i+7,ref=itemRefs.get(row.item);
      for(const col of row.scope==='Valve'?['N','O']:['J','K'])if(service[`${col}${r}`])service[`${col}${r}`].s=inputStyle;
      if(ref)link(service,`F${r}`,`${ref.sheet}!G${ref.row}`,row.scope==='Pipe'?row.lengthM:row.quantity);
      put(service,`W${r}`,row.scope);
      if(row.scope==='Valve'){
        put(service,`P${r}`,row.costs.valveServiceCost,`F${r}*N${r}*O${r}`);
        put(service,`Q${r}`,row.costs.directServiceCost,`P${r}`);
        return;
      }
      put(service,`S${r}`,row.nps);
      put(service,`T${r}`,6);
      put(service,`U${r}`,1.6);
      put(service,`V${r}`,row.scope==='Pipe'?0:row.quantities.straightButtWeldJoints/row.quantity);
      put(service,`G${r}`,row.quantities.straightButtWeldJoints,row.scope==='Pipe'?`ROUNDUP(ROUNDUP(F${r}/T${r},0)*U${r},0)`:`F${r}*V${r}`);
      put(service,`H${r}`,row.quantities.erectionQuantityIM,row.scope==='Pipe'?`S${r}*F${r}`:'0');
      put(service,`I${r}`,row.quantities.buttWeldDiameterInch,`G${r}*S${r}`);
      put(service,`L${r}`,row.costs.erectionCost,`H${r}*J${r}`);
      put(service,`M${r}`,row.costs.buttFabricationCost,`I${r}*K${r}`);
      put(service,`Q${r}`,row.costs.directServiceCost,`SUM(L${r}:M${r})`);
    });
    service['!cols'].push(...[18,18,18,20,18].map(wch=>({wch})));
    const serviceRange=X.utils.decode_range(service['!ref']);serviceRange.e.c=22;service['!ref']=X.utils.encode_range(serviceRange);

    // One pipe build owns surface area, supports, civil work and PWHT arithmetic.
    const calc=X.utils.aoa_to_sheet([
      ['Pipe Service Calculations'],
      ['Yellow cells are inputs. White cells calculate. Edit quantity on the component sheet. Rates/geometry are selected at export; regenerate after changing material, size, location, IBR or PMS class.'],
      ['Source File','Item','NPS in','OD mm (selected)','Wall mm (selected)','Length m','Temperature C','Area m2','Paint Rs/m2','Painting Rs','Insulation Rs/m2','Insulation Rs','Span m','Supports','Pipe kg/m','Support Height m','Support kg','Support MT','Steel Rs/MT','Structural Rs','Civil Base Rs/Support','Civil Scope Factor','Civil Rs/Support','Civil Rs','PWHT ID','PWHT Rs/ID','PWHT Rs','Status / Basis'],
    ]);
    const pipeRows=summary.pipeSupport.rows;
    const readyCalc=[];
    pipeRows.forEach((row,i)=>{
      const r=i+4,item=row.item,ref=itemRefs.get(item),sr=serviceRefs.get(item);
      const paint=summary.painting.rows.find(x=>x.item===item);
      const ins=summary.insulation.rows.find(x=>x.item===item);
      const civil=summary.civilSupport.rows.find(x=>x.item===item);
      const pwht=summary.pwht.rows.find(x=>x.item===item);
      const vals=[item.sourceName,item.item,row.nps,options.odTable[row.nps],row.thicknessMm,row.lengthM,
        options.temperature(item),0,paint?.rate?.rateRsPerM2??'',paint?.cost??0,ins?.rate?.rateRsPerM2??'',ins?.cost??0,
        row.support?.adoptedSupportSpacingM??'',row.support?.totalSupportCount??0,row.support?.pipeMetalWeightKgM??0,
        row.support?.supportHeightM??options.supportHeight, row.support?.structuralQuantityKg??0,row.support?.structuralQuantityMT??0,
        options.supportRate,row.cost??0,civil?.baseCivilCostPerSupport??0,summary.civilSupport.factorPercent/100,
        civil?.civilCostPerSupport??0,civil?.civilCost??0,pwht?.status==='READY'?pwht.pwhtId:0,pwht?.status==='READY'?pwht.rate.rateRsPerId:0,pwht?.cost??0,
        item.componentCost?.sourceReviewRequired?'Source review required':row.status];
      vals.forEach((v,j)=>put(calc,X.utils.encode_cell({r:r-1,c:j}),v??''));
      if(row.status!=='READY'||item.componentCost?.sourceReviewRequired)return;
      readyCalc.push(r);
      if(sr&&rows[sr-7].status==='READY')link(calc,`F${r}`,`'Piping Service Cost'!F${sr}`,row.lengthM);
      else if(ref)link(calc,`F${r}`,`${ref.sheet}!G${ref.row}`,row.lengthM);
      const raw=options.temperature(item);put(calc,`G${r}`,raw===''?'':Number(raw));
      const area=Math.PI*options.odTable[row.nps]/1000*row.lengthM;
      put(calc,`H${r}`,area,`PI()*D${r}/1000*F${r}`);
      // The same approved temperature bands and linear interpolation as the app.
      if(paint?.status!=='EXCLUDED'){
        put(calc,`I${r}`,paint?.rate?.rateRsPerM2??'Review',`IF(G${r}="",1010,IF(OR(G${r}<65,G${r}>500),"Review",IF(G${r}<=200,885,IF(G${r}<300,885+(G${r}-200)/100*(2220-885),2220))))`);
        put(calc,`J${r}`,paint?.cost??0,`IF(ISNUMBER(I${r}),H${r}*I${r},0)`);
      }else {put(calc,`I${r}`,'Excluded');put(calc,`J${r}`,0);}
      let insulation='6118';
      const bands=[[400,5587,500,6118],[300,5082,400,5587],[200,4881,300,5082],[100,4578,200,4881]];
      for(const [low,rate,high,next] of bands)insulation=`IF(G${r}<=${high},${rate}+(G${r}-${low})/${high-low}*(${next}-${rate}),${insulation})`;
      put(calc,`K${r}`,ins?.rate?.rateRsPerM2??'Review',`IF(G${r}="","Not configured",IF(OR(G${r}<100,G${r}>500),"Review",${insulation}))`);
      put(calc,`L${r}`,ins?.cost??0,`IF(ISNUMBER(K${r}),H${r}*K${r},0)`);
      put(calc,`M${r}`,row.support.adoptedSupportSpacingM,`IF(C${r}<=1,2,IF(C${r}<=2,3,IF(C${r}<=4,4,6)))`);
      put(calc,`N${r}`,row.support.totalSupportCount,`MAX(1,ROUNDUP(F${r}/M${r},0)+1)`);
      put(calc,`O${r}`,row.support.pipeMetalWeightKgM,`0.02466*E${r}*(D${r}-E${r})`);
      put(calc,`Q${r}`,row.support.structuralQuantityKg,`N${r}*O${r}*P${r}`);
      put(calc,`R${r}`,row.support.structuralQuantityMT,`Q${r}/1000`);
      put(calc,`T${r}`,row.cost,`R${r}*S${r}`);
      put(calc,`U${r}`,civil?.baseCivilCostPerSupport??0,`ROUNDUP(IF(C${r}<=3,6000,IF(C${r}<=20,6000+(C${r}-3)*(17000-6000)/17,IF(C${r}<=48,17000+(C${r}-20)*(26000-17000)/28,26000+(C${r}-48)*(26000-17000)/28)))/500,0)*500`);
      put(calc,`W${r}`,civil?.civilCostPerSupport??0,`U${r}*V${r}`);
      put(calc,`X${r}`,civil?.civilCost??0,`N${r}*W${r}`);
      if(pwht?.status==='READY'&&sr)link(calc,`Y${r}`,`'Piping Service Cost'!I${sr}`,pwht.pwhtId);
      put(calc,`AA${r}`,pwht?.cost??0,`Y${r}*Z${r}`);
      put(calc,`AB${r}`,raw===''?'Temperature not specified':'Ready',`IF(OR(I${r}="Review",K${r}="Review"),"Review temperature",IF(G${r}="","Temperature not specified","Ready - selected geometry/rate basis"))`);
    });
    const end=pipeRows.length+3,calcTotal=end+2;
    put(calc,`A${calcTotal}`,'TOTAL');
    const calcCols=['F','H','J','L','N','Q','R','T','X','Y','AA'];
    for(const col of calcCols){const values=readyCalc.map(r=>Number(calc[`${col}${r}`]?.v)||0);put(calc,`${col}${calcTotal}`,values.reduce((a,b)=>a+b,0),sum(readyCalc.map(r=>`${col}${r}`)));}
    calc['!ref']=`A1:AB${calcTotal}`;calc['!cols']=Array.from({length:28},(_,i)=>({wch:i===0?40:i===1?24:i===27?50:20}));
    calc['!rows']=[{hpt:26},{hpt:44},{hpt:42}];calc.A2.s={alignment:{wrapText:true,vertical:'top'}};
    calc['!merges']=[{s:{r:0,c:0},e:{r:0,c:27}},{s:{r:1,c:0},e:{r:1,c:27}}];
    for(let col=0;col<28;col++)calc[X.utils.encode_cell({r:2,c:col})].s={fill:{patternType:'solid',fgColor:{rgb:'EAF3F8'}},font:{bold:true,color:{rgb:'0B365F'}},alignment:{wrapText:true}};
    X.utils.book_append_sheet(workbook,calc,'Pipe Service Calculations');

    const total=Math.max(rows.length+8,8),refCalc=col=>`'Pipe Service Calculations'!${col}${calcTotal}`;
    put(service,`S${total}`,'Rework %');put(service,`T${total}`,summary.reworkRatePercent/100);
    put(service,`I${total}`,summary.reworkId,`${sum(allReady('I'))}*T${total}`);
    put(service,`Q${total}`,summary.rework,`${sum(allReady('M'))}*T${total}`);
    for(const [offset,qtyCol,calcQty,costCol,calcCost,value,qty] of [
      [1,'N','R','Q','T',summary.pipeSupport.cost,summary.pipeSupport.weightMt],
      [2,'N','N','Q','X',summary.pipeSupportCivil,summary.civilSupport.supportCount],
      [3,'N','H','Q','J',summary.painting.cost,summary.painting.surfaceAreaM2],
      [4,'N','H','Q','L',summary.insulation.cost,summary.insulation.surfaceAreaM2],
      [5,'I','Y','Q','AA',summary.pwht.cost,summary.pwht.id],
    ]){
      link(service,`${qtyCol}${total+offset}`,refCalc(calcQty),qty);
      link(service,`${costCol}${total+offset}`,refCalc(calcCost),value);
      if(offset!==5)put(service,`O${total+offset}`,qty?value/qty:0,`IFERROR(Q${total+offset}/${qtyCol}${total+offset},0)`);
    }
    // Preserve exact eligible painting/insulation areas; excluded rows have no priced area.
    for(const [offset,kind,rateCol] of [[3,'painting','I'],[4,'insulation','K']]){
      put(service,`N${total+offset}`,summary[kind].surfaceAreaM2,pipeRows.length?`SUMIFS('Pipe Service Calculations'!H4:H${end},'Pipe Service Calculations'!${rateCol}4:${rateCol}${end},">0")`:'0');
    }
    const amountByWork={},quantityByWork={};
    for(const [work,scope,qty,cost]of [[1,'Pipe','I','M'],[2,'Fitting','I','M'],[3,'Flange','I','M'],[4,'Pipe','H','L']]){
      quantityByWork[work]=sum(scopeRefs(scope,qty));amountByWork[work]=sum(scopeRefs(scope,cost));
    }
    quantityByWork[5]=sum(rows.flatMap((row,i)=>row.status==='READY'&&row.scope==='Valve'?[`'Piping Service Cost'!N${i+7}*'Piping Service Cost'!F${i+7}`]:[]));
    amountByWork[5]=sum(scopeRefs('Valve','P'));
    for(const [work,off,qty]of [[6,0,'I'],[7,1,'N'],[8,2,'N'],[9,3,'N'],[10,4,'N'],[11,5,'I']]){
      quantityByWork[work]=`'Piping Service Cost'!${qty}${total+off}`;amountByWork[work]=`'Piping Service Cost'!Q${total+off}`;
    }
    const works=options.partBRows;
    put(partB,'J4','Matched Detail Cost Rs');partB.J4.s={...partB.I4.s};
    partB['!cols'].push({wch:24});
    works.forEach((work,i)=>{
      const r=i+5;
      for(const col of ['A','B','C','D','H','I'])if(partB[`${col}${r}`])partB[`${col}${r}`].s={...partB[`${col}${r}`].s,fill:{patternType:'solid',fgColor:{rgb:'FFFFFF'}}};
      if(work.slNo<=11){
        put(partB,`E${r}`,work.quantity,quantityByWork[work.slNo]);
        put(partB,`J${r}`,work.amount,amountByWork[work.slNo]);
        put(partB,`F${r}`,work.rate,`IFERROR(J${r}/E${r},0)`);
        put(partB,`G${r}`,work.amount,`E${r}*F${r}`);
      }else put(partB,`G${r}`,work.amount,`E${r}*F${r}`);
    });
    const partBRange=X.utils.decode_range(partB['!ref']);partBRange.e.c=9;partB['!ref']=X.utils.encode_range(partBRange);
    put(partB,`B${works.length+7}`,'E and F initially link to matched detail quantities and weighted rates. Edit the detailed yellow inputs to retain full traceability. Replacing E or F here is a work-package override: G and the project totals update, but the underlying detail stays unchanged.');
    // Direct service detail includes extra services once, not twice.
    put(service,`L${total+6}`,summary.erection,sum(allReady('L')));
    put(service,`M${total+6}`,summary.welding,sum(allReady('M')));
    put(service,`P${total+6}`,summary.valve,sum(allReady('P')));
    put(service,`Q${total+6}`,summary.direct,`'Service Cost Part B'!G${works.length+5}`);
    const audit=workbook.Sheets['BOM Service Inputs'];
    if(audit)options.items.forEach((item,i)=>{
      const j=pipeRows.findIndex(row=>row.item===item);if(j<0)return;
      const r=i+2,c=j+4;
      for(const [target,source]of [['D','G'],['G','K'],['H','L'],['I','I'],['J','J']]){
        const value=calc[`${source}${c}`]?.v??'';link(audit,`${target}${r}`,`'Pipe Service Calculations'!${source}${c}`,value);
      }
      put(audit,`D${r}`,options.temperature(item)||'Not specified',`IF('Pipe Service Calculations'!G${c}="","Not specified",'Pipe Service Calculations'!G${c})`);
    });
    const methods=workbook.Sheets['Method and Audit'];
    if(methods)put(methods,'B26','Excel formulas link quantities, rates, service detail, Part B and Executive Summary. Edit yellow inputs. Geometry, material/library selection, location/IBR eligibility and PWHT applicability are selected in the app; regenerate after changing these. Source notes describe the original export basis. Review rows are excluded, not priced at zero.');
    workbook.Workbook=workbook.Workbook||{};
    workbook.Workbook.CalcPr={calcMode:'auto',fullCalcOnLoad:true,forceFullCalc:true};
    return workbook;
  }
  root.ExcelAuditFormulas={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
