"""Reproducible factual extraction. No commercial defaults are inferred here.
Download the Lamons handbook URL in the output metadata to tmp/gasket-sources/lamons.pdf first.
Crop to the physical page: the PDF contains off-page copies of other tables.
"""
import json, re
from pathlib import Path
from fractions import Fraction
import pdfplumber

root = Path(__file__).resolve().parent.parent
reader = pdfplumber.open(root / 'tmp/gasket-sources/lamons.pdf')
result = {'schemaVersion': 1, 'sourceUrl': 'https://www.lamons.com/wp-content/uploads/2021/09/Lamons-Gasket-Fastener-Handbook.pdf',
          'sourceTitle': 'Lamons Gasket & Fastener Handbook (2015)', 'checkedOn': '2026-10-22',
          'scope': 'Published nominal geometry only. Dimensions are not design approval or a mass/price quotation.',
          'spiral': [], 'sheet': [], 'fullFace': [], 'rtjMappings': [], 'rtjRings': []}

def nps(text):
    return float(sum((Fraction(x) for x in text.strip().split()), Fraction(0)))

for pages, key, count in [(range(39,42),'sheet',4), (range(42,44),'fullFace',8), (range(72,76),'spiral',8)]:
    for page_no in pages:
        page = reader.pages[page_no-1]
        bounds=(page.width*.15,0,page.width*.86,page.height) if key=='spiral' else (0,0,page.width,page.height)
        text = page.within_bbox(bounds).extract_text().replace('**','')
        rating = None
        for line in text.splitlines():
            match = re.search(r'\bClass\s+(1500|2500|150|300|400|600|900)\b',line)
            if match:
                rating=int(match[1]); continue
            match = re.fullmatch(r'(\d+(?:\s+\d+/\d+)?|\d+/\d+)\s+((?:[\d.]+\s+){'+str(count-1)+r'}[\d.]+)',line)
            if not match or not rating:
                continue # starred/nonstandard sizes or ambiguous rows are deliberately excluded
            numbers = [float(x) for x in match[2].split()]
            row={'nps':nps(match[1]),'rating':rating,'sourcePage':page_no}
            if key=='spiral':
                row.update(zip(['innerIdMm','windingIdMm','windingOdMm','outerOdMm'],numbers[1::2]))
                assert 0 < row['innerIdMm'] < row['windingIdMm'] < row['windingOdMm'] < row['outerOdMm']
            else:
                row.update(idMm=numbers[1],odMm=numbers[3])
                if key=='fullFace':row.update(holeCount=int(numbers[4]),holeDiameterMm=numbers[5]*25.4,boltCircleMm=numbers[7])
                assert 0 < row['idMm'] < row['odMm']
            result[key].append(row)

page = reader.pages[116]
table=page.within_bbox((0,0,page.width,page.height)).extract_tables()[0]
for row in table[3:]:
    if not row[0]: continue
    size=nps(row[0])
    for column,ratings in [(1,[150]),(2,[300,400,600]),(3,[900]),(4,[1500]),(5,[2500])]:
        ring=(row[column] or '').strip()
        if re.fullmatch(r'R-\d+',ring):
            for rating in ratings:result['rtjMappings'].append({'nps':size,'rating':rating,'ring':ring,'sourcePage':117})
for page_no in [118,119]:
    page=reader.pages[page_no-1]
    text=page.within_bbox((0,0,page.width,page.height)).extract_text()
    for line in text.splitlines():
        match=re.fullmatch(r'(R-\d+)\s+((?:(?:[\d.]+|--)\s+){11}(?:[\d.]+|--))',line)
        if match:
            v=[float(x) if x!='--' else None for x in match[2].split()]
            result['rtjRings'].append({'ring':match[1],'pitchMm':v[1],'widthMm':v[3],'heightMm':v[7],'flatMm':v[9],'sourcePage':page_no})
for key in ['spiral','sheet','fullFace','rtjMappings']:
    keys=[(r['nps'],r['rating']) for r in result[key]]
    assert len(keys)==len(set(keys)),f'duplicate {key}'
assert next(r for r in result['spiral'] if r['nps']==4 and r['rating']==150)['windingIdMm']==127
assert next(r for r in result['rtjMappings'] if r['nps']==4 and r['rating']==1500)['ring']=='R-39'
ring_ids={r['ring'] for r in result['rtjRings']}
assert all(r['ring'] in ring_ids for r in result['rtjMappings']), str(sorted({r['ring'] for r in result['rtjMappings'] if r['ring'] not in ring_ids}))
(root/'gasket-standard-dimensions.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
print({key:len(result[key]) for key in ['spiral','sheet','fullFace','rtjMappings','rtjRings']})
